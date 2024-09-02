const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

// Array to hold command data
const commands = [];

// Path to the commands folder
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Read commands from files
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Create an instance of REST and set the token
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Optionally set properties for all commands
        commands.forEach(element => {
            element.dm_permission = true; // Allow this command in DMs
            element.contexts = [0, 1, 2]; // Set available contexts
            element.integration_types = [0, 1]; // Set integration types
        });

        // Register commands globally
        const data = await rest.put(Routes.applicationCommands(clientId), {
            body: commands,
        });

        console.log('Successfully reloaded application (/) commands.');
        console.log('Commands registered:', data);
    } catch (error) {
        console.error('Error registering commands:', error);
    }
})();
