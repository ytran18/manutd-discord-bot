import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import matchService from '../services/matchService';
import logger from '../utils/logger';

interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('incoming-match')
        .setDescription('Xem thông tin trận đấu sắp tới'),
        
    async execute(interaction: CommandInteraction) {
        try {
            logger.info('IncomingMatch', `Command executed by user: ${interaction.user.tag}`);
            
            await interaction.deferReply();
            const nextMatch = await matchService.getNextMatch();
            
            if (!nextMatch) {
                logger.warn('IncomingMatch', 'No match data available');
                await interaction.followUp('❌ Không thể lấy thông tin trận đấu.');
                return;
            }

            const message = matchService.formatMatchMessage(nextMatch);
            await interaction.followUp(message);
            logger.info('IncomingMatch', 'Successfully sent match information');
            
        } catch (error) {
            logger.error('IncomingMatch', 'Error executing incoming-match command:', error);
            await interaction.followUp('❌ Đã xảy ra lỗi khi lấy thông tin trận đấu.');
        }
    }
};

export default command; 