"use client";

import { Standing, Team } from "@/types";
import Image from "next/image";
import Link from "next/link";
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
        <div className="overflow-x-auto rounded-xl shadow-2xl bg-white">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-12">Pos</th>
                        <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Team</th>
                        <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Pl</th>
                        <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">W</th>
                        <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">D</th>
                        <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">L</th>
                        <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">GF</th>
                        <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">GA</th>
                        <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">GD</th>
                        <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Pts</th>
                        <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Form</th>
                        <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Next</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {standings.map((row, index) => {
                        const pos = index + 1;
                        const isCL = pos <= 4;
                        const isEL = pos === 5;
                        const isRel = pos >= 18;

                        return (
                            <tr
                                key={row.teamId}
                                className={`group hover:bg-[#3d195b]/5 transition-colors relative
                  ${isCL ? 'border-l-4 border-l-[#00ff85]' : ''}
                  ${isEL ? 'border-l-4 border-l-[#025da4]' : ''}
                  ${isRel ? 'border-l-4 border-l-[#ff005a]' : ''}
                `}
                            >
                                <td className="px-4 py-5 text-sm font-black text-[#3d195b] text-center">{pos}</td>
                                <td className="px-4 py-5">
                                    <Link href={`/teams/${row.teamId}`} className="flex items-center gap-4 group/team">
                                        <div className="relative w-8 h-8 flex-shrink-0 transition-transform group-hover/team:scale-110">
                                            <Image
                                                src={getTeamLogo(row.team.name)}
                                                alt={row.team.name}
                                                fill
                                                className="object-contain"
                                                onError={(e) => {
                                                    (e.target as any).src = '/logo-fallback.svg';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <span className="font-black text-[#3d195b] tracking-tight text-base whitespace-nowrap">
                                                {row.team.name}
                                            </span>
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-600 text-center">{row.played}</td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-600 text-center">{row.wins}</td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-600 text-center">{row.draws}</td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-600 text-center">{row.losses}</td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-400 text-center">{row.goalsFor}</td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-400 text-center">{row.goalsAgainst}</td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-400 text-center">
                                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                </td>
                                <td className="px-4 py-5 text-sm font-black text-[#3d195b] text-center">{row.points}</td>
                                <td className="px-4 py-5 text-center">
                                    <div className="flex justify-center gap-1">
                                        {(row.form || ['W', 'D', 'W', 'L', 'W']).map((res, i) => (
                                            <div
                                                key={i}
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${getFormColor(res)}`}
                                            >
                                                {res}
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-5 text-center">
                                    <div className="relative w-6 h-6 mx-auto opacity-40 group-hover:opacity-100 transition-opacity">
                                        <Image
                                            src={`/logos/${pos === 1 ? 'manchester-city' : 'arsenal'}.football-logos.cc.svg`}
                                            alt="Next"
                                            fill
                                            className="object-contain grayscale group-hover:grayscale-0"
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
