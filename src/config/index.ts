import dotenv from 'dotenv';

dotenv.config();

interface DiscordConfig {
    token: string;
    clientId: string;
    guildId: string;
    channelId: string;
}

interface FootballConfig {
    apiUrl: string;
    authToken: string;
    manUtdTeamId: string;
}

interface Config {
    discord: DiscordConfig;
    football: FootballConfig;
}

const config: Config = {
    discord: {
        token: process.env.DISCORD_TOKEN || '',
        clientId: process.env.DISCORD_BOT_CLIENT_ID || '',
        guildId: process.env.GUILD_ID || '',
        channelId: process.env.CHANNEL_ID || ''
    },
    football: {
        apiUrl: process.env.API_URL || '',
        authToken: process.env.API_AUTH_TOKEN || '',
        manUtdTeamId: process.env.MANUTD_TEAM_ID || ''
    }
};

export default config; 