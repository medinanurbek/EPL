


export function Footer() {
    return (
        <footer className="py-12 border-t border-white/5 mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-1 bg-[#00ff85] mb-8 rounded-full opacity-20" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">
                    Official Information System
                </p>
                <p className="text-[10px] font-medium text-white/20 uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} English Premier League. All data provided for demonstration purposes.
                </p>
            </div>
        </footer>
    );
}
