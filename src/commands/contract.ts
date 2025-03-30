import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import contractService from '../services/contractService';
import logger from '../utils/logger';

const command = {
    data: new SlashCommandBuilder()
        .setName('contract')
        .setDescription('Xem thông tin hợp đồng của các cầu thủ Manchester United'),

    async execute(interaction: CommandInteraction) {
        try {
            await interaction.deferReply();
            
            logger.info('Contract', 'Fetching contract information');
            const message = await contractService.getContracts();
            
            await interaction.followUp(message);
            
            logger.success('Contract', 'Successfully sent contract information');
        } catch (error) {
            logger.error('Contract', 'Failed to fetch contract information', error);
            await interaction.followUp('❌ Đã xảy ra lỗi khi lấy thông tin hợp đồng. Vui lòng thử lại sau.');
        }
    }
};

export default command; 