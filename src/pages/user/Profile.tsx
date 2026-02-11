import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, MapPin, Shield, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTeamLogo } from "../../lib/utils";
import { FavoriteButton } from "../../components/ui/FavoriteButton";
import { apiService } from "../../lib/api";
import { useFavorites } from "../../context/FavoritesContext";
import { Team, Player } from "../../types";

export default function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const { favTeams, favPlayers } = useFavorites();

    const [favoriteTeamsData, setFavoriteTeamsData] = useState<Team[]>([]);
    const [favoritePlayersData, setFavoritePlayersData] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const storedUser = localStorage.getItem("epl_current_user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            try {
                // Load Teams
                if (favTeams.length > 0) {
                    const allTeams = await apiService.getTeams();
                    const filtered = allTeams.filter(t => favTeams.includes(t.id));
                    setFavoriteTeamsData(filtered);
                } else {
                    setFavoriteTeamsData([]);
                }

                // Load Players
                if (favPlayers.length > 0) {
                    const playerPromises = favPlayers.map(id => apiService.getPlayerDetails(id).catch(() => null));
                    const players = await Promise.all(playerPromises);
                    setFavoritePlayersData(players.filter((p): p is Player => p !== null));
                } else {
                    setFavoritePlayersData([]);
                }
            } catch (error) {
                console.error("Failed to load favorites data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [favTeams, favPlayers]);

    const handleLogout = () => {
        localStorage.removeItem("epl_token");
        localStorage.removeItem("epl_current_user");
        window.dispatchEvent(new Event("auth-change"));
        navigate("/");
    };

    if (loading && !user) return <div className="text-white text-center py-20">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-[#37003c] text-white">
            {/* Profile Header */}
            <section className="pt-24 pb-12 relative overflow-hidden bg-[#37003c]">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[#00ff85] opacity-[0.03] blur-[120px]" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center p-1 shadow-2xl">
                                <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-[#00ff85] to-[#04f5ff] flex items-center justify-center overflow-hidden">
                                    <User className="w-16 h-16 text-[#37003c]" />
                                </div>
                            </div>
                        </div>

                        <div className="text-center md:text-left flex-1 space-y-4">
                            <div>
                                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-2 italic">
                                    {user?.fullName || "Premier Guest"}
                                </h1>
                                <p className="text-[#00ff85] font-black uppercase text-xs tracking-[0.4em]">Official Fan Profile</p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center gap-3 w-fit mx-auto md:mx-0"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Favorite Clubs */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.5em] flex items-center gap-4 w-full">
                                    Favorite Clubs
                                    <div className="flex-1 h-px bg-white/10" />
                                </h2>
                            </div>

                            <div className="grid gap-4">
                                <AnimatePresence>
                                    {favoriteTeamsData.map((team) => (
                                        <motion.div
                                            key={team.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] flex items-center gap-6 group hover:bg-white/10 transition-all"
                                        >
                                            <Link to={`/teams/${team.id}`} className="flex items-center gap-6 flex-1">
                                                <div className="relative w-16 h-16 p-2 bg-white/5 rounded-2xl">
                                                    <img src={getTeamLogo(team.name)} alt={team.name} className="w-full h-full object-contain p-2" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{team.name}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                                                        <MapPin className="w-3 h-3 text-[#00ff85]" />
                                                        {team.city || "Unknown City"}
                                                    </div>
                                                </div>
                                            </Link>
                                            <FavoriteButton id={team.id} type="team" />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {favoriteTeamsData.length === 0 && (
                                    <div className="py-16 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                                        <Shield className="w-10 h-10 text-white/10 mb-4" />
                                        <p className="text-sm font-black text-white/40 uppercase tracking-widest">No clubs followed</p>
                                        <Link to="/teams" className="text-[10px] font-black text-[#00ff85] uppercase tracking-tighter mt-4 hover:underline">Pick a team</Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Favorite Players */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.5em] flex items-center gap-4 w-full">
                                    Favorite Players
                                    <div className="flex-1 h-px bg-white/10" />
                                </h2>
                            </div>

                            <div className="grid gap-4">
                                <AnimatePresence>
                                    {favoritePlayersData.map((player) => (
                                        <motion.div
                                            key={player.id}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] flex items-center gap-6 group hover:bg-white/10 transition-all"
                                        >
                                            <Link to={`/players/${player.id}`} className="flex items-center gap-6 flex-1">
                                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-1 overflow-hidden">
                                                    {player.imagePath ? (
                                                        <img src={player.imagePath} alt={player.name} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        <Users className="w-8 h-8 text-white/20" />
                                                    )}
                                                </div>
                                                <div className="flex-1 text-white">
                                                    <h3 className="text-lg font-black uppercase tracking-tight truncate w-32">{player.displayName || player.name}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#ff005a] uppercase tracking-widest mt-1">
                                                        <Shield className="w-3 h-3" />
                                                        {player.position}
                                                    </div>
                                                </div>
                                            </Link>
                                            <FavoriteButton id={player.id} type="player" />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {favoritePlayersData.length === 0 && (
                                    <div className="py-16 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                                        <Users className="w-10 h-10 text-white/10 mb-4" />
                                        <p className="text-sm font-black text-white/40 uppercase tracking-widest">No players followed</p>
                                        {/* Since we don't have a dedicated players list page, we link to a team or squads */}
                                        <Link to="/teams" className="text-[10px] font-black text-[#ff005a] uppercase tracking-tighter mt-4 hover:underline">Browse Players</Link>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
