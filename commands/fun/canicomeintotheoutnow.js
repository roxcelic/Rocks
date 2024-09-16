const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('i know what you are')
		.setDescription('boov'),
	async execute(interaction) {
			await interaction.reply('oh can i come into the out now?')},
};
