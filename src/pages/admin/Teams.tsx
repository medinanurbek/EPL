import { useState } from "react";
import { Team } from "@/types";
import { Plus, Edit2, Trash2, ArrowLeft, Shield, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getTeamLogo } from "@/lib/utils";

// Mock Data
const initialTeams: Team[] = [
    { id: "1", name: "Arsenal", city: "London", stadium: "Emirates Stadium", shortName: "ARS" },
    { id: "2", name: "Manchester City", city: "Manchester", stadium: "Etihad Stadium", shortName: "MCI" },
];

export default function ManageTeams() {
    const [teams, setTeams] = useState<Team[]>(initialTeams);
    const [isAdding, setIsAdding] = useState(false);
    const [newTeam, setNewTeam] = useState<Partial<Team>>({ name: "", city: "", stadium: "", shortName: "" });

    const handleCreate = () => {
        if (newTeam.name && newTeam.city) {
            const team: Team = {
                id: Math.random().toString(36).substr(2, 9),
                name: newTeam.name,
                city: newTeam.city,
                stadium: newTeam.stadium || "",
                shortName: newTeam.shortName || "",
            };
            setTeams([...teams, team]);
            setIsAdding(false);
            setNewTeam({ name: "", city: "", stadium: "", shortName: "" });
        }
    };

    const handleDelete = (id: string) => {
        setTeams(teams.filter(t => t.id !== id));
    };

    return (
        <div className="py-12 bg-slate-50 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link to="/admin" className="inline-flex items-center gap-2 text-[#37003c]/40 hover:text-[#37003c] mb-4 transition-colors text-[10px] font-black uppercase tracking-widest">
                            <ArrowLeft className="w-3 h-3" /> Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-[#37003c] tracking-tighter uppercase">Manage Clubs</h1>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#37003c] text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Register New Club
                    </button>
                </header>

                {isAdding && (
                    <div className="mb-8 glass-card p-10 bg-white border-t-8 border-t-[#00ff85] rounded-[2.5rem] shadow-2xl">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-sm font-black text-[#37003c] uppercase tracking-widest">Register New Club</h2>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-[#ff005a]"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Club Name</label>
                                <input
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:border-[#37003c] focus:outline-none font-bold"
                                    value={newTeam.name}
                                    onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                                    placeholder="e.g. Liverpool"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                                <input
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:border-[#37003c] focus:outline-none font-bold"
                                    value={newTeam.city}
                                    onChange={e => setNewTeam({ ...newTeam, city: e.target.value })}
                                    placeholder="e.g. Manchester"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Stadium</label>
                                <input
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:border-[#37003c] focus:outline-none font-bold"
                                    value={newTeam.stadium}
                                    onChange={e => setNewTeam({ ...newTeam, stadium: e.target.value })}
                                    placeholder="e.g. Anfield"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleCreate}
                                    className="w-full py-4 rounded-2xl bg-[#00ff85] text-[#37003c] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-80 transition-all shadow-lg shadow-[#00ff85]/20"
                                >
                                    <Check className="w-5 h-5" /> Save Club
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="glass-card bg-white overflow-hidden rounded-[2.5rem] shadow-2xl">
                    <table className="w-full text-left">
                        <thead className="bg-[#37003c] text-white">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest w-1/3">Official Club Name</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Location</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Stadium</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 mt-2">
                            {teams.map(team => (
                                <tr key={team.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-6">
                                            <div className="relative w-10 h-10 flex-shrink-0 transition-transform group-hover:scale-110">
                                                <img
                                                    src={getTeamLogo(team.name)}
                                                    alt={team.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <span className="font-black text-[#37003c] tracking-tight uppercase">{team.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-500 italic uppercase">{team.city}</td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-500 uppercase">{team.stadium}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                            <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-[#37003c] transition-colors"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(team.id)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-[#ff005a] transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {teams.length === 0 && (
                        <div className="py-24 text-center">
                            <Shield className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No clubs registered in the system.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
