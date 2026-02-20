import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Calendar, Moon, Star, Clock, Bell, Info, ChevronLeft, Sparkles, MoonStar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, differenceInDays, isBefore, isAfter, startOfDay, addDays } from 'date-fns';
import { id } from 'date-fns/locale';

const RamadanPage: React.FC = () => {
    const [ramadanStart, setRamadanStart] = useState(() => {
        const saved = localStorage.getItem('muslim_app_ramadan_start');
        if (saved) {
            const date = new Date(saved);
            if (!isNaN(date.getTime())) return date;
        }
        return new Date('2026-03-01'); // Ramadan 2026 approx start
    });
    
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        localStorage.setItem('muslim_app_ramadan_start', ramadanStart.toISOString());
    }, [ramadanStart]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const ramadanEnd = addDays(ramadanStart, 30);
    const isRamadan = isAfter(currentTime, startOfDay(ramadanStart)) && isBefore(currentTime, startOfDay(ramadanEnd));
    
    const daysToRamadan = differenceInDays(startOfDay(ramadanStart), startOfDay(currentTime));
    
    // If Ramadan has passed, set countdown to next year (roughly 354 days apart)
    let displayDays = daysToRamadan;
    if (daysToRamadan < 0 && !isRamadan) {
        displayDays = daysToRamadan + 354; 
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 transition-colors">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg mb-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <MoonStar size={120} />
                </div>
                <div className="relative z-10">
                    <Link to="/" className="absolute left-0 top-0 p-2 text-white/80 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-black mb-1 ">Ramadan 1446H</h1>
                    <p className="text-primary-100 text-xs font-black uppercase  opacity-80 mt-1">Bulan Penuh Berkah</p>
                </div>
            </div>
            
            <div className="max-w-md mx-auto px-6 pt-8">
                {/* Hero Countdown / Status */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-[3rem] p-10 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden mb-10 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary-400/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10 text-center">
                        <div className="inline-flex p-4 bg-white/10 backdrop-blur-md rounded-3xl mb-6 border border-white/20">
                            <Moon className="text-yellow-200 fill-yellow-200" size={40} />
                        </div>
                        
                        {isRamadan ? (
                            <div>
                                <h2 className="text-sm font-black uppercase text-primary-100 mb-2">Marhaban ya Ramadan</h2>
                                <div className="text-4xl font-black mb-2 flex justify-center items-end gap-2">
                                    <span>Hari Ke-</span>
                                    <span className="text-secondary-300">{differenceInDays(currentTime, ramadanStart) + 1}</span>
                                </div>
                                <p className="text-primary-100/70 text-xs font-bold uppercase ">Semoga Berkah menyertai kita</p>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-sm font-black uppercase text-primary-100 mb-2">Menuju Ramadan</h2>
                                <div className="text-7xl font-black mb-2 tabular-nums">
                                    {displayDays}
                                </div>
                                <p className="text-primary-100/70 text-xs font-black uppercase ">Hari Lagi</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Date Setting */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 mb-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-primary-600 shadow-sm">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase ">Awal Ramadan</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold ">Prediksi mulai puasa</p>
                        </div>
                    </div>
                    
                    <input 
                        type="date" 
                        className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white font-black text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-inner"
                        value={ramadanStart instanceof Date && !isNaN(ramadanStart.getTime()) ? format(ramadanStart, 'yyyy-MM-dd') : '2025-03-01'}
                        onChange={(e) => setRamadanStart(new Date(e.target.value))}
                    />
                    
                    <div className="mt-4 flex items-start gap-2 opacity-60">
                        <Info size={14} className="text-secondary-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                            Awal Ramadan biasanya ditetapkan melalui Sidang Isbat. Silakan sesuaikan jika ada perbedaan.
                        </p>
                    </div>
                </div>

                {/* Sunnah & Amalan */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group transition-all hover:shadow-xl hover:shadow-primary-500/5 cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600">
                                <Star size={24} />
                            </div>
                            <span className="text-[10px] font-black text-primary-500 uppercase ">Amalan</span>
                        </div>
                        <h4 className="font-black text-slate-800 dark:text-white mb-1">Niat Puasa Ramadan</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">"Nawaitu shauma ghadin 'an ada'i fardhi syahri Ramadhana hadzihis sanati lillahi Ta'ala."</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group transition-all hover:shadow-xl hover:shadow-secondary-500/5 cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-secondary-50 dark:bg-secondary-900/30 rounded-2xl flex items-center justify-center text-secondary-600">
                                <Bell size={24} />
                            </div>
                            <span className="text-[10px] font-black text-secondary-500 uppercase ">Doa</span>
                        </div>
                        <h4 className="font-black text-slate-800 dark:text-white mb-1">Doa Buka Puasa</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">"Allahumma laka shumtu wa 'ala rizqika afthartu, bi-rahmatika ya arhamar-rahimin."</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RamadanPage;
