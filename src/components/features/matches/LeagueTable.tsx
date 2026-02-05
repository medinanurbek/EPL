import { Link } from "react-router-dom";
import { Standing, Team } from "@/types";
import { getTeamLogo } from "@/lib/utils";

interface LeagueTableProps {
    standings: (Standing & {
        team: Team;
        form?: ('W' | 'L' | 'D')[];
        nextOpponentLogo?: string;
    })[];
}

export function LeagueTable({ standings }: LeagueTableProps) {
    const getFormColor = (res: 'W' | 'L' | 'D') => {
        switch (res) {
            case 'W': return 'bg-[#00ff85] text-[#3d195b]';
            case 'D': return 'bg-[#76766f] text-white';
            case 'L': return 'bg-[#ff005a] text-white';
        }
    };

    return (
        <div className="overflow-x-auto rounded-[2.5rem] shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-6 py-5 text-[11px] font-outfit font-black text-white/40 uppercase tracking-[0.3em] text-center w-16">Pos</th>
                        <th className="px-6 py-5 text-[11px] font-outfit font-black text-white/40 uppercase tracking-[0.3em]">Club</th>
                        <th className="px-6 py-5 text-[11px] font-outfit font-black text-white/40 uppercase tracking-[0.3em] text-center">Pl</th>
                        <th className="px-6 py-5 text-[11px] font-outfit font-black text-white/40 uppercase tracking-[0.3em] text-center">W</th>
                        <th className="px-6 py-5 text-[11px] font-outfit font-black text-white/40 uppercase tracking-[0.3em] text-center">D</th>
                        <th className="px-6 py-5 text-[11px] font-outfit font-black text-white/40 uppercase tracking-[0.3em] text-center">L</th>
                        <th className="px-6 py-5 text-[11px] font-outfit font-black text-white/40 uppercase tracking-[0.3em] text-center text-white/20">GF</th>
                        <th className="px-6 py-5 text-[11px] font-outfit font-black text-white/40 uppercase tracking-[0.3em] text-center text-white/20">GA</th>
                        <th className="px-6 py-5 text-[11px] font-outfit font-black text-[#00ff85] uppercase tracking-[0.3em] text-center">GD</th>
                        <th className="px-6 py-5 text-[11px] font-outfit font-black text-[#00ff85] uppercase tracking-[0.3em] text-center">Pts</th>
                        <th className="px-6 py-5 text-[11px] font-outfit font-black text-white/40 uppercase tracking-[0.3em] text-center">Recent Form</th>
                        <th className="px-6 py-5 text-[11px] font-outfit font-black text-white/40 uppercase tracking-[0.3em] text-center">Next</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {standings.map((row, index) => {
                        const pos = index + 1;
                        const isCL = pos <= 4;
                        const isEL = pos === 5;
                        const isRel = pos >= 18;

                        return (
                            <tr
                                key={row.teamId}
                                className={`group hover:bg-white/5 transition-all relative
                  ${isCL ? 'border-l-4 border-l-[#00ff85]/50' : ''}
                  ${isEL ? 'border-l-4 border-l-[#025da4]/50' : ''}
                  ${isRel ? 'border-l-4 border-l-[#ff005a]/50' : ''}
                `}
                            >
                                <td className="px-6 py-6 text-sm font-outfit font-black text-white/40 text-center">{pos}</td>
                                <td className="px-6 py-6">
                                    <Link to={`/teams/${row.teamId}`} className="flex items-center gap-4 group/team">
                                        <div className="relative w-9 h-9 flex-shrink-0 transition-transform group-hover/team:scale-110 drop-shadow-lg">
                                            <img
                                                src={getTeamLogo(row.team.name)}
                                                alt={row.team.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as any).src = '/logo-fallback.svg';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <span className="font-outfit font-black text-white tracking-tight text-base whitespace-nowrap group-hover:text-[#00ff85] transition-colors">
                                                {row.team.name}
                                            </span>
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-6 py-6 text-sm font-outfit font-bold text-white/60 text-center">{row.played}</td>
                                <td className="px-6 py-6 text-sm font-outfit font-bold text-white/60 text-center">{row.wins}</td>
                                <td className="px-6 py-6 text-sm font-outfit font-bold text-white/60 text-center">{row.draws}</td>
                                <td className="px-6 py-6 text-sm font-outfit font-bold text-white/60 text-center">{row.losses}</td>
                                <td className="px-6 py-6 text-sm font-outfit font-bold text-white/20 text-center group-hover:text-white/40 transition-colors">{row.goalsFor}</td>
                                <td className="px-6 py-6 text-sm font-outfit font-bold text-white/20 text-center group-hover:text-white/40 transition-colors">{row.goalsAgainst}</td>
                                <td className="px-6 py-6 text-sm font-outfit font-black text-white/60 text-center">
                                    <span className={row.goalDifference > 0 ? "text-[#00ff85]" : row.goalDifference < 0 ? "text-[#ff005a]" : ""}>
                                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-lg font-outfit font-black text-[#00ff85] text-center drop-shadow-[0_0_10px_rgba(0,255,133,0.3)]">{row.points}</td>
                                <td className="px-6 py-6 text-center">
                                    <div className="flex justify-center gap-1.5">
                                        {(row.form || ['W', 'D', 'W', 'L', 'W']).map((res, i) => (
                                            <div
                                                key={i}
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-outfit font-black shadow-lg transition-transform hover:scale-125 ${getFormColor(res)}`}
                                            >
                                                {res}
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <div className="relative w-7 h-7 mx-auto opacity-20 group-hover:opacity-100 transition-all group-hover:scale-110">
                                        <img
                                            src={getTeamLogo(pos === 1 ? 'Manchester City' : 'Arsenal')}
                                            alt="Next"
                                            className="w-full h-full object-contain grayscale group-hover:grayscale-0"
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
