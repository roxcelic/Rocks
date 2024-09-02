const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const MAX_MESSAGE_LENGTH = 1970;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fetch')
		.setDescription('Fetches data from the API with provided parameters.')
		.addStringOption(option =>
			option.setName('param')
				.setDescription('Parameters for the API call, separated by periods.')
				.setRequired(false)),
	async execute(interaction) {
		// Corrected the option name here
		const paramInput = interaction.options.getString('param');
		const params = paramInput ? paramInput.split('.').map(p => p.trim()) : [];

		let apiUrl = 'https://api.roxcelic.love';

		try {
			const response = await axios.get(apiUrl);
			let data = response.data;

			const getClosestMatch = (obj, params) => {
				let current = obj;
				for (const param of params) {
					if (current && typeof current === 'object' && current[param] !== undefined) {
						current = current[param];
					} else {
						return current;
					}
				}
				return current;
			};

			const getTopLevelHeaders = (obj) => {
				if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
					return Object.keys(obj).map(key => `${key}`);
				}
				return [];
			};

			let headers;
			if (params.length === 0) {
				headers = getTopLevelHeaders(data);
			} else {
				let current = data;
				for (const param of params) {
					if (current && typeof current === 'object' && current[param] !== undefined) {
						current = current[param];
					} else {
						current = {};
					}
				}
				headers = Object.keys(current).map(key => `${params.join('.')}.${key}`);
			}

			let result = params.length ? getClosestMatch(data, params) : data;
			let formattedResult = JSON.stringify(result, null, 2);
			const isPrimitive = (value) => value === null || (typeof value !== 'object' && typeof value !== 'function');

			let responseMessage;

			if (isPrimitive(result)) {
				responseMessage = `Result:\n\`\`\`json\n${formattedResult}\n\`\`\``;
			} else {
				const headersText = `Possible headers:\n\`\`\`json\n${JSON.stringify(headers, null, 2)}\n\`\`\`\n`;
				let maxResultLength = MAX_MESSAGE_LENGTH - headersText.length;
				if (formattedResult.length > maxResultLength) {
					formattedResult = formattedResult.substring(0, maxResultLength - 3) + '...';
				}
				responseMessage = `${headersText}Result:\n\`\`\`json\n${formattedResult}\n\`\`\``;
			}
			await interaction.reply(responseMessage);
		} catch (error) {
			console.error('Error fetching data:', error);
			await interaction.reply('An error occurred while fetching data from the API.');
		}
	},
};
