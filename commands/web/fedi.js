const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const he = require('he');

const DEFAULT_ACCOUNT_ID = 'AjITkomZCGnFUiYbc8';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fedi')
        .setDescription('Fetches information about a user from the Akkoma instance.')
        .addStringOption(option =>
            option.setName('account_id')
                .setDescription('The account ID of the user to fetch information for')
                .setRequired(false)),
    async execute(interaction) {
        const accountId = interaction.options.getString('account_id') || DEFAULT_ACCOUNT_ID;
        const baseUrl = 'https://fedi.roxcelic.love/api/v1/accounts';
        async function fetchUserData(accountId) {
            try {
                const userUrl = `${baseUrl}/${accountId}`;
                const response = await fetch(userUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const userData = await response.json();
                return userData;
            } catch (error) {
                console.error(`Error fetching user data: ${error.message}`);
                return null;
            }
        }
        async function fetchUserStatuses(accountId) {
            try {
                const statusesUrl = `${baseUrl}/${accountId}/statuses`;
                const response = await fetch(statusesUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const statusesData = await response.json();
                return statusesData;
            } catch (error) {
                console.error(`Error fetching user statuses: ${error.message}`);
                return null;
            }
        }
        const userData = await fetchUserData(accountId);
        const statusesData = await fetchUserStatuses(accountId);
        if (!userData || !statusesData) {
            await interaction.reply({ content: 'Could not fetch data. Please try again later.', ephemeral: true });
            return;
        }
        const latestStatuses = statusesData.slice(0, 3).map(status => {
            const content = he.decode(status.content || 'No content').replace(/`/g, '\\`');
            return `- ${content} -\n\t- ${status.url} -\n`;
        }).join('\n');
        const replyContent = `
        **User Profile Information**
        \`\`\`
- Username: ${he.decode(userData.username || 'Unknown')}
- Display Name: ${he.decode(userData.display_name || 'Unknown')}
- Bio: ${he.decode(userData.note || 'No bio available')}
- Followers Count: ${userData.followers_count || 'Unknown'}
- Following Count: ${userData.following_count || 'Unknown'}
- Posts Count: ${userData.statuses_count || 'Unknown'}
- Avatar URL: ${he.decode(userData.avatar || 'No avatar available')}
        \`\`\`
**Latest Statuses:**
        \`\`\`
${latestStatuses || 'No recent statuses'}
        \`\`\`
        `;
        await interaction.reply({ content: replyContent });
    },
};
