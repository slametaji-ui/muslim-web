import React, { useState, useEffect } from 'react';
import { RotateCcw, Target, Volume2, VolumeX, Fingerprint, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

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
            setCount(prev => prev + 1);
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
        setDzikirIndex(prev => (prev + 1) % DZIKIR_LIST.length);
        setCount(0);
    };

    const prevDzikir = () => {
        setDzikirIndex(prev => (prev - 1 + DZIKIR_LIST.length) % DZIKIR_LIST.length);
        setCount(0);
    };

    const selectDzikir = (index: number) => {
        setDzikirIndex(index);
        setCount(0);
        setTarget(DZIKIR_LIST[index].target);
        setShowDzikirList(false);
    };

    return (
        <div className="max-w-md mx-auto w-full h-[100dvh] select-none flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
            <PageHeader 
                title="Tasbih" 
                rightElement={
                    <button 
                        onClick={() => setIsSoundOn(!isSoundOn)}
                        className={`p-2 rounded-xl transition-all ${isSoundOn ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}
                    >
                        {isSoundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                }
            />

            {/* Dzikir Display Card - Compacted */}
            <div className="px-5 mt-4 flex-shrink-0">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden text-center">
                    <div className="flex items-center justify-between mb-3 text-emerald-600">
                        <button onClick={prevDzikir} className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <button 
                            onClick={() => setShowDzikirList(true)}
                            className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2 border border-slate-100 dark:border-slate-700 shadow-sm"
                        >
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Pilih Dzikir</span>
                            <List size={10} />
                        </button>
                        <button onClick={nextDzikir} className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="mb-1">
                        <p className="font-serif text-2xl text-slate-800 dark:text-emerald-50 mb-1" dir="rtl">
                            {currentDzikir.arabic}
                        </p>
                        <h2 className="text-emerald-600 dark:text-emerald-400 font-black text-sm mb-0.5">{currentDzikir.latin}</h2>
                        <p className="text-slate-400 text-[9px] px-2 italic line-clamp-1">{currentDzikir.meaning}</p>
                    </div>
                </div>
            </div>

            {/* Counter Section - Compacted */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="relative mb-6">
                    <div className="absolute inset-0 scale-[1.5] blur-3xl rounded-full bg-emerald-400/5 pointer-events-none"></div>
                    <div className="text-[100px] font-black text-slate-800 dark:text-white leading-none tracking-tighter tabular-nums font-mono">
                        {count.toString().padStart(2, '0')}
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-emerald-600 text-white rounded-full px-3 py-0.5 flex items-center gap-1.5 shadow-lg border border-white/10">
                        <Target size={10} className="text-emerald-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Goal: {target || '∞'}</span>
                    </div>
                </div>

                <div className="w-full max-w-[240px] aspect-square relative">
                    <button 
                        onClick={handleIncrement}
                        className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-700 rounded-full shadow-[0_20px_40px_rgba(16,185,129,0.25)] dark:shadow-none border-[10px] border-white dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group active:scale-[0.96] transition-all duration-75"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
                        <Fingerprint size={48} className="text-white/30 group-active:text-white/70 transition-all mb-1" />
                        <span className="text-white/50 text-[9px] font-black uppercase tracking-widest">Sentuh</span>
                        <div className="absolute w-full h-full rounded-full border-[15px] border-white/10 group-active:animate-ping opacity-0 group-active:opacity-30"></div>
                    </button>
                </div>
            </div>

            {/* Reset Footer - Minimal */}
            <div className="p-6 pb-24 flex-shrink-0 flex justify-center border-t border-slate-50 dark:border-slate-900">
                <div className="flex items-center gap-2">
                    <div className="bg-slate-50 dark:bg-slate-900 p-1 rounded-2xl flex border border-slate-100 dark:border-slate-800">
                        {[33, 99, 100, 0].map(val => (
                            <button 
                                key={val}
                                onClick={() => setTarget(val)}
                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all ${target === val ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}
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
                                    className={`p-5 rounded-3xl text-left transition-all flex items-center justify-between group ${dzikirIndex === index ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                >
                                    <div>
                                        <div className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${dzikirIndex === index ? 'text-emerald-200' : 'text-emerald-600'}`}>T: {item.target}</div>
                                        <div className={`text-md font-black transition-colors ${dzikirIndex === index ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{item.latin}</div>
                                    </div>
                                    <div className={`text-xl font-serif ${dzikirIndex === index ? 'text-white' : 'text-slate-300 dark:text-emerald-800'}`}>{item.arabic}</div>
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setShowDzikirList(false)}
                            className="w-full mt-6 py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
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
