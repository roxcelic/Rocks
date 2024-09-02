const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const MAX_MESSAGE_LENGTH = 1970; // Length to allow space for headers

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fetch')
		.setDescription('Fetches data from the API with provided parameters.')
		.addStringOption(option =>
			option.setName('param')
				.setDescription('Parameters for the API call, separated by periods.')
				.setRequired(false)), // Parameter is not required
	async execute(interaction) {
		const paramInput = interaction.options.getString('param');
		const params = paramInput ? paramInput.split('.').map(p => p.trim()) : [];

		let apiUrl = 'https://api.roxcelic.love';

		try {
			const response = await axios.get(apiUrl);
			let data = response.data;

			// Function to get the closest matching parameter
			const getClosestMatch = (obj, params) => {
				let current = obj;
				for (const param of params) {
					if (current[param] !== undefined) {
						current = current[param];
					} else {
						return current; // Return the closest match available
					}
				}
				return current;
			};

			// Function to get headers at the top level
			const getTopLevelHeaders = (obj) => {
				return Object.keys(obj).map(key => `${key}`);
			};

			// Function to get child headers at a specific level
			const getChildHeaders = (obj, level) => {
				let current = obj;
				for (let i = 0; i < level; i++) {
					if (typeof current === 'object' && !Array.isArray(current)) {
						current = current[Object.keys(current)[0]]; // Navigate to the next level
					} else {
						return []; // Not an object at this level
					}
				}
				return Object.keys(current).map(key => `${key}`);
			};

			let headers;
			if (params.length === 0) {
				// Get top-level headers
				headers = getTopLevelHeaders(data);
			} else {
				// Get headers for the specified parameter
				const level = params.length - 1; // The level we're interested in
				let current = data;
				for (const param of params) {
					if (current[param] !== undefined) {
						current = current[param];
					} else {
						current = {}; // If parameter not found, return an empty object
					}
				}
				headers = Object.keys(current).map(key => `${params.join('.')}.${key}`);
			}

			let result = params.length ? getClosestMatch(data, params) : data;
			let formattedResult = JSON.stringify(result, null, 2);

			// Check if the result is a primitive value
			const isPrimitive = (value) => value === null || (typeof value !== 'object' && typeof value !== 'function');

			let responseMessage;

			if (isPrimitive(result)) {
				// If result is primitive, only include the result in the response
				responseMessage = `Result:\n\`\`\`json\n${formattedResult}\n\`\`\``;
			} else {
				// If result is an object or array, include headers and result in the response
				const headersText = `Possible headers:\n\`\`\`json\n${JSON.stringify(headers, null, 2)}\n\`\`\`\n`;

				// Truncate headers and result if the combined message is too long
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
