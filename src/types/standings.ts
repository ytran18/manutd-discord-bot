interface Team {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
}

interface TableEntry {
    position: number;
    team: Team;
    playedGames: number;
    won: number;
    draw: number;
    lost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
}

interface Standing {
    stage: string;
    type: 'TOTAL' | 'HOME' | 'AWAY';
    table: TableEntry[];
}

export interface StandingsResponse {
    competition: {
        name: string;
    };
    standings: Standing[];
}

export interface FormattedStanding {
    position: number;
    teamName: string;
    played: number;
    won: number;
    draw: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    isManUtd: boolean;
} 