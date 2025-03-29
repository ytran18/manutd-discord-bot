export interface Contract {
    start: string;
    until: string;
}

export type Position = 
    | 'Goalkeeper'
    | 'Centre-Back'
    | 'Right-Back'
    | 'Left-Back'
    | 'Defensive Midfield'
    | 'Central Midfield'
    | 'Attacking Midfield'
    | 'Right Winger'
    | 'Left Winger'
    | 'Centre-Forward';

export interface Player {
    id: number;
    name: string;
    position: string;
    dateOfBirth: string;
    nationality: string;
    shirtNumber?: number;
}

export interface Coach {
    id: number;
    name: string;
    dateOfBirth: string;
    nationality: string;
    contract: Contract;
}

export interface SquadResponse {
    squad: Player[];
    coach: Coach;
} 