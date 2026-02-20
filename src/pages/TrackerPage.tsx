import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Calendar, Trophy, Zap, Star, Heart, Clock, ChevronLeft, ChevronRight, Layout as LayoutIcon } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface TrackerItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    category: 'mandatory' | 'sunnah' | 'dzikir';
}

const trackerItems: TrackerItem[] = [
    { id: 'subuh', label: 'Sholat Subuh', icon: <Clock size={20} />, color: 'bg-emerald-500', category: 'mandatory' },
    { id: 'dzuhur', label: 'Sholat Dzuhur', icon: <Clock size={20} />, color: 'bg-emerald-500', category: 'mandatory' },
    { id: 'ashar', label: 'Sholat Ashar', icon: <Clock size={20} />, color: 'bg-emerald-500', category: 'mandatory' },
    { id: 'maghrib', label: 'Sholat Maghrib', icon: <Clock size={20} />, color: 'bg-emerald-500', category: 'mandatory' },
    { id: 'isya', label: 'Sholat Isya', icon: <Clock size={20} />, color: 'bg-emerald-500', category: 'mandatory' },
    { id: 'dhuha', label: 'Sholat Dhuha', icon: <Zap size={20} />, color: 'bg-amber-500', category: 'sunnah' },
    { id: 'tahajjud', label: 'Tahajjud / Witir', icon: <Star size={20} />, color: 'bg-indigo-500', category: 'sunnah' },
    { id: 'quran', label: 'Baca Al-Quran', icon: <Heart size={20} />, color: 'bg-rose-500', category: 'dzikir' },
    { id: 'shadaqah', label: 'Sedekah Harian', icon: <Trophy size={20} />, color: 'bg-orange-500', category: 'dzikir' },
];

const TrackerPage: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [history, setHistory] = useState<Record<string, string[]>>(() => {
        const saved = localStorage.getItem('muslim_app_tracker_history');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('muslim_app_tracker_history', JSON.stringify(history));
    }, [history]);

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const todayDone = history[dateKey] || [];

    const toggleItem = (id: string) => {
        setHistory(prev => {
            const current = prev[dateKey] || [];
            const next = current.includes(id) 
                ? current.filter(item => item !== id)
                : [...current, id];
            return { ...prev, [dateKey]: next };
        });
    };

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

    const getProgress = (date: Date) => {
        const key = format(date, 'yyyy-MM-dd');
        const done = history[key] || [];
        return (done.length / trackerItems.length) * 100;
    };

    return (
        <div className="max-w-md mx-auto w-full pb-32 dark:bg-slate-950 min-h-screen transition-colors">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-600 pt-12 pb-8 px-6 rounded-b-[2.5rem] shadow-lg mb-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <Trophy size={140} />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-black tracking-tight">Tracker Ibadah</h1>
                        <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                            <Trophy size={16} className="text-amber-300" />
                            <span className="text-xs font-black">{Object.values(history).flat().length} Total</span>
                        </div>
                    </div>

                    {/* Weekly Calendar */}
                    <div className="flex justify-between items-center bg-black/10 rounded-3xl p-4 border border-white/5">
                        {weekDays.map((day, idx) => {
                            const active = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, new Date());
                            const progress = getProgress(day);
                            
                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => setSelectedDate(day)}
                                    className={`flex flex-col items-center gap-2 transition-all ${active ? 'scale-110' : 'opacity-60'}`}
                                >
                                    <span className={`text-[8px] font-black uppercase ${active ? 'text-white' : 'text-white/60'}`}>
                                        {format(day, 'EEE', { locale: id })}
                                    </span>
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-white text-emerald-700 shadow-xl' : 'bg-white/10 text-white'}`}>
                                            <span className="text-xs font-black">{format(day, 'd')}</span>
                                        </div>
                                        {progress > 0 && (
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 border border-emerald-700"></div>
                                        )}
                                    </div>
                                    {isToday && !active && <div className="w-1 h-1 rounded-full bg-white"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Daily Dashboard */}
            <div className="px-6 mb-8">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Zap size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Hari Ini</p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">{todayDone.length} dari {trackerItems.length} Selesai</h3>
                        </div>
                    </div>
                    <div className="relative w-12 h-12">
                         <svg className="w-full h-full -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-slate-800" />
                            <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-emerald-500" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * (todayDone.length / trackerItems.length))} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-black text-emerald-600">{Math.round((todayDone.length / trackerItems.length) * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracker List Groups */}
            <div className="px-6 space-y-8">
                {['mandatory', 'sunnah', 'dzikir'].map((cat) => {
                    const items = trackerItems.filter(i => i.category === cat);
                    return (
                        <div key={cat}>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-3">
                                <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
                                {cat === 'mandatory' ? 'Wajib' : cat === 'sunnah' ? 'Sunnah' : 'Amalan'}
                            </h4>
                            <div className="space-y-3">
                                {items.map((item) => {
                                    const done = todayDone.includes(item.id);
                                    return (
                                        <button 
                                            key={item.id}
                                            onClick={() => toggleItem(item.id)}
                                            className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all ${done ? 'bg-emerald-600 text-white shadow-xl scale-[1.02]' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${done ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                                                    {item.icon}
                                                </div>
                                                <h3 className="font-black text-sm uppercase tracking-tight">{item.label}</h3>
                                            </div>
                                            <div className={`transition-all ${done ? 'text-white' : 'text-slate-200'}`}>
                                                {done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TrackerPage;
