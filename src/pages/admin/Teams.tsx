import { useState, useEffect } from "react";
import { Team } from "@/types";
import { Edit2, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { getTeamLogo } from "@/lib/utils";
import { apiService } from "@/lib/api";

export default function ManageTeams() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [coachName, setCoachName] = useState("");
    const [modalMode, setModalMode] = useState<"add" | "replace">("add");

    const loadTeams = async () => {
        try {
            const data = await apiService.getTeams();
            setTeams(data);
        } catch (error) {
            console.error("Failed to load teams", error);
        }
    };

    useEffect(() => {
        loadTeams();
    }, []);

    const openCoachModal = (team: Team, mode: "add" | "replace") => {
        setSelectedTeam(team);
        setModalMode(mode);
        setCoachName("");
        setIsCoachModalOpen(true);
    };

    const handleCoachSubmit = async () => {
        if (!selectedTeam || !coachName) return;

        try {
            if (modalMode === "add") {
                await apiService.addCoach(selectedTeam.id, coachName);
            } else {
                await apiService.replaceCoach(selectedTeam.id, coachName);
            }
            await loadTeams();
            setIsCoachModalOpen(false);
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to update coach");
        }
    };

    const handleDeleteCoach = async (team: Team) => {
        if (!confirm(`Remove coach ${team.coach} from ${team.name}?`)) return;
        try {
            await apiService.removeCoach(team.id);
            loadTeams();
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to remove coach");
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
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Team Management</h1>
                    </div>
                </header>

                <div className="glass-card bg-white/5 overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/10">
                    <table className="w-full text-left">
                        <thead className="bg-[#37003c] text-[#00ff85]">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest w-1/3">Club</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Head Coach</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 mt-2">
                            {teams.map(team => (
                                <tr key={team.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-6">
                                            <div className="relative w-10 h-10 flex-shrink-0 transition-transform group-hover:scale-110">
                                                <img
                                                    src={getTeamLogo(team.name)}
                                                    alt={team.name}
                                                    className="w-full h-full object-contain brightness-110"
                                                />
                                            </div>
                                            <div>
                                                <span className="font-black text-white tracking-tight uppercase block">{team.name}</span>
                                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{team.stadium}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {team.coach ? (
                                            <span className="text-white font-bold">{team.coach}</span>
                                        ) : (
                                            <span className="text-white/20 italic text-sm">Vacant</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {!team.coach ? (
                                                <button
                                                    onClick={() => openCoachModal(team, "add")}
                                                    className="px-4 py-2 bg-[#00ff85]/10 text-[#00ff85] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#00ff85] hover:text-[#37003c] transition-all"
                                                >
                                                    Add Coach
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => openCoachModal(team, "replace")}
                                                        className="p-2 text-white/40 hover:text-white transition-colors"
                                                        title="Replace Coach"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCoach(team)}
                                                        className="p-2 text-white/40 hover:text-[#ff005a] transition-colors"
                                                        title="Remove Coach"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCoachModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#2d0033] w-full max-w-md p-8 rounded-[2rem] border border-white/10 shadow-2xl">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">
                            {modalMode === "add" ? "Appoint Head Coach" : "Replace Head Coach"}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Coach Name</label>
                                <input
                                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-[#00ff85]"
                                    value={coachName}
                                    onChange={e => setCoachName(e.target.value)}
                                    placeholder="e.g. Mikel Arteta"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setIsCoachModalOpen(false)}
                                    className="flex-1 py-3 text-white/40 font-bold hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCoachSubmit}
                                    className="flex-1 py-3 bg-[#00ff85] text-[#37003c] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
