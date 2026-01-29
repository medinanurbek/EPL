"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Calendar, Users, Briefcase, Menu, X, TrendingUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image";

const navItems = [
    { name: "Standings", href: "/standings", icon: Trophy },
    { name: "Matches", href: "/matches", icon: Calendar },
    { name: "Teams", href: "/teams", icon: Users },
    { name: "Stats", href: "/stats", icon: TrendingUp },
    { name: "Players", href: "/players", icon: Users },
];

const adminItems = [
    { name: "Admin Dashboard", href: "/admin", icon: Briefcase },
];

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const isAdmin = pathname.startsWith("/admin");

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#37003c] shadow-lg">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 text-white font-black text-xl tracking-tighter group">
                        <div className="relative w-10 h-10 group-hover:rotate-6 transition-transform">
                            <NextImage
                                src="/logos/premier-league.png"
                                alt="PL"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="uppercase">Premier <span className="text-[#00ff85]">League</span></span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {(isAdmin ? adminItems : navItems).map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors ${isActive
                                        ? "bg-white text-[#37003c]"
                                        : "text-white/70 hover:text-[#00ff85]"
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/auth"
                        className="hidden lg:flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-[#00ff85] transition-colors"
                    >
                        Login
                    </Link>

                    <Link
                        href="/auth?mode=register"
                        className="hidden lg:flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#00ff85] text-[#37003c] hover:scale-105 transition-all shadow-lg active:scale-95"
                    >
                        Register
                    </Link>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-border bg-background"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {(isAdmin ? adminItems : navItems).map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-semibold ${isActive ? "bg-epl-navy text-epl-cyan" : ""
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
                                <Link
                                    href="/auth"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 text-white font-bold"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/auth?mode=register"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#00ff85] text-[#37003c] font-bold"
                                >
                                    Register
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
