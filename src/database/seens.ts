import mongoose from 'mongoose';

import { toId } from '@/tools';

// We don't really care about storing joins (since we can just use their 'online' status)
// Instead, we store the last time they were seen online; i.e. their leave time, not join

const schema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	at: {
		type: Date,
		required: true,
		default: Date.now,
	},
	name: {
		type: String,
		required: true,
	},
	seenIn: {
		type: [String],
		required: true,
		default: [],
	},
});

interface Model {
	id: string;
	at: Date;
	name: string;
	seenIn: string[];
}
const model = mongoose.model('seen', schema, 'seens');

// TODO: Debounce calls to this
export function seeUser(user: string, rooms: string[] = []): Promise<Model> {
	const userId = toId(user);
	return model.findOneAndUpdate({ id: userId }, { id: userId, name: user, seenIn: rooms }, { upsert: true, new: true });
}

export function lastSeen(user: string): Promise<Model | null> {
	const userId = toId(user);
	return model.findOne({ id: userId });
}

export function fetchAllSeens(): Promise<Model[]> {
	return model.find({}).lean();
}
