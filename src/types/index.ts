export type PlayerPosition = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
export type MatchStatus = 'SCHEDULED' | 'FINISHED' | 'LIVE';
export type EventType = 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION';

export interface Team {
    id: string;
    name: string;
    shortName: string;
    city: string;
    stadium: string;
    logoUrl?: string;
}

export interface Player {
    id: string;
    teamId: string;
    name: string;
    position: PlayerPosition;
    nationality: string;
    number: number;
}

export interface Match {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    date: string;
    status: MatchStatus;
    seasonId: string;
}

export interface Season {
    id: string;
    year: string;
    isActive: boolean;
}

export interface Standing {
    teamId: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
}

export interface MatchEvent {
    id: string;
    matchId: string;
    playerId: string;
    type: EventType;
    minute: number;
}

export interface User {
    id: string;
    username: string;
    role: 'GUEST' | 'ADMIN';
}
