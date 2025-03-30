import axios from 'axios';
import config from '../config';
import { PersonResponse } from '../types/person';
import { SquadResponse } from '../types/squad';
import logger from '../utils/logger';

interface PersonContract {
    id: number;
    name: string;
    position: string;
    contractStart: string;
    contractEnd: string;
}

class ContractService {
    private async getPersonDetails(personId: number): Promise<PersonResponse> {
        try {
            const response = await axios.get<PersonResponse>(
                `${config.football.apiUrl}/persons/${personId}`,
                {
                    headers: { 'X-Auth-Token': config.football.authToken }
                }
            );
            return response.data;
        } catch (error) {
            logger.error('ContractService', `Failed to fetch person details for ID ${personId}`, error);
            throw error;
        }
    }

    private async getAllPersonContracts(squad: SquadResponse): Promise<PersonContract[]> {
        const contracts: PersonContract[] = [];
        const delay = 6000; // 6 seconds delay to respect rate limit (10 requests per minute)

        // Process coach first
        try {
            const coachDetails = await this.getPersonDetails(squad.coach.id);
            if (coachDetails.currentTeam?.contract) {
                contracts.push({
                    id: coachDetails.id,
                    name: coachDetails.name,
                    position: 'Coach',
                    contractStart: coachDetails.currentTeam.contract.start,
                    contractEnd: coachDetails.currentTeam.contract.until
                });
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error) {
            logger.error('ContractService', `Error fetching coach details`, error);
        }

        // Process players in batches to respect rate limit
        for (const player of squad.squad) {
            try {
                const playerDetails = await this.getPersonDetails(player.id);
                if (playerDetails.currentTeam?.contract) {
                    contracts.push({
                        id: playerDetails.id,
                        name: playerDetails.name,
                        position: playerDetails.position || player.position,
                        contractStart: playerDetails.currentTeam.contract.start,
                        contractEnd: playerDetails.currentTeam.contract.until
                    });
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            } catch (error) {
                logger.error('ContractService', `Error fetching player details for ID ${player.id}`, error);
                continue;
            }
        }

        return contracts.sort((a, b) => {
            const dateA = new Date(a.contractEnd);
            const dateB = new Date(b.contractEnd);
            return dateA.getTime() - dateB.getTime();
        });
    }

    private formatContractMessage(contracts: PersonContract[]): string {
        const lines: string[] = [];
        
        // Header
        lines.push('```ansi');
        lines.push('\x1b[1;33m=== Manchester United Contracts ===\x1b[0m');
        lines.push('');

        // Group contracts by year
        const contractsByYear: { [key: string]: PersonContract[] } = {};
        contracts.forEach(contract => {
            const year = contract.contractEnd?.split('-')[0];
            if (!contractsByYear[year]) {
                contractsByYear[year] = [];
            }
            contractsByYear[year].push(contract);
        });

        // Display contracts by year
        Object.keys(contractsByYear).sort().forEach(year => {
            lines.push(`\x1b[1;36m=== Contracts ending in ${year} ===\x1b[0m`);
            contractsByYear[year].forEach(contract => {
                const contractPeriod = `${contract.contractEnd}`;
                lines.push(`${contract.name} - ${contractPeriod}`);
            });
            lines.push('');
        });

        lines.push('```');
        return lines.join('\n');
    }

    async getContracts(): Promise<string> {
        try {
            logger.info('ContractService', 'Fetching squad information');
            
            // First get the squad
            const squadResponse = await axios.get<SquadResponse>(
                `${config.football.apiUrl}/teams/${config.football.manUtdTeamId}`,
                {
                    headers: { 'X-Auth-Token': config.football.authToken }
                }
            );

            // Then get contract details for each person
            const contracts = await this.getAllPersonContracts(squadResponse.data);

            return this.formatContractMessage(contracts);
        } catch (error) {
            logger.error('ContractService', 'Failed to fetch contracts', error);
            throw error;
        }
    }
}

export default new ContractService(); 