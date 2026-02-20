import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Calendar, Droplets, BookOpen, Clock, Plus, Trash2, Info, Settings2, ChevronRight, CheckCircle2, ChevronLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, differenceInDays, addDays, isAfter, startOfDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface FastDebt {
    id: string;
    year: number;
    days: number;
    paid: number;
}

const WomenHealthPage: React.FC = () => {
    // --- State for Menstruation ---
    const [isMenstruating, setIsMenstruating] = useState(() => localStorage.getItem('muslim_app_is_menstruating') === 'true');
    const [periodDuration, setPeriodDuration] = useState(() => Number(localStorage.getItem('muslim_app_period_duration')) || 7);
    const [periodStartDate, setPeriodStartDate] = useState(() => localStorage.getItem('muslim_app_period_start_date') || '');
    const [showSettings, setShowSettings] = useState(false);

    // --- State for Fasting Debts ---
    const [fastDebts, setFastDebts] = useState<FastDebt[]>(() => {
        const saved = localStorage.getItem('muslim_app_fast_debts');
        return saved ? JSON.parse(saved) : [{ id: '1', year: 1446, days: 7, paid: 0 }];
    });

    // --- Effects for Persistence ---
    useEffect(() => {
        localStorage.setItem('muslim_app_is_menstruating', String(isMenstruating));
    }, [isMenstruating]);

    useEffect(() => {
        localStorage.setItem('muslim_app_period_duration', String(periodDuration));
    }, [periodDuration]);

    useEffect(() => {
        localStorage.setItem('muslim_app_period_start_date', periodStartDate);
    }, [periodStartDate]);

    useEffect(() => {
        localStorage.setItem('muslim_app_fast_debts', JSON.stringify(fastDebts));
    }, [fastDebts]);

    // --- Logic for Tracking ---
    const handleStartPeriod = () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        setPeriodStartDate(today);
        setIsMenstruating(true);
    };

    const handleStopPeriod = () => {
        setIsMenstruating(false);
        setPeriodStartDate('');
    };

    const calculatePeriodDay = () => {
        if (!isMenstruating || !periodStartDate) return 0;
        const start = startOfDay(new Date(periodStartDate));
        const today = startOfDay(new Date());
        return differenceInDays(today, start) + 1;
    };

    const currentDay = calculatePeriodDay();
    const estEndDate = periodStartDate ? addDays(new Date(periodStartDate), periodDuration - 1) : null;
    const progress = Math.min(100, Math.max(0, (currentDay / periodDuration) * 100));

    // --- Fasting Debt Handlers ---
    const updatePaidDays = (id: string, delta: number) => {
        setFastDebts(prev => prev.map(debt => {
            if (debt.id === id) {
                const newPaid = Math.min(debt.days, Math.max(0, debt.paid + delta));
                return { ...debt, paid: newPaid };
            }
            return debt;
        }));
    };

    const addDebtYear = () => {
        const newYear = fastDebts.length > 0 ? (fastDebts[0].year + 1) : 1447;
        setFastDebts(prev => [{ id: Date.now().toString(), year: newYear, days: 7, paid: 0 }, ...prev]);
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 transition-colors">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg mb-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <Heart size={120} />
                </div>
                <div className="relative z-10">
                    <Link to="/" className="absolute left-0 top-0 p-2 text-white/80 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-black mb-1 tracking-tight">Fitur Muslimah</h1>
                    <p className="text-primary-100 text-xs font-black uppercase  opacity-80 mt-1">Kesehatan & Ibadah</p>
                </div>
            </div>
            
            <div className="max-w-md mx-auto px-6 pt-6">
                
                {/* 1. Enhanced Menstruation Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase  flex items-center gap-2">
                             <Droplets size={16} className="text-rose-500" /> Pelacak Haid
                        </h3>
                        <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all text-slate-400"
                        >
                            <Settings2 size={18} />
                        </button>
                    </div>

                    {showSettings && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-rose-100 dark:border-rose-900/30 mb-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-[10px] font-black text-rose-500 uppercase  mb-4">Pengaturan Siklus</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Durasi Haid Rata-rata (Hari)</label>
                                    <div className="flex items-center gap-3">
                                        {[5, 6, 7, 8, 9, 10].map(d => (
                                            <button 
                                                key={d}
                                                onClick={() => setPeriodDuration(d)}
                                                className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${periodDuration === d ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}
                                            >{d}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`p-8 rounded-[3rem] transition-all duration-500 relative overflow-hidden shadow-2xl ${isMenstruating ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-200 dark:shadow-none' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white'}`}>
                        {/* Motif Backdrop */}
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 bg-white"></div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-80 ${isMenstruating ? 'text-rose-100' : 'text-slate-400'}`}>Status Anda</span>
                                    <h2 className="text-3xl font-black mt-1 tracking-tight">{isMenstruating ? 'Sedang Haid' : 'Sedang Suci'}</h2>
                                </div>
                                <div className={`p-4 rounded-2xl ${isMenstruating ? 'bg-white/20' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-500'}`}>
                                    <Droplets size={24} fill={isMenstruating ? "white" : "none"} />
                                </div>
                            </div>

                            {isMenstruating && (
                                <div className="mb-8 space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="text-sm font-black text-rose-50">
                                            Hari ke-{currentDay} <span className="opacity-60 text-xs font-bold">dari {periodDuration} hari</span>
                                        </div>
                                        {estEndDate && (
                                            <div className="text-[10px] font-bold opacity-80 uppercase  text-right">
                                                Estimasi Selesai:<br/>{format(estEndDate, 'dd MMM yyyy', { locale: id })}
                                            </div>
                                        )}
                                    </div>
                                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-white rounded-full transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                {!isMenstruating ? (
                                    <button 
                                        onClick={handleStartPeriod}
                                        className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase  shadow-xl shadow-rose-100 dark:shadow-none hover:bg-rose-600 transition-all active:scale-95"
                                    >Mulai Haid Sekarang</button>
                                ) : (
                                    <button 
                                        onClick={handleStopPeriod}
                                        className="flex-1 py-4 bg-white text-rose-600 rounded-2xl font-black text-[10px] uppercase  shadow-xl hover:bg-rose-50 transition-all active:scale-95"
                                    >Sudah Selesai / Suci</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Enhanced Qadha Puasa Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6 px-1">
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase ">Qadha Puasa Ramadan</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase  mt-0.5">Pantau tanggungan puasa Anda</p>
                        </div>
                        <button 
                            onClick={addDebtYear}
                            className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl hover:bg-primary-100 transition-all border border-primary-100 dark:border-primary-800 shadow-sm"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {fastDebts.map((debt) => (
                            <div key={debt.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl hover:shadow-primary-500/5 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center font-black text-xs shadow-inner">
                                            {debt.year}
                                        </div>
                                        <div>
                                            <div className="text-[8px] font-black text-slate-400 uppercase ">Tahun Hijriah</div>
                                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase leading-tight">Ramadan {debt.year} H</h4>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${debt.paid >= debt.days ? 'bg-primary-50 text-primary-600' : 'bg-secondary-50 text-secondary-600'}`}>
                                            {debt.paid >= debt.days ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                            <span className="text-[9px] font-black uppercase ">
                                                {debt.paid >= debt.days ? 'Lunas' : 'Tersisa'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase ">Progres Pelunasan</span>
                                        <span className="text-xs font-black text-slate-800 dark:text-white tabular-nums">{debt.paid} <span className="text-slate-400 font-bold">/ {debt.days} Hari</span></span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-1000 shadow-md shadow-primary-500/20"
                                            style={{ width: `${(debt.paid / debt.days) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => updatePaidDays(debt.id, -1)}
                                        className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase  border border-slate-100 dark:border-slate-700 active:scale-95 transition-all"
                                    >-1 Hari</button>
                                    <button 
                                        onClick={() => updatePaidDays(debt.id, 1)}
                                        disabled={debt.paid >= debt.days}
                                        className={`flex-[2] py-3 rounded-xl font-black text-[10px] uppercase  transition-all active:scale-95 shadow-lg shadow-primary-500/10 ${debt.paid >= debt.days ? 'bg-slate-100 text-slate-300' : 'bg-primary-600 text-white'}`}
                                    >Sudah Dibayar</button>
                                    <button 
                                        onClick={() => setFastDebts(prev => prev.filter(d => d.id !== debt.id))}
                                        className="p-3 text-slate-300 hover:text-rose-500 transition-all active:scale-95"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Knowledge / Adab Section */}
                <div className="space-y-4">
                    <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-[2.5rem] border border-primary-100 dark:border-primary-800/50 flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-primary-600 shadow-sm">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-primary-900 dark:text-primary-300 text-xs mb-1 uppercase ">Niat Mandi Wajib</h3>
                            <p className="text-primary-700 dark:text-primary-400 text-[10px] leading-relaxed font-bold italic mb-2">
                                "Nawaitul ghusla liraf'il hadatsil akbari minal haidhi fardhan lillaahi ta'aalaa."
                            </p>
                            <p className="text-[9px] text-primary-600/70 font-medium">Artinya: Aku berniat mandi untuk menghilangkan hadas besar dari haid, fardu karena Allah Ta'ala.</p>
                        </div>
                    </div>

                    <div className="bg-secondary-50 dark:bg-secondary-900/20 p-6 rounded-[2.5rem] border border-secondary-100 dark:border-secondary-800/50 flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-secondary-600 shadow-sm">
                            <Info size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-secondary-900 dark:text-secondary-300 text-xs mb-1 uppercase ">Wawasan Fiqh</h3>
                            <ul className="text-[10px] text-secondary-800 dark:text-secondary-400 space-y-2 font-bold leading-tight">
                                <li className="flex gap-2"><ChevronRight size={10} className="mt-0.5 shrink-0" /> Batas minimal haid adalah 24 jam.</li>
                                <li className="flex gap-2"><ChevronRight size={10} className="mt-0.5 shrink-0" /> Batas maksimal haid adalah 15 hari.</li>
                                <li className="flex gap-2"><ChevronRight size={10} className="mt-0.5 shrink-0" /> Masa suci minimal antara dua haid adalah 15 hari.</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WomenHealthPage;
