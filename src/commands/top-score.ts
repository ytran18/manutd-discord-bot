import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import scorersService from '../services/scorersService';
import logger from '../utils/logger';

const command = {
    data: new SlashCommandBuilder()
        .setName('top-score')
        .setDescription('Xem danh sách cầu thủ ghi bàn nhiều nhất')
        .addStringOption(option =>
            option.setName('league')
                .setDescription('Chọn giải đấu')
                .setRequired(true)
                .addChoices(
                    { name: 'Premier League', value: 'PL' },
                    { name: 'La Liga', value: 'PD' },
                    { name: 'Bundesliga', value: 'BL1' },
                    { name: 'Serie A', value: 'SA' },
                    { name: 'Ligue 1', value: 'FL1' }
                )),

    async execute(interaction: CommandInteraction) {
        try {
            await interaction.deferReply();
            const league = interaction.options.get('league')?.value as string;
            
            logger.info('TopScore', `Fetching top scorers for league: ${league}`);
            const message = await scorersService.getTopScorers(league);
            
            await interaction.followUp(message);
            
            logger.success('TopScore', `Successfully sent top scorers for ${league}`);
        } catch (error) {
            logger.error('TopScore', 'Failed to fetch top scorers', error);
            await interaction.followUp('❌ Đã xảy ra lỗi khi lấy thông tin cầu thủ ghi bàn.');
        }
    }
};

export default command; 