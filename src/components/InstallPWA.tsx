import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle2, Star, Sparkles, Share, PlusSquare } from 'lucide-react';

const InstallPWA: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) {
            setIsInstalled(true);
        }

        // Detect if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // For iOS, we show the prompt automatically after a short delay if not installed
        if (ios && !isStandalone) {
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        window.addEventListener('appinstalled', () => {
            setShowPrompt(false);
            setDeferredPrompt(null);
            setIsInstalled(true);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    if (isInstalled || !showPrompt) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500">
            <div 
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[3rem] p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom duration-700 pointer-events-auto"
                style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
                
                <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-8"></div>

                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-emerald-200 dark:shadow-none animate-bounce duration-[2000ms]">
                            <Download size={36} />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 p-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900">
                            <Star size={14} fill="currentColor" />
                        </div>
                        <div className="absolute -bottom-2 -left-2 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-lg border-2 border-emerald-500">
                            <Sparkles size={14} className="text-emerald-500" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Pasang Aplikasi Qolbi</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8 max-w-[280px]">
                        Nikmati pengalaman ibadah yang lebih lancar, cepat, dan tanpa gangguan browser.
                    </p>

                    <div className="w-full grid gap-3">
                        {!isIOS ? (
                            <button 
                                onClick={handleInstallClick}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-100 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                            >
                                <span>Pasang Sekarang</span>
                                <CheckCircle2 size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-white/5 text-left">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                                    <Sparkles size={12} /> Panduan Pemasangan iOS
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                                            <Share size={16} className="text-blue-500" />
                                        </div>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium pt-1">
                                            Tekan tombol <span className="font-bold text-slate-800 dark:text-white">Share</span> di bagian bawah browser Safari.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                                            <PlusSquare size={16} className="text-slate-800 dark:text-white" />
                                        </div>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium pt-1">
                                            Scroll ke bawah dan pilih <span className="font-bold text-slate-800 dark:text-white">Add to Home Screen</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <button 
                            onClick={() => setShowPrompt(false)}
                            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] uppercase text-[10px] tracking-[0.2em]"
                        >
                            Tutup
                        </button>
                    </div>
                    
                    <div className="mt-8 flex items-center gap-2 opacity-30 select-none">
                        <Smartphone size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Web App for Mobile</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstallPWA;
