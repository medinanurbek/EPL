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
        <div className="glass-card overflow-hidden group hover:border-[#37003c] transition-all bg-white">
            <div className="bg-slate-50 px-6 py-3 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(match.date), "EEE d MMM yyyy")}
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight
          ${isLive ? "bg-[#ff005a] text-white animate-pulse" : "bg-slate-200 text-slate-500"}
        `}>
                    {isLive ? "Live" : match.status}
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col items-center text-center gap-3">
                        <div className="relative w-16 h-16 transition-transform group-hover:scale-110">
                            <Image
                                src={getTeamLogo(match.homeTeam.name)}
                                alt={match.homeTeam.name}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="font-black text-[#37003c] text-sm uppercase tracking-tight line-clamp-1">{match.homeTeam.name}</div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-4">
                            <span className={`text-4xl font-black ${isFinished || isLive ? "text-[#37003c]" : "text-slate-200"}`}>
                                {isFinished || isLive ? match.homeScore : "-"}
                            </span>
                            <span className="text-slate-300 font-black text-2xl">:</span>
                            <span className={`text-4xl font-black ${isFinished || isLive ? "text-[#37003c]" : "text-slate-200"}`}>
                                {isFinished || isLive ? match.awayScore : "-"}
                            </span>
                        </div>
                        {!isFinished && !isLive && (
                            <div className="text-[10px] font-black text-white bg-[#37003c] px-3 py-1 rounded-full whitespace-nowrap">
                                {format(new Date(match.date), "HH:mm")}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col items-center text-center gap-3">
                        <div className="relative w-16 h-16 transition-transform group-hover:scale-110">
                            <Image
                                src={getTeamLogo(match.awayTeam.name)}
                                alt={match.awayTeam.name}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="font-black text-[#37003c] text-sm uppercase tracking-tight line-clamp-1">{match.awayTeam.name}</div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <MapPin className="w-3 h-3 text-[#37003c]/30" />
                    {match.homeTeam.stadium}
                </div>
                <button className="text-[#37003c] hover:text-[#ff005a] transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
