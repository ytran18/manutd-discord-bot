import axios from 'axios';
import config from '../config';
import { TopScorersResponse } from '../types/scorers';
import logger from '../utils/logger';

class ScorersService {
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    }

    private formatScorerInfo(scorer: TopScorersResponse['scorers'][0]): string {
        const { player, team, playedMatches, goals, assists, penalties } = scorer;
        const penaltiesText = penalties ? `(${penalties} penalties)` : '';
        return `${player.name} - ${team.shortName} - ${goals} goals ${penaltiesText} - ${assists} assists - ${playedMatches} matches`;
    }

    private formatScorersMessage(data: TopScorersResponse): string {
        const lines: string[] = [];
        const season = `${new Date(data.season.startDate).getFullYear()}/${new Date(data.season.endDate).getFullYear()}`;
        
        // Header
        lines.push('```ansi');
        lines.push(`\x1b[1;33m=== ${data.competition.name} Top Scorers (${season}) ===\x1b[0m`);
        lines.push('');

        // Scorers
        data.scorers.forEach((scorer, index) => {
            const position = index + 1;
            const line = this.formatScorerInfo(scorer);
            if (position <= 3) {
                // Highlight top 3 with different colors
                const color = position === 1 ? '33' : position === 2 ? '32' : '36';
                lines.push(`\x1b[1;${color}m${position}. ${line}\x1b[0m`);
            } else {
                lines.push(`${position}. ${line}`);
            }
        });

        lines.push('```');
        return lines.join('\n');
    }

    async getTopScorers(competition: string): Promise<string> {
        try {
            logger.info('ScorersService', `Fetching top scorers for competition ${competition}`);
            
            const response = await axios.get<TopScorersResponse>(
                `${config.football.apiUrl}/competitions/${competition}/scorers`,
                {
                    headers: { 'X-Auth-Token': config.football.authToken }
                }
            );

            return this.formatScorersMessage(response.data);
        } catch (error) {
            logger.error('ScorersService', 'Failed to fetch top scorers', error);
            throw error;
        }
    }
}

export default new ScorersService(); 