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
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath).default as Command;
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

// Register slash commands
const rest = new REST({ version: '10' }).setToken(config.discord.token);

(async () => {
    try {
        logger.info('Bot', 'Refreshing application commands...');
        const commands = Array.from(client.commands.values()).map(command => command.data.toJSON());
        
        await rest.put(
            Routes.applicationGuildCommands(
                config.discord.clientId,
                config.discord.guildId
            ),
            { body: commands }
        );
        logger.success('Bot', 'Registered commands successfully!');
    } catch (error) {
        logger.error('Bot', 'Error when registering commands:', error);
    }
})();

// Event handlers
client.once('ready', () => {
    logger.success('Bot', `✅ Bot đã sẵn sàng! Đăng nhập với tên ${client.user?.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        logger.error('Bot', 'Error executing command:', error);
        const errorMessage = { content: 'Đã xảy ra lỗi khi thực hiện lệnh!', ephemeral: true };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Start bot
client.login(config.discord.token); 