import { Player, Team } from "@/types";
import { User, Flag, ArrowLeft, Target, Star, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock Data
const mockPlayer: Player = { id: "p3", teamId: "1", name: "Mohamed Salah", position: "Forward", nationality: "Egypt", number: 11 };
const mockTeam: Team = { id: "1", name: "Liverpool", city: "Liverpool", stadium: "Anfield", shortName: "LIV" };

export default function PlayerDetailsPage({ params }: { params: { playerId: string } }) {
    const getLogoPath = (teamName: string) => {
        const slug = teamName.toLowerCase().replace(/\s+/g, '-');
        return `/logos/${slug}.football-logos.cc.svg`;
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Header / Hero */}
            <div className="bg-[#37003c] text-white pt-24 pb-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#ff2882_0%,transparent_50%)] opacity-30" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <Link href={`/teams/${mockPlayer.teamId}`} className="inline-flex items-center gap-2 text-white/50 hover:text-[#00ff85] mb-8 transition-colors text-[10px] font-black uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" /> Back to Team
                    </Link>

                    <div className="flex flex-col md:flex-row items-end gap-12">
                        <div className="relative group">
                            <div className="w-56 h-72 bg-white rounded-[3rem] flex items-center justify-center border-8 border-white/10 shadow-3xl overflow-hidden">
                                <User className="w-32 h-32 text-slate-100 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-[#00ff85] rounded-[2rem] flex items-center justify-center text-5xl font-black text-[#37003c] shadow-2xl rotate-6 italic transition-transform group-hover:rotate-12">
                                {mockPlayer.number}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left pb-4">
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-6">
                                <div className="px-4 py-1.5 rounded-full bg-[#ff2882] text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                    {mockPlayer.position}
                                </div>
                                <div className="flex items-center gap-2 text-white/50 font-black uppercase text-[10px] tracking-widest">
                                    <Flag className="w-3.5 h-3.5 text-[#00ff85]" />
                                    {mockPlayer.nationality}
                                </div>
                            </div>
                            <h1 className="text-6xl md:text-9xl font-black mb-4 tracking-tighter leading-[0.8]">
                                {mockPlayer.name.split(' ').map((n, i) => (
                                    <span key={i} className={i === 1 ? "text-[#00ff85] block" : "block"}>{n}</span>
                                ))}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Stats Grid */}
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: "Appearances", value: "23", icon: Target, color: "text-[#00ff85]" },
                            { label: "Goals", value: "15", icon: Star, color: "text-[#ff2882]" },
                            { label: "Assists", value: "9", icon: Zap, color: "text-[#025da4]" },
                            { label: "Minutes", value: "1,942", icon: User, color: "text-[#37003c]" },
                        ].map((stat) => (
                            <div key={stat.label} className="glass-card p-8 flex flex-col items-center text-center bg-white shadow-2xl rounded-[2.5rem]">
                                <stat.icon className={`w-6 h-6 ${stat.color} mb-6`} />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-[#37003c] italic">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <section className="glass-card p-10 h-full flex flex-col justify-center bg-[#37003c] rounded-[2.5rem] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6 relative z-10">Current Club</h3>
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="relative w-12 h-16 transition-transform group-hover:scale-110">
                                    <Image
                                        src={getLogoPath(mockTeam.name)}
                                        alt={mockTeam.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-white tracking-tight">{mockTeam.name}</p>
                                    <p className="text-[10px] font-black text-[#00ff85] uppercase tracking-widest">Signed 2017</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
