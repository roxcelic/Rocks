const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('yas')
		.setDescription('yass queen'),
	async execute(interaction) {
			await interaction.reply('SLAYYYYYYYYYYYYYY. period.')},
};
