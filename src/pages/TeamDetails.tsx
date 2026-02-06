import { Team, Player } from "@/types";
import { Shield, Users, ArrowLeft, Target, Award, TrendingUp, ChevronRight, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

// Mock Data - In real app, fetch based on teamId
const mockTeam: Team = {
    id: "9",
    name: "Manchester City",
    city: "Manchester",
    stadium: "Etihad Stadium",
    shortName: "MCI"
};

// Club Information
const clubInfo = {
    founded: 1880,
    stadium: "Etihad Stadium",
    capacity: "53,400",
};

// Next Match
const nextMatch = {
    homeTeam: "Manchester City",
    awayTeam: "Sunderland",
    date: "Dec 3, 2025",
    time: "20:00",
    competition: "Premier League - Matchweek 14",
};

// Team Form (Last 5 matches) - most recent first
const teamForm = [
    { result: "W", opponent: "WHU", score: "2-0", date: "NOV 30" },
    { result: "W", opponent: "NFO", score: "3-0", date: "NOV 23" },
    { result: "W", opponent: "LIV", score: "3-0", date: "NOV 9" },
    { result: "W", opponent: "AVL", score: "2-0", date: "NOV 2" },
    { result: "W", opponent: "LEE", score: "3-1", date: "DEC 6" },
];

// League Table Position - 2025/26 Season
const tablePosition = {
    position: 2,
    team: "Manchester City",
    played: 21,
    wins: 13,
    draws: 4,
    losses: 4,
    points: 43,
    goalsFor: 45,
    goalsAgainst: 19,
    cleanSheets: 9,
};

// Top Performers - 2025/26 Season
const topPerformers = {
    topScorer: { name: "Erling Haaland", goals: 20 },
    mostAssists: { name: "Rayan Cherki", assists: 7 },
    mostPasses: { name: "Rodri", passes: 1650 },
};

export default function TeamDetailsPage() {
    const { id: teamId } = useParams();
    const [squad, setSquad] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSquad = async () => {
            try {
                setLoading(true);
                const data = await apiService.getTeamSquad(mockTeam.id);
                setSquad(data);
            } catch (error) {
                console.error('Failed to fetch squad:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSquad();
    }, [teamId]);

    const getLogoPath = (teamName: string) => {
        const slug = teamName.toLowerCase().replace(/\s+/g, '-');
        return `/logos/${slug}.football-logos.cc.svg`;
    };

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
                            <img
                                src={getLogoPath(mockTeam.name)}
                                alt={mockTeam.name}
                                width={80}
                                height={80}
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black mb-3 tracking-tight">
                                {mockTeam.name}
                            </h1>
                            <div className="flex items-center gap-6 text-white/60 text-sm">
                                <div className="flex items-center gap-2">
                                    < MapPin className="w-4 h-4" />
                                    Est. {clubInfo.founded}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {clubInfo.stadium}
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
                        <section className="bg-[#2d0032] rounded-2xl p-8 border border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-white font-bold text-lg">Next Match</h2>
                            </div>
                            <div className="bg-[#1a0020] rounded-xl p-6">
                                <div className="text-white/60 text-sm mb-4">{nextMatch.competition}</div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <div className="relative w-16 h-16 mb-2">
                                                <img
                                                    src={getLogoPath(nextMatch.homeTeam)}
                                                    alt={nextMatch.homeTeam}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="text-white text-sm font-semibold">{nextMatch.homeTeam}</div>
                                        </div>
                                    </div>
                                    <div className="text-center px-8">
                                        <div className="text-white text-2xl font-bold mb-1">{nextMatch.time}</div>
                                        <div className="text-white/60 text-xs">{nextMatch.date}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <div className="relative w-16 h-16 mb-2">
                                                <img
                                                    src={getLogoPath(nextMatch.awayTeam)}
                                                    alt={nextMatch.awayTeam}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="text-white text-sm font-semibold">{nextMatch.awayTeam}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Team Form */}
                        <section className="bg-[#2d0032] rounded-2xl p-8 border border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-white font-bold text-lg">Team Form</h2>
                                <button className="text-white/60 hover:text-white flex items-center gap-1 text-sm">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex gap-3">
                                {teamForm.map((match, idx) => (
                                    <div key={idx} className="flex-1">
                                        <div className={`aspect-square rounded-xl flex items-center justify-center text-2xl font-black mb-2 ${match.result === 'W' ? 'bg-green-600' :
                                            match.result === 'D' ? 'bg-gray-600' :
                                                'bg-red-600'
                                            }`}>
                                            {match.result}
                                        </div>
                                        <div className="text-center">
                                            <div className="text-white/60 text-xs mb-1">{match.date}</div>
                                            <div className="text-white text-sm font-semibold">{match.opponent}</div>
                                            <div className={`text-xs font-bold mt-1 ${match.result === 'W' ? 'text-green-400' :
                                                match.result === 'D' ? 'text-gray-400' :
                                                    'text-red-400'
                                                }`}>
                                                {match.score}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Top Performers */}
                        <section className="bg-[#2d0032] rounded-2xl p-8 border border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-white font-bold text-lg">Top Performers</h2>
                                <button className="text-white/60 hover:text-white flex items-center gap-1 text-sm">
                                    See all <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                {/* Top Goal Scorer */}
                                <div className="text-center">
                                    <div className="text-white/60 text-xs mb-3 flex items-center justify-center gap-2">
                                        <Target className="w-4 h-4" />
                                        Top Goal Scorer
                                    </div>
                                    <div className="bg-[#1a0020] rounded-xl p-4 border border-white/5">
                                        <div className="w-16 h-16 bg-sky-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                                            < Shield className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-white font-bold text-sm mb-1">{topPerformers.topScorer.name}</div>
                                        <div className="text-3xl font-black text-white">{topPerformers.topScorer.goals}</div>
                                    </div>
                                </div>

                                {/* Most Assists */}
                                <div className="text-center">
                                    <div className="text-white/60 text-xs mb-3 flex items-center justify-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Most Assists
                                    </div>
                                    <div className="bg-[#1a0020] rounded-xl p-4 border border-white/5">
                                        <div className="w-16 h-16 bg-sky-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                                            < Shield className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-white font-bold text-sm mb-1">{topPerformers.mostAssists.name}</div>
                                        <div className="text-3xl font-black text-white">{topPerformers.mostAssists.assists}</div>
                                    </div>
                                </div>

                                {/* Most Successful Passes */}
                                <div className="text-center">
                                    <div className="text-white/60 text-xs mb-3 flex items-center justify-center gap-2">
                                        <Award className="w-4 h-4" />
                                        Most Successful Passes
                                    </div>
                                    <div className="bg-[#1a0020] rounded-xl p-4 border border-white/5">
                                        <div className="w-16 h-16 bg-sky-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                                            < Shield className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-white font-bold text-sm mb-1">{topPerformers.mostPasses.name}</div>
                                        <div className="text-3xl font-black text-white">{topPerformers.mostPasses.passes}</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-8">
                        {/* Table Position */}
                        <section className="bg-[#2d0032] rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white font-bold">Table</h3>
                                <button className="text-white/60 hover:text-white flex items-center gap-1 text-sm">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-center mb-6">
                                <div className="text-6xl font-black text-white mb-2">
                                    {tablePosition.position}<sup className="text-2xl">th</sup>
                                </div>
                                <div className="text-white/60 text-sm">Steady at 2nd place</div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Pld</span>
                                    <span className="text-white font-bold">{tablePosition.played}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">W</span>
                                    <span className="text-white font-bold">{tablePosition.wins}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">D</span>
                                    <span className="text-white font-bold">{tablePosition.draws}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">L</span>
                                    <span className="text-white font-bold">{tablePosition.losses}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-3 border-t border-white/10">
                                    <span className="text-white/60">Pts</span>
                                    <span className="text-white font-black text-lg">{tablePosition.points}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2">
                                    <span className="text-white/60">GF / GA</span>
                                    <span className="text-white font-bold">{tablePosition.goalsFor} / {tablePosition.goalsAgainst}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Clean Sheets</span>
                                    <span className="text-white font-bold">{tablePosition.cleanSheets}</span>
                                </div>
                            </div>
                        </section>

                        {/* Squad List */}
                        <section className="bg-[#2d0032] rounded-2xl p-6 border border-white/5">
                            <h3 className="text-white font-bold mb-6">Squad</h3>
                            {loading ? (
                                <div className="text-center text-white/60 py-8">Loading squad...</div>
                            ) : squad.length === 0 ? (
                                <div className="text-center text-white/60 py-8">No squad data available</div>
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
                                </div>
                            )}
                            <Link to={`/teams/${mockTeam.id}/squad`} className="block text-center text-purple-300 hover:text-white text-sm font-semibold mt-4">
                                View Full Squad
                            </Link>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
