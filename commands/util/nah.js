const { SlashCommandBuilder } = require('discord.js');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('nah')
                .setDescription('oh'),
        async execute(interaction) {
                        await interaction.reply('this does not slay')},
};