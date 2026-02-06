import { useState, useEffect } from "react";
import { LeagueTable } from "@/components/features/matches/LeagueTable";
import { apiService, StandingWithTeam } from "@/lib/api";

export default function StandingsPage() {
    const [standings, setStandings] = useState<StandingWithTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStandings = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await apiService.getStandings();
                setStandings(data);
            } catch (err) {
                console.error('Failed to fetch standings:', err);
                setError('Failed to load standings. Please make sure the backend server is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchStandings();
    }, []);

    return (
        <div className="py-12 bg-[#37003c] min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-[#00ff85] font-outfit font-black text-xs uppercase tracking-[0.4em] mb-4">
                        <div className="w-8 h-1 bg-[#00ff85] rounded-full shadow-[0_0_10px_rgba(0,255,133,0.5)]" />
                        2025/26 Season
                    </div>
                    <h1 className="text-5xl md:text-7xl font-outfit font-black text-white tracking-tighter mb-4 uppercase leading-[0.9]">
                        League <span className="text-[#00ff85]">Table</span>
                    </h1>
                    <p className="text-white/40 font-medium max-w-2xl font-outfit italic">
                        Live Premier League standings including points, wins, draws, losses, and goal difference.
                    </p>
                </header>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-[#00ff85]/20 border-t-[#00ff85] rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-white/60 font-outfit font-medium">Loading standings...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-[#ff005a]/10 border border-[#ff005a]/30 rounded-2xl p-6 mb-8">
                        <p className="text-[#ff005a] font-outfit font-medium">{error}</p>
                    </div>
                )}

                {!loading && !error && <LeagueTable standings={standings} />}

                <div className="mt-12 flex flex-wrap gap-8 items-center border-t border-white/5 pt-8">
                    <div className="flex items-center gap-3 group">
                        <div className="w-3.5 h-3.5 bg-[#00ff85] rounded-[4px] shadow-[0_0_10px_rgba(0,255,133,0.3)] transition-transform group-hover:scale-125" />
                        <span className="text-[10px] font-outfit font-black text-white/30 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Champions League</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                        <div className="w-3.5 h-3.5 bg-[#025da4] rounded-[4px] shadow-[0_0_10px_rgba(2,93,164,0.3)] transition-transform group-hover:scale-125" />
                        <span className="text-[10px] font-outfit font-black text-white/30 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Europa League</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                        <div className="w-3.5 h-3.5 bg-[#ff005a] rounded-[4px] shadow-[0_0_90px_rgba(255,0,90,0.3)] transition-transform group-hover:scale-125" />
                        <span className="text-[10px] font-outfit font-black text-white/30 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Relegation Zone</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
