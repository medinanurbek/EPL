import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Player } from "@/types";
import { apiService } from "@/lib/api";
import { ArrowLeft, Flag, Calendar, Ruler, Weight, MapPin } from "lucide-react";
import { getFlagClass } from "@/lib/utils";

export default function PlayerDetailsPage() {
    const { playerId } = useParams();
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayer = async () => {
            if (!playerId) return;
            try {
                setLoading(true);
                const data = await apiService.getPlayerDetails(playerId);
                setPlayer(data);
            } catch (error) {
                console.error("Failed to fetch player:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayer();
    }, [playerId]);

    if (loading) {
        return (
            <div className="bg-[#37003c] min-h-screen flex items-center justify-center">
                <div className="text-white text-2xl font-bold animate-pulse">Loading player...</div>
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

    // Parse statistics if it's a string
    let stats: any = null;
    if (player.statistics) {
        try {
            stats = typeof player.statistics === 'string'
                ? JSON.parse(player.statistics)
                : player.statistics;
            // If stats is an array, take the first element
            if (Array.isArray(stats) && stats.length > 0) {
                stats = stats[0];
            }
        } catch (e) {
            console.error("Failed to parse statistics:", e);
        }
    }

    return (
        <div className="bg-[#37003c] min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <Link
                    to={`/teams/${player.teamId}/squad`}
                    className="inline-flex items-center gap-2 text-[#00ff85] hover:text-white mb-8 transition-colors text-xs font-bold uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Squad
                </Link>

                {/* Player Header */}
                <div className="glass-card p-8 md:p-12 rounded-[3rem] mb-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        {/* Player Image */}
                        <div className="relative">
                            <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-[#00ff85]/20 to-transparent rounded-full flex items-center justify-center overflow-hidden border-4 border-white/10">
                                {player.imagePath ? (
                                    <img
                                        src={player.imagePath}
                                        alt={player.displayName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-white/20 text-6xl font-black">
                                        {player.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            {/* Jersey Number */}
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#00ff85] rounded-2xl flex items-center justify-center shadow-2xl border-4 border-[#37003c]">
                                <span className="text-4xl font-black text-[#37003c]">{player.number}</span>
                            </div>
                        </div>

                        {/* Player Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="mb-4">
                                <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                    {player.displayName || player.commonName || player.name}
                                </h1>
                                <p className="text-[#00ff85] text-xl md:text-2xl font-bold uppercase tracking-wider">
                                    {player.position}
                                </p>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        {player.nationalityISO2 ? (
                                            <span className={`fi fi-${getFlagClass(player.nationalityISO2)} w-5 h-3.5 rounded-[2px] shadow-sm`} />
                                        ) : (
                                            <Flag className="w-4 h-4 text-[#00ff85]" />
                                        )}
                                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Nation</span>
                                    </div>
                                    <p className="text-white font-bold text-sm">{player.nationality}</p>
                                </div>

                                {player.dateOfBirth && (
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-[#00ff85]" />
                                            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Age</span>
                                        </div>
                                        <p className="text-white font-bold text-sm">
                                            {new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear()}
                                        </p>
                                    </div>
                                )}

                                {player.height && (
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Ruler className="w-4 h-4 text-[#00ff85]" />
                                            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Height</span>
                                        </div>
                                        <p className="text-white font-bold text-sm">{player.height} cm</p>
                                    </div>
                                )}

                                {player.weight && (
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Weight className="w-4 h-4 text-[#00ff85]" />
                                            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Weight</span>
                                        </div>
                                        <p className="text-white font-bold text-sm">{player.weight} kg</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                {stats && stats.details && (
                    <div className="glass-card p-8 md:p-12 rounded-[3rem]">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-8">
                            Season <span className="text-[#00ff85]">Statistics</span>
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.details
                                .filter((detail: any) => {
                                    const statName = detail.type?.name?.toLowerCase() || '';
                                    return statName.includes('goal') && !statName.includes('conceded') ||
                                        statName.includes('assist') ||
                                        statName.includes('appearance') ||
                                        statName.includes('minutes played');
                                })
                                .map((detail: any, index: number) => (
                                    <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-[#00ff85]/30 transition-colors">
                                        <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
                                            {detail.type?.name || 'Stat'}
                                        </div>
                                        <div className="text-3xl font-black text-white">
                                            {detail.value?.value || 0}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Personal Info */}
                <div className="glass-card p-8 md:p-12 rounded-[3rem] mt-8">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-8">
                        Personal <span className="text-[#00ff85]">Information</span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#00ff85]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-[#00ff85]" />
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Full Name</p>
                                    <p className="text-white font-bold text-lg">
                                        {player.firstName} {player.lastName}
                                    </p>
                                </div>
                            </div>

                            {player.dateOfBirth && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-[#00ff85]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-6 h-6 text-[#00ff85]" />
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Date of Birth</p>
                                        <p className="text-white font-bold text-lg">
                                            {new Date(player.dateOfBirth).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#00ff85]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    {player.nationalityISO2 ? (
                                        <span className={`fi fi-${getFlagClass(player.nationalityISO2)} w-6 h-4 rounded-[2px] shadow-sm`} />
                                    ) : (
                                        <Flag className="w-6 h-6 text-[#00ff85]" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Nationality</p>
                                    <p className="text-white font-bold text-lg">{player.nationality}</p>
                                </div>
                            </div>

                            {player.detailedPosition && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-[#00ff85]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-[#00ff85] text-xl font-black">⚽</span>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Position</p>
                                        <p className="text-white font-bold text-lg">{player.detailedPosition}</p>
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
