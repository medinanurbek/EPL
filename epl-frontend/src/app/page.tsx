"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Calendar, Users, ArrowRight, Star, ShieldCheck, Rocket, Zap, Target, User, TrendingUp } from "lucide-react";
import Image from "next/image";
import { topScorers, topAssistants, latestResults, upcomingFixtures } from "@/lib/match-data";
import { getTeamLogo } from "@/lib/utils";
import { MatchCard } from "@/components/shared/MatchCard";

export default function Home() {
  const features = [
    { title: "Live Standings", description: "Real-time Premier League table with automated points calculation.", icon: Trophy, href: "/standings", color: "bg-[#00ff85]" },
    { title: "Match Center", description: "Schedule fixtures and log live events with the official logger.", icon: Calendar, href: "/matches", color: "bg-[#ff005a]" },
    { title: "Club Profiles", description: "Detailed squad lists and stadium information for all 20 clubs.", icon: Users, href: "/teams", color: "bg-[#025da4]" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-[#37003c]">
        {/* Stadium Background Effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://resources.premierleague.com/premierleague/photo/2024/11/11/878c7728-6627-4144-874c-4734898516bd/2024-25-PL-Generic.jpg')] bg-cover bg-center opacity-40 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#37003c] via-[#37003c]/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[#cfae24] text-[#37003c] font-black uppercase text-xs tracking-[0.2em] mb-6 shadow-lg">
                Live: Matchweek 12
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 italic transform -skew-x-6 leading-[0.9]">
                2025/26 <br />
                <span className="text-white">PREMIER</span> <br />
                <span className="text-white">LEAGUE</span>
              </h1>
              <p className="text-xl text-slate-200 font-medium max-w-xl leading-relaxed mb-10 drop-shadow-md">
                Experience the drama of the world's most watched league. Track live stats, upcoming fixtures, and the race for the title.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/matches"
                  className="px-8 py-4 rounded-sm bg-[#04f5ff] text-[#37003c] font-black uppercase tracking-widest hover:bg-white transition-colors shadow-lg shadow-[#04f5ff]/20"
                >
                  Full Schedule
                </Link>
                <button className="px-8 py-4 rounded-sm bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                  Latest Highlights
                </button>
              </div>
            </motion.div>

            {/* Top 3 Teams Widget */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="hidden lg:block"
            >
              <div className="glass-card bg-[#37003c]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff85] opacity-20 blur-[100px] rounded-full" />

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <h3 className="text-white font-black uppercase tracking-wider flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-[#cfae24]" />
                    Title Race
                  </h3>
                  <Link href="/standings" className="text-[#04f5ff] text-xs font-black uppercase tracking-widest hover:underline">View Table</Link>
                </div>

                <div className="space-y-4 relative z-10">
                  {[
                    { rank: 1, name: "Manchester City", points: 45, logo: "manchester-city", form: ["W", "W", "W", "W", "D"] },
                    { rank: 2, name: "Arsenal", points: 42, logo: "arsenal", form: ["W", "W", "D", "W", "W"] },
                    { rank: 3, name: "Liverpool", points: 40, logo: "liverpool", form: ["W", "D", "L", "W", "W"] }
                  ].map((team) => (
                    <div key={team.rank} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${team.rank === 1 ? "bg-[#cfae24] text-[#37003c]" : "bg-white/10 text-white"
                          }`}>
                          {team.rank}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8">
                            <Image src={getTeamLogo(team.name)} alt={team.name} fill className="object-contain" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-black text-sm uppercase">{team.name}</span>
                            <div className="flex gap-1 mt-1">
                              {team.form.map((res, i) => (
                                <span key={i} className={`w-1.5 h-1.5 rounded-full ${res === "W" ? "bg-[#00ff85]" : res === "D" ? "bg-slate-400" : "bg-[#ff005a]"
                                  }`} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-white italic">{team.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats & Match Widgets Feed */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left Column: Player Stats */}
            <div className="lg:col-span-1 space-y-8">
              {/* Top Scorer Widget */}
              <div className="glass-card bg-[#37003c] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110 group-hover:rotate-12 duration-500">
                  <Rocket className="w-24 h-24 text-[#00ff85] -rotate-45" />
                </div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00ff85]/5 rounded-full blur-3xl group-hover:bg-[#00ff85]/10 transition-colors" />
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-[#00ff85]" />
                  Golden Boot Race
                </h3>
                <div className="relative z-10">
                  <div className="flex items-end gap-6 mb-8">
                    <div className="text-6xl font-black text-[#00ff85] italic leading-none">{topScorers[0].goals}</div>
                    <div className="text-white/40 font-black text-xs uppercase tracking-widest pb-1">Goals</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/50 border border-white/5">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-white uppercase tracking-tight">{topScorers[0].name}</p>
                      <p className="text-[10px] font-black text-[#00ff85] uppercase tracking-widest">{topScorers[0].team}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Assistant Widget */}
              <div className="glass-card bg-white p-8 rounded-[2.5rem] shadow-xl border-t-8 border-t-[#ff2882]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                  <Zap className="w-4 h-4 text-[#ff2882]" />
                  Playmaker Award
                </h3>
                <div className="space-y-6">
                  {topAssistants.map((player, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-slate-200">0{i + 1}</span>
                        <div>
                          <p className="text-sm font-black text-[#37003c] uppercase">{player.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{player.team}</p>
                        </div>
                      </div>
                      <div className="text-2xl font-black text-[#37003c] italic">{player.assists}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Match Feed */}
            <div className="lg:col-span-2 space-y-12">
              {/* Latest Results */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[10px] font-black text-[#37003c] uppercase tracking-[0.4em] flex items-center gap-4">
                    Latest Results
                    <div className="w-20 h-px bg-[#37003c]/10" />
                  </h2>
                  <Link href="/matches" className="text-[10px] font-black text-[#ff2882] uppercase tracking-widest hover:underline">See All</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {latestResults.slice(0, 2).map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>

              {/* Upcoming Fixtures */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
                    Upcoming Fixtures
                    <div className="w-20 h-px bg-slate-100" />
                  </h2>
                </div>
                <div className="space-y-4">
                  {upcomingFixtures.map((match) => (
                    <div key={match.id} className="bg-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-sm border border-slate-50 group hover:border-[#00ff85] transition-all">
                      <div className="flex items-center gap-6 flex-1 justify-end">
                        <span className="font-black text-[#37003c] text-xs uppercase hidden sm:block">{match.homeTeam.name}</span>
                        <div className="relative w-8 h-8">
                          <Image src={getTeamLogo(match.homeTeam.name)} alt="logo" fill className="object-contain" />
                        </div>
                      </div>

                      <div className="px-8 flex flex-col items-center">
                        <div className="text-sm font-black text-[#37003c] mb-1">vs</div>
                        <div className="text-[9px] font-black text-white bg-[#37003c] px-3 py-1 rounded-full uppercase tracking-tighter">
                          {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 flex-1">
                        <div className="relative w-8 h-8">
                          <Image src={getTeamLogo(match.awayTeam.name)} alt="logo" fill className="object-contain" />
                        </div>
                        <span className="font-black text-[#37003c] text-xs uppercase hidden sm:block">{match.awayTeam.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Standard Features Grid */}
      <section className="py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-10 rounded-[3rem] bg-slate-50 hover:bg-[#37003c] transition-all duration-500"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 group-hover:rotate-6 ${feature.color}`}>
                  <feature.icon className="w-8 h-8 text-[#37003c]" />
                </div>
                <h3 className="text-2xl font-black text-[#37003c] group-hover:text-white mb-4 tracking-tight uppercase">
                  {feature.title}
                </h3>
                <p className="text-slate-500 group-hover:text-white/60 font-medium leading-relaxed mb-10 italic">
                  {feature.description}
                </p>
                <Link
                  href={feature.href}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#37003c] group-hover:text-[#00ff85] transition-colors"
                >
                  Explore Module <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
