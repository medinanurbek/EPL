import { Team, Player } from "@/types";
import { Users, ArrowLeft, ChevronRight, MapPin } from "lucide-react";
import { getTeamLogo } from "@/lib/utils";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

// Top Performers - Placeholder for now (API doesn't provide this yet)
// const topPerformers = {
//    topScorer: { name: "TBD", goals: 0 },
//    mostAssists: { name: "TBD", assists: 0 },
//    mostPasses: { name: "TBD", passes: 0 },
// };

export default function TeamDetailsPage() {
    const { id: teamId } = useParams();
    const [team, setTeam] = useState<Team | null>(null);
    const [squad, setSquad] = useState<Player[]>([]);
    const [standing, setStanding] = useState<any | null>(null); // Using any for now to match Standing type extended
    const [matchesData, setMatchesData] = useState<any>(null); // New state for matches
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeamData = async () => {
            if (!teamId) return;
            try {
                setLoading(true);
                setError(null);

                // Fetch basic team info
                const teamData = await apiService.getTeamById(teamId);
                setTeam(teamData);

                // Fetch squad
                const squadData = await apiService.getTeamSquad(teamId);
                setSquad(squadData);

                // Fetch matches logic (form, upcoming, next)
                const mData = await apiService.getTeamMatches(teamId);
                setMatchesData(mData);

                // Fetch standings to get position
                const standingsData = await apiService.getStandings();
                const teamStanding = standingsData.find(s => s.team.id === teamId || s.team.name === teamData.name);
                if (teamStanding) {
                    setStanding(teamStanding);
                }

            } catch (err) {
                console.error('Failed to fetch team data:', err);
                setError(`Failed to load team details: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, [teamId]);



    if (loading) {
        return (
            <div className="bg-[#37003c] min-h-screen flex items-center justify-center">
                <div className="text-white text-xl font-bold animate-pulse">Loading Team Details...</div>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="bg-[#37003c] min-h-screen flex items-center justify-center">
                <div className="text-[#ff005a] text-xl font-bold">{error || "Team not found"}</div>
            </div>
        );
    }

    return (
        <div className="bg-[#37003c] min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-b from-[#2d0032] to-[#37003c] text-white pt-24 pb-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Link to="/teams" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Clubs
                    </Link>

                    <div className="flex items-center gap-8">
                        <div className="relative w-32 h-32 bg-gradient-to-br from-sky-400 to-sky-500 rounded-3xl flex items-center justify-center shadow-2xl">
                            {team.logoUrl ? (
                                <img
                                    src={team.logoUrl}
                                    alt={team.name}
                                    className="w-20 h-20 object-contain"
                                />
                            ) : (
                                <img
                                    src={getTeamLogo(team.name)}
                                    alt={team.name}
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                    onError={(e) => {
                                        (e.target as any).src = '/logo-fallback.svg';
                                    }}
                                />
                            )}
                        </div>
                        <div>
                            <h1 className="text-5xl font-black mb-3 tracking-tight">
                                {team.name}
                            </h1>
                            <div className="flex items-center gap-6 text-white/60 text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {team.city || "Unknown City"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {team.stadium || "Unknown Stadium"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Next Match */}
                        {matchesData?.nextMatch && (
                            <section className="bg-[#2d0032] rounded-2xl p-8 border border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-white font-bold text-lg">Next Match</h2>
                                </div>
                                <div className="bg-[#1a0020] rounded-xl p-6">
                                    <div className="text-white/60 text-sm mb-4">Premier League</div>
                                    <div className="flex items-center justify-between">
                                        {/* Determine Home/Away for Next Match */}
                                        {(() => {
                                            const cleanTeamName = team.name.replace(/\s+(FC|AFC)$/i, '').trim();
                                            const cleanHomeTeam = matchesData.nextMatch.homeTeam.replace(/\s+(FC|AFC)$/i, '').trim();
                                            const isHome = cleanHomeTeam.includes(cleanTeamName) || cleanTeamName.includes(cleanHomeTeam);
                                            const opponent = isHome ? matchesData.nextMatch.awayTeam : matchesData.nextMatch.homeTeam;

                                            // TODO: Logic if we want to show Home Team on left always or Current Team on left always
                                            // Current design: Team on Left, Opponent on Right

                                            return (
                                                <>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center">
                                                            <div className="relative w-16 h-16 mb-2 mx-auto">
                                                                {team.logoUrl ? (
                                                                    <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
                                                                ) : (
                                                                    <img src={getTeamLogo(team.name)} alt={team.name} className="w-full h-full object-contain" />
                                                                )}
                                                            </div>
                                                            <div className="text-white text-sm font-semibold">{team.name}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center px-8">
                                                        <div className="text-white text-2xl font-bold mb-1">VS</div>
                                                        <div className="text-white/60 text-xs">{matchesData.nextMatch.date}</div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center">
                                                            <div className="relative w-16 h-16 mb-2 mx-auto">
                                                                <img
                                                                    src={getTeamLogo(opponent)}
                                                                    alt={opponent}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>
                                                            <div className="text-white text-sm font-semibold">
                                                                {opponent}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Recent Matches (Form) */}
                        {matchesData?.recentMatches && matchesData.recentMatches.length > 0 && (
                            <section className="bg-[#2d0032] rounded-2xl p-8 border border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-white font-bold text-lg">Recent Matches</h2>
                                </div>
                                <div className="space-y-4">
                                    {matchesData.recentMatches.slice(0, 5).map((match: any, idx: number) => {
                                        // Normalize names for comparison (remove FC/AFC and trim)
                                        const cleanTeamName = team.name.replace(/\s+(FC|AFC)$/i, '').trim();
                                        const cleanHomeTeam = match.homeTeam.replace(/\s+(FC|AFC)$/i, '').trim();

                                        const isHome = cleanHomeTeam.includes(cleanTeamName) || cleanTeamName.includes(cleanHomeTeam);
                                        const opponent = isHome ? match.awayTeam : match.homeTeam;
                                        const score = `${match.homeScore} - ${match.awayScore}`;

                                        // Determine result for current team
                                        let result = 'D';
                                        let resultColor = 'bg-gray-500/20 text-gray-400';

                                        if (isHome) {
                                            if (match.homeScore > match.awayScore) { result = 'W'; resultColor = 'bg-green-500/20 text-green-500'; }
                                            else if (match.homeScore < match.awayScore) { result = 'L'; resultColor = 'bg-red-500/20 text-red-500'; }
                                        } else {
                                            if (match.awayScore > match.homeScore) { result = 'W'; resultColor = 'bg-green-500/20 text-green-500'; }
                                            else if (match.awayScore < match.homeScore) { result = 'L'; resultColor = 'bg-red-500/20 text-red-500'; }
                                        }

                                        return (
                                            <div key={idx} className="flex items-center justify-between bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${resultColor}`}>
                                                        {result}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">{match.date}</span>
                                                        <span className="text-white font-bold text-sm">vs {opponent}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-white font-black text-lg tracking-widest">{score}</div>
                                                    <img
                                                        src={getTeamLogo(opponent)}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            if (!target.src.includes('logo-fallback')) {
                                                                target.src = '/logo-fallback.svg';
                                                            }
                                                        }}
                                                        alt={opponent}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Upcoming Matches */}
                        {matchesData?.upcoming && matchesData.upcoming.length > 0 && (
                            <section className="bg-[#2d0032] rounded-2xl p-8 border border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-white font-bold text-lg">Upcoming Matches</h2>
                                    <button className="text-white/60 hover:text-white flex items-center gap-1 text-sm">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    {matchesData.upcoming.map((match: any, idx: number) => {
                                        // Normalize names
                                        const cleanTeamName = team.name.replace(/\s+(FC|AFC)$/i, '').trim();
                                        const cleanHomeTeam = match.homeTeam.replace(/\s+(FC|AFC)$/i, '').trim();

                                        const isHome = cleanHomeTeam.includes(cleanTeamName) || cleanTeamName.includes(cleanHomeTeam);
                                        const opponent = isHome ? match.awayTeam : match.homeTeam;

                                        return (
                                            <div key={idx} className="flex flex-col group cursor-pointer">
                                                <div className="aspect-square bg-[#37003c] rounded-xl flex items-center justify-center mb-2 border border-white/5 group-hover:border-white/20 transition-all relative overflow-hidden">
                                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
                                                    <img
                                                        src={getTeamLogo(opponent)}
                                                        alt={opponent}
                                                        className="w-10 h-10 object-contain drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    <div className="absolute top-2 right-2 text-[8px] font-black bg-white/10 px-1.5 py-0.5 rounded text-white/80">
                                                        {isHome ? 'H' : 'A'}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1 mt-1">
                                                        {match.date.split(' ').slice(1, 3).join(' ')}
                                                    </div>
                                                    <div className="text-white text-xs font-bold truncate w-full px-1" title={opponent}>
                                                        {opponent}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-8">
                        {/* Table Position */}
                        {standing && (
                            <section className="bg-[#2d0032] rounded-2xl p-6 border border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-white font-bold">Table</h3>
                                    <button className="text-white/60 hover:text-white flex items-center gap-1 text-sm">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-center mb-6">
                                    <div className="text-6xl font-black text-white mb-2">
                                        {standing.position}<sup className="text-2xl">th</sup>
                                    </div>
                                    <div className="text-white/60 text-sm">
                                        {standing.position <= 4 ? "Champions League Spot" :
                                            standing.position <= 6 ? "European Spot" :
                                                standing.position >= 18 ? "Relegation Zone" : "Mid Table"}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">Pld</span>
                                        <span className="text-white font-bold">{standing.played}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">W</span>
                                        <span className="text-white font-bold">{standing.wins}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">D</span>
                                        <span className="text-white font-bold">{standing.draws}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">L</span>
                                        <span className="text-white font-bold">{standing.losses}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-3 border-t border-white/10">
                                        <span className="text-white/60">Pts</span>
                                        <span className="text-white font-black text-lg">{standing.points}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2">
                                        <span className="text-white/60">GF / GA</span>
                                        <span className="text-white font-bold">{standing.goalsFor} / {standing.goalsAgainst}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">GD</span>
                                        <span className="text-white font-bold">{standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}</span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Squad List */}
                        <section className="bg-[#2d0032] rounded-2xl p-6 border border-white/5">
                            <h3 className="text-white font-bold mb-6">Squad</h3>
                            {loading ? (
                                <div className="text-center text-white/60 py-8">Loading squad...</div>
                            ) : squad.length === 0 ? (
                                <div className="text-center text-white/60 py-8">
                                    <p className="text-sm">Squad data coming soon...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {squad.slice(0, 5).map((player) => (
                                        <Link
                                            key={player.id}
                                            to={`/players/${player.id}`}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                                        >
                                            {player.imagePath ? (
                                                <img
                                                    src={player.imagePath}
                                                    alt={player.displayName || player.name}
                                                    className="w-10 h-10 rounded-full object-cover bg-white/10"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/60 text-sm font-bold">
                                                    {player.number}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="text-white text-sm font-semibold group-hover:text-purple-300 transition-colors">
                                                    {player.displayName || player.commonName || player.name}
                                                    {player.isCaptain && <span className="ml-2 text-yellow-400">©</span>}
                                                </div>
                                                <div className="text-white/40 text-xs">{player.position}</div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                        </Link>
                                    ))}
                                    <Link to={`/teams/${team.id}/squad`} className="block text-center text-purple-300 hover:text-white text-sm font-semibold mt-4">
                                        View Full Squad
                                    </Link>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
