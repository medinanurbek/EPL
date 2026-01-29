import { MatchCard } from "@/components/shared/MatchCard";
import { Match, Team } from "@/types";

// Mock Data
const mockMatches: (Match & { homeTeam: Team; awayTeam: Team })[] = [
    {
        id: "m1",
        homeTeamId: "1",
        awayTeamId: "3",
        homeScore: 2,
        awayScore: 1,
        date: "2025-01-28T20:00:00Z",
        status: "FINISHED",
        seasonId: "s1",
        homeTeam: { id: "1", name: "Arsenal", city: "London", stadium: "Emirates Stadium", shortName: "ARS" },
        awayTeam: { id: "3", name: "Aston Villa", city: "Birmingham", stadium: "Villa Park", shortName: "AVL" },
    },
    {
        id: "m2",
        homeTeamId: "2",
        awayTeamId: "6",
        homeScore: 2,
        awayScore: 2,
        date: "2025-01-29T19:45:00Z",
        status: "LIVE",
        seasonId: "s1",
        homeTeam: { id: "2", name: "Manchester City", city: "Manchester", stadium: "Etihad Stadium", shortName: "MCI" },
        awayTeam: { id: "6", name: "Liverpool", city: "Liverpool", stadium: "Anfield", shortName: "LIV" },
    },
    {
        id: "m3",
        homeTeamId: "4",
        awayTeamId: "5",
        homeScore: 0,
        awayScore: 0,
        date: "2025-02-01T15:00:00Z",
        status: "SCHEDULED",
        seasonId: "s1",
        homeTeam: { id: "4", name: "Manchester United", city: "Manchester", stadium: "Old Trafford", shortName: "MUN" },
        awayTeam: { id: "5", name: "Chelsea", city: "London", stadium: "Stamford Bridge", shortName: "CHE" },
    },
];

export default function MatchesPage() {
    return (
        <div className="py-12 bg-white min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-[#37003c] font-black text-xs uppercase tracking-widest mb-4">
                            <div className="w-8 h-1 bg-[#37003c] rounded-full" />
                            Fixtures & Results
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-[#37003c] tracking-tighter mb-4">
                            Match Center
                        </h1>
                        <p className="text-slate-500 font-medium max-w-2xl text-lg italic">
                            Experience every moment of the world's most exciting league.
                        </p>
                    </div>

                    <div className="flex gap-3 bg-slate-50 p-1.5 rounded-full border border-slate-100">
                        {["All", "Results", "Fixtures", "Live"].map((filter) => (
                            <button
                                key={filter}
                                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                  ${filter === "All"
                                        ? "bg-[#37003c] text-white shadow-lg shadow-[#37003c]/20"
                                        : "text-slate-400 hover:text-[#37003c]"
                                    }
                `}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="space-y-16">
                    <section>
                        <h2 className="text-[10px] font-black text-[#ff005a] uppercase tracking-[0.3em] mb-8 flex items-center gap-6">
                            <div className="w-2 h-2 rounded-full bg-[#ff005a] animate-ping" />
                            LIVE & RECENT
                            <div className="flex-grow h-px bg-slate-100" />
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mockMatches.filter(m => m.status !== "SCHEDULED").map((match) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-6">
                            UPCOMING FIXTURES
                            <div className="flex-grow h-px bg-slate-100" />
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mockMatches.filter(m => m.status === "SCHEDULED").map((match) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
