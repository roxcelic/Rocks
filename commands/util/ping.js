const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const randomChance = Math.floor(Math.random() * 8192) + 1;
		if (randomChance === 1) {
			await interaction.reply('aww damit I missed *sparkle*');
		} else {
			await interaction.reply('Pong!');
		}
	},
};
