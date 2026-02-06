import { useState, useEffect } from "react";
import { Player, Team } from "@/types";
import { apiService } from "@/lib/api";
import { User, Flag, ArrowLeft, Target, Star, Zap, Clock } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function PlayerDetailsPage() {
    const { playerId } = useParams();
    const [player, setPlayer] = useState<Player | null>(null);
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        appearances: 0,
        goals: 0,
        assists: 0,
        minutes: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!playerId) return;
            try {
                setLoading(true);
                const playerData = await apiService.getPlayerDetails(playerId);
                setPlayer(playerData);

                if (playerData.teamId) {
                    const teamData = await apiService.getTeamById(playerData.teamId);
                    setTeam(teamData);
                }

                // Parse statistics
                if (playerData.statistics) {
                    try {
                        const statsArray = JSON.parse(playerData.statistics);
                        const newStats = {
                            appearances: 0,
                            goals: 0,
                            assists: 0,
                            minutes: 0
                        };

                        if (Array.isArray(statsArray)) {
                            // Helper to process stats list
                            const processStatsList = (list: any[]) => {
                                list.forEach((stat: any) => {
                                    const typeName = stat.type?.name;
                                    const value = stat.value?.total || 0;

                                    if (typeName === "Appearances") newStats.appearances += value;
                                    if (typeName === "Goals") newStats.goals += value;
                                    if (typeName === "Assists") newStats.assists += value;
                                    if (typeName === "Minutes Played") newStats.minutes += value;
                                });
                            }

                            statsArray.forEach((item: any) => {
                                // Check for nested details array (season structure)
                                // Only process stats if they are for the current season (optional, but for now we aggregate or take all)
                                // Simplification: Just look for 'details' array
                                if (item.details && Array.isArray(item.details)) {
                                    processStatsList(item.details);
                                }
                                // Or if it's a flat list (unlikely based on check, but good for safety)
                                else if (item.type?.name) {
                                    processStatsList([item]);
                                }
                            });
                        }
                        setStats(newStats);
                    } catch (e) {
                        console.error("Failed to parse stats:", e);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch player data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [playerId]);

    const getLogoPath = (teamName: string) => {
        const slug = teamName.toLowerCase().replace(/\s+/g, '-');
        return `/logos/${slug}.football-logos.cc.svg`;
    };

    if (loading) {
        return (
            <div className="bg-[#37003c] min-h-screen flex items-center justify-center">
                <div className="text-white text-2xl font-bold animate-pulse">Loading player profile...</div>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="bg-[#37003c] min-h-screen flex items-center justify-center">
                <div className="text-white text-2xl font-bold">Player not found</div>
            </div>
        );
    }

    return (
        <div className="bg-[#37003c] min-h-screen text-white">
            {/* Header / Hero */}
            <div className="relative pt-32 pb-24 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, #ff2882 0%, transparent 50%), radial-gradient(circle at 80% 50%, #00ff85 0%, transparent 50%)`
                }} />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <Link to={`/teams/${player.teamId}`} className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-12 transition-colors text-xs font-bold uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" /> Back to Team
                    </Link>

                    <div className="flex flex-col md:flex-row items-end gap-16">
                        {/* Player Image Card */}
                        <div className="relative group">
                            <div className="w-64 h-80 bg-[#2d0032] rounded-[2rem] flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden relative z-10">
                                {player.imagePath ? (
                                    <img
                                        src={player.imagePath}
                                        alt={player.displayName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-32 h-32 text-white/20" />
                                )}
                            </div>
                            {/* Decorative Number Badge */}
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#00ff85] rounded-3xl flex items-center justify-center text-4xl font-extrabold text-[#37003c] shadow-lg z-20 rotate-3 transform group-hover:rotate-6 transition-transform">
                                {player.number}
                            </div>
                        </div>

                        {/* Player Info */}
                        <div className="flex-1 pb-4">
                            <div className="flex flex-wrap items-center gap-4 mb-8">
                                <span className="px-4 py-2 rounded-lg bg-[#ff2882] text-white text-xs font-bold uppercase tracking-widest shadow-md">
                                    {player.detailedPosition || player.position}
                                </span>
                                <span className="flex items-center gap-2 text-white/80 font-bold uppercase text-xs tracking-widest">
                                    <Flag className="w-4 h-4 text-[#00ff85]" />
                                    {player.nationality}
                                </span>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-2">
                                <span className="block text-white">{player.firstName || player.name.split(' ')[0]}</span>
                                <span className="block text-[#00ff85]">{player.lastName || player.name.split(' ').slice(1).join(' ')}</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-[#2d0032]/50 border-t border-white/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        {/* Stats Grid */}
                        <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Appearances", value: stats.appearances, icon: Target, color: "text-[#00ff85]" },
                                { label: "Goals", value: stats.goals, icon: Star, color: "text-[#ff2882]" },
                                { label: "Assists", value: stats.assists, icon: Zap, color: "text-[#025da4]" },
                                { label: "Minutes", value: stats.minutes.toLocaleString(), icon: Clock, color: "text-white" },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-[#37003c] rounded-3xl p-8 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 shadow-xl group">
                                    <div className="flex justify-between items-start mb-4">
                                        <stat.icon className={`w-8 h-8 ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                    </div>
                                    <p className="text-4xl font-black text-white mb-2">{stat.value}</p>
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Club Card */}
                        <div className="lg:col-span-1">
                            {team && (
                                <div className="h-full bg-gradient-to-br from-[#37003c] to-[#2d0032] rounded-3xl p-8 border border-white/5 flex flex-col justify-center items-center text-center relative overflow-hidden">
                                    <div className="w-24 h-24 mb-6 relative z-10">
                                        <img
                                            src={getLogoPath(team.name)}
                                            alt={team.name}
                                            className="w-full h-full object-contain drop-shadow-lg"
                                        />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black text-white leading-tight mb-2">{team.name}</h3>
                                        <div className="inline-block px-3 py-1 bg-[#00ff85]/10 text-[#00ff85] text-[10px] font-bold uppercase tracking-widest rounded-full">
                                            Current Club
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
