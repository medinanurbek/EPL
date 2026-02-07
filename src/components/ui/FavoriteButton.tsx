import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/context/FavoritesContext";

interface FavoriteButtonProps {
    id: string;
    type: "team" | "player";
    className?: string;
}

export function FavoriteButton({ id, type, className = "" }: FavoriteButtonProps) {
    const { isFavTeam, isFavPlayer, toggleFavTeam, toggleFavPlayer } = useFavorites();

    const isFavorite = type === "team" ? isFavTeam(id) : isFavPlayer(id);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (type === "team") {
            await toggleFavTeam(id);
        } else {
            await toggleFavPlayer(id);
        }
    };

    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={toggleFavorite}
            className={`p-2 rounded-full transition-all ${isFavorite
                ? "bg-[#ff005a] text-white shadow-lg shadow-[#ff005a]/20"
                : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                } ${className}`}
        >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </motion.button>
    );
}
