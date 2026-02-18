import React, { useState, useEffect } from 'react';
import { RotateCcw, Target, Volume2, VolumeX, Fingerprint, ChevronLeft, ChevronRight, List } from 'lucide-react';
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
            // Optional: Auto switch to next dzikir? Maybe too aggressive.
        } else {
            setCount(prev => prev + 1);
            if ('vibrate' in navigator) navigator.vibrate(50);
            
            if (isSoundOn) {
                // Play subtle beep using Web Audio API for better reliability and performance
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
        <div className="max-w-md mx-auto w-full pb-20 select-none min-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
                <Link to="/" className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <div className="text-center">
                    <h1 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Tasbih Digital</h1>
                    <div className="text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase px-3">Muslim App</div>
                </div>
                <button 
                    onClick={() => setIsSoundOn(!isSoundOn)}
                    className={`p-2 rounded-xl transition-all ${isSoundOn ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}
                >
                    {isSoundOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>
            </div>

            {/* Dzikir Display Card */}
            <div className="px-6 mt-8">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-900/5 border border-slate-100 dark:border-slate-700 relative overflow-hidden text-center group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                        <List size={120} />
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <button onClick={prevDzikir} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full text-emerald-600 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={() => setShowDzikirList(true)}
                            className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full flex items-center gap-2 border border-emerald-100 dark:border-emerald-800/50"
                        >
                            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest leading-none">Pilih Dzikir</span>
                            <List size={12} className="text-emerald-600" />
                        </button>
                        <button onClick={nextDzikir} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full text-emerald-600 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="mb-4">
                        <p className="font-serif text-3xl leading-loose text-slate-800 dark:text-emerald-50 mb-4 animate-in fade-in zoom-in-95 duration-500" dir="rtl">
                            {currentDzikir.arabic}
                        </p>
                        <h2 className="text-emerald-600 dark:text-emerald-400 font-black text-lg mb-1">{currentDzikir.latin}</h2>
                        <p className="text-slate-400 text-xs px-4 italic leading-relaxed">{currentDzikir.meaning}</p>
                    </div>
                </div>
            </div>

            {/* Counter Section */}
            <div className="flex-1 flex flex-col items-center justify-center py-10">
                <div className="relative mb-12">
                    {/* Ring background */}
                    <div className="absolute inset-0 scale-[2] blur-3xl rounded-full bg-emerald-400/10 pointer-events-none"></div>
                    <div className="text-[120px] font-black text-slate-800 dark:text-white leading-none tracking-tighter tabular-nums drop-shadow-2xl font-mono">
                        {count.toString().padStart(2, '0')}
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-emerald-600 text-white rounded-full px-4 py-1 flex items-center gap-2 shadow-xl">
                        <Target size={12} className="text-emerald-400 dark:text-emerald-100" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Goal: {target}</span>
                    </div>
                </div>

                <div className="px-12 w-full max-w-sm">
                    <button 
                        onClick={handleIncrement}
                        className="w-full aspect-square bg-gradient-to-br from-emerald-500 to-teal-700 rounded-full shadow-[0_30px_60px_rgba(16,185,129,0.3)] dark:shadow-none border-[14px] border-white dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group active:scale-[0.97] transition-all duration-75"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
                        <Fingerprint size={72} className="text-white/40 group-active:text-white/80 transition-all mb-2" />
                        <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Sentuh</span>
                        
                        <div className="absolute w-full h-full rounded-full border-[20px] border-white/10 opacity-0 group-active:animate-ping opacity-0 group-active:opacity-40"></div>
                    </button>
                </div>
            </div>

            {/* Reset Footer */}
            <div className="pb-8 flex justify-center px-6">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex border border-slate-200 dark:border-slate-700">
                        {[33, 99, 100, 0].map(val => (
                            <button 
                                key={val}
                                onClick={() => setTarget(val)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${target === val ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}
                            >
                                {val === 0 ? '∞' : val}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleReset}
                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-colors shadow-sm border border-slate-100 dark:border-slate-700"
                        title="Reset"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Dzikir List Modal Overlay */}
            {showDzikirList && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full rounded-t-[3rem] p-8 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 shadow-2xl">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8"></div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 px-2">Dzikir Pilihan</h3>
                        <div className="grid gap-4">
                            {DZIKIR_LIST.map((item, index) => (
                                <button 
                                    key={item.id}
                                    onClick={() => selectDzikir(index)}
                                    className={`p-6 rounded-[2rem] text-left transition-all flex items-center justify-between group ${dzikirIndex === index ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                >
                                    <div>
                                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${dzikirIndex === index ? 'text-emerald-200' : 'text-emerald-600'}`}>Target: {item.target}</div>
                                        <div className={`text-lg font-black transition-colors ${dzikirIndex === index ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{item.latin}</div>
                                        <div className={`text-xs mt-1 opacity-70 ${dzikirIndex === index ? 'text-white' : 'text-slate-500'}`}>{item.meaning}</div>
                                    </div>
                                    <div className={`text-2xl font-serif ${dzikirIndex === index ? 'text-white' : 'text-slate-300 dark:text-emerald-800'}`}>{item.arabic}</div>
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setShowDzikirList(false)}
                            className="w-full mt-8 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest"
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
