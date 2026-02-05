"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, ArrowRight } from "lucide-react";
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
        <div className="py-12 bg-[#37003c] min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-[#00ff85] font-outfit font-black text-xs uppercase tracking-[0.4em] mb-4">
                        <div className="w-8 h-1 bg-[#00ff85] rounded-full shadow-[0_0_10px_rgba(0,255,133,0.5)]" />
                        Clubs
                    </div>
                    <h1 className="text-5xl md:text-7xl font-outfit font-black text-white tracking-tighter mb-8 uppercase leading-[0.9]">
                        Premier League <span className="text-[#00ff85]">Teams</span>
                    </h1>

                    <div className="relative max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#00ff85] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by club name or city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ff85]/20 focus:border-[#00ff85] transition-all font-outfit font-medium"
                        />
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredTeams.map((team) => (
                        <Link
                            key={team.id}
                            href={`/teams/${team.id}`}
                            className="group glass-card p-6 rounded-[24px] aspect-square flex flex-col items-center justify-center text-center transition-all hover:-translate-y-2 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff85]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative w-24 h-24 mb-6 transition-transform z-10">
                                <Image
                                    src={getTeamLogo(team.name)}
                                    alt={team.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            <div className="relative z-10 w-full">
                                <h3 className="text-xl font-outfit font-black text-white uppercase tracking-tighter mb-1 select-none line-clamp-1">{team.name}</h3>
                                <p className="text-[#00ff85]/60 text-[10px] uppercase font-outfit font-bold tracking-[0.2em] mb-6">{team.city}</p>

                                <div className="flex items-center justify-center gap-2 text-[#00ff85] font-outfit font-black text-[10px] uppercase tracking-[0.3em]">
                                    View Profile <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
