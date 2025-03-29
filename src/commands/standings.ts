import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import standingsService from '../services/standingsService';
import logger from '../utils/logger';

const command = {
    data: new SlashCommandBuilder()
        .setName('standings')
        .setDescription('Xem bảng xếp hạng giải đấu')
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
            
            logger.info('Standings', `Fetching standings for league: ${league}`);
            const message = await standingsService.getStandings(league);
            
            await interaction.followUp({
                content: '```ansi\n' + message + '```'
            });
            
            logger.success('Standings', `Successfully sent standings for ${league}`);
        } catch (error) {
            logger.error('Standings', 'Failed to fetch standings', error);
            await interaction.followUp('❌ Đã xảy ra lỗi khi lấy thông tin bảng xếp hạng.');
        }
    }
};

export default command; 