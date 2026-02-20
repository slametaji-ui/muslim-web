import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Moon, Clock, Library, Sun, Compass, Fingerprint, Home, MoonStar, Coins, Heart, Trophy, Book } from 'lucide-react';
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

    useEffect(() => {
        const handleThemeChange = () => {
            const newTheme = localStorage.getItem('theme') as 'light' | 'dark';
            if (newTheme && (newTheme === 'light' || newTheme === 'dark')) {
                setTheme(newTheme);
            }
        };
        window.addEventListener('storage', handleThemeChange);
        window.addEventListener('theme-set', handleThemeChange);
        return () => {
            window.removeEventListener('storage', handleThemeChange);
            window.removeEventListener('theme-set', handleThemeChange);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 bg-islamic dark:bg-islamic-dark">
            <InstallPWA />

            {/* Main Content */}
            <main className="flex-1 pb-24 relative z-10">
                {children}
            </main>

            {/* Mobile Bottom Navigation - Enhanced Aesthetics */}
            <div className="fixed bottom-0 left-0 right-0 px-4 pb-[env(safe-area-inset-bottom,1.5rem)] z-[100] pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800/40 px-2 py-3 rounded-[2.5rem] flex justify-around items-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] dark:shadow-none mb-2">
                        <MobileNavLink to="/" icon={<Home size={22} fill={isActive('/') ? "currentColor" : "none"} />} label="Beranda" active={isActive('/')} />
                        <MobileNavLink to="/quran" icon={<Book size={22} fill={isActive('/quran') ? "currentColor" : "none"} />} label="Quran" active={isActive('/quran')} />
                        <MobileNavLink to="/tracker" icon={<Trophy size={22} fill={isActive('/tracker') ? "currentColor" : "none"} />} label="Tracker" active={isActive('/tracker')} />
                        <MobileNavLink to="/ramadan" icon={<MoonStar size={22} fill={isActive('/ramadan') ? "currentColor" : "none"} />} label="Ramadan" active={isActive('/ramadan')} />
                        <MobileNavLink to="/zakat" icon={<Coins size={22} fill={isActive('/zakat') ? "currentColor" : "none"} />} label="Zakat" active={isActive('/zakat')} />
                        <MobileNavLink to="/muslimah" icon={<Heart size={22} fill={isActive('/muslimah') ? "currentColor" : "none"} />} label="Muslimah" active={isActive('/muslimah')} />
                    </nav>
                </div>
            </div>

            {/* Desktop Message */}
            <div className="hidden lg:block fixed bottom-4 left-4 text-[10px] text-slate-400 font-medium">
                Optimized for Mobile Viewing
            </div>
        </div>
    );
};

const NavLink = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
    <Link
        to={to}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 relative group ${active
            ? 'text-emerald-600 dark:text-emerald-400 font-black'
            : 'text-slate-500 dark:text-white-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
    >
        {active && (
            <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-500"></div>
        )}
        <div className={`transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${active ? 'text-emerald-500' : ''}`}>
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
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-2xl shadow-sm transition-all duration-500 relative flex-1 ${active ? 'text-emerald-600 dark:text-emerald-400 scale-105' : 'text-slate-400 dark:text-slate-500 hover:text-emerald-500'
            }`}
    >
        {active && (
            <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-3xl -z-10 scale-[1.4] blur-lg opacity-60 animate-pulse"></div>
        )}
        <div className={`transition-all duration-500 ${active ? 'animate-bounce-subtle text-emerald-600' : 'group-hover:scale-110'}`}>
            {icon}
        </div>
        <span className={`text-[7px] font-black uppercase tracking-[0.1em] transition-all duration-500 ${active ? 'opacity-100 translate-y-0.5' : 'opacity-60'}`}>
            {label}
        </span>
        {active && (
            <div className="absolute -bottom-1 w-4 h-1 bg-emerald-500 rounded-full blur-[1px]"></div>
        )}
    </Link>
);

export default Layout;
