import axios from 'axios';
import { Client, TextChannel } from 'discord.js';
import config from '../config';
import { MatchesResponse } from '../types/match';
import logger from '../utils/logger';

class MatchNotificationService {
    private formatDate(utcDate: string): string {
        const date = new Date(utcDate);
        return date.toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    private async getUpcomingMatch(): Promise<MatchesResponse['matches'][0] | null> {
        try {
            const today = new Date();
            const dateTo = new Date(today);
            dateTo.setDate(today.getDate() + 7); // Look ahead 7 days

            const response = await axios.get<MatchesResponse>(
                `${config.football.apiUrl}/teams/${config.football.manUtdTeamId}/matches`,
                {
                    headers: { 'X-Auth-Token': config.football.authToken },
                }
            );

            if (response.data.matches.length === 0) {
                return null;
            }

            const now = new Date();
            const nextMatch = response.data.matches
                .filter(match => new Date(match.utcDate) > now)
                .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())?.[0];

            return nextMatch;
        } catch (error) {
            logger.error('MatchNotificationService', 'Lỗi khi lấy thông tin trận đấu sắp tới', error);
            return null;
        }
    }

    private formatNotificationMessage(match: MatchesResponse['matches'][0]): string {
        const matchTime = this.formatDate(match.utcDate);
        const isHome = match.homeTeam.id === Number(config.football.manUtdTeamId);
        const opponent = isHome ? match.awayTeam : match.homeTeam;
        const venue = isHome ? 'Old Trafford' : opponent.name;

        return `@everyone\n\n` +
               `🚨 **THÔNG BÁO TRẬN ĐẤU SẮP DIỄN RA: D-DAY** 🚨\n\n` +
               `🏆 **Giải đấu:** ${match.competition.name}\n` +
               `⚔️ **Trận đấu:** ${isHome ? 'Manchester United' : opponent.name} vs ${isHome ? opponent.name : 'Manchester United'}\n` +
               `🏟️ **Sân vận động:** ${venue}\n` +
               `📅 **Thời gian:** ${matchTime}\n\n` +
               `Hãy cùng cổ vũ cho Quỷ Đỏ! 🔴⚪️⚫️`;
    }

    async checkAndNotify(client: Client): Promise<void> {
        try {
            const match = await this.getUpcomingMatch();
            
            if (!match) return;

            const matchTime = new Date(match.utcDate);
            const now = new Date();
            const hoursUntilMatch = (matchTime.getTime() - now.getTime()) / (1000 * 60 * 60);

            // Notify if match is between 18-19 hours away
            if (hoursUntilMatch > 18 && hoursUntilMatch < 19) {
                const channel = await client.channels.fetch(config.discord.channelId) as TextChannel;
                if (channel) {
                    const message = this.formatNotificationMessage(match);
                    await channel.send(message);
                    logger.info('MatchNotificationService', `Đã gửi thông báo cho trận đấu ${match.homeTeam.name} vs ${match.awayTeam.name}`);
                }
            }
        } catch (error) {
            logger.error('MatchNotificationService', 'Lỗi khi gửi thông báo trận đấu', error);
        }
    }
}

export default new MatchNotificationService(); 