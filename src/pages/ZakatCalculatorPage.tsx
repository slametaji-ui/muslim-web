import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { Users, Coins, Calculator, Info, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ZakatCalculatorPage: React.FC = () => {
    const [personCount, setPersonCount] = useState<number>(1);
    const [ricePrice, setRicePrice] = useState<number>(15000); // Average price per liter/kg
    const [zakatType, setZakatType] = useState<'money' | 'rice'>('money');

    const amountPerPerson = zakatType === 'rice' ? 3.5 : ricePrice * 3.5;
    const totalAmount = amountPerPerson * personCount;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 transition-colors">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg mb-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <Coins size={120} />
                </div>
                <div className="relative z-10">
                    <Link to="/" className="absolute left-0 top-0 p-2 text-white/80 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-black mb-1 tracking-tight">Zakat Fitrah</h1>
                    <p className="text-primary-100 text-xs font-black uppercase tracking-widest opacity-80 mt-1">Sucikan Harta & Jiwa</p>
                </div>
            </div>
            
            <div className="max-w-md mx-auto px-6 pt-8">
                {/* Result Card */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-[3rem] p-10 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden mb-10 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
                    
                    <div className="relative z-10 text-center">
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary-100 mb-2">Total Zakat</h2>
                        <div className="text-5xl font-black mb-2 flex justify-center items-end gap-2 tabular-nums">
                            {zakatType === 'money' ? (
                                <>
                                    <span className="text-2xl mb-2">Rp</span>
                                    <span>{new Intl.NumberFormat('id-ID').format(totalAmount)}</span>
                                </>
                            ) : (
                                <>
                                    <span>{totalAmount}</span>
                                    <span className="text-2xl mb-2">Ltr</span>
                                </>
                            )}
                        </div>
                        <p className="text-primary-100/70 text-[10px] font-bold uppercase tracking-widest mt-4">Wajib ditunaikan sebelum Salat Idul Fitri</p>
                    </div>
                </div>

                {/* Input Controls */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 mb-8 shadow-sm">
                    {/* Toggle Type */}
                    <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl mb-8 shadow-inner border border-slate-100 dark:border-slate-700">
                        <button 
                            onClick={() => setZakatType('money')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${zakatType === 'money' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Coins size={14} />
                                Uang
                            </div>
                        </button>
                        <button 
                            onClick={() => setZakatType('rice')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${zakatType === 'rice' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Calculator size={14} />
                                Beras
                            </div>
                        </button>
                    </div>

                    {/* Person Count */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-3 pl-1">
                            <Users size={14} />
                            Jumlah Jiwa (Anggota Keluarga)
                        </label>
                        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <button 
                                onClick={() => setPersonCount(Math.max(1, personCount - 1))}
                                className="w-12 h-12 flex items-center justify-center font-black text-xl text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all"
                            >-</button>
                            <input 
                                type="number" 
                                value={personCount}
                                onChange={(e) => setPersonCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="flex-1 text-center bg-transparent font-black text-slate-800 dark:text-white outline-none"
                            />
                            <button 
                                onClick={() => setPersonCount(personCount + 1)}
                                className="w-12 h-12 flex items-center justify-center font-black text-xl text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all"
                            >+</button>
                        </div>
                    </div>

                    {/* Price per Liter (only for money) */}
                    {zakatType === 'money' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-3 pl-1">
                                <Coins size={14} />
                                Harga Beras per Liter (Rp)
                            </label>
                            <input 
                                type="number" 
                                value={ricePrice}
                                onChange={(e) => setRicePrice(parseInt(e.target.value) || 0)}
                                className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white font-black text-sm outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-[2rem] border border-primary-100 dark:border-primary-800/50 flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-primary-600 shadow-sm">
                        <Info size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-primary-900 dark:text-primary-300 text-sm mb-1 uppercase tracking-tight">Ketentuan Zakat</h3>
                        <p className="text-primary-700 dark:text-primary-400 text-[11px] leading-relaxed font-medium">
                            Besarnya zakat fitrah menurut Imam Syafi'i adalah satu sha' (± 3,5 liter atau 2,5 kg) beras yang biasa dimakan sehari-hari.
                        </p>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest px-2">
                        <CheckCircle2 size={14} className="text-primary-500" />
                        Niat untuk diri sendiri & keluarga
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm italic text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        "Nawaytu an ukhrija zakaatal fithri 'annii wa 'an jamyi'i maa yalzamunii nafaqatuhum syar'an fardhan lillaahi ta'aalaa."
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZakatCalculatorPage;
