"use client";

import { motion } from "framer-motion";
import { Calendar, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { latestResults, upcomingFixtures } from "@/lib/match-data";
import { MatchCard } from "@/components/shared/MatchCard";
import { useState } from "react";

export default function MatchesPage() {
    const [activeTab, setActiveTab] = useState<"fixtures" | "results">("fixtures");

    const matches = activeTab === "fixtures" ? upcomingFixtures : latestResults;

    return (
        <div className="min-h-screen bg-[#37003c]">
            {/* Header Section */}
            <section className="bg-[#37003c] pt-24 pb-12 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-[0.03] scale-110">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://resources.premierleague.com/premierleague/photo/2024/11/11/878c7728-6627-4144-874c-4734898516bd/2024-25-PL-Generic.jpg')] bg-cover bg-center mix-blend-overlay" />
                </div>
                {/* Glow Effects */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-[#00ff85] rounded-full blur-[150px] opacity-10" />
                    <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-[#ff005a] rounded-full blur-[150px] opacity-10" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00ff85] text-[#37003c] font-outfit font-black uppercase text-[10px] tracking-[0.3em] mb-8 shadow-[0_0_20px_rgba(0,255,133,0.3)]">
                                Matchweek 12 of 38
                            </div>
                            <h1 className="text-6xl md:text-8xl font-outfit font-black text-white uppercase tracking-tighter leading-[0.85]">
                                MATCH <br />
                                <span className="text-[#04f5ff]">CENTER</span>
                            </h1>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
                            <button
                                onClick={() => setActiveTab("fixtures")}
                                className={`px-10 py-3.5 rounded-xl text-[10px] font-outfit font-black uppercase tracking-[0.2em] transition-all ${activeTab === "fixtures"
                                    ? "bg-[#00ff85] text-[#37003c] shadow-lg shadow-[#00ff85]/20"
                                    : "text-white/40 hover:text-white"
                                    }`}
                            >
                                Fixtures
                            </button>
                            <button
                                onClick={() => setActiveTab("results")}
                                className={`px-10 py-3.5 rounded-xl text-[10px] font-outfit font-black uppercase tracking-[0.2em] transition-all ${activeTab === "results"
                                    ? "bg-[#00ff85] text-[#37003c] shadow-lg shadow-[#00ff85]/20"
                                    : "text-white/40 hover:text-white"
                                    }`}
                            >
                                Results
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-12 pb-8 border-b border-white/5">
                        <div className="flex items-center gap-6">
                            <button className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[10px] font-outfit font-black uppercase tracking-[0.2em] text-white hover:border-[#00ff85] transition-all shadow-xl group">
                                <Filter className="w-4 h-4 text-[#00ff85] group-hover:scale-110 transition-transform" />
                                All Clubs
                            </button>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#00ff85] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search fixtures..."
                                    className="pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-outfit font-medium text-white focus:outline-none focus:border-[#00ff85] focus:bg-white/10 transition-all w-72 placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-110 active:scale-95 group">
                                <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-white" />
                            </button>
                            <span className="text-[11px] font-outfit font-black text-[#00ff85] uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(0,255,133,0.3)]">December 2025</span>
                            <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-110 active:scale-95 group">
                                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Section Header */}
                    <div className="flex items-center justify-between gap-8 mb-12">
                        <div className="flex items-center gap-6 flex-grow">
                            <h2 className="text-[12px] font-outfit font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">
                                {activeTab === "fixtures" ? "Upcoming Fixtures" : "Latest Results"}
                            </h2>
                            <div className="h-px bg-white/5 flex-grow" />
                        </div>
                        <button className="text-[10px] font-outfit font-black text-[#ff005a] uppercase tracking-[0.3em] hover:text-[#00ff85] transition-colors whitespace-nowrap">
                            See All
                        </button>
                    </div>

                    {/* Matches Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {matches.map((match, idx) => (
                            <motion.div
                                key={match.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
                            >
                                <MatchCard match={match} />
                            </motion.div>
                        ))}
                    </div>

                    {matches.length === 0 && (
                        <div className="py-32 text-center bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Calendar className="w-10 h-10 text-white/20" />
                            </div>
                            <h3 className="text-xl font-outfit font-black text-white uppercase tracking-widest mb-4">No matches found</h3>
                            <p className="text-white/30 font-outfit italic tracking-tight">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
