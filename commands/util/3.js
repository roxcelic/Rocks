const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('silly')
		.setDescription(':3'),
	async execute(interaction) {
			await interaction.reply(':3:3:3:3:3:3:3')},
};
