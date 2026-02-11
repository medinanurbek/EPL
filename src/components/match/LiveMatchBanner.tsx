import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";
import { Match } from "@/types";
import { Radio, ChevronRight } from "lucide-react";
import { getTeamLogo } from "@/lib/utils";

export default function LiveMatchBanner() {
    const [liveMatches, setLiveMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLiveMatches = async () => {
            try {
                const response = await apiService.getMatches();
                const allMatches = response.matches || [];
                const live = allMatches.filter((m: any) => m.status === "LIVE");
                setLiveMatches(live);
            } catch (error) {
                console.error("Failed to fetch matches", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveMatches();
        // Poll every 10 seconds
        const interval = setInterval(fetchLiveMatches, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading || liveMatches.length === 0) return null;

    return (
        <div className="bg-[#ff2882] text-white overflow-hidden relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full animate-pulse">
                            <Radio className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Live Now</span>
                        </div>
                        <div className="hidden md:flex gap-8 overflow-x-auto">
                            {liveMatches.slice(0, 3).map(match => (
                                <Link key={match.id} to={`/matches`} className="flex items-center gap-4 hover:opacity-80 transition-opacity min-w-max">
                                    <div className="flex items-center gap-2 text-sm font-bold">
                                        <span className="w-6 text-right">{getShortName(match, true)}</span>
                                        <img src={getTeamLogo(getTeamName(match, true))} className="w-6 h-6 object-contain bg-white rounded-full p-0.5" />
                                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-black">{match.homeScore} - {match.awayScore}</span>
                                        <img src={getTeamLogo(getTeamName(match, false))} className="w-6 h-6 object-contain bg-white rounded-full p-0.5" />
                                        <span className="w-6">{getShortName(match, false)}</span>
                                    </div>
                                    <span className="text-[10px] font-black opacity-60">88'</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <Link to="/matches" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest hover:underline">
                        View All <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
                {/* Mobile Scroller */}
                <div className="md:hidden mt-3 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {liveMatches.map(match => (
                        <Link key={match.id} to={`/matches`} className="flex flex-col items-center gap-2 bg-white/10 p-3 rounded-lg min-w-[200px]">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <img src={getTeamLogo(getTeamName(match, true))} className="w-6 h-6 object-contain bg-white rounded-full p-0.5" />
                                    <span className="text-xs font-bold">{getShortName(match, true)}</span>
                                </div>
                                <span className="font-black text-[#fff]">{match.homeScore}</span>
                            </div>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <img src={getTeamLogo(getTeamName(match, false))} className="w-6 h-6 object-contain bg-white rounded-full p-0.5" />
                                    <span className="text-xs font-bold">{getShortName(match, false)}</span>
                                </div>
                                <span className="font-black text-[#fff]">{match.awayScore}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Helpers to handle the nested Team object or ID if team data isn't fully populated yet
function getShortName(match: any, isHome: boolean) {
    if (isHome) return match.homeTeam?.shortName || "HOM";
    return match.awayTeam?.shortName || "AWY";
}

function getTeamName(match: any, isHome: boolean) {
    if (isHome) return match.homeTeam?.name || "";
    return match.awayTeam?.name || "";
}
