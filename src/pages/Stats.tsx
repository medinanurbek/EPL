import { useState, useEffect } from "react";
import { getTeamLogo } from "@/lib/utils";
import { Target, Zap, ShieldCheck } from "lucide-react";

interface StatEntry {
    playerId: string;
    name: string;
    teamName: string;
    teamId: string;
    imagePath: string;
    value: number;
}

interface StatsData {
    topScorers: StatEntry[];
    topAssists: StatEntry[];
    cleanSheets: StatEntry[];
}

export default function StatsPage() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8080/api/stats")
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

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

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="w-12 h-12 border-4 border-[#00ff85] border-t-transparent rounded-full animate-spin" />
                        <div className="text-[#00ff85] font-bold uppercase tracking-[0.2em] text-sm animate-pulse">Loading Stats...</div>
                    </div>
                ) : stats ? (
                    <section className="mb-24">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Player Leaders</h2>
                            <div className="h-px flex-1 mx-8 bg-white/10 hidden md:block" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatsList title="Goals" icon={Target} data={stats.topScorers} iconColor="text-[#ff005a]" accentColor="#ff005a" />
                            <StatsList title="Assists" icon={Zap} data={stats.topAssists} iconColor="text-[#00ff85]" accentColor="#00ff85" />
                            <StatsList title="Clean Sheets" icon={ShieldCheck} data={stats.cleanSheets} iconColor="text-[#04f5ff]" accentColor="#04f5ff" />
                        </div>
                    </section>
                ) : (
                    <div className="text-center py-32 text-white/30 font-bold uppercase tracking-widest text-xs">No stats available</div>
                )}
            </div>
        </div>
    );
}

function StatsList({ title, icon: Icon, data, iconColor, accentColor }: { title: string, icon: any, data: StatEntry[], iconColor: string, accentColor: string }) {
    return (
        <div className="glass-card bg-[#37003c] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group border border-white/5">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: accentColor }} />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-sm font-black text-white/90 uppercase tracking-tight">{title}</h3>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>

            {/* Featured top player */}
            {data.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                            {data[0].imagePath ? (
                                <img src={data[0].imagePath} alt={data[0].name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-white/10" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black text-white uppercase truncate">{data[0].name}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: accentColor }}>{data[0].teamName}</p>
                        </div>
                        <div className="text-3xl font-black italic" style={{ color: accentColor }}>{data[0].value}</div>
                    </div>
                </div>
            )}

            <div className="space-y-3 relative z-10">
                {data.slice(1).map((item, i) => (
                    <div key={item.playerId || i} className="flex items-center justify-between group/item hover:bg-white/5 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-white/20 w-5 text-right">{i + 2}</span>
                            <div className="flex items-center gap-2">
                                <div className="relative w-4 h-4 opacity-50">
                                    <img src={getTeamLogo(item.teamName)} alt="logo" className="w-full h-full object-contain" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[11px] font-black text-white uppercase truncate w-24 sm:w-32">{item.name}</p>
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest truncate">{item.teamName}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm font-black text-[#00ff85] italic">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
