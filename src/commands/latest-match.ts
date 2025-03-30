import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import latestMatchService from '../services/latestMatchService';
import logger from '../utils/logger';

const command = {
    data: new SlashCommandBuilder()
        .setName('latest-match')
        .setDescription('Xem thông tin trận đấu gần nhất của Manchester United'),

    async execute(interaction: CommandInteraction) {
        try {
            await interaction.deferReply();
            
            logger.info('LatestMatch', 'Đang lấy thông tin trận đấu gần nhất');
            const message = await latestMatchService.getLatestMatch();
            
            await interaction.followUp(message);
            
            logger.success('LatestMatch', 'Đã gửi thông tin trận đấu gần nhất thành công');
        } catch (error) {
            logger.error('LatestMatch', 'Lỗi khi lấy thông tin trận đấu gần nhất', error);
            await interaction.followUp('❌ Đã xảy ra lỗi khi lấy thông tin trận đấu. Vui lòng thử lại sau.');
        }
    }
};

export default command; 