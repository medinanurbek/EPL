import { playerStats, clubStats } from "@/lib/match-data";
import { getTeamLogo } from "@/lib/utils";
import { Target, Zap, Waves, ShieldCheck, ChevronRight } from "lucide-react";

export default function StatsPage() {
    return (
        <div className="py-12 bg-[#37003c] min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-16">
                    <div className="flex items-center gap-2 text-white/60 font-black text-xs uppercase tracking-widest mb-4">
                        <div className="w-8 h-1 bg-[#00ff85] rounded-full" />
                        Statistics
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
                        PL Statistics 2025/26
                    </h1>
                    <p className="text-white/60 font-medium italic">Comprehensive leaderboards for players and clubs.</p>
                </header>

                {/* Player Stats Section */}
                <section className="mb-24">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Player Leaders</h2>
                        <div className="h-px flex-1 mx-8 bg-white/10 hidden md:block" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Goals */}
                        <StatsList title="Goals" icon={Target} data={playerStats.goals} iconColor="text-[#ff005a]" />
                        {/* Assists */}
                        <StatsList title="Assists" icon={Zap} data={playerStats.assists} iconColor="text-[#00ff85]" />
                        {/* Passes */}
                        <StatsList title="Total Passes" icon={Waves} data={playerStats.passes} iconColor="text-[#025da4]" />
                        {/* Clean Sheets */}
                        <StatsList title="Clean Sheets" icon={ShieldCheck} data={playerStats.cleanSheets} iconColor="text-[#ff2882]" />
                    </div>
                </section>

                {/* Club Stats Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Club Leaders</h2>
                        <div className="h-px flex-1 mx-8 bg-white/10 hidden md:block" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ClubStatsList title="Goals" data={clubStats.goals} />
                        <ClubStatsList title="Tackles Won" data={clubStats.tackles} />
                        <ClubStatsList title="Blocks" data={clubStats.blocks} />
                        <ClubStatsList title="Total Passes" data={clubStats.passes} />
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatsList({ title, icon: Icon, data, iconColor }: { title: string, icon: any, data: any[], iconColor: string }) {
    return (
        <div className="glass-card bg-[#37003c] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-white/90 uppercase tracking-tight">{title}</h3>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="space-y-4">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-white/20 w-4">{item.rank}</span>
                            <div className="flex items-center gap-2">
                                <div className="relative w-4 h-4 opacity-50">
                                    <img src={getTeamLogo(item.team)} alt="logo" className="w-full h-full object-contain" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[11px] font-black text-white uppercase truncate w-24 sm:w-32">{item.name}</p>
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest truncate">{item.team}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm font-black text-[#00ff85] italic">{item.value.toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ClubStatsList({ title, data }: { title: string, data: any[] }) {
    return (
        <div className="glass-card bg-[#2d0032] rounded-[2rem] p-6 shadow-xl border-t-8 border-t-[#00ff85] group hover:border-t-[#ff2882] transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-white uppercase tracking-tight">{title}</h3>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#00ff85] transition-colors" />
            </div>
            <div className="space-y-4">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-white/20 w-4">{item.rank}</span>
                            <div className="flex items-center gap-2">
                                <div className="relative w-6 h-6">
                                    <img src={getTeamLogo(item.team)} alt="logo" className="w-full h-full object-contain" />
                                </div>
                                <p className="text-[10px] font-black text-white uppercase truncate w-24 sm:w-32">{item.team}</p>
                            </div>
                        </div>
                        <div className="text-sm font-black text-[#00ff85] italic">{item.value.toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
