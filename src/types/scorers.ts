export interface Competition {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
}

export interface Season {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: string | null;
}

export interface Player {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    section: string;
}

export interface Team {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
}

export interface Scorer {
    player: Player;
    team: Team;
    playedMatches: number;
    goals: number;
    assists: number;
    penalties: number | null;
}

export interface TopScorersResponse {
    count: number;
    competition: Competition;
    season: Season;
    scorers: Scorer[];
} 