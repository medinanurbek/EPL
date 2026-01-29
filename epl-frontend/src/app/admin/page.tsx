import { Shield, Users, Calendar, Trophy, Settings, Activity, ArrowRight, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const stats = [
        { label: "Active Teams", value: "20", icon: Shield, color: "text-[#37003c]" },
        { label: "Registered Players", value: "542", icon: Users, color: "text-[#ff2882]" },
        { label: "Matches Today", value: "4", icon: Calendar, color: "text-[#025da4]" },
        { label: "Standings Status", value: "Synced", icon: Trophy, color: "text-[#00ff85]" },
    ];

    const quickActions = [
        { title: "Manage Teams", href: "/admin/teams", description: "Create, edit, or remove clubs from the league.", icon: Shield, color: "hover:border-[#00ff85]" },
        { title: "Manage Players", href: "/admin/players", description: "Register players and assign them to club squads.", icon: Users, color: "hover:border-[#ff2882]" },
        { title: "Match Control", href: "/admin/matches", description: "Set match dates, update scores, and log events.", icon: Calendar, color: "hover:border-[#025da4]" },
    ];

    return (
        <div className="py-12 bg-slate-50 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-[#37003c] font-black text-xs uppercase tracking-widest mb-4">
                        <div className="w-8 h-1 bg-[#37003c] rounded-full" />
                        Control Center
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-[#37003c] tracking-tighter mb-4 uppercase">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium italic">
                        Manage the English Premier League Information System entities and match events.
                    </p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat) => (
                        <div key={stat.label} className="glass-card p-8 bg-white border-l-8 border-l-[#37003c] shadow-xl rounded-[2rem]">
                            <div className="flex items-center justify-between mb-6">
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                <Activity className="w-4 h-4 text-slate-100" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-[#37003c] italic">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {quickActions.map((action) => (
                        <Link
                            key={action.title}
                            href={action.href}
                            className={`group glass-card p-10 bg-white transition-all rounded-[3rem] border border-slate-100 shadow-2xl ${action.color}`}
                        >
                            <div className="flex items-start justify-between mb-10">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-[#37003c] group-hover:bg-[#37003c] group-hover:text-white transition-all">
                                    <action.icon className="w-8 h-8" />
                                </div>
                                <PlusCircle className="w-6 h-6 text-slate-100 group-hover:text-[#ff2882] transition-colors" />
                            </div>
                            <h3 className="text-2xl font-black text-[#37003c] mb-4 uppercase tracking-tight">{action.title}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 italic">
                                {action.description}
                            </p>
                            <div className="flex items-center gap-3 text-[#37003c] font-black text-[10px] uppercase tracking-[0.2em]">
                                OPEN MODULE <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent System Activity */}
                <section className="glass-card p-10 bg-[#37003c] overflow-hidden rounded-[3rem] shadow-3xl text-white">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-4">
                            <Settings className="w-5 h-5" />
                            SYSTEM LOGS
                            <div className="w-20 h-px bg-white/10" />
                        </h2>
                        <div className="text-[9px] font-black text-[#00ff85] uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/5">
                            Live Feed
                        </div>
                    </div>
                    <div className="space-y-6">
                        {[
                            "Updated score for Live Match: MCI vs TOT (2 - 2)",
                            "New Player Registered: J. Grealish to Manchester City",
                            "Standings recalculated successfully (Season 2025/26)",
                            "Match Event Logged: GOAL (Salah 45')",
                        ].map((log, i) => (
                            <div key={i} className="flex items-center gap-6 text-sm font-bold text-white/70 border-b border-white/5 pb-6 last:border-0">
                                <div className="w-2 h-2 rounded-full bg-[#00ff85] shadow-[0_0_10px_#00ff85]" />
                                <span className="italic">{log}</span>
                                <span className="ml-auto text-[10px] font-black text-white/20">{(i + 1) * 2} MIN AGO</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
