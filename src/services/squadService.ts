import axios from 'axios';
import config from '../config';
import { SquadResponse, Position } from '../types/squad';
import logger from '../utils/logger';

class SquadService {
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    }

    private getDisplayPosition(position: string): string {
        switch (position) {
            case 'Goalkeeper': return 'GK';
            case 'Centre-Back': return 'CB';
            case 'Right-Back': return 'RB';
            case 'Left-Back': return 'LB';
            case 'Defensive Midfield': return 'CDM';
            case 'Central Midfield': return 'CM';
            case 'Attacking Midfield': return 'CAM';
            case 'Right Winger': return 'RW';
            case 'Left Winger': return 'LW';
            case 'Centre-Forward': return 'CF';
            default: return position;
        }
    }

    private formatPlayerInfo(name: string, position: string, dateOfBirth: string, nationality: string): string {
        const displayPosition = this.getDisplayPosition(position);
        return `${name} - ${displayPosition} - ${this.formatDate(dateOfBirth)} - ${nationality}`;
    }

    private formatSquadMessage(data: SquadResponse): string {
        const lines: string[] = [];
        
        // Coach
        lines.push('```ansi');
        lines.push('\x1b[1;33m=== COACH ===\x1b[0m');
        lines.push(this.formatPlayerInfo(data.coach.name, 'Coach', data.coach.dateOfBirth, data.coach.nationality));
        lines.push('');

        // Goalkeepers
        lines.push('\x1b[1;33m=== GOALKEEPERS ===\x1b[0m');
        const goalkeepers = data.squad.filter(p => p.position === 'Goalkeeper');
        goalkeepers.forEach(player => {
            lines.push(this.formatPlayerInfo(player.name, player.position, player.dateOfBirth, player.nationality));
        });
        lines.push('');

        // Defenders
        lines.push('\x1b[1;33m=== DEFENDERS ===\x1b[0m');
        const defenders = data.squad.filter(p => 
            ['Centre-Back', 'Right-Back', 'Left-Back'].includes(p.position)
        );
        defenders.forEach(player => {
            lines.push(this.formatPlayerInfo(player.name, player.position, player.dateOfBirth, player.nationality));
        });
        lines.push('');

        // Midfielders
        lines.push('\x1b[1;33m=== MIDFIELDERS ===\x1b[0m');
        const midfielders = data.squad.filter(p => 
            ['Defensive Midfield', 'Central Midfield', 'Attacking Midfield'].includes(p.position)
        );
        midfielders.forEach(player => {
            lines.push(this.formatPlayerInfo(player.name, player.position, player.dateOfBirth, player.nationality));
        });
        lines.push('');

        // Wingers
        lines.push('\x1b[1;33m=== WINGERS ===\x1b[0m');
        const wingers = data.squad.filter(p => 
            ['Right Winger', 'Left Winger'].includes(p.position)
        );
        wingers.forEach(player => {
            lines.push(this.formatPlayerInfo(player.name, player.position, player.dateOfBirth, player.nationality));
        });
        lines.push('');

        // Forwards
        lines.push('\x1b[1;33m=== FORWARDS ===\x1b[0m');
        const forwards = data.squad.filter(p => p.position === 'Centre-Forward');
        forwards.forEach(player => {
            lines.push(this.formatPlayerInfo(player.name, player.position, player.dateOfBirth, player.nationality));
        });

        lines.push('```');
        return lines.join('\n');
    }

    async getSquad(): Promise<string> {
        try {
            logger.info('SquadService', 'Fetching squad information');
            
            const response = await axios.get<SquadResponse>(
                `${config.football.apiUrl}/teams/${config.football.manUtdTeamId}`,
                {
                    headers: { 'X-Auth-Token': config.football.authToken }
                }
            );

            return this.formatSquadMessage(response.data);
        } catch (error) {
            logger.error('SquadService', 'Failed to fetch squad information', error);
            throw error;
        }
    }
}

export default new SquadService(); 