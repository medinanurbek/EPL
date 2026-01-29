import { Team, Player } from "@/types";
import { Shield, MapPin, Users, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock Data
const mockTeam: Team = { id: "1", name: "Liverpool", city: "Liverpool", stadium: "Anfield", shortName: "LIV" };
const mockSquad: Player[] = [
    { id: "p1", teamId: "1", name: "Alisson Becker", position: "Goalkeeper", nationality: "Brazil", number: 1 },
    { id: "p2", teamId: "1", name: "Virgil van Dijk", position: "Defender", nationality: "Netherlands", number: 4 },
    { id: "p3", teamId: "1", name: "Mohamed Salah", position: "Forward", nationality: "Egypt", number: 11 },
];

export default function TeamDetailsPage({ params }: { params: { teamId: string } }) {
    const getLogoPath = (teamName: string) => {
        const slug = teamName.toLowerCase().replace(/\s+/g, '-');
        return `/logos/${slug}.football-logos.cc.svg`;
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Header / Hero */}
            <div className="bg-[#37003c] text-white pt-24 pb-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#ff2882_0%,transparent_40%)] opacity-20" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <Link href="/teams" className="inline-flex items-center gap-2 text-white/50 hover:text-[#00ff85] mb-8 transition-colors text-[10px] font-black uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" /> Back to Clubs
                    </Link>

                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="relative w-40 h-56 bg-white rounded-[2rem] flex items-center justify-center p-8 shadow-2xl overflow-hidden border-4 border-white/10 group">
                            <Image
                                src={getLogoPath(mockTeam.name)}
                                alt={mockTeam.name}
                                fill
                                className="object-contain p-8 group-hover:scale-110 transition-transform"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-[#00ff85] text-[#37003c] text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-lg shadow-[#00ff85]/20">
                                Premier League Club
                            </div>
                            <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-none">
                                {mockTeam.name}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-8">
                                <div className="flex items-center gap-2 text-white/60 font-black uppercase text-[10px] tracking-widest">
                                    <MapPin className="w-4 h-4 text-[#ff2882]" />
                                    {mockTeam.stadium}, {mockTeam.city}
                                </div>
                                <div className="flex items-center gap-2 text-white/60 font-black uppercase text-[10px] tracking-widest">
                                    <Users className="w-4 h-4 text-[#ff2882]" />
                                    Founded 1892
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="glass-card p-10 bg-white shadow-2xl rounded-[3rem]">
                            <h2 className="text-2xl font-black text-[#37003c] mb-10 flex items-center gap-4">
                                <div className="w-2 h-8 bg-[#00ff85] rounded-full" />
                                OFFICIAL SQUAD
                            </h2>
                            <div className="divide-y divide-slate-100">
                                {mockSquad.map((player) => (
                                    <Link
                                        key={player.id}
                                        href={`/players/${player.id}`}
                                        className="flex items-center justify-between py-6 group hover:bg-slate-50 transition-all px-4 rounded-3xl"
                                    >
                                        <div className="flex items-center gap-8">
                                            <span className="text-3xl font-black text-slate-100 group-hover:text-[#ff2882]/20 transition-colors w-10 text-right italic">
                                                {player.number}
                                            </span>
                                            <div>
                                                <div className="text-xl font-black text-[#37003c] group-hover:text-[#ff2882] transition-colors">{player.name}</div>
                                                <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">
                                                    {player.position} • {player.nationality}
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowLeft className="w-5 h-5 rotate-180 text-slate-300 group-hover:text-[#37003c] group-hover:translate-x-2 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-8">
                        <section className="glass-card p-10 bg-white shadow-2xl rounded-[3rem] border-t-8 border-t-[#00ff85]">
                            <h3 className="text-[10px] font-black text-[#37003c] uppercase tracking-widest mb-10 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#ff2882]" />
                                Club Performance
                            </h3>
                            <div className="space-y-8">
                                {[
                                    { label: "current rank", value: "1st" },
                                    { label: "best result", value: "Won (4-1)" },
                                    { label: "points", value: "54" },
                                    { label: "top scorer", value: "M. Salah" },
                                ].map((stat) => (
                                    <div key={stat.label} className="flex justify-between items-end border-b border-slate-50 pb-6">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
                                        <span className="text-2xl font-black text-[#37003c] leading-none italic">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
