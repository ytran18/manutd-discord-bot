import axios from 'axios';
import config from '../config';
import { StandingsResponse, FormattedStanding } from '../types/standings';
import logger from '../utils/logger';

class StandingsService {
    private formatStandings(data: StandingsResponse): FormattedStanding[] {
        const totalStandings = data.standings.find(s => s.type === 'TOTAL');
        if (!totalStandings) return [];

        return totalStandings.table.map(entry => ({
            position: entry.position,
            teamName: entry.team.shortName || entry.team.name,
            played: entry.playedGames,
            won: entry.won,
            draw: entry.draw,
            lost: entry.lost,
            goalsFor: entry.goalsFor,
            goalsAgainst: entry.goalsAgainst,
            points: entry.points,
            isManUtd: entry.team.name.includes('Manchester United') || entry.team.shortName === 'Man United'
        }));
    }

    private formatMessage(standings: FormattedStanding[], competitionName: string): string {
        const header = `🏆 ${competitionName}\n\n`;
        
        // Table header
        const table = [
            '┌────┬────────────────┬──┬──┬──┬──┬────┬────┐',
            '│ #  │ Team           │ P│ W│ D│ L│ GD │ Pts│',
            '├────┼────────────────┼──┼──┼──┼──┼────┼────┤'
        ];

        // Add all teams
        standings.forEach(team => {
            const goalDiff = team.goalsFor - team.goalsAgainst;
            const goalDiffStr = (goalDiff > 0 ? '+' : '') + goalDiff;
            
            if (team.isManUtd) {
                table.push(this.formatTableRow(team, goalDiffStr, true));
            } else {
                table.push(this.formatTableRow(team, goalDiffStr, false));
            }
        });

        // Add table footer
        table.push('└────┴────────────────┴──┴──┴──┴──┴────┴────┘');

        return header + table.join('\n');
    }

    private formatTableRow(team: FormattedStanding, goalDiff: string, isManUtd: boolean): string {
        const row = `│ ${team.position.toString().padStart(2)} │ ${team.teamName.padEnd(14)} │${team.played.toString().padStart(2)}│${team.won.toString().padStart(2)}│${team.draw.toString().padStart(2)}│${team.lost.toString().padStart(2)}│${goalDiff.padStart(4)}│${team.points.toString().padStart(4)}│`;
        
        if (isManUtd) {
            return `\x1b[31m${row}\x1b[0m`;
        }
        return row;
    }

    async getStandings(competitionId: string): Promise<string> {
        try {
            logger.info('StandingsService', `Fetching standings for competition ${competitionId}`);
            
            const response = await axios.get<StandingsResponse>(
                `${config.football.apiUrl}/competitions/${competitionId}/standings`,
                {
                    headers: { 'X-Auth-Token': config.football.authToken }
                }
            );

            const formattedStandings = this.formatStandings(response.data);
            return this.formatMessage(formattedStandings, response.data.competition.name);
        } catch (error) {
            logger.error('StandingsService', 'Failed to fetch standings', error);
            throw error;
        }
    }
}

export default new StandingsService(); 