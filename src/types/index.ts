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
    coach?: string;
}

export interface PlayerStats {
    goals: number;
    assists: number;
    cleanSheets: number;
}

export interface Player {
    id: string;
    teamId: string;
    name: string;
    commonName?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    position: PlayerPosition;
    detailedPosition?: string;
    nationality: string;
    nationalityCode?: string;
    nationalityISO2?: string;
    number: number;
    height?: number;
    weight?: number;
    dateOfBirth?: string;
    imagePath?: string;
    isCaptain?: boolean;
    statistics?: PlayerStats;
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
    matchday?: number;
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
    team: Team;
    nextOpponent?: string;
    nextOpponentLogo?: string;
    form?: string[];
    position: number;
}

export interface MatchEvent {
    id: string;
    matchId: string;
    playerId: string;
    type: EventType;
    minute: number;
}

export interface GoalEvent {
    id: string;
    matchId: string;
    matchIndex: number;
    matchday: number;
    homeTeam: string;
    awayTeam: string;
    scorerId: string;
    scorerName: string;
    assistId?: string;
    assistName?: string;
    teamName: string;
    teamId: string;
    minute: number;
    isHomeGoal: boolean;
}

export interface User {
    id: string;
    username: string;
    role: 'GUEST' | 'ADMIN';
}
