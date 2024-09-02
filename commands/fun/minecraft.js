const { SlashCommandBuilder } = require('discord.js');
const { status } = require('minecraft-server-util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcstatus')
        .setDescription('Checks the status of the Minecraft server.'),
    async execute(interaction) {
        const serverAddress = 'server.roxcelic.love';
        const serverPort = 25565;

        try {
            const response = await status(serverAddress, serverPort); // Pass port directly here
            const serverStatus = `**Server is online!**\n` +
                                 `**MOTD:** ${response.motd.clean}\n` +
                                 `**Players:** ${response.players.online}/${response.players.max}\n` +
                                 `**Version:** ${response.version.name}\n` +
                                 `**Address** ${serverAddress}\n` +
                                 `**Port:** ${serverPort}`;

            await interaction.reply(serverStatus);
        } catch (error) {
            console.error('Error checking Minecraft server status:', error);
            await interaction.reply('The server is offline or unreachable. Please check the server address and port.');
        }
    },
};
