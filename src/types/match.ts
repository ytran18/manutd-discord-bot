export interface Team {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
}

export interface Score {
    winner: string | null;
    duration: string;
    fullTime: {
        home: number | null;
        away: number | null;
    };
    halfTime: {
        home: number | null;
        away: number | null;
    };
}

export interface Match {
    id: number;
    utcDate: string;
    status: string;
    stage: string;
    competition: {
        id: number;
        name: string;
        emblem: string;
    };
    homeTeam: Team;
    awayTeam: Team;
    score: Score;
}

export interface MatchesResponse {
    matches: Match[];
} 