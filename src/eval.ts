import { inspect } from 'util';
import { ansiToHtml } from '@/utils/ansiToHtml';

import * as _cache from '@/cache';
import { cachebuster as _cachebuster } from '@/utils/cachebuster';
import type { PSCommandContext } from '@/types/chat';

// Exporting into side variables for eval lookup
const cache = _cache;
const cachebuster = _cachebuster;

export type EvalModes = 'COLOR_OUTPUT' | 'FULL_OUTPUT' | 'ABBR_OUTPUT' | 'NO_OUTPUT';
export type EvalOutput = {
	success: boolean;
	output: string;
};

export function formatValue(value: unknown, mode: EvalModes): string {
	switch (mode) {
		case 'COLOR_OUTPUT':
		case 'FULL_OUTPUT': {
			const color = mode === 'COLOR_OUTPUT';
			// TODO Stringify functions and render with syntax highlighting
			const inspection = inspect(value, { depth: 2, colors: color, numericSeparator: true });
			return color
				? ansiToHtml(inspection)
						.replace(/\t/g, '&nbsp;'.repeat(4)) // Fill out tabs
						.replace(/ (?= |$)/g, '&nbsp;') // Fill out multi-spaces
						.replace(/\n/g, '<br/>') // Fill out newlines
				: inspection;
		}
		case 'ABBR_OUTPUT': {
			if (value instanceof Error) return value.message;
			switch (typeof value) {
				case 'string':
					return value;
				case 'number':
				case 'bigint':
				case 'boolean':
				case 'symbol':
					return value.toString();
				case 'undefined':
					return 'undefined';
				case 'function': {
					const funcStr = value.toString();
					const isAsync = funcStr.startsWith('async');
					const restFuncStr = ((funcStr: string) => {
						const funcLines = funcStr.split('\n');
						if (funcStr.startsWith('function')) {
							if (funcLines.length <= 3) {
								const [header, content] = funcStr.split('\n');
								return `${header.match(/\(.*\)/)!.toString()} => { ${content} }`;
							} else return `${funcLines[0].match(/\(.*\)/)!.toString()} => { ... }`;
						} else {
							if (funcLines.length === 1) return funcStr;
							else return `${funcLines[0]} ... }`;
						}
					})(funcStr.replace(/^async\s*/, ''));
					return `${isAsync ? 'async ' : ''}${restFuncStr}`;
				}
				case 'object': {
					if (value === null) return 'null';
					return inspect(value, { depth: 2, compact: true, maxArrayLength: 100, numericSeparator: true });
				}
				default: {
					return inspect(value) as never;
				}
			}
		}
		case 'NO_OUTPUT': {
			return '';
		}
	}
}

export async function evaluate(
	code: string,
	mode: EvalModes,
	passedContext: {
		message: PSMessage;
		context: PSCommandContext;
	} // Add Discord case here, eventually
): Promise<EvalOutput> {
	let success: boolean, value: unknown;
	try {
		const res = await (() => {
			const { message, context } = passedContext;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Storing in context for eval()
			const evalContext = { message, context, cache, cachebuster };
			return eval(code);
		})();
		success = true;
		value = res;
	} catch (err) {
		success = false;
		value = err;
	}
	return {
		success: success,
		output: formatValue(value!, mode),
	};
}
