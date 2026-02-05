import { Match, Team } from "@/types";
import { format } from "date-fns";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import Image from "next/image";
import { getTeamLogo } from "@/lib/utils";

interface MatchCardProps {
    match: Match & { homeTeam: Team; awayTeam: Team };
}

export function MatchCard({ match }: MatchCardProps) {
    const isFinished = match.status === "FINISHED";
    const isLive = match.status === "LIVE";

    return (
        <div className="glass-card overflow-hidden group hover:border-[#00ff85]/50 transition-all bg-white/[0.03] backdrop-blur-3xl relative border border-white/10 shadow-2xl rounded-[24px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff85]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-outfit font-black uppercase tracking-[0.3em] text-white/40">
                    <Calendar className="w-3.5 h-4 text-white/20" />
                    {format(new Date(match.date), "EEE d MMM yyyy")}
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
                            <Image
                                src={getTeamLogo(match.homeTeam.name)}
                                alt={match.homeTeam.name}
                                fill
                                className="object-contain"
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
                            <Image
                                src={getTeamLogo(match.awayTeam.name)}
                                alt={match.awayTeam.name}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="font-outfit font-black text-white text-[10px] uppercase tracking-[0.2em] text-center line-clamp-2 leading-tight min-h-[2rem] flex items-start justify-center px-2">
                            {match.awayTeam.name}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-white/[0.02] relative z-10 group/footer cursor-pointer">
                <div className="flex items-center gap-3 text-[10px] font-outfit font-black text-white/40 uppercase tracking-[0.3em]">
                    <MapPin className="w-4 h-4 text-[#00ff85] opacity-50" />
                    {match.homeTeam.stadium}
                </div>
                <ChevronRight className="w-5 h-5 text-[#00ff85] transition-transform group-hover/footer:translate-x-2" />
            </div>
        </div>
    );
}
