import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Calendar, Moon, Star, Clock, Bell, Info } from 'lucide-react';
import { format, differenceInDays, isBefore, isAfter, startOfDay, addDays } from 'date-fns';
import { id } from 'date-fns/locale';

const RamadanPage: React.FC = () => {
    const [ramadanStart, setRamadanStart] = useState(() => {
        const saved = localStorage.getItem('muslim_app_ramadan_start');
        if (saved) {
            const date = new Date(saved);
            if (!isNaN(date.getTime())) return date;
        }
        return new Date('2025-03-01'); // Default estimation
    });
    
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        localStorage.setItem('muslim_app_ramadan_start', ramadanStart.toISOString());
    }, [ramadanStart]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const daysToRamadan = differenceInDays(startOfDay(ramadanStart), startOfDay(currentTime));
    const isRamadan = isAfter(currentTime, ramadanStart) && isBefore(currentTime, addDays(ramadanStart, 30));
    
    // If Ramadan has passed, set countdown to next year (roughly 354 days apart)
    let displayDays = daysToRamadan;
    if (daysToRamadan < 0 && !isRamadan) {
        // Simple approximation for next Hijri year
        displayDays = daysToRamadan + 354; 
    }

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 transition-colors">
            <PageHeader title="Ramadan 1446H" />
            
            <div className="max-w-md mx-auto px-6 pt-8">
                {/* Hero Countdown / Status */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden mb-10 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10 text-center">
                        <div className="inline-flex p-4 bg-white/10 backdrop-blur-md rounded-3xl mb-6 border border-white/20">
                            <Moon className="text-yellow-200 fill-yellow-200" size={40} />
                        </div>
                        
                        {isRamadan ? (
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-100 mb-2">Marhaban ya Ramadan</h2>
                                <div className="text-6xl font-black mb-2 flex justify-center items-end gap-2">
                                    <span>Hari Ke-</span>
                                    <span className="text-yellow-300">{differenceInDays(currentTime, ramadanStart) + 1}</span>
                                </div>
                                <p className="text-indigo-100/70 text-xs font-bold uppercase tracking-widest">Semoga Berkah menyertai kita</p>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-100 mb-2">Menuju Ramadan</h2>
                                <div className="text-7xl font-black mb-2 tabular-nums">
                                    {displayDays}
                                </div>
                                <p className="text-indigo-100/70 text-xs font-black uppercase tracking-widest">Hari Lagi</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Date Setting */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 mb-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-indigo-600 shadow-sm">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-tight">Prediksi Awal Ramadan</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest">Atur tanggal mulai ramadan</p>
                        </div>
                    </div>
                    
                    <input 
                        type="date" 
                        className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white font-black text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                        value={ramadanStart instanceof Date && !isNaN(ramadanStart.getTime()) ? format(ramadanStart, 'yyyy-MM-dd') : '2025-03-01'}
                        onChange={(e) => setRamadanStart(new Date(e.target.value))}
                    />
                    
                    <div className="mt-4 flex items-start gap-2 opacity-60">
                        <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                            Awal Ramadan biasanya ditetapkan melalui Sidang Isbat. Silakan sesuaikan jika ada perbedaan.
                        </p>
                    </div>
                </div>

                {/* Sunnah & Amalan */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-none cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Star size={24} />
                            </div>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Amalan</span>
                        </div>
                        <h4 className="font-black text-slate-800 dark:text-white mb-1">Niat Puasa Ramadan</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">"Nawaitu shauma ghadin 'an ada'i fardhi syahri Ramadhana hadzihis sanati lillahi Ta'ala."</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-none cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                                <Bell size={24} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Doa</span>
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
