import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Player, Team } from "@/types";
import { apiService } from "@/lib/api";
import { getTeamLogo, getFlagClass } from "@/lib/utils";
import { ArrowLeft, Shield } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

export default function TeamSquadPage() {
    const { teamId } = useParams();
    const [team, setTeam] = useState<Team | null>(null);
    const [squad, setSquad] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const { isFavPlayer } = useFavorites();

    useEffect(() => {
        const fetchSquad = async () => {
            // ... existing fetch logic ...
            if (!teamId) {
                console.log("No teamId provided");
                return;
            }

            console.log("=== STARTING FETCH for team:", teamId);

            try {
                setLoading(true);
                const teamData = await apiService.getTeamById(teamId);
                const squadData = await apiService.getTeamSquad(teamId);

                setTeam(teamData);
                setSquad(squadData || []);
            } catch (error) {
                console.error("!!! ERROR in fetchSquad:", error);
                setSquad([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSquad();
    }, [teamId]);

    const groupedSquad = squad.reduce((acc, player) => {
        const pos = player.position || "Other";
        if (!acc[pos]) acc[pos] = [];
        acc[pos].push(player);
        return acc;
    }, {} as Record<string, Player[]>);

    const positionOrder = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

    // ... existing loading and error checks ...
    if (loading) {
        return (
            <div className="bg-[#37003c] min-h-screen flex items-center justify-center">
                <div className="text-white text-2xl font-bold animate-pulse">Loading squad...</div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="bg-[#37003c] min-h-screen flex items-center justify-center">
                <div className="text-white text-2xl font-bold">Team not found</div>
            </div>
        );
    }

    return (
        <div className="bg-[#37003c] min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        to={`/teams/${teamId}`}
                        className="inline-flex items-center gap-2 text-[#00ff85] hover:text-white mb-8 transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Team Profile
                    </Link>

                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white/5 rounded-2xl p-4 border border-white/10">
                            <img
                                src={getTeamLogo(team.name)}
                                alt={team.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none mb-2">
                                {team.name} <span className="text-[#00ff85]">Squad</span>
                            </h1>
                            <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px]">Season 2025/26 • Official Roster</p>
                        </div>
                    </div>
                </div>

                {/* Squad Groups */}
                <div className="space-y-16">
                    {positionOrder.map(pos => {
                        const players = groupedSquad[pos] || [];
                        if (players.length === 0) return null;

                        return (
                            <section key={pos}>
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{pos}s</h2>
                                    <div className="flex-1 h-px bg-white/10"></div>
                                    <span className="text-[#00ff85] text-xs font-bold uppercase tracking-widest">{players.length} Players</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {players.sort((a, b) => {
                                        // Sort by favorite first
                                        const aFav = isFavPlayer(a.id);
                                        const bFav = isFavPlayer(b.id);
                                        if (aFav && !bFav) return -1;
                                        if (!aFav && bFav) return 1;
                                        // Then by number
                                        return (a.number || 99) - (b.number || 99);
                                    }).map(player => (
                                        <PlayerCard key={player.id} player={player} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function PlayerCard({ player }: { player: Player }) {
    return (
        <div className="relative group/card">
            <FavoriteButton id={player.id} type="player" className="absolute top-4 left-4 z-20" />
            <Link
                to={`/players/${player.id}`}
                className="group glass-card p-6 rounded-[2rem] flex flex-col items-center text-center transition-all hover:-translate-y-2 relative overflow-hidden active:scale-95 border border-white/5 hover:border-[#00ff85]/30 shadow-xl block"
            >
                {/* Background Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff85]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Jersey Number Float */}
                <div className="absolute top-4 right-6 text-6xl font-black text-white/5 group-hover:text-[#00ff85]/10 transition-colors select-none">
                    {player.number}
                </div>

                <div className="relative mb-6">
                    <div className="w-32 h-32 bg-[#2d0032] rounded-full flex items-center justify-center overflow-hidden border-2 border-white/5 group-hover:border-[#00ff85]/50 transition-colors bg-gradient-to-br from-white/10 to-transparent">
                        {player.imagePath ? (
                            <img
                                src={player.imagePath}
                                alt={player.displayName}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                        ) : (
                            <Shield className="w-12 h-12 text-white/10" />
                        )}
                    </div>

                    {/* Status Indicator */}
                    {player.isCaptain && (
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-[#37003c] font-black text-xs shadow-lg border-2 border-[#37003c]">
                            ©
                        </div>
                    )}
                </div>

                <div className="relative z-10 w-full">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1 group-hover:text-[#00ff85] transition-colors leading-tight">
                        {player.displayName || player.commonName || player.name}
                    </h3>

                    <div className="flex flex-col gap-2 mt-4 items-center">
                        <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-white/60">
                                {player.nationalityISO2 ? (
                                    <span className={`fi fi-${getFlagClass(player.nationalityISO2)} w-4 h-3 rounded-[2px] shadow-sm`} />
                                ) : (
                                    <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-widest">{player.nationality}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
