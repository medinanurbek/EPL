import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Trophy, Calendar, Users, ArrowRight, Rocket, Zap, User, TrendingUp } from "lucide-react";
import { topScorers, topAssistants } from "@/lib/match-data";
import { getTeamLogo } from "@/lib/utils";
import { MatchCard } from "@/components/features/matches/MatchCard";
import { useState, useEffect } from "react";
import { Standing, Match, Team } from "@/types";

interface BackendMatch {
    matchday: number;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    halfTimeScore: string;
}

const isValidDate = (date: string) => {
    return !isNaN(Date.parse(date));
};

export default function HomeLanding() {
    const features = [
        { title: "Live Standings", description: "Real-time Premier League table with automated points calculation.", icon: Trophy, href: "/standings", color: "bg-[#00ff85]" },
        { title: "Match Center", description: "Schedule fixtures and log live events with the official logger.", icon: Calendar, href: "/matches", color: "bg-[#ff005a]" },
        { title: "Club Profiles", description: "Detailed squad lists and stadium information for all 20 clubs.", icon: Users, href: "/teams", color: "bg-[#025da4]" },
    ];

    const [standings, setStandings] = useState<Standing[]>([]);
    const [latestMatches, setLatestMatches] = useState<(Match & { homeTeam: Team; awayTeam: Team })[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<(Match & { homeTeam: Team; awayTeam: Team })[]>([]);
    const [currentMatchweek, setCurrentMatchweek] = useState<number>(12);

    useEffect(() => {
        // Fetch Standings
        fetch("http://localhost:8080/api/standings")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setStandings(data);
                }
            })
            .catch(err => console.error(err));

        // Transform backend match to frontend match
        const transformMatch = (bm: BackendMatch): Match & { homeTeam: Team; awayTeam: Team } => {
            // Append current year or next year roughly based on month
            // "Sat Feb/7" -> "Sat Feb 7 2026"
            let dateStr = bm.date.replace("/", " ");
            if (!dateStr.includes("202")) {
                dateStr += " 2026"; // Assume 2026 for Jan-May matches
            }

            return {
                id: Math.random().toString(36).substr(2, 9),
                homeTeamId: "0",
                awayTeamId: "0",
                homeScore: bm.homeScore,
                awayScore: bm.awayScore,
                date: dateStr,
                status: bm.homeScore !== undefined && bm.homeScore !== 0 ? "FINISHED" : (bm.time ? "SCHEDULED" : "SCHEDULED"),
                // Note: simplified status logic. If score exists, likely finished.
                seasonId: "2025-26",
                matchday: bm.matchday,
                homeTeam: { id: "0", name: bm.homeTeam, shortName: bm.homeTeam, city: "", stadium: "Stadium" },
                awayTeam: { id: "0", name: bm.awayTeam, shortName: bm.awayTeam, city: "", stadium: "Stadium" }
            };
        };

        // Fetch Latest Results
        fetch("http://localhost:8080/api/matches/latest")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const transformed = data.map(transformMatch).map(m => ({ ...m, status: "FINISHED" as const }));
                    setLatestMatches(transformed);
                }
            })
            .catch(err => console.error(err));

        // Fetch Upcoming Fixtures
        fetch("http://localhost:8080/api/matches/upcoming")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const transformed = data.map(transformMatch);
                    setUpcomingMatches(transformed);
                    // Use matchday from first upcoming fixture as current matchweek
                    if (transformed.length > 0 && transformed[0].matchday) {
                        setCurrentMatchweek(transformed[0].matchday);
                    }
                }
            })
            .catch(err => console.error(err));
    }, []);

    const topThree = standings.slice(0, 3);

    return (
        <div className="flex flex-col min-h-screen bg-[#37003c]">
            {/* Hero Section */}
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-[#37003c]">
                {/* Stadium Background Effect */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('https://resources.premierleague.com/premierleague/photo/2024/11/11/878c7728-6627-4144-874c-4734898516bd/2024-25-PL-Generic.jpg')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#37003c] via-[#37003c]/80 to-transparent" />
                </div>

                <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00ff85] text-[#37003c] font-black uppercase text-[10px] tracking-[0.3em] mb-8 shadow-[0_0_20px_rgba(0,255,133,0.3)]">
                                <span className="relative flex h-2 w-2 mr-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#37003c] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#37003c]"></span>
                                </span>
                                Matchweek {currentMatchweek} Live
                            </div>
                            <h1 className="text-6xl md:text-8xl font-outfit font-black text-white tracking-[-0.04em] mb-8 leading-[0.9] uppercase">
                                2025/26 <br />
                                <span className="text-[#00ff85]">PREMIER</span> <br />
                                <span className="text-white">LEAGUE</span>
                            </h1>
                            <p className="text-xl text-white/60 font-medium max-w-xl leading-relaxed mb-12 font-sans">
                                Experience the drama of the world&apos;s most watched league. Track live stats, upcoming fixtures, and the race for the title with high-fidelity analytics.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <Link
                                    to="/matches"
                                    className="px-10 py-5 rounded-2xl bg-[#04f5ff] text-[#37003c] font-outfit font-black uppercase tracking-widest hover:scale-105 hover:bg-white transition-all shadow-[0_0_30px_rgba(4,245,255,0.3)] active:scale-95"
                                >
                                    Full Schedule
                                </Link>
                                <button className="px-10 py-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white font-outfit font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all active:scale-95">
                                    Final Highlights
                                </button>
                            </div>
                        </motion.div>

                        {/* Top 3 Teams Widget */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="hidden lg:block"
                        >
                            <div className="glass-card bg-[#37003c]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff85] opacity-20 blur-[100px] rounded-full" />

                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <h3 className="text-white font-outfit font-black uppercase tracking-wider flex items-center gap-3">
                                        <Trophy className="w-5 h-5 text-[#cfae24]" />
                                        Title Race
                                    </h3>
                                    <Link to="/standings" className="text-[#04f5ff] text-[10px] font-outfit font-black uppercase tracking-[0.2em] hover:text-white transition-colors">View Table</Link>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    {topThree.length > 0 ? topThree.map((item, index) => (
                                        <div key={item.teamId} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${index + 1 === 1 ? "bg-[#cfae24] text-[#37003c]" : "bg-white/10 text-white"
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-8 h-8">
                                                        {item.team && (
                                                            <img src={getTeamLogo(item.team.name)} alt={item.team.name} className="w-full h-full object-contain" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-black text-sm uppercase">{item.team?.name || "Unknown"}</span>
                                                        {/* Form removed as it's not in backend yet */}
                                                        <div className="text-[10px] text-white/40 font-bold tracking-wider mt-0.5">
                                                            {item.played} PL | {item.goalDifference > 0 ? '+' : ''}{item.goalDifference} GD
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-2xl font-black text-white italic">{item.points}</span>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-white/30 font-bold uppercase tracking-widest text-xs">
                                            Loading Standings...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats & Match Widgets Feed */}
            <section className="py-24 bg-[#37003c] relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-[#00ff85] rounded-full blur-[150px]" />
                    <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-[#ff005a] rounded-full blur-[150px]" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* Left Column: Player Stats */}
                        <div className="lg:col-span-1 space-y-8">
                            {/* Top Scorer Widget */}
                            <div className="glass-card bg-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-white/10">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110 group-hover:rotate-12 duration-500">
                                    <Rocket className="w-24 h-24 text-[#00ff85] -rotate-45" />
                                </div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00ff85]/5 rounded-full blur-3xl group-hover:bg-[#00ff85]/10 transition-colors" />
                                <h3 className="text-[10px] font-outfit font-black text-white/40 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                    <TrendingUp className="w-4 h-4 text-[#00ff85]" />
                                    Golden Boot Race
                                </h3>
                                <div className="relative z-10">
                                    <div className="flex items-end gap-6 mb-8">
                                        <div className="text-6xl font-outfit font-black text-[#00ff85] italic leading-none">{topScorers[0].goals}</div>
                                        <div className="text-white/40 font-outfit font-black text-xs uppercase tracking-widest pb-1">Goals</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/50 border border-white/5">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-outfit font-black text-white uppercase tracking-tight">{topScorers[0].name}</p>
                                            <p className="text-[10px] font-outfit font-black text-[#00ff85] uppercase tracking-widest">{topScorers[0].team}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Assistant Widget */}
                            <div className="glass-card bg-white/5 p-8 rounded-[2.5rem] shadow-xl border border-white/10 border-t-8 border-t-[#ff2882]">
                                <h3 className="text-[10px] font-outfit font-black text-white/40 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-[#ff2882]" />
                                    Playmaker Award
                                </h3>
                                <div className="space-y-6">
                                    {topAssistants.map((player, i) => (
                                        <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-outfit font-black text-white/20">0{i + 1}</span>
                                                <div>
                                                    <p className="text-sm font-outfit font-black text-white uppercase">{player.name}</p>
                                                    <p className="text-[10px] font-outfit font-black text-[#00ff85] uppercase tracking-widest">{player.team}</p>
                                                </div>
                                            </div>
                                            <div className="text-2xl font-outfit font-black text-white italic">{player.assists}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Match Feed */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Latest Results */}
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-[10px] font-outfit font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-4">
                                        Latest Results
                                        <div className="w-20 h-px bg-white/10" />
                                    </h2>
                                    <Link to="/matches" className="text-[10px] font-outfit font-black text-[#ff2882] uppercase tracking-widest hover:text-[#00ff85] transition-colors">See All</Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {latestMatches.map((match) => (
                                        <MatchCard key={match.id} match={match} />
                                    ))}
                                    {latestMatches.length === 0 && (
                                        <div className="col-span-2 text-center py-8 text-white/30 font-bold uppercase tracking-widest text-xs">Loading Results...</div>
                                    )}
                                </div>
                            </section>

                            {/* Upcoming Fixtures */}
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-[10px] font-outfit font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-4">
                                        Upcoming Fixtures
                                        <div className="w-20 h-px bg-white/10" />
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {upcomingMatches.map((match) => (
                                        <div key={match.id} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl flex items-center justify-between shadow-sm border border-white/5 group hover:border-[#00ff85] transition-all">
                                            <div className="flex items-center gap-6 flex-1 justify-end">
                                                <span className="font-outfit font-black text-white text-xs uppercase hidden sm:block">{match.homeTeam.name}</span>
                                                <div className="relative w-8 h-8">
                                                    <img src={getTeamLogo(match.homeTeam.name)} alt="logo" className="w-full h-full object-contain" />
                                                </div>
                                            </div>

                                            <div className="px-8 flex flex-col items-center">
                                                <div className="text-sm font-outfit font-black text-white/40 mb-1">vs</div>
                                                <div className="text-[9px] font-outfit font-black text-[#37003c] bg-[#00ff85] px-3 py-1 rounded-full uppercase tracking-tighter">
                                                    {/* Attempt to parse date, fallback to raw string if fail */}
                                                    {isValidDate(match.date) ? format(new Date(match.date), "HH:mm") : "TBD"}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 flex-1">
                                                <div className="relative w-8 h-8">
                                                    <img src={getTeamLogo(match.awayTeam.name)} alt="logo" className="w-full h-full object-contain" />
                                                </div>
                                                <span className="font-outfit font-black text-white text-xs uppercase hidden sm:block">{match.awayTeam.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {upcomingMatches.length === 0 && (
                                        <div className="text-center py-8 text-white/30 font-bold uppercase tracking-widest text-xs">Loading Fixtures...</div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>

            {/* Standard Features Grid */}
            <section className="py-32 bg-[#37003c] relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group p-10 rounded-[3rem] bg-white/5 border border-white/5 hover:border-[#00ff85]/30 hover:bg-white/10 transition-all duration-500 shadow-2xl backdrop-blur-sm"
                            >
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 group-hover:rotate-6 ${feature.color}`}>
                                    <feature.icon className="w-8 h-8 text-[#37003c]" />
                                </div>
                                <h3 className="text-2xl font-outfit font-black text-white group-hover:text-[#00ff85] mb-4 tracking-tight uppercase transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-white/40 group-hover:text-white/70 font-medium leading-relaxed mb-10 italic transition-colors">
                                    {feature.description}
                                </p>
                                <Link
                                    to={feature.href}
                                    className="inline-flex items-center gap-2 text-[10px] font-outfit font-black uppercase tracking-[0.2em] text-[#00ff85] hover:text-white transition-colors"
                                >
                                    Explore Module <ArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
