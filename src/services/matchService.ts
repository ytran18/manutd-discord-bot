import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

interface Team {
    name: string;
}

interface Competition {
    name: string;
}

interface Match {
    utcDate: string;
    homeTeam: Team;
    awayTeam: Team;
    venue: string;
    competition: Competition;
}

interface MatchResponse {
    matches: Match[];
}

class MatchService {
    async getNextMatch(): Promise<Match | null> {
        try {
            logger.info('MatchService', 'Fetching next match data...');
            
            const response = await axios.get<MatchResponse>(
                `${config.football.apiUrl}/teams/${config.football.manUtdTeamId}/matches`,
                {
                    headers: { 'X-Auth-Token': config.football.authToken }
                }
            );

            if (!response.data || !response.data.matches) {
                logger.error('MatchService', 'Invalid API response structure');
                throw new Error('Invalid API response');
            }

            const matches = response.data.matches;
            if (matches.length === 0) {
                logger.warn('MatchService', 'No matches found in API response');
                return null;
            }

            const now = new Date();
            const nextMatch = matches
                .filter(match => new Date(match.utcDate) > now)
                .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())?.[0];

            if (!nextMatch) {
                logger.warn('MatchService', 'No upcoming matches found');
                return null;
            }

            logger.info('MatchService', `Found next match: ${nextMatch.homeTeam.name} vs ${nextMatch.awayTeam.name}`);
            logger.debug('MatchService', 'Match details:', nextMatch);
            
            return nextMatch;
        } catch (error) {
            logger.error('MatchService', 'Failed to fetch match data', error);
            throw error;
        }
    }

    formatMatchMessage(match: Match): string {
        logger.debug('MatchService', 'Formatting match message for:', match);
        
        const matchTime = new Date(match.utcDate).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour12: false
        });

        return (
            `📅 **Trận đấu sắp tới của Manchester United**\n\n` +
            `⚔️ **${match.homeTeam.name}** 🆚 **${match.awayTeam.name}**\n` +
            `🏟️ **Địa điểm:** ${match.venue || 'Chưa cập nhật'}\n` +
            `⏰ **Thời gian:** ${matchTime} (giờ VN)\n` +
            `🏆 **Giải đấu:** ${match.competition.name}\n\n` +
            `🔥 Hãy sẵn sàng cổ vũ cho Quỷ Đỏ!`
        );
    }
}

export default new MatchService(); 