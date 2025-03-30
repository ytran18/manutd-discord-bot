import axios from 'axios';
import config from '../config';
import { MatchesResponse } from '../types/match';
import logger from '../utils/logger';

class LatestMatchService {
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

    private formatScore(match: MatchesResponse['matches'][0]): string {
        if (match.status === 'FINISHED') {
            const { fullTime, halfTime } = match.score;
            return `${fullTime.home} - ${fullTime.away} (HT: ${halfTime.home} - ${halfTime.away})`;
        }
        return 'Chưa có kết quả';
    }

    private formatMatchMessage(match: MatchesResponse['matches'][0]): string {
        const lines: string[] = [];
        const isHome = match.homeTeam.id === Number(config.football.manUtdTeamId);
        const opponent = isHome ? match.awayTeam : match.homeTeam;
        
        // Header
        lines.push('```ansi');
        lines.push('\x1b[1;33m=== Trận đấu gần nhất của Manchester United ===\x1b[0m');
        lines.push('');

        // Competition
        lines.push(`\x1b[1;36m🏆 Giải đấu: ${match.competition.name}\x1b[0m`);
        lines.push('');

        // Teams
        if (isHome) {
            lines.push(`⚔️ Manchester United vs ${opponent.name}`);
        } else {
            lines.push(`⚔️ ${opponent.name} vs Manchester United`);
        }

        // Date and Status
        lines.push(`📅 Thời gian: ${this.formatDate(match.utcDate)}`);
        lines.push(`📌 Trạng thái: ${match.status}`);

        // Score with color based on result
        const score = this.formatScore(match);
        if (match.status === 'FINISHED') {
            const result = match.score.winner === (isHome ? 'HOME_TEAM' : 'AWAY_TEAM') ? '32' : // Win - Green
                          match.score.winner === null ? '33' : // Draw - Yellow
                          '31'; // Loss - Red
            lines.push(`⚽ Tỉ số: \x1b[1;${result}m${score}\x1b[0m`);
        } else {
            lines.push(`⚽ Tỉ số: ${score}`);
        }

        lines.push('```');
        return lines.join('\n');
    }

    async getLatestMatch(): Promise<string> {
        try {
            logger.info('LatestMatchService', 'Đang lấy thông tin trận đấu gần nhất');
            
            const today = new Date();
            const dateFrom = new Date(today);
            dateFrom.setDate(today.getDate() - 30); // Look back 30 days
            
            const response = await axios.get<MatchesResponse>(
                `${config.football.apiUrl}/teams/${config.football.manUtdTeamId}/matches`,
                {
                    headers: { 'X-Auth-Token': config.football.authToken },
                    params: {
                        dateFrom: dateFrom.toISOString().split('T')[0],
                        dateTo: today.toISOString().split('T')[0],
                        status: 'FINISHED',
                        limit: 1
                    }
                }
            );

            console.log({response: response.config.params});
            

            if (response.data.matches.length === 0) {
                return '```Không tìm thấy trận đấu nào trong 30 ngày gần đây```';
            }

            const latestMatch = response.data.matches[0];
            return this.formatMatchMessage(latestMatch);
        } catch (error) {
            logger.error('LatestMatchService', 'Lỗi khi lấy thông tin trận đấu gần nhất', error);
            throw error;
        }
    }
}

export default new LatestMatchService(); 