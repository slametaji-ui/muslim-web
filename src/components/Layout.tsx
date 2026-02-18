import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Moon, Clock, BookOpen, Sun, Compass, RotateCw } from 'lucide-react';
import InstallPWA from './InstallPWA';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    // Initialize theme from localStorage or system preference
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme') as 'light' | 'dark';
        }
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    const isActive = (path: string) => location.pathname === path;

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <InstallPWA />
            {/* Top Navbar (Desktop) / Mobile Header */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src="/logo-muslimapp.png"
                            alt="Muslim App Logo"
                            className="w-8 h-8 object-contain transition-transform group-hover:scale-110"
                        />
                        <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                            Muslim App
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            <NavLink to="/" icon={<Clock size={18} />} label="Sholat" active={isActive('/')} />
                            <NavLink to="/quran" icon={<BookOpen size={18} />} label="Al-Quran" active={isActive('/quran')} />
                            <NavLink to="/tasbih" icon={<RotateCw size={18} />} label="Tasbih" active={isActive('/tasbih')} />
                            <NavLink to="/qibla" icon={<Compass size={18} />} label="Kiblat" active={isActive('/qibla')} />
                            <NavLink to="/calendar" icon={<Calendar size={18} />} label="Kalender" active={isActive('/calendar')} />
                        </nav>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-slate-700 transition-all active:scale-95"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-6 mb-16 md:mb-0">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-slate-500 dark:text-slate-500 text-sm hidden md:block transition-colors">
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
            <footer className="md:hidden pb-24 pt-8 text-center text-slate-500 dark:text-slate-500 text-xs">
                <p className="mb-1">© 2025 Muslim Web App</p>
                <p className="opacity-70 mb-1">Developed by Muslim App Team</p>
                <p className="opacity-60 text-[10px]">Data API by MyQuran & Aladhan</p>
            </footer>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-6 left-6 right-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/40 px-6 py-4 rounded-[2.5rem] flex justify-between items-center z-50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all">
                <MobileNavLink to="/" icon={<Clock size={20} />} label="Home" active={isActive('/')} />
                <MobileNavLink to="/quran" icon={<BookOpen size={20} />} label="Quran" active={isActive('/quran')} />
                <MobileNavLink to="/tasbih" icon={<RotateCw size={20} />} label="Tasbih" active={isActive('/tasbih')} />
                <MobileNavLink to="/qibla" icon={<Compass size={20} />} label="Kiblat" active={isActive('/qibla')} />
                <MobileNavLink to="/calendar" icon={<Calendar size={20} />} label="Hijri" active={isActive('/calendar')} />
            </div>
        </div>
    );
};

const NavLink = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
    <Link
        to={to}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 relative group ${active
            ? 'text-emerald-600 dark:text-emerald-400 font-black'
            : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
    >
        {active && (
            <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-500"></div>
        )}
        <div className={`transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${active ? 'text-emerald-500 shadow-emerald-200' : ''}`}>
            {icon}
        </div>
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
        {active && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-emerald-500 rounded-full animate-in slide-in-from-bottom-1 duration-500 opacity-50 blur-[2px]"></div>
        )}
    </Link>
);

const MobileNavLink = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
    <Link
        to={to}
        className={`flex flex-col items-center gap-1.5 py-1 px-3 rounded-2xl transition-all duration-500 relative ${active ? 'text-emerald-600 dark:text-emerald-400 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-emerald-500'
            }`}
    >
        {active && (
            <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-3xl -z-10 scale-[1.6] blur-xl opacity-60"></div>
        )}
        <div className={`transition-all duration-500 ${active ? 'animate-bounce-subtle text-emerald-600' : 'group-hover:scale-110'}`}>
            {icon}
        </div>
        <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-500 ${active ? 'opacity-100 translate-y-0.5' : 'opacity-40'}`}>
            {label}
        </span>
    </Link>
);

export default Layout;
