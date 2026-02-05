import { useState, Suspense } from "react";
import { ArrowRight, Lock, Mail, User, AlertCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

function AuthForm() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
    const [mode, setMode] = useState<"login" | "register">(initialMode);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Simulate small delay for better UX
        setTimeout(() => {
            try {
                const storedUsers = JSON.parse(localStorage.getItem("epl_users") || "[]");

                if (mode === "register") {
                    // Registration Logic
                    if (!formData.email || !formData.password || !formData.fullName) {
                        throw new Error("Please fill in all fields");
                    }

                    if (storedUsers.find((u: any) => u.email === formData.email)) {
                        throw new Error("User with this email already exists");
                    }

                    const newUser = {
                        id: Date.now().toString(),
                        email: formData.email,
                        password: formData.password,
                        fullName: formData.fullName
                    };

                    storedUsers.push(newUser);
                    localStorage.setItem("epl_users", JSON.stringify(storedUsers));
                    localStorage.setItem("epl_current_user", JSON.stringify(newUser));

                    // Dispatch custom event for Navbar to update
                    window.dispatchEvent(new Event("auth-change"));
                    navigate("/");
                } else {
                    // Login Logic
                    const user = storedUsers.find((u: any) => u.email === formData.email && u.password === formData.password);

                    if (!user) {
                        throw new Error("Invalid email or password");
                    }

                    localStorage.setItem("epl_current_user", JSON.stringify(user));

                    // Dispatch custom event for Navbar to update
                    window.dispatchEvent(new Event("auth-change"));
                    navigate("/");
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl relative border border-white/10 overflow-hidden group/card transition-all hover:border-[#00ff85]/30">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff85]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />

            <div className="text-center mb-12 relative z-10">
                <div className="relative w-16 h-16 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(0,255,133,0.3)]">
                    <img src="/logos/premier-league.png" alt="PL" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-4xl font-outfit font-black text-white uppercase tracking-tighter mb-3 leading-none">
                    {mode === "login" ? (
                        <>Welcome <span className="text-[#00ff85]">Back</span></>
                    ) : (
                        <>Join the <span className="text-[#00ff85]">Club</span></>
                    )}
                </h1>
                <p className="text-white/40 font-outfit font-medium text-xs uppercase tracking-[0.2em] italic">
                    {mode === "login" ? "Sign in to access elite features" : "Create your official profile today"}
                </p>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 text-[11px] font-outfit font-black uppercase tracking-wider relative z-10">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {mode === "register" && (
                    <div className="relative group/field">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within/field:text-[#00ff85] transition-colors" />
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="w-full pl-14 pr-6 py-4.5 rounded-2xl border border-white/10 bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#00ff85]/20 focus:border-[#00ff85] transition-all font-outfit font-bold text-white placeholder:text-white/20 selection:bg-[#00ff85]/30"
                        />
                    </div>
                )}
                <div className="relative group/field">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within/field:text-[#00ff85] transition-colors" />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-14 pr-6 py-4.5 rounded-2xl border border-white/10 bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#00ff85]/20 focus:border-[#00ff85] transition-all font-outfit font-bold text-white placeholder:text-white/20 selection:bg-[#00ff85]/30"
                    />
                </div>
                <div className="relative group/field">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within/field:text-[#00ff85] transition-colors" />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-14 pr-6 py-4.5 rounded-2xl border border-white/10 bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#00ff85]/20 focus:border-[#00ff85] transition-all font-outfit font-bold text-white placeholder:text-white/20 selection:bg-[#00ff85]/30"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-[#00ff85] text-[#37003c] font-outfit font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(0,255,133,0.15)] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isLoading ? "Processing..." : (mode === "login" ? "Sign In" : "Register")}
                    {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
            </form>

            <div className="mt-12 text-center relative z-10">
                <p className="text-white/30 text-[10px] font-outfit font-black uppercase tracking-[0.3em]">
                    {mode === "login" ? "New to the platform?" : "Already a member?"}
                    <button
                        type="button"
                        onClick={() => {
                            setMode(mode === "login" ? "register" : "login");
                            setError(null);
                        }}
                        className="ml-3 text-[#ff005a] hover:text-[#00ff85] transition-colors font-black"
                    >
                        {mode === "login" ? "Create Account" : "Sign In"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default function AuthPageContent() {
    return (
        <div className="flex-grow flex items-center justify-center p-6 relative">
            <div className="relative z-10 w-full flex justify-center py-12">
                <Suspense fallback={<div className="text-[#37003c] font-black italic">Loading...</div>}>
                    <AuthForm />
                </Suspense>
            </div>
        </div>
    );
}
