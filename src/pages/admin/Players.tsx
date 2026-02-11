import { useState } from "react";
import { Player, Team, PlayerPosition } from "@/types";
import { Plus, Edit2, Trash2, ArrowLeft, Check, X, User } from "lucide-react";
import { Link } from "react-router-dom";
import { getTeamLogo } from "@/lib/utils";

const initialPlayers: Player[] = [
    { id: "p1", teamId: "1", name: "Bukayo Saka", position: "Forward", nationality: "England", number: 7 },
    { id: "p2", teamId: "2", name: "Erling Haaland", position: "Forward", nationality: "Norway", number: 9 },
];

const mockTeams: Team[] = [
    { id: "1", name: "Arsenal", city: "London", stadium: "Emirates Stadium", shortName: "ARS" },
    { id: "2", name: "Manchester City", city: "Manchester", stadium: "Etihad Stadium", shortName: "MCI" },
];

export default function ManagePlayers() {
    const [players, setPlayers] = useState<Player[]>(initialPlayers);
    const [isAdding, setIsAdding] = useState(false);
    const [newPlayer, setNewPlayer] = useState<Partial<Player>>({ name: "", teamId: "1", position: "Midfielder", nationality: "", number: 0 });

    const handleCreate = () => {
        if (newPlayer.name) {
            const player: Player = {
                id: "p" + Math.random().toString(36).substr(2, 5),
                name: newPlayer.name,
                teamId: newPlayer.teamId || "1",
                position: newPlayer.position as PlayerPosition,
                nationality: newPlayer.nationality || "Unknown",
                number: newPlayer.number || 0,
            };
            setPlayers([...players, player]);
            setIsAdding(false);
        }
    };

    return (
        <div className="py-12 bg-[#37003c] min-h-screen font-inter text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link to="/admin" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-[10px] font-black uppercase tracking-widest">
                            <ArrowLeft className="w-3 h-3" /> Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Manage Players</h1>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#00ff85] text-[#37003c] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Register New Player
                    </button>
                </header>

                {isAdding && (
                    <div className="mb-8 glass-card p-10 bg-white/5 border-t-8 border-t-[#ff2882] rounded-[2.5rem] shadow-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Register New Player</h2>
                            <button onClick={() => setIsAdding(false)} className="text-white/20 hover:text-[#ff005a]"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                            <div className="space-y-3 lg:col-span-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Full Name</label>
                                <input
                                    className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] focus:outline-none font-bold text-white placeholder:text-white/10"
                                    value={newPlayer.name}
                                    onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })}
                                    placeholder="e.g. Bukayo Saka"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Club</label>
                                <select
                                    className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] focus:outline-none font-bold appearance-none text-white"
                                    value={newPlayer.teamId}
                                    onChange={e => setNewPlayer({ ...newPlayer, teamId: e.target.value })}
                                >
                                    {mockTeams.map(t => <option key={t.id} value={t.id} className="bg-[#37003c]">{t.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Position</label>
                                <select
                                    className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] focus:outline-none font-bold appearance-none text-white"
                                    value={newPlayer.position}
                                    onChange={e => setNewPlayer({ ...newPlayer, position: e.target.value as PlayerPosition })}
                                >
                                    {["Goalkeeper", "Defender", "Midfielder", "Forward"].map(p => <option key={p} value={p} className="bg-[#37003c]">{p}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleCreate}
                                    className="w-full py-4 rounded-2xl bg-[#ff2882] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#ff2882]/20"
                                >
                                    <Check className="w-5 h-5" /> Save Player
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="glass-card bg-white/5 overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/10">
                    <table className="w-full text-left">
                        <thead className="bg-[#37003c] text-[#00ff85]">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Player</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Official Club</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {players.map(player => (
                                <tr key={player.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/10 group-hover:bg-[#ff2882]/10 group-hover:text-[#ff2882] transition-all border border-white/5">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-white tracking-tight uppercase leading-none mb-1">{player.name}</p>
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic font-medium">#{player.number} • {player.nationality}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[9px] font-black text-[#00ff85] border-2 border-white/5 px-3 py-1 rounded-full uppercase tracking-[0.2em] group-hover:border-[#00ff85]/20 transition-colors">
                                            {player.position}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <img
                                                    src={getTeamLogo(mockTeams.find(t => t.id === player.teamId)?.name || "")}
                                                    alt="logo"
                                                    className="w-full h-full object-contain brightness-110"
                                                />
                                            </div>
                                            <span className="text-sm font-black text-white uppercase">{mockTeams.find(t => t.id === player.teamId)?.name || "N/A"}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                            <button className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-[#00ff85] transition-colors border border-white/5"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => setPlayers(players.filter(p => p.id !== player.id))} className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-[#ff005a] transition-colors border border-white/5"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
