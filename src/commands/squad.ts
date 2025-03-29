import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import squadService from '../services/squadService';
import logger from '../utils/logger';

const command = {
    data: new SlashCommandBuilder()
        .setName('squad')
        .setDescription('Xem danh sách cầu thủ Manchester United'),

    async execute(interaction: CommandInteraction) {
        try {
            await interaction.deferReply();
            
            logger.info('Squad', 'Fetching squad information');
            const message = await squadService.getSquad();
            
            await interaction.followUp(message);
            
            logger.success('Squad', 'Successfully sent squad information');
        } catch (error) {
            logger.error('Squad', 'Failed to fetch squad information', error);
            await interaction.followUp('❌ Đã xảy ra lỗi khi lấy thông tin đội hình.');
        }
    }
};

export default command; 