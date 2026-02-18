import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Calendar, Droplets, BookOpen, Clock, Plus, Trash2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface FastDebt {
    id: string;
    year: number;
    days: number;
    paid: number;
}

const WomenHealthPage: React.FC = () => {
    const [isMenstruating, setIsMenstruating] = useState(() => localStorage.getItem('muslim_app_is_menstruating') === 'true');
    const [fastDebts, setFastDebts] = useState<FastDebt[]>(() => {
        const saved = localStorage.getItem('muslim_app_fast_debts');
        return saved ? JSON.parse(saved) : [{ id: '1', year: 1445, days: 7, paid: 0 }];
    });
    
    useEffect(() => {
        localStorage.setItem('muslim_app_is_menstruating', String(isMenstruating));
    }, [isMenstruating]);

    useEffect(() => {
        localStorage.setItem('muslim_app_fast_debts', JSON.stringify(fastDebts));
    }, [fastDebts]);

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
        const newYear = fastDebts.length > 0 ? fastDebts[0].year + 1 : 1446;
        setFastDebts(prev => [{ id: Date.now().toString(), year: newYear, days: 7, paid: 0 }, ...prev]);
    };

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 transition-colors">
            <PageHeader title="Fitur Muslimah" />
            
            <div className="max-w-md mx-auto px-6 pt-8">
                {/* Menstruation Status Toggle */}
                <div className="relative mb-10">
                     <button 
                        onClick={() => setIsMenstruating(!isMenstruating)}
                        className={`w-full p-10 rounded-[3rem] transition-all duration-500 relative overflow-hidden group shadow-2xl ${isMenstruating ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white'}`}
                     >
                         {/* Background Decor */}
                         <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-all duration-700 -mr-16 -mt-16 ${isMenstruating ? 'bg-white/20 scale-150' : 'bg-rose-500/10'}`}></div>
                         
                         <div className="relative z-10 flex flex-col items-center">
                             <div className={`p-5 rounded-[2rem] mb-6 transition-all duration-500 ${isMenstruating ? 'bg-white/20 rotate-12 scale-110' : 'bg-rose-50 text-rose-500'}`}>
                                 <Droplets size={40} fill={isMenstruating ? "currentColor" : "none"} />
                             </div>
                             <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-2 opacity-80">Status Saat Ini</h2>
                             <div className="text-4xl font-black mb-2">
                                 {isMenstruating ? 'Sedang Haid' : 'Sedang Suci'}
                             </div>
                             <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 transition-all ${isMenstruating ? 'text-rose-100' : 'text-slate-400'}`}>
                                 {isMenstruating ? 'Tidak berkewajiban Sholat & Puasa' : 'Wajib menunaikan ibadah'}
                             </p>
                         </div>
                     </button>
                </div>

                {/* Fasting Debt Section */}
                <div className="flex items-center justify-between mb-6 px-1">
                    <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Hutang Puasa</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Pantau qadha puasa Anda</p>
                    </div>
                    <button 
                        onClick={addDebtYear}
                        className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100 dark:border-emerald-800"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="space-y-4 mb-10">
                    {fastDebts.map((debt) => (
                        <div key={debt.id} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Tahun Hijriah</div>
                                    <h4 className="text-xl font-black text-slate-800 dark:text-white">{debt.year} H</h4>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${debt.paid >= debt.days ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {debt.paid >= debt.days ? 'Lunas' : 'Belum Lunas'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                    <div 
                                        className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-lg"
                                        style={{ width: `${(debt.paid / debt.days) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-sm font-black text-slate-700 dark:text-slate-300 tabular-nums">
                                    {debt.paid}/{debt.days}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <button 
                                    onClick={() => updatePaidDays(debt.id, -1)}
                                    className="flex-1 py-3 bg-white dark:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 font-bold border border-slate-100 dark:border-slate-700 active:scale-95 transition-all"
                                >-1 Hari</button>
                                <button 
                                    onClick={() => updatePaidDays(debt.id, 1)}
                                    className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95 transition-all"
                                >Bayar Hutang</button>
                                <button 
                                    onClick={() => setFastDebts(prev => prev.filter(d => d.id !== debt.id))}
                                    className="px-4 bg-rose-50 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Adab Suci Section */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50 flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-indigo-600 shadow-sm">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-indigo-900 dark:text-indigo-300 text-sm mb-1 uppercase tracking-tight">Niat Mandi Wajib</h3>
                        <p className="text-indigo-700 dark:text-indigo-400 text-[11px] leading-relaxed font-medium italic">
                            "Nawaitul ghusla liraf'il hadatsil akbari minal haidhi fardhan lillaahi ta'aalaa."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WomenHealthPage;
