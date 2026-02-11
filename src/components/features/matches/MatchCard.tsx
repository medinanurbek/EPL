import { Match, Team } from "@/types";
import { format } from "date-fns";
import { Calendar, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getTeamLogo } from "@/lib/utils";

const isValidDate = (date: string) => {
    return !isNaN(Date.parse(date));
};
interface GoalEvent {
    id: string;
    matchIndex: number;
    scorerName: string;
    assistName?: string;
    teamName: string;
    minute: number;
    isHomeGoal: boolean;
}

interface MatchCardProps {
    match: Match & { homeTeam: Team; awayTeam: Team };
    matchIndex?: number;
}

export function MatchCard({ match, matchIndex }: MatchCardProps) {
    const isFinished = match.status === "FINISHED";
    const isLive = match.status === "LIVE";
    const [expanded, setExpanded] = useState(false);
    const [events, setEvents] = useState<GoalEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);

    const handleExpand = async () => {
        if (!isFinished || matchIndex === undefined) return;

        if (expanded) {
            setExpanded(false);
            return;
        }

        if (events.length === 0) {
            setLoadingEvents(true);
            try {
                const res = await fetch(`http://localhost:8080/api/matches/${matchIndex}/events`);
                const data = await res.json();
                setEvents(data || []);
            } catch (err) {
                console.error("Failed to fetch events:", err);
            } finally {
                setLoadingEvents(false);
            }
        }
        setExpanded(true);
    };

    return (
        <div className="glass-card overflow-hidden group hover:border-[#00ff85]/50 transition-all bg-white/[0.03] backdrop-blur-3xl relative border border-white/10 shadow-2xl rounded-[24px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff85]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-outfit font-black uppercase tracking-[0.3em] text-white/40">
                    <Calendar className="w-3.5 h-4 text-white/20" />
                    {match.date && isValidDate(match.date)
                        ? format(new Date(match.date), "EEE d MMM yyyy")
                        : "Date TBD"}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-outfit font-black uppercase tracking-[0.2em]
                    ${isLive ? "bg-[#ff005a] text-white shadow-[0_0_20px_rgba(255,0,90,0.4)]" : "bg-white/5 text-white/40"}
                `}>
                    {isLive ? "Live" : match.status}
                </div>
            </div>

            <div className="px-6 py-8 relative z-10">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 flex flex-col items-center gap-4">
                        <div className="relative w-16 h-16 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            <img
                                src={getTeamLogo(match.homeTeam.name)}
                                alt={match.homeTeam.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="font-outfit font-black text-white text-[10px] uppercase tracking-[0.2em] text-center line-clamp-2 leading-tight min-h-[2rem] flex items-start justify-center px-2">
                            {match.homeTeam.name}
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        {(isFinished || isLive) ? (
                            <div className="flex items-center gap-4">
                                <span className="text-5xl font-outfit font-black text-white tracking-tighter drop-shadow-2xl">{match.homeScore}</span>
                                <span className="text-white/20 font-outfit font-black text-2xl">:</span>
                                <span className="text-5xl font-outfit font-black text-white tracking-tighter drop-shadow-2xl">{match.awayScore}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="text-white/10 font-outfit font-black text-3xl tracking-widest">— : —</div>
                                <div className="text-[10px] font-outfit font-black text-[#37003c] bg-[#00ff85] px-5 py-1.5 rounded-full shadow-[0_0_25px_rgba(0,255,133,0.3)] transition-all group-hover:scale-105">
                                    {format(new Date(match.date), "HH:mm")}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-4">
                        <div className="relative w-16 h-16 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            <img
                                src={getTeamLogo(match.awayTeam.name)}
                                alt={match.awayTeam.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="font-outfit font-black text-white text-[10px] uppercase tracking-[0.2em] text-center line-clamp-2 leading-tight min-h-[2rem] flex items-start justify-center px-2">
                            {match.awayTeam.name}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expandable Goal Events */}
            {isFinished && matchIndex !== undefined && (
                <div
                    className="px-8 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.02] relative z-10 cursor-pointer hover:bg-white/[0.05] transition-colors"
                    onClick={handleExpand}
                >
                    <div className="flex items-center gap-3 text-[10px] font-outfit font-black text-white/40 uppercase tracking-[0.3em]">
                        <span>⚽</span>
                        {(match.homeScore + match.awayScore) > 0 ? `${match.homeScore + match.awayScore} Goals` : 'No Goals'}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#00ff85] transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                </div>
            )}

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-white/5"
                    >
                        <div className="px-8 py-4 space-y-2">
                            {loadingEvents ? (
                                <div className="text-center py-4">
                                    <div className="w-5 h-5 border-2 border-[#00ff85] border-t-transparent rounded-full animate-spin mx-auto" />
                                </div>
                            ) : events.length > 0 ? (
                                events.map((event) => (
                                    <div key={event.id} className={`flex items-center gap-3 py-2 px-3 rounded-xl ${event.isHomeGoal ? 'bg-white/[0.03]' : 'bg-white/[0.03]'}`}>
                                        <span className="text-[#00ff85] font-outfit font-black text-xs min-w-[28px]">{event.minute}'</span>
                                        <span className="text-white/30">⚽</span>
                                        <div className="flex-1">
                                            <span className="text-white font-outfit font-bold text-xs uppercase">{event.scorerName}</span>
                                            {event.assistName && (
                                                <span className="text-white/40 font-outfit text-[10px] ml-2">
                                                    (assist: <span className="text-white/60">{event.assistName}</span>)
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-4 h-4 opacity-40">
                                            <img src={getTeamLogo(event.teamName)} alt="" className="w-full h-full object-contain" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-white/30 font-outfit font-bold text-xs uppercase tracking-wider">
                                    No goal events recorded
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stadium footer - only for non-expanded or non-finished */}
            {(!isFinished || matchIndex === undefined) && (
                <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-white/[0.02] relative z-10 group/footer cursor-pointer">
                    <div className="flex items-center gap-3 text-[10px] font-outfit font-black text-white/40 uppercase tracking-[0.3em]">
                        <MapPin className="w-4 h-4 text-[#00ff85] opacity-50" />
                        {match.homeTeam.stadium}
                    </div>
                </div>
            )}
        </div>
    );
}
