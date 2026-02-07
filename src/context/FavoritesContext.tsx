import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiService } from "@/lib/api";

interface FavoritesContextType {
    favTeams: string[];
    favPlayers: string[];
    toggleFavTeam: (id: string) => Promise<void>;
    toggleFavPlayer: (id: string) => Promise<void>;
    isFavTeam: (id: string) => boolean;
    isFavPlayer: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favTeams, setFavTeams] = useState<string[]>([]);
    const [favPlayers, setFavPlayers] = useState<string[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    // Initial load and listen for auth changes to re-fetch
    useEffect(() => {
        const checkAuthAndLoad = () => {
            const user = localStorage.getItem("epl_current_user");
            if (user) {
                const parsed = JSON.parse(user);
                if (parsed.id !== userId) {
                    setUserId(parsed.id);
                    loadFavorites();
                }
            } else {
                setUserId(null);
                setFavTeams([]);
                setFavPlayers([]);
            }
        };

        checkAuthAndLoad();
        window.addEventListener("auth-change", checkAuthAndLoad);
        window.addEventListener("favoritesUpdated", checkAuthAndLoad);
        return () => {
            window.removeEventListener("auth-change", checkAuthAndLoad);
            window.removeEventListener("favoritesUpdated", checkAuthAndLoad);
        }
    }, [userId]);

    const loadFavorites = async () => {
        try {
            const data = await apiService.getFavorites();
            console.log("Loaded favorites:", data);
            setFavTeams(data.teams || []);
            setFavPlayers(data.players || []);
        } catch (error) {
            console.error("Failed to load favorites", error);
            // Fallback to local storage if API fails or user is guest (though backend handles guests too)
        }
    };

    const toggleFavTeam = async (id: string) => {
        // Optimistic update
        const isFav = favTeams.includes(id);
        const newFavs = isFav ? favTeams.filter(t => t !== id) : [...favTeams, id];
        setFavTeams(newFavs);

        try {
            await apiService.toggleFavoriteTeam(id);
        } catch (error: any) {
            // Revert on error
            console.error("Failed to toggle team favorite", error);
            console.error("Error details:", error.response?.data, error.status);
            setFavTeams(favTeams);
        }
    };

    const toggleFavPlayer = async (id: string) => {
        // Optimistic update
        const isFav = favPlayers.includes(id);
        const newFavs = isFav ? favPlayers.filter(p => p !== id) : [...favPlayers, id];
        setFavPlayers(newFavs);

        try {
            await apiService.toggleFavoritePlayer(id);
        } catch (error) {
            // Revert on error
            console.error("Failed to toggle player favorite", error);
            setFavPlayers(favPlayers);
        }
    };

    const isFavTeam = (id: string) => favTeams.includes(id);
    const isFavPlayer = (id: string) => favPlayers.includes(id);

    return (
        <FavoritesContext.Provider value={{ favTeams, favPlayers, toggleFavTeam, toggleFavPlayer, isFavTeam, isFavPlayer }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}
