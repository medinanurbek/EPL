
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Filter, Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { MatchCard } from "@/components/features/matches/MatchCard";
import { useState, useEffect, useMemo } from "react";
import { Match, MatchStatus, Team } from "@/types";

interface RawMatch {
    matchday: number;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    homeScore?: number;
    awayScore?: number;
    halfTimeScore?: string;
}

type ExtendedMatch = Match & {
    homeTeam: Team;
    awayTeam: Team;
    matchday: number;
    matchIndex: number;
};

export default function MatchesPage() {
    const [activeTab, setActiveTab] = useState<"fixtures" | "results">("fixtures");
    const [matches, setMatches] = useState<ExtendedMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatchday, setSelectedMatchday] = useState<number>(0);
    const [showMatchdayMenu, setShowMatchdayMenu] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const endpoint = activeTab === "fixtures"
                    ? "http://localhost:8080/api/matches/next-json"
                    : "http://localhost:8080/api/matches/results-json";

                const response = await fetch(endpoint);
                const data: RawMatch[] = await response.json();

                const transformedMatches = data.map((item, index) => {
                    // Parse date: "Fri Aug/15 2025" -> "Aug 15 2025"
                    const dateStr = item.date.split(" ").slice(1).join(" ").replace("/", " ");
                    const date = new Date(dateStr + " " + (item.time ? item.time.replace(".", ":") : "00:00"));

                    return {
                        id: `${activeTab}-${index}`,
                        homeTeamId: item.homeTeam,
                        awayTeamId: item.awayTeam,
                        homeScore: item.homeScore || 0,
                        awayScore: item.awayScore || 0,
                        date: date.toISOString(),
                        status: (activeTab === "fixtures" ? "SCHEDULED" : "FINISHED") as MatchStatus,
                        seasonId: "2025-26",
                        matchday: item.matchday,
                        matchIndex: index,
                        homeTeam: {
                            id: item.homeTeam,
                            name: item.homeTeam,
                            city: "UK",
                            stadium: "Premier League Stadium", // Placeholder
                            shortName: item.homeTeam.substring(0, 3).toUpperCase()
                        },
                        awayTeam: {
                            id: item.awayTeam,
                            name: item.awayTeam,
                            city: "UK",
                            stadium: "Premier League Stadium", // Placeholder
                            shortName: item.awayTeam.substring(0, 3).toUpperCase()
                        }
                    };
                });

                setMatches(transformedMatches);

                // Set default matchday
                if (transformedMatches.length > 0) {
                    // For results, show the latest matchday. For fixtures, show the earliest upcoming.
                    const availableMatchdays = Array.from(new Set(transformedMatches.map(m => m.matchday))).sort((a, b) => a - b);
                    if (activeTab === "results") {
                        setSelectedMatchday(availableMatchdays[availableMatchdays.length - 1]);
                    } else {
                        setSelectedMatchday(availableMatchdays[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch matches:", error);
                setMatches([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        setSelectedMatchday(0); // Reset on tab change
    }, [activeTab]);

    const availableMatchdays = useMemo(() => {
        return Array.from(new Set(matches.map(m => m.matchday))).sort((a, b) => a - b);
    }, [matches]);

    const filteredMatches = useMemo(() => {
        if (selectedMatchday === 0) return matches;
        return matches.filter(m => m.matchday === selectedMatchday);
    }, [matches, selectedMatchday]);

    const handlePrevMatchday = () => {
        const curIdx = availableMatchdays.indexOf(selectedMatchday);
        if (curIdx > 0) setSelectedMatchday(availableMatchdays[curIdx - 1]);
    };

    const handleNextMatchday = () => {
        const curIdx = availableMatchdays.indexOf(selectedMatchday);
        if (curIdx < availableMatchdays.length - 1) setSelectedMatchday(availableMatchdays[curIdx + 1]);
    };

    return (
        <div className="min-h-screen bg-[#37003c] text-white selection:bg-[#00ff85] selection:text-[#37003c] font-outfit">
            {/* Background Pattern - subtle noise/texture for premium feel */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* Deep unified background gradient */}
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#37003c] via-[#2a002e] to-[#150017] pointer-events-none" />

            {/* Header Section */}
            <section className="relative pt-24 pb-12 overflow-hidden z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="relative inline-block mb-6 group">
                                <button
                                    onClick={() => setShowMatchdayMenu(!showMatchdayMenu)}
                                    className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00ff85] backdrop-blur-md text-[#00ff85] font-bold uppercase text-xs tracking-[0.2em] transition-all group-hover:bg-white/10"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff85] shadow-[0_0_10px_#00ff85]" />
                                    Matchweek {selectedMatchday > 0 ? selectedMatchday : '-'}
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform text-white/50 group-hover:text-white ${showMatchdayMenu ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showMatchdayMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 mt-3 w-56 max-h-80 overflow-y-auto bg-[#250028] border border-white/10 rounded-xl shadow-2xl z-50 p-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                                        >
                                            <div className="grid grid-cols-1">
                                                {availableMatchdays.map(md => (
                                                    <button
                                                        key={md}
                                                        onClick={() => {
                                                            setSelectedMatchday(md);
                                                            setShowMatchdayMenu(false);
                                                        }}
                                                        className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-between ${selectedMatchday === md
                                                            ? 'bg-[#00ff85] text-[#37003c]'
                                                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        <span>Week {md}</span>
                                                        {selectedMatchday === md && <div className="w-1.5 h-1.5 rounded-full bg-[#37003c]" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="relative z-10">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-3 mb-2"
                                >
                                    <div className="h-1 w-12 bg-[#00ff85]" />
                                    <span className="text-[#00ff85] font-bold uppercase tracking-[0.3em] text-xs">Premier League</span>
                                </motion.div>
                                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] drop-shadow-2xl">
                                    MATCH <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff85] via-[#39ff14] to-[#02bcf5] drop-shadow-[0_0_30px_rgba(0,255,133,0.3)] pr-4 pb-2">
                                        CENTER
                                    </span>
                                </h1>
                            </div>
                        </div>

                        {/* Updated Tab Switcher */}
                        <div className="flex bg-[#250028]/80 backdrop-blur-md p-1.5 rounded-xl border border-white/5 shadow-2xl self-start md:self-end">
                            <button
                                onClick={() => setActiveTab("fixtures")}
                                className={`px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === "fixtures"
                                    ? "bg-white text-[#37003c] shadow-lg"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                Fixtures
                            </button>
                            <button
                                onClick={() => setActiveTab("results")}
                                className={`px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === "results"
                                    ? "bg-white text-[#37003c] shadow-lg"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                Results
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="pb-24 relative z-10 min-h-[60vh]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Toolbar */}
                    <div className="glass-panel p-1 rounded-2xl mb-10 flex flex-wrap items-center justify-between gap-4 border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-2 p-2 w-full md:w-auto">
                            <div className="relative flex-grow md:flex-grow-0 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#00ff85] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Find a match..."
                                    className="w-full md:w-80 pl-11 pr-4 py-3 bg-[#1a001c] border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-[#00ff85] focus:ring-1 focus:ring-[#00ff85] transition-all placeholder:text-white/20"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-5 py-3 bg-[#1a001c] hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-wider text-white transition-all">
                                <Filter className="w-3.5 h-3.5 text-[#00ff85]" />
                                <span className="hidden sm:inline">Filter</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-2 border-t md:border-t-0 md:border-l border-white/5 w-full md:w-auto justify-between md:justify-end">
                            <button
                                onClick={handlePrevMatchday}
                                disabled={availableMatchdays.indexOf(selectedMatchday) <= 0}
                                className="p-2.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="text-center">
                                <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-0.5">Current View</div>
                                <div className="text-sm font-bold text-white tracking-widest uppercase">
                                    Matchweek <span className="text-[#00ff85]">{selectedMatchday}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleNextMatchday}
                                disabled={availableMatchdays.indexOf(selectedMatchday) >= availableMatchdays.length - 1}
                                className="p-2.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Updated Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6">
                            <div className="w-12 h-12 border-4 border-[#00ff85] border-t-transparent rounded-full animate-spin" />
                            <div className="text-[#00ff85] font-bold uppercase tracking-[0.2em] text-sm animate-pulse">Loading Fixtures...</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AnimatePresence mode="wait">
                                {filteredMatches.map((match, idx) => (
                                    <motion.div
                                        key={match.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: idx * 0.05, duration: 0.4, ease: "easeOut" }}
                                    >
                                        <MatchCard match={match} matchIndex={activeTab === "results" ? match.matchIndex : undefined} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {!loading && filteredMatches.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                                <Calendar className="w-10 h-10 text-white/20" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">No Matches Found</h3>
                            <p className="text-white/40 font-medium">We couldn't find any matches for Matchweek {selectedMatchday}.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
