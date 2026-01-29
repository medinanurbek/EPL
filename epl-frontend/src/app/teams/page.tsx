"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Users, Trophy, ArrowRight } from "lucide-react";
import { Team } from "@/types";
import Image from "next/image";

import { allTeams } from "@/lib/match-data";
import { getTeamLogo } from "@/lib/utils";

export default function TeamsPage() {
    const [search, setSearch] = useState("");

    const filteredTeams = allTeams.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="py-12 bg-white min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-[#37003c] font-black text-xs uppercase tracking-widest mb-4">
                        <div className="w-8 h-1 bg-[#37003c] rounded-full" />
                        Clubs
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-[#37003c] tracking-tighter mb-8">
                        Premier League Teams
                    </h1>

                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by club name or city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#37003c]/5 focus:border-[#37003c] transition-all font-medium"
                        />
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredTeams.map((team) => (
                        <Link
                            key={team.id}
                            href={`/teams/${team.id}`}
                            className="group p-8 rounded-[2.5rem] bg-slate-50 hover:bg-[#37003c] transition-all duration-300 border border-slate-100"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="relative w-24 h-24 mb-6 group-hover:scale-110 transition-transform">
                                    <Image
                                        src={getTeamLogo(team.name)}
                                        alt={team.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <h3 className="text-xl font-black text-[#37003c] group-hover:text-white mb-2 tracking-tight">
                                    {team.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 group-hover:text-white/40 font-black uppercase tracking-widest mb-6">
                                    <MapPin className="w-3 h-3" />
                                    {team.city}
                                </div>

                                <div className="mt-auto flex items-center gap-2 text-[#ff005a] font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Profile <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
