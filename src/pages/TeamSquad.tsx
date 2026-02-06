import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Player, Team } from "@/types";
import { apiService } from "@/lib/api";
import { ArrowLeft, Shield } from "lucide-react";

export default function TeamSquadPage() {
    const { id: teamId } = useParams();
    const [squad, setSquad] = useState<Player[]>([]);
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [squadData, teamData] = await Promise.all([
                    apiService.getTeamSquad(teamId || "9"),
                    apiService.getTeamById(teamId || "9")
                ]);
                setSquad(squadData);
                setTeam(teamData);
            } catch (error) {
                console.error('Failed to fetch squad:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [teamId]);

    const getLogoPath = (teamName: string) => {
        const slug = teamName.toLowerCase().replace(/\s+/g, '-');
        return `/logos/${slug}.football-logos.cc.svg`;
    };

    // Group players by position
    const groupedPlayers = {
        Goalkeeper: squad.filter(p => p.position === 'Goalkeeper'),
        Defender: squad.filter(p => p.position === 'Defender'),
        Midfielder: squad.filter(p => p.position === 'Midfielder'),
        Forward: squad.filter(p => p.position === 'Forward'),
    };

    return (
        <div className="bg-[#37003c] min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-b from-[#2d0032] to-[#37003c] text-white pt-24 pb-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Link
                        to={`/teams/${teamId}`}
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Team Details
                    </Link>

                    {team && (
                        <div className="flex items-center gap-8">
                            <div className="relative w-32 h-32 bg-gradient-to-br from-sky-400 to-sky-500 rounded-3xl flex items-center justify-center shadow-2xl">
                                <img
                                    src={getLogoPath(team.name)}
                                    alt={team.name}
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black mb-3 tracking-tight">
                                    {team.name} Squad
                                </h1>
                                <div className="text-white/60 text-lg">
                                    {squad.length} Players
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Squad List */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="text-center text-white/60 py-20">
                        <div className="text-2xl font-bold mb-4">Loading squad...</div>
                    </div>
                ) : squad.length === 0 ? (
                    <div className="text-center text-white/60 py-20">
                        <div className="text-2xl font-bold mb-4">No squad data available</div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Goalkeepers */}
                        {groupedPlayers.Goalkeeper.length > 0 && (
                            <section>
                                <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-sky-400" />
                                    Goalkeepers
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groupedPlayers.Goalkeeper.map((player) => (
                                        <PlayerCard key={player.id} player={player} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Defenders */}
                        {groupedPlayers.Defender.length > 0 && (
                            <section>
                                <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-sky-400" />
                                    Defenders
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groupedPlayers.Defender.map((player) => (
                                        <PlayerCard key={player.id} player={player} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Midfielders */}
                        {groupedPlayers.Midfielder.length > 0 && (
                            <section>
                                <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-sky-400" />
                                    Midfielders
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groupedPlayers.Midfielder.map((player) => (
                                        <PlayerCard key={player.id} player={player} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Forwards */}
                        {groupedPlayers.Forward.length > 0 && (
                            <section>
                                <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-sky-400" />
                                    Forwards
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groupedPlayers.Forward.map((player) => (
                                        <PlayerCard key={player.id} player={player} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function PlayerCard({ player }: { player: Player }) {
    return (
        <Link
            to={`/players/${player.id}`}
            className="bg-[#2d0032] rounded-2xl p-6 border border-white/5 hover:border-sky-400/50 transition-all group"
        >
            <div className="flex items-start gap-4">
                {/* Player Image or Number */}
                {player.imagePath ? (
                    <img
                        src={player.imagePath}
                        alt={player.displayName || player.name}
                        className="w-20 h-20 rounded-full object-cover bg-white/10"
                    />
                ) : (
                    <div className="w-20 h-20 bg-sky-500/20 rounded-full flex items-center justify-center border-2 border-sky-400">
                        <span className="text-3xl font-black text-sky-400">{player.number}</span>
                    </div>
                )}

                {/* Player Info */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-white font-bold text-lg group-hover:text-sky-300 transition-colors">
                                {player.displayName || player.commonName || player.name}
                                {player.isCaptain && <span className="ml-2 text-yellow-400">©</span>}
                            </h3>
                            <p className="text-white/60 text-sm">{player.detailedPosition || player.position}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-sky-400">#{player.number}</div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-white/60">
                            <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                            {player.nationality}
                        </div>
                        {player.height && player.weight && (
                            <div className="flex items-center gap-2 text-white/60">
                                <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                                {player.height}cm • {player.weight}kg
                            </div>
                        )}
                        {player.dateOfBirth && (
                            <div className="flex items-center gap-2 text-white/60">
                                <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                                Born: {new Date(player.dateOfBirth).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
