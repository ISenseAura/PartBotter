export const command: DiscCommand = {
	name: 'test',
	desc: 'Test command',
	run(interaction) {
		return interaction.reply('Test');
	},
};
