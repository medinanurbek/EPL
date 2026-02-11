import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { Trash2, MessageSquare, Star, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ManageReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const data = await apiService.getReviews();
            setReviews(data);
        } catch (err: any) {
            setError("Failed to fetch reviews");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;
        try {
            await apiService.deleteReview(id);
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert("Failed to delete review");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-[#37003c] animate-spin" />
                <p className="text-[#37003c] font-black uppercase tracking-widest text-[10px]">Syncing Reviews...</p>
            </div>
        );
    }

    return (
        <div className="py-12 bg-[#37003c] min-h-screen font-inter text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-12">
                    <Link to="/admin" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-[10px] font-black uppercase tracking-widest">
                        <ArrowLeft className="w-3 h-3" /> Dashboard
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#00ff85] border border-white/10">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Review Management</h1>
                            <p className="text-white/40 font-medium text-xs mt-1 uppercase tracking-widest italic">Monitor and moderate community feedback</p>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="mb-8 p-6 bg-red-500/10 text-red-400 rounded-3xl flex items-center gap-4 border border-red-500/20 shadow-sm">
                        <AlertCircle className="w-6 h-6" />
                        <span className="font-bold text-sm">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {reviews.map((review) => (
                            <motion.div
                                key={review.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-white/5 flex flex-col justify-between group hover:border-[#00ff85]/20 transition-all"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex gap-1 text-[#00ff85]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-[#00ff85]" : "text-white/10"}`} />
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-white/70 font-medium text-sm leading-relaxed mb-6 italic">"{review.content}"</p>
                                </div>
                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div>
                                        <p className="font-black text-white text-xs uppercase tracking-tight">{review.userName}</p>
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {review.matchId && (
                                        <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-white/40 uppercase tracking-widest border border-white/5">
                                            Match Ref: {review.matchId.slice(-4)}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {reviews.length === 0 && !isLoading && (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-white/10">
                            <MessageSquare className="w-16 h-16 mb-6 opacity-20" />
                            <p className="font-black uppercase tracking-[0.3em] text-xs">No reviews found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
