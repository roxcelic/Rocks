const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('msg')
		.setDescription('Sends a DM to the user with the provided ID')
		.addStringOption(option =>
			option.setName('user_id')
				.setDescription('The ID of the user to DM')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('message')
				.setDescription('The message to send')
				.setRequired(true)),
	async execute(interaction) {
		const userId = interaction.options.getString('user_id');
		const message = interaction.options.getString('message');
		const sender = interaction.user;
		const timestamp = new Date().toLocaleString();
		try {
			const user = await interaction.client.users.fetch(userId);
			const dmMessage = `
Message sent by: ${sender.username}#${sender.discriminator} (ID: ${sender.id})
Timestamp: ${timestamp}

Original message:
${message}
			`;
			await user.send(dmMessage);
			await interaction.reply(`Message sent to <@${userId}>. with the content ${dmMessage}`);
		} catch (error) {
			console.error('Error sending DM:', error);
			await interaction.reply('Failed to send the message. Please check the user ID and try again.');
		}
	},
};
