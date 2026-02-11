import { useState, useEffect } from "react";
import { Player, Team, PlayerPosition } from "@/types";
import { Plus, Edit2, Trash2, ArrowLeft, Check, X, User, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";
import { getTeamLogo } from "@/lib/utils";

export default function ManagePlayers() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTeam, setFilterTeam] = useState("");
    const [filterPosition, setFilterPosition] = useState("");
    const [newPlayer, setNewPlayer] = useState({
        name: "", teamId: "", position: "Midfielder" as PlayerPosition,
        nationality: "", number: 0, height: 0, weight: 0, imagePath: "",
    });
    const [editData, setEditData] = useState<Partial<Player>>({});
    const [previewUrl, setPreviewUrl] = useState("");

    const loadData = async () => {
        try {
            const [playerData, teamData] = await Promise.all([
                apiService.getPlayers(),
                apiService.getTeams(),
            ]);
            setPlayers(playerData || []);
            setTeams(teamData || []);
            if (teamData.length > 0 && !newPlayer.teamId) {
                setNewPlayer(prev => ({ ...prev, teamId: teamData[0].id }));
            }
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async () => {
        if (!newPlayer.name) return;
        try {
            await apiService.createPlayer({
                name: newPlayer.name,
                teamId: newPlayer.teamId,
                position: newPlayer.position,
                nationality: newPlayer.nationality || "Unknown",
                number: newPlayer.number || 0,
                height: newPlayer.height || 0,
                weight: newPlayer.weight || 0,
                imagePath: newPlayer.imagePath || "",
            });
            setIsAdding(false);
            setNewPlayer({ name: "", teamId: teams[0]?.id || "", position: "Midfielder", nationality: "", number: 0, height: 0, weight: 0, imagePath: "" });
            setPreviewUrl("");
            await loadData();
        } catch (err: any) {
            alert(err?.response?.data?.error || "Failed to create player");
        }
    };

    const handleDelete = async (playerId: string) => {
        if (!confirm("Бұл ойыншыны жою керек пе? Бұл әрекетті кері қайтару мүмкін емес.")) return;
        try {
            await apiService.deletePlayer(playerId);
            await loadData();
        } catch (err: any) {
            alert(err?.response?.data?.error || "Failed to delete player");
        }
    };

    const handleUpdate = async (playerId: string) => {
        try {
            await apiService.updatePlayer(playerId, editData);
            setEditingId(null);
            setEditData({});
            await loadData();
        } catch (err: any) {
            alert(err?.response?.data?.error || "Failed to update player");
        }
    };

    const startEdit = (player: Player) => {
        setEditingId(player.id);
        setEditData({
            name: player.name, position: player.position, nationality: player.nationality,
            number: player.number, teamId: player.teamId, height: player.height, weight: player.weight,
            imagePath: player.imagePath,
        });
    };

    const filteredPlayers = players.filter(p => {
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterTeam && p.teamId !== filterTeam) return false;
        if (filterPosition && p.position !== filterPosition) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="py-12 bg-[#37003c] min-h-screen font-inter text-white flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#00ff85] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="py-12 bg-[#37003c] min-h-screen font-inter text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link to="/admin" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-[10px] font-black uppercase tracking-widest">
                            <ArrowLeft className="w-3 h-3" /> Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Manage Players</h1>
                        <p className="text-white/30 text-sm mt-2">{players.length} players registered</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#00ff85] text-[#37003c] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Register New Player
                    </button>
                </header>

                {/* Add Player Form */}
                {isAdding && (
                    <div className="mb-8 p-8 md:p-10 bg-white/5 border-t-8 border-t-[#ff2882] rounded-[2.5rem] shadow-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Register New Player</h2>
                            <button onClick={() => { setIsAdding(false); setPreviewUrl(""); }} className="text-white/20 hover:text-[#ff005a]"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                                    {(previewUrl || newPlayer.imagePath) ? (
                                        <img src={previewUrl || newPlayer.imagePath} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-16 h-16 text-white/10" />
                                    )}
                                </div>
                                <div className="w-full space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Photo URL</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-white/5 focus:border-[#00ff85] focus:outline-none text-xs text-white placeholder:text-white/10"
                                        value={newPlayer.imagePath}
                                        onChange={e => { setNewPlayer({ ...newPlayer, imagePath: e.target.value }); setPreviewUrl(e.target.value); }}
                                        placeholder="https://... or /logos/..."
                                    />
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Full Name */}
                                <div className="space-y-2 lg:col-span-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Full Name *</label>
                                    <input
                                        className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] focus:outline-none font-bold text-white placeholder:text-white/10"
                                        value={newPlayer.name}
                                        onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })}
                                        placeholder="e.g. Bukayo Saka"
                                    />
                                </div>

                                {/* Nationality */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Country</label>
                                    <input
                                        className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] focus:outline-none font-bold text-white placeholder:text-white/10"
                                        value={newPlayer.nationality}
                                        onChange={e => setNewPlayer({ ...newPlayer, nationality: e.target.value })}
                                        placeholder="e.g. England"
                                    />
                                </div>

                                {/* Club */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Club *</label>
                                    <select
                                        className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] focus:outline-none font-bold appearance-none text-white"
                                        value={newPlayer.teamId}
                                        onChange={e => setNewPlayer({ ...newPlayer, teamId: e.target.value })}
                                    >
                                        {teams.map(t => <option key={t.id} value={t.id} className="bg-[#37003c]">{t.name}</option>)}
                                    </select>
                                </div>

                                {/* Position */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Position *</label>
                                    <select
                                        className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] focus:outline-none font-bold appearance-none text-white"
                                        value={newPlayer.position}
                                        onChange={e => setNewPlayer({ ...newPlayer, position: e.target.value as PlayerPosition })}
                                    >
                                        {["Goalkeeper", "Defender", "Midfielder", "Forward"].map(p => <option key={p} value={p} className="bg-[#37003c]">{p}</option>)}
                                    </select>
                                </div>

                                {/* Number */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Number <span className="text-white/15">(optional)</span></label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] focus:outline-none font-bold text-white placeholder:text-white/10"
                                        value={newPlayer.number || ""}
                                        onChange={e => setNewPlayer({ ...newPlayer, number: parseInt(e.target.value) || 0 })}
                                        placeholder="e.g. 7"
                                    />
                                </div>

                                {/* Height */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Height (cm)</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] focus:outline-none font-bold text-white placeholder:text-white/10"
                                        value={newPlayer.height || ""}
                                        onChange={e => setNewPlayer({ ...newPlayer, height: parseInt(e.target.value) || 0 })}
                                        placeholder="e.g. 178"
                                    />
                                </div>

                                {/* Weight */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-[#00ff85] focus:outline-none font-bold text-white placeholder:text-white/10"
                                        value={newPlayer.weight || ""}
                                        onChange={e => setNewPlayer({ ...newPlayer, weight: parseInt(e.target.value) || 0 })}
                                        placeholder="e.g. 72"
                                    />
                                </div>

                                {/* Save Button */}
                                <div className="flex items-end lg:col-span-3">
                                    <button
                                        onClick={handleCreate}
                                        disabled={!newPlayer.name}
                                        className="w-full md:w-auto px-12 py-4 rounded-2xl bg-[#ff2882] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#ff2882]/20 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Check className="w-5 h-5" /> Save Player
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input
                            className="w-full pl-11 pr-5 py-3 rounded-xl border border-white/5 bg-white/5 focus:border-[#00ff85] focus:outline-none text-sm text-white placeholder:text-white/20"
                            placeholder="Search players..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-5 py-3 rounded-xl border border-white/5 bg-white/5 text-white text-sm font-bold appearance-none min-w-[160px]"
                        value={filterTeam}
                        onChange={e => setFilterTeam(e.target.value)}
                    >
                        <option value="" className="bg-[#37003c]">All Teams</option>
                        {teams.map(t => <option key={t.id} value={t.id} className="bg-[#37003c]">{t.name}</option>)}
                    </select>
                    <select
                        className="px-5 py-3 rounded-xl border border-white/5 bg-white/5 text-white text-sm font-bold appearance-none min-w-[140px]"
                        value={filterPosition}
                        onChange={e => setFilterPosition(e.target.value)}
                    >
                        <option value="" className="bg-[#37003c]">All Positions</option>
                        {["Goalkeeper", "Defender", "Midfielder", "Forward"].map(p => <option key={p} value={p} className="bg-[#37003c]">{p}</option>)}
                    </select>
                </div>

                {/* Player Table */}
                <div className="bg-white/5 overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/10">
                    <table className="w-full text-left">
                        <thead className="bg-[#37003c] text-[#00ff85]">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Player</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Role</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Club</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest hidden lg:table-cell">Stats</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredPlayers.map(player => (
                                <tr key={player.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-5">
                                        {editingId === player.id ? (
                                            <div className="space-y-2">
                                                <input className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white font-bold w-full" value={editData.name || ""} onChange={e => setEditData({ ...editData, name: e.target.value })} placeholder="Name" />
                                                <input className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-xs w-full" value={editData.imagePath || ""} onChange={e => setEditData({ ...editData, imagePath: e.target.value })} placeholder="Image URL" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 bg-white/5">
                                                    {player.imagePath ? (
                                                        <img src={player.imagePath} alt={player.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white/10 group-hover:text-[#ff2882] transition-all">
                                                            <User className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white tracking-tight uppercase leading-none mb-1">{player.name}</p>
                                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                                        {player.number > 0 && `#${player.number} • `}{player.nationality}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        {editingId === player.id ? (
                                            <select className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white font-bold appearance-none text-xs" value={editData.position || ""} onChange={e => setEditData({ ...editData, position: e.target.value as PlayerPosition })}>
                                                {["Goalkeeper", "Defender", "Midfielder", "Forward"].map(p => <option key={p} value={p} className="bg-[#37003c]">{p}</option>)}
                                            </select>
                                        ) : (
                                            <span className="text-[9px] font-black text-[#00ff85] border-2 border-white/5 px-3 py-1 rounded-full uppercase tracking-[0.2em] group-hover:border-[#00ff85]/20 transition-colors">
                                                {player.position}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-7 h-7 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <img src={getTeamLogo(teams.find(t => t.id === player.teamId)?.name || "")} alt="logo" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-xs font-black text-white uppercase">{teams.find(t => t.id === player.teamId)?.shortName || "N/A"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 hidden lg:table-cell">
                                        {editingId === player.id ? (
                                            <div className="flex gap-2">
                                                <input type="number" className="px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-xs w-16" value={editData.height || ""} onChange={e => setEditData({ ...editData, height: parseInt(e.target.value) || 0 })} placeholder="cm" />
                                                <input type="number" className="px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-xs w-16" value={editData.weight || ""} onChange={e => setEditData({ ...editData, weight: parseInt(e.target.value) || 0 })} placeholder="kg" />
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-white/30 font-bold space-y-0.5">
                                                {player.height ? <p>{player.height} cm</p> : null}
                                                {player.weight ? <p>{player.weight} kg</p> : null}
                                                {!player.height && !player.weight && <p className="text-white/10">—</p>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {editingId === player.id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleUpdate(player.id)} className="p-3 bg-[#00ff85]/10 rounded-xl text-[#00ff85] hover:bg-[#00ff85]/20 transition-colors">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => { setEditingId(null); setEditData({}); }} className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                <button onClick={() => startEdit(player)} className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-[#00ff85] transition-colors border border-white/5">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(player.id)} className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-[#ff005a] transition-colors border border-white/5">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredPlayers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-white/20 text-sm">
                                        No players found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
