import { useState } from "react";
import { Match, Team } from "@/types";
import { Plus, Edit2, Play, ArrowLeft, X, Check, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { getTeamLogo } from "@/lib/utils";

const initialMatches: Match[] = [
    { id: "m1", homeTeamId: "1", awayTeamId: "2", homeScore: 0, awayScore: 0, date: "2025-02-01T15:00:00Z", status: "SCHEDULED", seasonId: "s1" },
];

const mockTeams: Team[] = [
    { id: "1", name: "Arsenal", city: "London", stadium: "Emirates Stadium", shortName: "ARS" },
    { id: "2", name: "Manchester City", city: "Manchester", stadium: "Etihad Stadium", shortName: "MCI" },
    { id: "3", name: "Aston Villa", city: "Birmingham", stadium: "Villa Park", shortName: "AVL" },
];

export default function ManageMatches() {
    const [matches] = useState<Match[]>(initialMatches);
    const [isLoggingEvent, setIsLoggingEvent] = useState<string | null>(null);

    const getTeam = (id: string) => mockTeams.find(t => t.id === id);

    return (
        <div className="py-12 bg-slate-50 min-h-screen font-inter">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link to="/admin" className="inline-flex items-center gap-2 text-[#37003c]/40 hover:text-[#37003c] mb-4 transition-colors text-[10px] font-black uppercase tracking-widest">
                            <ArrowLeft className="w-3 h-3" /> Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-[#37003c] tracking-tighter uppercase leading-none">Match Control</h1>
                    </div>
                    <button
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#37003c] text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Schedule New Match
                    </button>
                </header>

                {isLoggingEvent && (
                    <div className="mb-12 glass-card p-10 bg-[#37003c] rounded-[3rem] relative shadow-3xl text-white">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white/10 text-[#00ff85] flex items-center justify-center animate-pulse border border-white/5">
                                    <Timer className="w-5 h-5" />
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Match Incident Logger</h2>
                            </div>
                            <button onClick={() => setIsLoggingEvent(null)} className="text-white/20 hover:text-[#ff005a]"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Incident Type</label>
                                <select className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] font-black text-xs uppercase tracking-widest appearance-none text-white">
                                    <option>Goal</option>
                                    <option>Yellow Card</option>
                                    <option>Red Card</option>
                                    <option>Substitution</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Impacted Player</label>
                                <select className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] font-black text-xs uppercase tracking-widest appearance-none text-white">
                                    <option>Bukayo Saka</option>
                                    <option>Martin Ødegaard</option>
                                    <option>Erling Haaland</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Timestamp (Min)</label>
                                <input type="number" className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] font-black text-xs text-white" defaultValue={45} />
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
                            <div key={match.id} className="glass-card bg-white p-10 flex flex-col md:flex-row items-center gap-10 group hover:border-[#37003c] transition-all rounded-[3.5rem] shadow-2xl relative overflow-hidden active:scale-[0.99]">
                                <div className="flex-1 flex items-center justify-between w-full max-w-2xl mx-auto">
                                    <div className="flex flex-col items-center gap-4 w-32">
                                        <div className="relative w-16 h-16 transition-transform group-hover:scale-110">
                                            <img src={getTeamLogo(home?.name || "")} alt="logo" className="w-full h-full object-contain" />
                                        </div>
                                        <p className="font-black text-[#37003c] text-xs uppercase tracking-widest text-center whitespace-nowrap">{home?.name}</p>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-8">
                                            <span className="text-6xl font-black text-[#37003c] transition-colors">{match.homeScore}</span>
                                            <span className="text-slate-100 font-black text-4xl leading-none -translate-y-1">:</span>
                                            <span className="text-6xl font-black text-[#37003c] transition-colors">{match.awayScore}</span>
                                        </div>
                                        <div className="mt-4 px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                            {match.status}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-4 w-32">
                                        <div className="relative w-16 h-16 transition-transform group-hover:scale-110">
                                            <img src={getTeamLogo(away?.name || "")} alt="logo" className="w-full h-full object-contain" />
                                        </div>
                                        <p className="font-black text-[#37003c] text-xs uppercase tracking-widest text-center whitespace-nowrap">{away?.name}</p>
                                    </div>
                                </div>

                                <div className="h-px md:h-16 w-full md:w-px bg-slate-100" />

                                <div className="flex flex-wrap gap-4 items-center justify-center">
                                    <button
                                        onClick={() => setIsLoggingEvent(match.id)}
                                        className="px-6 py-3 rounded-2xl bg-[#025da4] text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#37003c] transition-all shadow-lg"
                                    >
                                        <Play className="w-4 h-4" /> Start Logger
                                    </button>
                                    <button className="p-4 rounded-2xl border-2 border-slate-50 text-slate-300 hover:text-[#37003c] hover:border-[#37003c]/20 transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="px-6 py-3 rounded-2xl bg-[#ff2882] text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 transition-all shadow-lg">
                                        Finalize Data
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
