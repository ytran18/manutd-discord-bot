import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import config from './config';
import { Command } from './types/command';
import logger from './utils/logger';

// Initialize express
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Bot is running!');
});

app.listen(port, () => {
    logger.info('Express', `Server is running on port ${port}`);
});

// Extend Client type to include commands
declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, Command>;
    }
}

// Initialize client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Initialize commands collection
client.commands = new Collection<string, Command>();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => 
    file.endsWith('.ts') || file.endsWith('.js')
);

logger.info('Bot', `Loading commands from ${commandsPath}`);
logger.debug('Bot', 'Found command files:', commandFiles);

for (const file of commandFiles) {
    try {
        const filePath = path.join(commandsPath, file);
        logger.debug('Bot', `Loading command from ${filePath}`);
        
        const command = require(filePath).default as Command;
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            logger.success('Bot', `Loaded command: ${command.data.name}`);
        } else {
            logger.warn('Bot', `Invalid command file: ${file}`);
        }
    } catch (error) {
        logger.error('Bot', `Failed to load command ${file}:`, error);
    }
}

// Register slash commands
const rest = new REST({ version: '10' }).setToken(config.discord.token);

(async () => {
    try {
        logger.info('Bot', 'Started refreshing application commands...');
        const commands = Array.from(client.commands.values()).map(command => command.data.toJSON());
        
        logger.debug('Bot', 'Registering commands:', commands);
        
        await rest.put(
            Routes.applicationGuildCommands(
                config.discord.clientId,
                config.discord.guildId
            ),
            { body: commands }
        );
        logger.success('Bot', 'Successfully registered application commands');
    } catch (error) {
        logger.error('Bot', 'Failed to register application commands:', error);
    }
})();

// Event handlers
client.once('ready', () => {
    logger.success('Bot', `Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        logger.warn('Bot', `No command matching ${interaction.commandName} was found`);
        return;
    }

    try {
        logger.debug('Bot', `Executing command: ${interaction.commandName}`, {
            user: interaction.user.tag,
            guild: interaction.guild?.name,
            channel: interaction.channel?.id
        });
        
        await command.execute(interaction);
    } catch (error) {
        logger.error('Bot', `Error executing command ${interaction.commandName}:`, error);
        
        const errorMessage = { content: 'Đã xảy ra lỗi khi thực hiện lệnh!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Start bot
client.login(config.discord.token)
    .then(() => logger.info('Bot', 'Connecting to Discord...'))
    .catch(error => logger.error('Bot', 'Failed to connect to Discord:', error)); 