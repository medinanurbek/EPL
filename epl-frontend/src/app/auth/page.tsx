"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { useSearchParams } from "next/navigation";

function AuthForm() {
    const searchParams = useSearchParams();
    const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
    const [mode, setMode] = useState<"login" | "register">(initialMode);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate auth
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="text-center mb-10">
                <div className="relative w-16 h-16 mx-auto mb-6">
                    <Image src="/logos/premier-league.png" alt="PL" fill className="object-contain" />
                </div>
                <h1 className="text-2xl font-black text-[#37003c] uppercase tracking-tight mb-2">
                    {mode === "login" ? "Welcome Back" : "Join the Club"}
                </h1>
                <p className="text-slate-400 font-medium text-sm">
                    {mode === "login" ? "Sign in to access exclusive features" : "Create your account today"}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {mode === "register" && (
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#37003c] transition-colors" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#37003c]/10 focus:border-[#37003c] transition-all font-bold text-[#37003c]"
                        />
                    </div>
                )}
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#37003c] transition-colors" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#37003c]/10 focus:border-[#37003c] transition-all font-bold text-[#37003c]"
                    />
                </div>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#37003c] transition-colors" />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#37003c]/10 focus:border-[#37003c] transition-all font-bold text-[#37003c]"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-[#37003c] text-white font-black uppercase tracking-widest rounded-xl hover:bg-[#00ff85] hover:text-[#37003c] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    {isLoading ? "Processing..." : (mode === "login" ? "Sign In" : "Create Account")}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => setMode(mode === "login" ? "register" : "login")}
                        className="ml-2 text-[#ff005a] hover:underline"
                    >
                        {mode === "login" ? "Register" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Patterns */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-[#00ff85] rounded-full blur-[150px] opacity-20" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-[#37003c] rounded-full blur-[150px] opacity-20" />
            </div>

            <div className="relative z-10 w-full flex justify-center">
                <Suspense fallback={<div className="text-[#37003c] font-black">Loading...</div>}>
                    <AuthForm />
                </Suspense>
            </div>
        </div>
    );
}
