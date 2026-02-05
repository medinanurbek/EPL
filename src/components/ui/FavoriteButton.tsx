

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface FavoriteButtonProps {
    id: string;
    type: "team" | "player";
    className?: string;
}

export function FavoriteButton({ id, type, className = "" }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem(`fav_${type}s`) || "[]");
        setIsFavorite(favorites.includes(id));
    }, [id, type]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const key = `fav_${type}s`;
        const favorites = JSON.parse(localStorage.getItem(key) || "[]");

        let newFavorites;
        if (isFavorite) {
            newFavorites = favorites.filter((favId: string) => favId !== id);
        } else {
            newFavorites = [...favorites, id];
        }

        localStorage.setItem(key, JSON.stringify(newFavorites));
        setIsFavorite(!isFavorite);

        // Dispatch a custom event to notify other components (like the profile page)
        window.dispatchEvent(new Event("favoritesUpdated"));
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
