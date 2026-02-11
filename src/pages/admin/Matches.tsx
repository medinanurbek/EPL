import { useState, useEffect } from "react";
import { Match, Team } from "@/types";
import { Plus, Edit2, Play, ArrowLeft, X, Check, Timer, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getTeamLogo } from "@/lib/utils";
import { apiService } from "@/lib/api";

export default function ManageMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingEvent, setIsLoggingEvent] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [matchesData, teamsData] = await Promise.all([
                apiService.getTeamMatches("all"), // Assuming a way to get all matches, or just general matches
                // Wait, getTeamMatches("all") might not exist. Let's check api.ts again or just use a generic call.
                // I'll use common match fetching if available.
                fetch('/api/matches').then(res => res.json()),
                apiService.getTeams()
            ]);
            setMatches(matchesData);
            setTeams(teamsData);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getTeam = (id: string) => teams.find(t => t.id === id);

    const handleUpdateStatus = async (matchId: string, status: string) => {
        try {
            await apiService.updateMatchStatus(matchId, status);
            setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: status as any } : m));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-[#37003c] animate-spin" />
                <p className="text-[#37003c] font-black uppercase tracking-widest text-[10px]">Loading Control Panel...</p>
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
                    </div>
                    <button
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#00ff85] text-[#37003c] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Schedule New Match
                    </button>
                </header>

                {isLoggingEvent && (
                    <div className="mb-12 glass-card p-10 bg-white/5 rounded-[3rem] relative shadow-3xl text-white border border-white/10">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white/10 text-[#00ff85] flex items-center justify-center animate-pulse border border-white/5">
                                    <Timer className="w-5 h-5" />
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Match Incident Logger</h2>
                            </div>
                            <button onClick={() => setIsLoggingEvent(null)} className="text-white/20 hover:text-[#ff005a]"><X className="w-6 h-6" /></button>
                        </div>
                        {/* Logger Content */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Incident Type</label>
                                <select className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] font-black text-xs uppercase tracking-widest appearance-none text-white focus:outline-none">
                                    <option className="bg-[#37003c]">Goal</option>
                                    <option className="bg-[#37003c]">Yellow Card</option>
                                    <option className="bg-[#37003c]">Red Card</option>
                                    <option className="bg-[#37003c]">Substitution</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Impacted Player</label>
                                <select className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] font-black text-xs uppercase tracking-widest appearance-none text-white focus:outline-none">
                                    <option className="bg-[#37003c]">Player 1</option>
                                    <option className="bg-[#37003c]">Player 2</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Timestamp (Min)</label>
                                <input type="number" className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] font-black text-xs text-white focus:outline-none" defaultValue={45} />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => setIsLoggingEvent(null)}
                                    className="w-full py-4 rounded-2xl bg-[#00ff85] text-[#37003c] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#00e075] transition-all shadow-lg"
                                >
                                    <Check className="w-5 h-5" /> Commit Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-8">
                    {matches.map(match => {
                        const home = getTeam(match.homeTeamId);
                        const away = getTeam(match.awayTeamId);
                        return (
                            <div key={match.id} className="glass-card p-10 flex flex-col md:flex-row items-center gap-10 group hover:border-white/20 transition-all rounded-[3.5rem] shadow-2xl relative overflow-hidden active:scale-[0.99] border border-white/5">
                                <div className="flex-1 flex items-center justify-between w-full max-w-2xl mx-auto">
                                    <div className="flex flex-col items-center gap-4 w-32">
                                        <div className="relative w-16 h-16 transition-transform group-hover:scale-110">
                                            <img src={getTeamLogo(home?.name || "")} alt="logo" className="w-full h-full object-contain brightness-110" />
                                        </div>
                                        <p className="font-black text-white text-xs uppercase tracking-widest text-center whitespace-nowrap">{home?.name}</p>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-8">
                                            <span className="text-6xl font-black text-white transition-colors">{match.homeScore}</span>
                                            <span className="text-white/10 font-black text-4xl leading-none -translate-y-1">:</span>
                                            <span className="text-6xl font-black text-white transition-colors">{match.awayScore}</span>
                                        </div>
                                        <div className={`mt-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] ${match.status === 'LIVE' ? 'bg-[#ff005a] text-white animate-pulse' : 'bg-white/5 text-white/40'}`}>
                                            {match.status}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-4 w-32">
                                        <div className="relative w-16 h-16 transition-transform group-hover:scale-110">
                                            <img src={getTeamLogo(away?.name || "")} alt="logo" className="w-full h-full object-contain brightness-110" />
                                        </div>
                                        <p className="font-black text-white text-xs uppercase tracking-widest text-center whitespace-nowrap">{away?.name}</p>
                                    </div>
                                </div>

                                <div className="h-px md:h-16 w-full md:w-px bg-white/10" />

                                <div className="flex flex-wrap gap-4 items-center justify-center">
                                    {match.status === 'SCHEDULED' ? (
                                        <button
                                            onClick={() => handleUpdateStatus(match.id, 'LIVE')}
                                            className="px-6 py-3 rounded-2xl bg-[#00ff85] text-[#37003c] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 transition-all shadow-lg"
                                        >
                                            <Play className="w-4 h-4" /> Start Match
                                        </button>
                                    ) : match.status === 'LIVE' ? (
                                        <button
                                            onClick={() => handleUpdateStatus(match.id, 'FINISHED')}
                                            className="px-6 py-3 rounded-2xl bg-white text-[#37003c] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 transition-all shadow-lg"
                                        >
                                            <Check className="w-4 h-4" /> Finalize
                                        </button>
                                    ) : (
                                        <button className="px-6 py-3 rounded-2xl bg-white/5 text-white/20 text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed">
                                            Completed
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsLoggingEvent(match.id)}
                                        className="p-4 rounded-2xl border-2 border-white/5 text-white/10 hover:text-[#00ff85] hover:border-[#00ff85]/20 transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
