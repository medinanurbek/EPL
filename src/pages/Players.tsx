import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { apiService } from "@/lib/api";
import { getTeamLogo, getFlagClass } from "@/lib/utils";
import { Player, Team } from "@/types";
import { useFavorites } from "@/context/FavoritesContext";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

export default function PlayersPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [selectedPosition, setSelectedPosition] = useState("All");
    const [selectedTeam, setSelectedTeam] = useState("All");
    const { isFavPlayer } = useFavorites();

    const positions = ["All", "Goalkeeper", "Defender", "Midfielder", "Forward"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [playersData, teamsData] = await Promise.all([
                    apiService.getPlayers(),
                    apiService.getTeams()
                ]);
                setPlayers(playersData);
                setTeams(teamsData);
            } catch (err: any) {
                console.error("Failed to fetch players/teams:", err);
                setError(err.message || "Something went wrong while fetching players.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredPlayers = useMemo(() => {
        return players.filter(player => {
            const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase()) ||
                player.displayName?.toLowerCase().includes(search.toLowerCase());
            const matchesPosition = selectedPosition === "All" || player.position.includes(selectedPosition);
            const matchesTeam = selectedTeam === "All" || player.teamId === selectedTeam;
            return matchesSearch && matchesPosition && matchesTeam;
        }).sort((a, b) => {
            const aFav = isFavPlayer(a.id);
            const bFav = isFavPlayer(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [players, search, selectedPosition, selectedTeam, isFavPlayer]);

    const getTeamName = (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        return team ? team.name : "Unknown Team";
    };

    return (
        <div className="py-12 bg-[#37003c] min-h-screen selection:bg-[#00ff85] selection:text-[#37003c]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-[#00ff85] font-outfit font-black text-xs uppercase tracking-[0.4em] mb-4"
                    >
                        <div className="w-8 h-1 bg-[#00ff85] rounded-full shadow-[0_0_10px_rgba(0,255,133,0.5)]" />
                        Players
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-outfit font-black text-white tracking-tighter mb-8 uppercase leading-[0.9]"
                    >
                        Premier League <span className="text-[#00ff85]">Stars</span>
                    </motion.h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#00ff85] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search players by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ff85]/20 focus:border-[#00ff85] transition-all font-outfit font-medium"
                            />
                        </div>

                        <div className="relative group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#00ff85] transition-colors" />
                            <select
                                value={selectedPosition}
                                onChange={(e) => setSelectedPosition(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-[#37003c] text-white focus:outline-none focus:ring-2 focus:ring-[#00ff85]/20 focus:border-[#00ff85] transition-all font-outfit font-medium appearance-none"
                            >
                                {positions.map(pos => (
                                    <option key={pos} value={pos}>{pos} Position</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative group">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#00ff85] transition-colors" />
                            <select
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-[#37003c] text-white focus:outline-none focus:ring-2 focus:ring-[#00ff85]/20 focus:border-[#00ff85] transition-all font-outfit font-medium appearance-none"
                            >
                                <option value="All">All Clubs</option>
                                {teams.sort((a, b) => a.name.localeCompare(b.name)).map(team => (
                                    <option key={team.id} value={team.id}>{team.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="w-12 h-12 border-4 border-[#00ff85] border-t-transparent rounded-full animate-spin" />
                        <div className="text-[#00ff85] font-bold uppercase tracking-[0.2em] text-sm animate-pulse">Loading Players...</div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="text-[#ff4d4d] text-6xl mb-4 font-black">!</div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Failed to Load Players</h3>
                        <p className="text-white/40 font-medium mb-8 max-w-md mx-auto">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-[#00ff85] text-[#37003c] font-bold uppercase rounded-xl hover:scale-105 transition-transform"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredPlayers.map((player) => (
                                    <motion.div
                                        key={player.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative group/card"
                                    >
                                        <FavoriteButton
                                            id={player.id}
                                            type="player"
                                            className="absolute top-4 right-4 z-20 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                        />
                                        <Link
                                            to={`/players/${player.id}`}
                                            className="glass-card group/card p-5 rounded-[2rem] flex flex-col items-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden block"
                                        >
                                            {/* Dynamic Ambient Background */}
                                            <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#00ff85]/5 blur-[60px] rounded-full group-hover:bg-[#00ff85]/10 transition-colors duration-700" />
                                            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-purple-500/5 blur-[60px] rounded-full group-hover:bg-purple-500/10 transition-colors duration-700" />

                                            <div className="relative mb-8">
                                                {/* Principal Avatar with Ring */}
                                                <div className="relative">
                                                    <div className="absolute inset-0 rounded-full border-2 border-[#00ff85]/10 scale-110 group-hover:scale-120 transition-transform duration-700" />

                                                    <div className="relative w-32 h-32 rounded-full p-1.5 bg-gradient-to-br from-[#00ff85]/30 via-transparent to-purple-500/30">
                                                        <div className="w-full h-full rounded-full overflow-hidden bg-[#240029] border-[4px] border-[#37003c]">
                                                            {player.imagePath ? (
                                                                <img
                                                                    src={player.imagePath}
                                                                    alt={player.name}
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-white/5 text-5xl font-black">
                                                                    {player.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Team Logo Badge - Compact and Popping */}
                                                <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white rounded-xl flex items-center justify-center z-30 shadow-xl border-4 border-[#37003c] transition-all duration-300 group-hover:-rotate-3">
                                                    <img
                                                        src={getTeamLogo(getTeamName(player.teamId))}
                                                        className="w-7 h-7 object-contain"
                                                        alt="team logo"
                                                    />
                                                </div>

                                                {/* Nationality Badge - Compact */}
                                                <div className="absolute top-0 -right-2 w-10 h-10 rounded-xl bg-[#1a1a1a] border-[3px] border-[#37003c] flex items-center justify-center overflow-hidden shadow-xl z-20 group-hover:translate-x-1 transition-transform">
                                                    <span className={`fi fi-${getFlagClass(player.nationalityISO2)} scale-[1.5]`} />
                                                </div>
                                            </div>

                                            <div className="relative z-10 w-full text-center">
                                                <div className="flex items-center justify-center gap-1.5 mb-3">
                                                    <span className="px-2 py-0.5 rounded bg-[#00ff85]/10 border border-[#00ff85]/20 text-[10px] font-outfit font-black text-[#00ff85] uppercase tracking-wider">
                                                        #{player.number || "??"}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-outfit font-black text-white/40 uppercase tracking-wider">
                                                        {player.position}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-outfit font-black text-white uppercase tracking-tighter mb-1.5 group-hover:text-[#00ff85] transition-colors leading-tight line-clamp-1">
                                                    {player.displayName || player.name}
                                                </h3>

                                                <div className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] font-outfit">
                                                    {getTeamName(player.teamId)}
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[#00ff85] font-outfit font-black text-[9px] uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-all duration-500">
                                                    <div className="w-4 h-[1px] bg-[#00ff85]/20" />
                                                    PROFILE
                                                    <div className="w-4 h-[1px] bg-[#00ff85]/20" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredPlayers.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-32"
                            >
                                <div className="text-white/20 text-6xl mb-4 font-black">?</div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">No Players Found</h3>
                                <p className="text-white/40 font-medium">Try adjusting your search or filters</p>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
