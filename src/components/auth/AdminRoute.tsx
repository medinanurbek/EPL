import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const storedUser = localStorage.getItem("epl_current_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div className="min-h-screen bg-[#37003c] flex items-center justify-center text-[#37003c] font-black italic">Loading...</div>;
    }

    if (!user || user.role !== "ADMIN") {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
