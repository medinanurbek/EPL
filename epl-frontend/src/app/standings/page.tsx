import { LeagueTable } from "@/components/shared/LeagueTable";
import { Standing, Team } from "@/types";

// Mock Data
const mockStandings: (Standing & { team: Team })[] = [
    { teamId: "1", played: 23, wins: 15, draws: 5, losses: 3, points: 50, goalsFor: 42, goalsAgainst: 17, goalDifference: 25, team: { id: "1", name: "Arsenal", city: "London", stadium: "Emirates Stadium", shortName: "ARS" } },
    { teamId: "2", played: 23, wins: 14, draws: 4, losses: 5, points: 46, goalsFor: 47, goalsAgainst: 21, goalDifference: 26, team: { id: "2", name: "Manchester City", city: "Manchester", stadium: "Etihad Stadium", shortName: "MCI" } },
    { teamId: "3", played: 23, wins: 14, draws: 4, losses: 5, points: 46, goalsFor: 35, goalsAgainst: 25, goalDifference: 10, team: { id: "3", name: "Aston Villa", city: "Birmingham", stadium: "Villa Park", shortName: "AVL" } },
    { teamId: "4", played: 23, wins: 10, draws: 8, losses: 5, points: 38, goalsFor: 41, goalsAgainst: 34, goalDifference: 7, team: { id: "4", name: "Manchester United", city: "Manchester", stadium: "Old Trafford", shortName: "MUN" } },
    { teamId: "5", played: 23, wins: 10, draws: 7, losses: 6, points: 37, goalsFor: 39, goalsAgainst: 25, goalDifference: 14, team: { id: "5", name: "Chelsea", city: "London", stadium: "Stamford Bridge", shortName: "CHE" } },
    { teamId: "6", played: 23, wins: 10, draws: 6, losses: 7, points: 36, goalsFor: 35, goalsAgainst: 32, goalDifference: 3, team: { id: "6", name: "Liverpool", city: "Liverpool", stadium: "Anfield", shortName: "LIV" } },
    { teamId: "7", played: 23, wins: 10, draws: 4, losses: 9, points: 34, goalsFor: 32, goalsAgainst: 32, goalDifference: 0, team: { id: "7", name: "Fulham", city: "London", stadium: "Craven Cottage", shortName: "FUL" } },
    { teamId: "8", played: 23, wins: 10, draws: 3, losses: 10, points: 33, goalsFor: 35, goalsAgainst: 32, goalDifference: 3, team: { id: "8", name: "Brentford", city: "London", stadium: "Gtech Community Stadium", shortName: "BRE" } },
    { teamId: "9", played: 23, wins: 9, draws: 6, losses: 8, points: 33, goalsFor: 32, goalsAgainst: 29, goalDifference: 3, team: { id: "9", name: "Newcastle United", city: "Newcastle", stadium: "St. James' Park", shortName: "NEW" } },
    { teamId: "10", played: 23, wins: 9, draws: 6, losses: 8, points: 33, goalsFor: 25, goalsAgainst: 26, goalDifference: -1, team: { id: "10", name: "Everton", city: "Liverpool", stadium: "Goodison Park", shortName: "EVE" } },
    { teamId: "11", played: 23, wins: 8, draws: 9, losses: 6, points: 33, goalsFor: 24, goalsAgainst: 26, goalDifference: -2, team: { id: "11", name: "Sunderland", city: "Sunderland", stadium: "Stadium of Light", shortName: "SUN" } },
    { teamId: "12", played: 23, wins: 7, draws: 9, losses: 7, points: 30, goalsFor: 33, goalsAgainst: 31, goalDifference: 2, team: { id: "12", name: "Brighton and Hove Albion", city: "Brighton", stadium: "Amex Stadium", shortName: "BHA" } },
    { teamId: "13", played: 23, wins: 7, draws: 9, losses: 7, points: 30, goalsFor: 38, goalsAgainst: 43, goalDifference: -5, team: { id: "13", name: "Bournemouth", city: "Bournemouth", stadium: "Vitality Stadium", shortName: "BOU" } },
    { teamId: "14", played: 23, wins: 7, draws: 7, losses: 9, points: 28, goalsFor: 33, goalsAgainst: 31, goalDifference: 2, team: { id: "14", name: "Tottenham Hotspur", city: "London", stadium: "Tottenham Hotspur Stadium", shortName: "TOT" } },
    { teamId: "15", played: 23, wins: 7, draws: 7, losses: 9, points: 28, goalsFor: 24, goalsAgainst: 28, goalDifference: -4, team: { id: "15", name: "Crystal Palace", city: "London", stadium: "Selhurst Park", shortName: "CRY" } },
    { teamId: "16", played: 23, wins: 6, draws: 8, losses: 9, points: 26, goalsFor: 31, goalsAgainst: 38, goalDifference: -7, team: { id: "16", name: "Leeds United", city: "Leeds", stadium: "Elland Road", shortName: "LEE" } },
    { teamId: "17", played: 23, wins: 7, draws: 4, losses: 12, points: 25, goalsFor: 23, goalsAgainst: 34, goalDifference: -11, team: { id: "17", name: "Nottingham Forest", city: "Nottingham", stadium: "City Ground", shortName: "NFO" } },
    { teamId: "18", played: 23, wins: 5, draws: 5, losses: 13, points: 20, goalsFor: 27, goalsAgainst: 45, goalDifference: -18, team: { id: "18", name: "West Ham United", city: "London", stadium: "London Stadium", shortName: "WHU" } },
    { teamId: "19", played: 23, wins: 3, draws: 6, losses: 14, points: 15, goalsFor: 25, goalsAgainst: 44, goalDifference: -19, team: { id: "19", name: "Burnley", city: "Burnley", stadium: "Turf Moor", shortName: "BUR" } },
    { teamId: "20", played: 23, wins: 1, draws: 5, losses: 17, points: 8, goalsFor: 15, goalsAgainst: 43, goalDifference: -28, team: { id: "20", name: "Wolverhampton Wanderers", city: "Wolverhampton", stadium: "Molineux Stadium", shortName: "WOL" } },
];

export default function StandingsPage() {
    return (
        <div className="py-12 bg-white min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-[#3d195b] font-black text-xs uppercase tracking-widest mb-4">
                        <div className="w-8 h-1 bg-[#3d195b] rounded-full" />
                        2025/26 Season
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-[#3d195b] tracking-tighter mb-4">
                        League Table
                    </h1>
                    <p className="text-slate-500 font-medium max-w-2xl">
                        Live Premier League standings including points, wins, draws, losses, and goal difference.
                    </p>
                </header>

                <LeagueTable standings={mockStandings} />

                <div className="mt-12 flex flex-wrap gap-8 items-center border-t border-slate-100 pt-8">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#00ff85] rounded-sm" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Champions League</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#025da4] rounded-sm" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Europa League</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#ff005a] rounded-sm" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Relegation</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
