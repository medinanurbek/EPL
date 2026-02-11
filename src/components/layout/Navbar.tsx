import { Link, useLocation, useNavigate } from "react-router-dom";
import { Trophy, Calendar, Users, Briefcase, Menu, X, TrendingUp, LogOut, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { name: "Standings", href: "/standings", icon: Trophy },
    { name: "Matches", href: "/matches", icon: Calendar },
    { name: "Teams", href: "/teams", icon: Users },
    { name: "Stats", href: "/stats", icon: TrendingUp },
    { name: "Players", href: "/players", icon: Users },
    { name: "Admin", href: "/admin", icon: Briefcase },
];

const adminItems = [
    { name: "Admin Dashboard", href: "/admin", icon: Briefcase },
];

export function Navbar() {
    const location = useLocation();
    const pathname = location.pathname;
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const isAdmin = pathname.startsWith("/admin");

    const checkAuth = () => {
        const storedUser = localStorage.getItem("epl_current_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        checkAuth();
        // Listen for auth changes
        window.addEventListener("auth-change", checkAuth);
        return () => window.removeEventListener("auth-change", checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("epl_current_user");
        setUser(null);
        navigate("/");
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-transparent backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 text-white font-outfit font-black text-xl tracking-tighter group">
                        <div className="relative w-10 h-10 group-hover:rotate-6 transition-transform">
                            <img
                                src="/logos/premier-league.png"
                                alt="PL"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="uppercase">Premier <span className="text-[#00ff85]">League</span></span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {(isAdmin ? adminItems : navItems).map((item) => {
                            // Check if admin item and user is not admin
                            if (item.href.startsWith("/admin") && user?.role !== "ADMIN") return null;

                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-outfit font-black uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 ${isActive
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
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link
                                to="/profile"
                                className="hidden lg:flex items-center gap-2 text-[10px] font-outfit font-black uppercase tracking-widest text-[#00ff85] hover:text-white transition-colors"
                            >
                                <UserIcon className="w-4 h-4" />
                                {user.fullName.split(' ')[0]}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="hidden lg:flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-outfit font-black uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/auth"
                                className="hidden lg:flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-outfit font-black uppercase tracking-widest text-white/70 hover:text-[#00ff85] transition-colors"
                            >
                                Login
                            </Link>

                            <Link
                                to="/auth?mode=register"
                                className="hidden lg:flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-outfit font-black uppercase tracking-widest bg-[#00ff85] text-[#37003c] hover:scale-105 transition-all shadow-lg active:scale-95 shadow-[#00ff85]/20"
                            >
                                Register
                            </Link>
                        </>
                    )}

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg text-white hover:bg-white/10"
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
                        className="md:hidden border-t border-white/10 bg-[#37003c]"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {(isAdmin ? adminItems : navItems).map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-black uppercase tracking-tight text-white ${isActive ? "bg-white/10 text-[#00ff85]" : ""
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
                                {user ? (
                                    <>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-[#00ff85] text-[#00ff85] font-black uppercase tracking-widest"
                                        >
                                            <UserIcon className="w-5 h-5" />
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/auth"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 text-white font-bold"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/auth?mode=register"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#00ff85] text-[#37003c] font-bold"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
