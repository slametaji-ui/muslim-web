import React, { useState, useEffect } from 'react';
import { RotateCcw, Target, Volume2, VolumeX, Fingerprint, ChevronLeft, ChevronRight, List, Library, CheckCircle2, ChevronLeft as BackIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DzikirItem {
    id: string;
    arabic: string;
    latin: string;
    meaning: string;
    target: number;
}

const DZIKIR_LIST: DzikirItem[] = [
    {
        id: 'istighfar',
        arabic: 'أَسْتَغْفِرُ اللهَ الْعَظِيْمَ',
        latin: "Astaghfirullahal 'Adziim",
        meaning: 'Aku memohon ampun kepada Allah Yang Maha Agung',
        target: 33
    },
    {
        id: 'subhanallah',
        arabic: 'سُبْحَانَ اللهِ',
        latin: 'Subhanallah',
        meaning: 'Maha Suci Allah',
        target: 33
    },
    {
        id: 'alhamdulillah',
        arabic: 'الْحَمْدُ لِلَّهِ',
        latin: 'Alhamdulillah',
        meaning: 'Segala puji bagi Allah',
        target: 33
    },
    {
        id: 'allahuakbar',
        arabic: 'اللهُ أَكْبَرُ',
        latin: 'Allahu Akbar',
        meaning: 'Allah Maha Besar',
        target: 33
    },
    {
        id: 'tahlil',
        arabic: 'لَا إِلَهَ إِلَّا اللهُ',
        latin: 'Laailaha Illallah',
        meaning: 'Tiada Tuhan selain Allah',
        target: 100
    }
];

const TasbihPage: React.FC = () => {
    const [dzikirIndex, setDzikirIndex] = useState(0);
    const [count, setCount] = useState(() => {
        return Number(localStorage.getItem('muslim_app_tasbih_count') || 0);
    });
    const [target, setTarget] = useState<number>(33);
    const [isSoundOn, setIsSoundOn] = useState(() => {
        return localStorage.getItem('muslim_app_tasbih_sound') !== 'false';
    });
    const [showDzikirList, setShowDzikirList] = useState(false);

    const currentDzikir = DZIKIR_LIST[dzikirIndex];

    useEffect(() => {
        localStorage.setItem('muslim_app_tasbih_count', count.toString());
    }, [count]);

    useEffect(() => {
        localStorage.setItem('muslim_app_tasbih_sound', isSoundOn.toString());
    }, [isSoundOn]);

    const handleIncrement = () => {
        if (target > 0 && count >= target) {
            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
            setCount(1);
        } else {
            setCount((prev: number) => prev + 1);
            if ('vibrate' in navigator) navigator.vibrate(50);
            
            if (isSoundOn) {
                try {
                    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();

                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);

                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.1);
                    
                    setTimeout(() => audioCtx.close(), 150);
                } catch (e) {
                    console.error('Audio feedback error:', e);
                }
            }
        }
    };

    const handleReset = () => {
        if (window.confirm('Reset hitungan?')) {
            setCount(0);
        }
    };

    const nextDzikir = () => {
        setDzikirIndex((prev: number) => (prev + 1) % DZIKIR_LIST.length);
        setCount(0);
    };

    const prevDzikir = () => {
        setDzikirIndex((prev: number) => (prev - 1 + DZIKIR_LIST.length) % DZIKIR_LIST.length);
        setCount(0);
    };

    const selectDzikir = (index: number) => {
        setDzikirIndex(index);
        setCount(0);
        setTarget(DZIKIR_LIST[index].target);
        setShowDzikirList(false);
    };

    return (
        <div className="max-w-md mx-auto w-full h-[100dvh] select-none flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg text-white text-center relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <Fingerprint size={120} />
                </div>
                <div className="relative z-10">
                    <Link to="/" className="absolute left-0 top-0 p-2 text-white/80 hover:text-white transition-colors">
                        <BackIcon size={24} />
                    </Link>
                    <h1 className="text-2xl font-black mb-1 tracking-tight">Tasbih Digital</h1>
                    <p className="text-primary-100 text-xs font-black uppercase  opacity-80 mt-1">Dzikir & Mengingat Allah</p>
                    
                    <button 
                        onClick={() => setIsSoundOn(!isSoundOn)}
                        className="absolute right-0 top-0 p-2 text-white/80 hover:text-white transition-colors"
                    >
                        {isSoundOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
                    </button>
                </div>
            </div>

            {/* Dzikir Display Card */}
            <div className="px-5 mt-6 flex-shrink-0">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-xl shadow-primary-500/5 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <Library size={100} />
                    </div>
                    <div className="flex items-center justify-between mb-4 text-primary-600 relative z-10">
                        <button onClick={prevDzikir} className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={() => setShowDzikirList(true)}
                            className="bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary-100/50 dark:border-primary-800 shadow-inner"
                        >
                            <span className="text-[10px] font-black uppercase  leading-none">Pilih Dzikir</span>
                            <List size={12} />
                        </button>
                        <button onClick={nextDzikir} className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
 
                    <div className="text-center relative z-10">
                        <p className="font-serif text-3xl text-slate-800 dark:text-primary-50 mb-2 leading-relaxed" dir="rtl">
                            {currentDzikir.arabic}
                        </p>
                        <h2 className="text-primary-600 dark:text-primary-400 font-black text-lg mb-1">{currentDzikir.latin}</h2>
                        <p className="text-slate-400 text-xs px-4 italic leading-relaxed">{currentDzikir.meaning}</p>
                    </div>
                </div>
            </div>

            {/* Counter Section - Enhanced with Glow */}
            <div className="flex-1 flex flex-col items-center gap-1 justify-center mt-2 relative">
                <div className="relative ">
                    <div className="absolute inset-0 scale-[2.5] blur-[80px] rounded-full bg-primary-400/20 dark:bg-primary-500/10 pointer-events-none"></div>
                    <div className="absolute inset-0 scale-[1.5] blur-3xl rounded-full bg-secondary-400/10 pointer-events-none"></div>
                    
                    <div className="text-[50px] font-black text-slate-800 dark:text-white leading-none tracking-tighter tabular-nums font-mono drop-shadow-2xl relative z-10">
                        {count.toString().padStart(2, '0')}
                    </div>
                </div>

                <div className="bg-slate-900 dark:bg-primary-600 text-white rounded-full px-4 py-1.5 flex items-center gap-2 shadow-xl border border-white/10 relative z-20">
                    <Target size={12} className="text-primary-300" />
                    <span className="text-[10px] font-black uppercase ">Target: {target || '∞'}</span>
                </div>

                <div className="w-full max-w-[190px] aspect-square relative">
                    {/* Bead Visual Effect */}
                    <div className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-primary-200 dark:border-primary-800 animate-[spin_20s_linear_infinite]"></div>
                    
                    <button 
                        onClick={handleIncrement}
                        className="w-[70%] h-[70%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-full shadow-[0_40px_80px_-15px_rgba(16,185,129,0.5)] dark:shadow-[0_20px_40px_-5px_rgba(16,185,129,0.2)] border-[12px] border-white dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group active:scale-[0.85] transition-all duration-75"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
                        <Fingerprint size={56} className="text-white/40 group-active:text-white transition-all mb-2" />
                        <span className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em] animate-pulse group-active:scale-95">Tap</span>
                        <div className="absolute w-full h-full rounded-full border-[30px] border-white/10 animate-ping hidden group-active:block"></div>
                    </button>
                </div>
            </div>

            {/* Reset Footer - Minimal */}
            <div className="p-6 pb-24 flex-shrink-0 flex justify-center border-t border-slate-50 dark:border-slate-900">
                <div className="flex items-center gap-2">
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl flex border border-slate-100 dark:border-slate-800 shadow-inner">
                        {[33, 99, 100, 0].map(val => (
                            <button 
                                key={val}
                                onClick={() => setTarget(val)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${target === val ? 'bg-primary-600 text-white shadow-lg scale-95' : 'text-slate-400 hover:text-primary-500'}`}
                            >
                                {val === 0 ? '∞' : val}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleReset}
                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-300 hover:text-rose-500 transition-colors shadow-sm border border-slate-100 dark:border-slate-700 active:scale-90"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>

            {/* Dzikir List Modal Overlay */}
            {showDzikirList && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full rounded-t-[2.5rem] p-6 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 shadow-2xl">
                        <div className="w-10 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6"></div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 px-2 tracking-tight uppercase">Dzikir Pilihan</h3>
                        <div className="grid gap-3">
                             {DZIKIR_LIST.map((item, index) => (
                                <button 
                                    key={item.id}
                                    onClick={() => selectDzikir(index)}
                                    className={`p-6 rounded-[2rem] text-left transition-all flex items-center justify-between group border ${dzikirIndex === index ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white border-transparent shadow-xl shadow-primary-500/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/30'}`}
                                >
                                    <div className="flex-1">
                                        <div className={`text-[9px] font-black uppercase  mb-1 ${dzikirIndex === index ? 'text-primary-100' : 'text-secondary-600'}`}>Target: {item.target}</div>
                                        <div className={`text-md font-black transition-colors ${dzikirIndex === index ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{item.latin}</div>
                                        <div className={`text-[10px] font-medium leading-tight mt-1 opacity-70 ${dzikirIndex === index ? 'text-primary-50' : 'text-slate-500'}`}>{item.meaning}</div>
                                    </div>
                                    <div className={`text-2xl font-serif mr-2 ${dzikirIndex === index ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`}>{item.arabic}</div>
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setShowDzikirList(false)}
                            className="w-full mt-6 py-2 text-slate-400 font-bold text-[10px] uppercase "
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasbihPage;
