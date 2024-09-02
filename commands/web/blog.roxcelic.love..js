const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const dns = require('dns');
const util = require('util');

const dnsLookup = util.promisify(dns.lookup);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blog-roxcelic-love')
        .setDescription('Checks the status of my blogs website and github information.'),
    async execute(interaction) {
        async function getWebsiteDetails(url) {
            try {
                const response = await fetch(url);
                const html = await response.text();
                const $ = cheerio.load(html);

                const title = $('title').text();
                const description = $('meta[name="description"]').attr('content') || 'No description';

                return { title, description };
            } catch (error) {
                console.error(`Error fetching website details: ${error.message}`);
                return { title: 'Unknown', description: 'Unknown' };
            }
        }

        async function getGitHubRepoInfo(owner, repo) {
            try {
                const { data: repoData } = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
                const { data: commitsData } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`);
                
                const latestCommit = commitsData[0];
                const commitHash = latestCommit.sha;
                const branchName = repoData.default_branch;
                const lastCommitDate = latestCommit.commit.committer.date;
                const commitMessage = latestCommit.commit.message;
                const commitAuthor = latestCommit.commit.author.name;

                let totalCommits = 0;
                let page = 1;
                const perPage = 100;

                while (true) {
                    const { data: pageCommits } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
                        params: { per_page: perPage, page }
                    });
                    if (pageCommits.length === 0) break;
                    totalCommits += pageCommits.length;
                    page++;
                }

                return {
                    commitHash,
                    branchName,
                    lastCommitDate,
                    commitMessage,
                    commitAuthor,
                    totalCommits,
                    latestCommit
                };
            } catch (error) {
                console.error(`Error fetching GitHub repo info: ${error.message}`);
                return {
                    commitHash: 'Unknown',
                    branchName: 'Unknown',
                    lastCommitDate: 'Unknown',
                    commitMessage: 'Unknown',
                    commitAuthor: 'Unknown',
                    totalCommits: 'Unknown',
                    latestCommit: 'Unknown'
                };
            }
        }

        async function checkWebsiteStatus(url, owner, repo) {
            try {
                const response = await axios.get(url);
                const status = response.status === 200 ? 'Up' : 'Down';
                const { address } = await dnsLookup(new URL(url).hostname);
                const gitInfo = await getGitHubRepoInfo(owner, repo);
                const websiteDetails = await getWebsiteDetails(url);

                return {
                    url,
                    status,
                    ip: address,
                    ...gitInfo,
                    ...websiteDetails
                };
            } catch (error) {
                console.error(`Error checking website status: ${error.message}`);
                return {
                    url,
                    status: 'Down',
                    ip: 'Unknown',
                    commitHash: 'Unknown',
                    branchName: 'Unknown',
                    lastCommitDate: 'Unknown',
                    commitMessage: 'Unknown',
                    commitAuthor: 'Unknown',
                    totalCommits: 'Unknown',
                    title: 'Unknown',
                    description: 'Unknown'
                };
            }
        }

        const result = await checkWebsiteStatus("https://blog.roxcelic.love", "roxcelic", "blog");
        await interaction.reply({
            content: `\`\`\`Website Information:
            URL: ${result.url}
            Status: ${result.status}
            IP Address: ${result.ip}
            Title: ${result.title}
            Description: ${result.description}

            GitHub Repository Information:
            Commit Hash: ${result.commitHash}
            Branch Name: ${result.branchName}
            Last Commit Date: ${result.lastCommitDate}
            Commit Message: ${result.commitMessage}
            Commit Author: ${result.commitAuthor}
            Total Commits: ${result.totalCommits}
            \`\`\``,
        });
    },
};
