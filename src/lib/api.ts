import axios from 'axios';
import { Team, Standing, Player } from '@/types';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api', // Will be proxied to http://localhost:8080/api by Vite
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response types from backend
export interface StandingWithTeam extends Standing {
    team: Team;
}

// API functions
export const apiService = {
    // Get all teams
    async getTeams(): Promise<Team[]> {
        const response = await api.get<Team[]>('/teams');
        return response.data;
    },

    // Get team by ID
    async getTeamById(id: string): Promise<Team> {
        const response = await api.get<Team>(`/teams/${id}`);
        return response.data;
    },

    // Get standings
    async getStandings(): Promise<StandingWithTeam[]> {
        const response = await api.get<StandingWithTeam[]>('/standings');
        return response.data;
    },

    // Health check
    async healthCheck(): Promise<{ status: string }> {
        const response = await api.get<{ status: string }>('/health');
        return response.data;
    },

    async getTeamSquad(teamId: string): Promise<Player[]> {
        const response = await api.get<Player[]>(`/teams/${teamId}/squad`);
        return response.data;
    },

    async getPlayerDetails(playerId: string): Promise<Player> {
        const response = await api.get<Player>(`/players/${playerId}`);
        return response.data;
    },

    async getTeamMatches(teamId: string): Promise<any> {
        const response = await api.get<any>(`/teams/${teamId}/matches`);
        return response.data;
    },
};

export default api;
