import { useState, useEffect, useCallback } from "react";
import { Team, GoalEvent } from "@/types";
import { ArrowLeft, Play, Square, Zap, Trash2, ChevronLeft, ChevronRight, Clock, Trophy, Radio, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";
import { getTeamLogo } from "@/lib/utils";

interface MatchData {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    homeTeam?: Team;
    awayTeam?: Team;
    homeScore: number;
    awayScore: number;
    date: string;
    matchday: number;
    status: "SCHEDULED" | "LIVE" | "FINISHED";
}

export default function ManageMatches() {
    const [matches, setMatches] = useState<MatchData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
    const [events, setEvents] = useState<GoalEvent[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeMatchday, setActiveMatchday] = useState<number>(1);
    const [viewingMatchday, setViewingMatchday] = useState<number>(1);

    const loadData = useCallback(async () => {
        try {
            const [matchResponse, teamData] = await Promise.all([
                apiService.getMatches(),
                apiService.getTeams(),
            ]);

            // Handle new response format
            const matchData = matchResponse.matches || [];
            const currentActive = matchResponse.activeMatchday || 1;

            setActiveMatchday(currentActive);

            // Determine what to view: if we haven't set a view yet, or if it changed significantly
            // But we want to persist user navigation if possible. 
            // Initial load strategy: show active matchday.
            setViewingMatchday(prev => (loading ? currentActive : prev));

            const enriched = matchData.map((m: any) => ({
                ...m,
                homeTeam: teamData.find((t: Team) => t.id === m.homeTeamId),
                awayTeam: teamData.find((t: Team) => t.id === m.awayTeamId),
            }));
            setMatches(enriched);
        } catch (err) {
            console.error("Failed to load matches:", err);
        } finally {
            setLoading(false);
        }
    }, [loading]);

    useEffect(() => { loadData(); }, [loadData]);

    // Poll for match data updates if there are live matches
    useEffect(() => {
        const hasLiveMatches = matches.some(m => m.status === "LIVE");
        if (!hasLiveMatches) return;

        const interval = setInterval(() => {
            loadData();
        }, 3000); // Refresh every 3 seconds

        return () => clearInterval(interval);
    }, [matches, loadData]);

    // Poll for live events when a live match is selected
    useEffect(() => {
        if (!selectedMatch) return;

        const loadEvents = async () => {
            try {
                const evts = await apiService.getMatchLiveEvents(selectedMatch);
                setEvents(evts || []);
            } catch { }
        };
        loadEvents();
        // We can rely on the main polling above to trigger re-renders, 
        // but we still need to fetch events for the selected match specifically.
        // Since loadData triggers a matches update, this effect will re-run if we depend on 'matches'.
        // Let's keep a separate interval for events to be safe and responsive.
        const interval = setInterval(loadEvents, 3000);
        return () => clearInterval(interval);
    }, [selectedMatch]);

    const handleStart = async (matchId: string) => {
        // Enforce matchday
        const match = matches.find(m => m.id === matchId);
        if (match && match.matchday !== activeMatchday) {
            alert(`You can only start matches for the active Matchday ${activeMatchday}. This match is in Matchday ${match.matchday}.`);
            return;
        }

        setActionLoading(matchId);
        try {
            await apiService.startMatch(matchId);
            await loadData();
            setSelectedMatch(matchId);
        } catch (err: any) {
            alert(err?.response?.data?.error || "Failed to start match");
        } finally {
            setActionLoading(null);
        }
    };

    const handleFinish = async (matchId: string) => {
        if (!confirm("Finish this match? Standings will be recalculated.")) return;
        setActionLoading(matchId);
        try {
            await apiService.finishMatch(matchId);
            await loadData();
        } catch (err: any) {
            alert(err?.response?.data?.error || "Failed to finish match");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteEvent = async (matchId: string, eventId: string) => {
        if (!confirm("Delete this goal event? Score will be recalculated.")) return;
        try {
            await apiService.deleteGoalEvent(matchId, eventId);
            await loadData();
            const evts = await apiService.getMatchLiveEvents(matchId);
            setEvents(evts || []);
        } catch (err: any) {
            alert(err?.response?.data?.error || "Failed to delete event");
        }
    };

    const visibleMatches = matches.filter(m => m.matchday === viewingMatchday);
    const liveMatches = visibleMatches.filter(m => m.status === "LIVE");
    const scheduledMatches = visibleMatches.filter(m => m.status === "SCHEDULED");
    const finishedMatches = visibleMatches.filter(m => m.status === "FINISHED");

    if (loading) {
        return (
            <div className="py-12 bg-[#37003c] min-h-screen font-inter text-white flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#00ff85] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="py-12 bg-[#37003c] min-h-screen font-inter text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link to="/admin" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-[10px] font-black uppercase tracking-widest">
                            <ArrowLeft className="w-3 h-3" /> Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Match Control</h1>
                        <p className="text-white/30 text-sm mt-2">
                            System Active Week: <span className="text-[#00ff85] font-bold">Matchday {activeMatchday}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl">
                        <button
                            onClick={() => setViewingMatchday(d => Math.max(1, d - 1))}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="text-center min-w-[120px]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Viewing</span>
                            <span className="text-lg font-black text-white">Matchday {viewingMatchday}</span>
                        </div>
                        <button
                            onClick={() => setViewingMatchday(d => d + 1)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {viewingMatchday !== activeMatchday && (
                    <div className="mb-8 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span className="text-sm text-blue-200">
                            Viewing Matchday {viewingMatchday}. The active simulation week is <strong>Matchday {activeMatchday}</strong>.
                            You can only start matches in the active week.
                        </span>
                        <button
                            onClick={() => setViewingMatchday(activeMatchday)}
                            className="ml-auto text-xs font-black uppercase bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Jump to Active
                        </button>
                    </div>
                )}

                {/* Live Matches */}
                {liveMatches.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-xs font-black text-[#ff2882] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Radio className="w-4 h-4 animate-pulse" /> Live Now
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {liveMatches.map(match => (
                                <MatchCard key={match.id} match={match} onStart={handleStart} onFinish={handleFinish}
                                    onSelect={setSelectedMatch} selected={selectedMatch === match.id} loading={actionLoading === match.id}
                                    activeMatchday={activeMatchday} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Scheduled Matches */}
                {scheduledMatches.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Scheduled
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {scheduledMatches.map(match => (
                                <MatchCard key={match.id} match={match} onStart={handleStart} onFinish={handleFinish}
                                    onSelect={setSelectedMatch} selected={selectedMatch === match.id} loading={actionLoading === match.id}
                                    activeMatchday={activeMatchday} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Finished Matches */}
                {finishedMatches.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-xs font-black text-[#00ff85]/60 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Trophy className="w-4 h-4" /> Finished
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {finishedMatches.map(match => (
                                <MatchCard key={match.id} match={match} onStart={handleStart} onFinish={handleFinish}
                                    onSelect={setSelectedMatch} selected={selectedMatch === match.id} loading={actionLoading === match.id}
                                    activeMatchday={activeMatchday} />
                            ))}
                        </div>
                    </section>
                )}

                {visibleMatches.length === 0 && (
                    <div className="text-center py-20 opacity-30">
                        <p className="text-2xl font-black uppercase">No matches found for Matchday {viewingMatchday}</p>
                    </div>
                )}

                {/* Events Panel */}
                {selectedMatch && (
                    <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-[#2d0033]/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Match Events</h3>
                                <button onClick={() => setSelectedMatch(null)} className="text-white/30 hover:text-white p-2">✕</button>
                            </div>

                            {(() => {
                                const match = matches.find(m => m.id === selectedMatch);
                                if (!match) return null;
                                return (
                                    <div className="text-center mb-8 p-4 bg-white/5 rounded-2xl">
                                        <div className="flex items-center justify-center gap-6">
                                            <div className="text-center">
                                                <img src={getTeamLogo(match.homeTeam?.name || "")} className="w-10 h-10 mx-auto mb-1 object-contain" alt="" />
                                                <p className="text-[10px] font-black text-white/50 uppercase">{match.homeTeam?.shortName}</p>
                                            </div>
                                            <div className="text-3xl font-black text-white">{match.homeScore} - {match.awayScore}</div>
                                            <div className="text-center">
                                                <img src={getTeamLogo(match.awayTeam?.name || "")} className="w-10 h-10 mx-auto mb-1 object-contain" alt="" />
                                                <p className="text-[10px] font-black text-white/50 uppercase">{match.awayTeam?.shortName}</p>
                                            </div>
                                        </div>
                                        {match.status === "LIVE" && (
                                            <p className="text-[10px] text-[#ff2882] font-black uppercase mt-2 animate-pulse">● Simulation Running</p>
                                        )}
                                    </div>
                                );
                            })()}

                            {events.length === 0 ? (
                                <p className="text-white/20 text-center text-sm py-8">No events yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {events.map(evt => (
                                        <div key={evt.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-colors">
                                            <div className="w-10 h-10 bg-[#00ff85]/10 rounded-xl flex items-center justify-center text-[#00ff85] text-xs font-black flex-shrink-0">
                                                {evt.minute}'
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-bold text-sm truncate">⚽ {evt.scorerName}</p>
                                                {evt.assistName && (
                                                    <p className="text-white/30 text-[10px] truncate">Assist: {evt.assistName}</p>
                                                )}
                                                <p className="text-white/20 text-[10px] uppercase">{evt.teamName}</p>
                                            </div>
                                            {matches.find(m => m.id === selectedMatch)?.status === "FINISHED" && (
                                                <button
                                                    onClick={() => handleDeleteEvent(selectedMatch, evt.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-[#ff005a] transition-all"
                                                    title="Delete event"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MatchCard({ match, onStart, onFinish, onSelect, selected, loading, activeMatchday }: {
    match: MatchData;
    onStart: (id: string) => void;
    onFinish: (id: string) => void;
    onSelect: (id: string) => void;
    selected: boolean;
    loading: boolean;
    activeMatchday: number;
}) {
    const isNext = match.matchday === activeMatchday;

    return (
        <div
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${selected ? "bg-white/10 border-[#00ff85]/30" : "bg-white/5 border-white/5 hover:border-white/20"
                }`}
            onClick={() => onSelect(match.id)}
        >
            <div className="flex items-center justify-between mb-4">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-2 ${match.status === "LIVE" ? "bg-[#ff2882]/20 text-[#ff2882] border-[#ff2882]/30 animate-pulse" :
                    match.status === "FINISHED" ? "bg-[#00ff85]/10 text-[#00ff85] border-[#00ff85]/20" :
                        "bg-white/10 text-white/40 border-white/10"
                    }`}>
                    {match.status === "LIVE" && <Radio className="w-3 h-3 inline mr-1" />}
                    {match.status}
                </span>
                <span className="text-[10px] text-white/20 font-bold">MW {match.matchday}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <img src={getTeamLogo(match.homeTeam?.name || "")} className="w-8 h-8 object-contain" alt="" />
                    <span className="text-sm font-black text-white uppercase truncate">{match.homeTeam?.shortName || "TBD"}</span>
                </div>
                <div className="text-xl font-black text-white mx-4">
                    {match.status === "SCHEDULED" ? "vs" : `${match.homeScore} - ${match.awayScore}`}
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className="text-sm font-black text-white uppercase truncate">{match.awayTeam?.shortName || "TBD"}</span>
                    <img src={getTeamLogo(match.awayTeam?.name || "")} className="w-8 h-8 object-contain" alt="" />
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                {match.status === "SCHEDULED" && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onStart(match.id); }}
                        disabled={loading || !isNext}
                        className="flex-1 py-2.5 rounded-xl bg-[#00ff85] text-[#37003c] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title={!isNext ? `Available in Matchday ${match.matchday}` : "Start Simulation"}
                    >
                        {loading ? <span className="animate-spin w-4 h-4 border-2 border-[#37003c] border-t-transparent rounded-full" /> : <><Play className="w-3.5 h-3.5" /> Start Match</>}
                    </button>
                )}
                {match.status === "LIVE" && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onFinish(match.id); }}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-[#ff2882] text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <><Square className="w-3.5 h-3.5" /> Finish</>}
                    </button>
                )}
                {match.status === "FINISHED" && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onSelect(match.id); }}
                        className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                    >
                        <Zap className="w-3.5 h-3.5" /> View Events
                    </button>
                )}
            </div>
        </div>
    );
}
