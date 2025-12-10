import { Link, useLocation } from 'react-router-dom';
import { Calendar, Moon, Clock, BookOpen } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            {/* Top Navbar (Desktop) / Mobile Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            M
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                            Muslim App
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <NavLink to="/" icon={<Clock size={18} />} label="Jadwal Sholat" active={isActive('/')} />
                        <NavLink to="/quran" icon={<BookOpen size={18} />} label="Al-Quran" active={isActive('/quran')} />
                        <NavLink to="/calendar" icon={<Calendar size={18} />} label="Kalender" active={isActive('/calendar')} />
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-6 mb-16 md:mb-0">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm hidden md:block">
                <div className="container mx-auto px-4">
                    <p className="mb-2 font-medium">© 2025 Muslim Web App</p>
                    <p className="text-xs text-slate-400 mb-2">Developed by Muslim App Team</p>
                    <div className="flex justify-center gap-4 text-xs text-slate-400">
                        <span>Data API by MyQuran</span>
                        <span>•</span>
                        <span>Hijri Date by Aladhan</span>
                    </div>
                </div>
            </footer>

            {/* Mobile Footer (visible above bottom nav) */}
            <footer className="md:hidden pb-24 pt-8 text-center text-slate-500 text-xs">
                <p className="mb-1">© 2025 Muslim Web App</p>
                <p className="opacity-70 mb-1">Developed by Muslim App Team</p>
                <p className="opacity-60 text-[10px]">Data API by MyQuran & Aladhan</p>
            </footer>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50 safe-area-bottom">
                <MobileNavLink to="/" icon={<Clock size={24} />} label="Sholat" active={isActive('/')} />
                <MobileNavLink to="/quran" icon={<BookOpen size={24} />} label="Al-Quran" active={isActive('/quran')} />
                <MobileNavLink to="/calendar" icon={<Calendar size={24} />} label="Kalender" active={isActive('/calendar')} />
            </div>
        </div>
    );
};

const NavLink = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
    <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${active
            ? 'bg-emerald-50 text-emerald-600 font-medium'
            : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
            }`}
    >
        {icon}
        <span>{label}</span>
    </Link>
);

const MobileNavLink = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
    <Link
        to={to}
        className={`flex flex-col items-center gap-1 ${active ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
            }`}
    >
        {icon}
        <span className="text-xs font-medium">{label}</span>
    </Link>
);

export default Layout;
