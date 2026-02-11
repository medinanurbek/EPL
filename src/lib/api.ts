import axios from 'axios';
import { Team, Standing, Player } from '@/types';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api', // Will be proxied to http://localhost:8080/api by Vite
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('epl_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response types from backend
export interface StandingWithTeam extends Standing {
    team: Team;
}

export interface StatEntry {
    playerId: string;
    name: string;
    teamName: string;
    teamId: string;
    imagePath: string;
    value: number;
}

export interface StatsData {
    topScorers: StatEntry[];
    topAssists: StatEntry[];
    cleanSheets: StatEntry[];
}

// API functions
export const apiService = {
    // Get all teams
    async getTeams(): Promise<Team[]> {
        const response = await api.get<Team[]>('/teams');
        return response.data;
    },

    // Get all players
    async getPlayers(): Promise<Player[]> {
        const response = await api.get<Player[]>('/players');
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

    // Authentication
    async login(data: { email: string; password: string }): Promise<{ token: string; user: any }> {
        const response = await api.post<{ token: string; user: any }>('/auth/login', data);
        return response.data;
    },

    async register(data: { email: string; password: string; fullName: string; role: string }): Promise<{ token: string; message: string }> {
        const response = await api.post<{ token: string; message: string }>('/auth/register', data);
        return response.data;
    },

    // Favorites
    async getFavorites(): Promise<{ teams: string[]; players: string[] }> {
        const response = await api.get<{ teams: string[]; players: string[] }>('/user/favorites');
        return response.data;
    },

    async toggleFavoriteTeam(teamId: string): Promise<void> {
        await api.post(`/user/favorites/teams/${teamId}`);
    },

    async toggleFavoritePlayer(playerId: string): Promise<void> {
        await api.post(`/user/favorites/players/${playerId}`);
    },

    // Admin & Reviews
    async getReviews(): Promise<any[]> {
        const response = await api.get<any[]>('/reviews');
        return response.data;
    },

    async createReview(data: { content: string; rating: number; matchId?: string; teamId?: string; playerId?: string }): Promise<void> {
        await api.post('/reviews', data);
    },

    async deleteReview(id: string): Promise<void> {
        await api.delete(`/reviews/${id}`);
    },

    async updateMatchStatus(matchId: string, status: string): Promise<void> {
        await api.patch(`/matches/${matchId}/status`, { status });
    },

    // Match Lifecycle
    async startMatch(matchId: string): Promise<void> {
        await api.patch(`/matches/${matchId}/start`);
    },

    async finishMatch(matchId: string): Promise<void> {
        await api.patch(`/matches/${matchId}/finish`);
    },

    // Live Events
    async getMatchLiveEvents(matchId: string): Promise<any[]> {
        const response = await api.get<any[]>(`/matches/${matchId}/live-events`);
        return response.data;
    },

    // Matchday
    async getMatchesByMatchday(day: number): Promise<any[]> {
        const response = await api.get<any[]>(`/matches/matchday/${day}`);
        return response.data;
    },

    // All matches (returns { matches: [], activeMatchday: number })
    async getMatches(): Promise<{ matches: any[], activeMatchday: number }> {
        const response = await api.get<{ matches: any[], activeMatchday: number }>('/matches');
        return response.data;
    },

    async getLatestResults(): Promise<any[]> {
        const response = await api.get<any[]>('/matches/latest');
        return response.data;
    },

    async getUpcomingFixtures(): Promise<any[]> {
        const response = await api.get<any[]>('/matches/upcoming');
        return response.data;
    },

    // Event Management (Admin)
    async editGoalEvent(matchId: string, eventId: string, data: any): Promise<void> {
        await api.put(`/matches/${matchId}/events/${eventId}`, data);
    },

    async deleteGoalEvent(matchId: string, eventId: string): Promise<void> {
        await api.delete(`/matches/${matchId}/events/${eventId}`);
    },

    // Player CRUD (Admin)
    async createPlayer(data: any): Promise<any> {
        const response = await api.post('/players', data);
        return response.data;
    },

    async updatePlayer(playerId: string, data: any): Promise<void> {
        await api.put(`/players/${playerId}`, data);
    },

    async deletePlayer(playerId: string): Promise<void> {
        await api.delete(`/players/${playerId}`);
    },

    // Coach Management
    async addCoach(teamId: string, name: string): Promise<void> {
        await api.post(`/teams/${teamId}/coach`, { name });
    },

    async removeCoach(teamId: string): Promise<void> {
        await api.delete(`/teams/${teamId}/coach`);
    },

    async replaceCoach(teamId: string, name: string): Promise<void> {
        await api.put(`/teams/${teamId}/coach/replace`, { name });
    },

    // Stats
    async getStats(): Promise<StatsData> {
        const response = await api.get<StatsData>('/stats');
        return response.data;
    },

    // Match Events
    async getMatchEvents(matchId: string): Promise<any[]> {
        const response = await api.get<any[]>(`/matches/${matchId}/events`);
        return response.data;
    },
};

export default api;
