import { useState, useEffect } from "react";
import { Shield, Users, Calendar, Trophy, Settings, Activity, ArrowRight, PlusCircle, MessageSquare, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ teams: 0, players: 0, liveMatches: 0, finishedMatches: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [teams, players] = await Promise.all([
                    apiService.getTeams(),
                    apiService.getPlayers(),
                ]);
                const matchesResponse = await apiService.getMatches();
                const matchesList = matchesResponse?.matches || [];
                setStats({
                    teams: teams?.length || 0,
                    players: players?.length || 0,
                    liveMatches: matchesList.filter((m: any) => m.status === "LIVE").length,
                    finishedMatches: matchesList.filter((m: any) => m.status === "FINISHED").length,
                });
            } catch (err) {
                console.error("Failed to load stats:", err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const statCards = [
        { label: "Active Teams", value: loading ? "..." : String(stats.teams), icon: Shield, color: "text-white" },
        { label: "Registered Players", value: loading ? "..." : String(stats.players), icon: Users, color: "text-[#ff2882]" },
        { label: "Live Matches", value: loading ? "..." : String(stats.liveMatches), icon: Radio, color: "text-[#ff2882]" },
        { label: "Finished Matches", value: loading ? "..." : String(stats.finishedMatches), icon: Trophy, color: "text-[#00ff85]" },
    ];

    const quickActions = [
        { title: "Manage Teams", href: "/admin/teams", description: "Create, edit, or remove clubs from the league.", icon: Shield, color: "hover:border-[#00ff85]" },
        { title: "Manage Players", href: "/admin/players", description: "Register players and assign them to club squads.", icon: Users, color: "hover:border-[#ff2882]" },
        { title: "Match Control", href: "/admin/matches", description: "Start simulations, finish matches, manage events.", icon: Calendar, color: "hover:border-[#025da4]" },
        { title: "Reviews", href: "/admin/reviews", description: "Monitor and manage user feedback.", icon: MessageSquare, color: "hover:border-[#00ff85]" },
    ];

    return (
        <div className="py-12 bg-[#37003c] min-h-screen text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-[#00ff85] font-black text-xs uppercase tracking-widest mb-4">
                        <div className="w-8 h-1 bg-[#00ff85] rounded-full" />
                        Control Center
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
                        Admin Dashboard
                    </h1>
                    <p className="text-white/60 font-medium italic">
                        Manage the English Premier League Information System entities and match events.
                    </p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {statCards.map((stat) => (
                        <div key={stat.label} className="glass-card p-8 border-l-8 border-l-[#00ff85] shadow-xl rounded-[2rem]">
                            <div className="flex items-center justify-between mb-6">
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                <Activity className="w-4 h-4 text-white/10" />
                            </div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-white italic">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {quickActions.map((action) => (
                        <Link
                            key={action.title}
                            to={action.href}
                            className={`group glass-card p-8 transition-all rounded-[2.5rem] border border-white/5 shadow-2xl ${action.color}`}
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-[#00ff85] group-hover:bg-[#00ff85] group-hover:text-[#37003c] transition-all">
                                    <action.icon className="w-7 h-7" />
                                </div>
                                <PlusCircle className="w-5 h-5 text-white/10 group-hover:text-[#ff2882] transition-colors" />
                            </div>
                            <h3 className="text-lg font-black text-white mb-3 uppercase tracking-tight">{action.title}</h3>
                            <p className="text-xs text-white/50 font-medium leading-relaxed mb-6 italic">
                                {action.description}
                            </p>
                            <div className="flex items-center gap-3 text-[#00ff85] font-black text-[10px] uppercase tracking-[0.2em]">
                                OPEN <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* System Info */}
                <section className="glass-card p-10 overflow-hidden rounded-[3rem] shadow-3xl border border-white/10">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-4">
                            <Settings className="w-5 h-5 text-[#00ff85]" />
                            SYSTEM STATUS
                            <div className="w-20 h-px bg-white/10" />
                        </h2>
                        <div className="text-[9px] font-black text-[#00ff85] uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                            Online
                        </div>
                    </div>
                    <div className="space-y-6">
                        {[
                            { text: "Match simulation engine ready", status: "active" },
                            { text: "Standings auto-recalculation enabled", status: "active" },
                            { text: "Player statistics tracking enabled", status: "active" },
                            { text: `${stats.teams} teams • ${stats.players} players loaded`, status: "info" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-6 text-sm font-bold text-white/70 border-b border-white/5 pb-6 last:border-0">
                                <div className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-[#00ff85] shadow-[0_0_10px_#00ff85]' : 'bg-white/30'}`} />
                                <span className="italic">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
