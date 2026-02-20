import React, { useState, useEffect } from 'react';
import {
    MapPin,
    User,
    Calendar,
    Bell,
    CheckCircle2,
    ChevronRight,
    Loader2,
    Navigation,
    Sparkles,
    Moon
} from 'lucide-react';
import { api, City } from '../services/api';
import { format, addDays } from 'date-fns';
import { id } from 'date-fns/locale';

interface OnboardingProps {
    onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [userName, setUserName] = useState('');
    const [city, setCity] = useState<City | null>(null);
    const [locating, setLocating] = useState(false);
    const [ramadanStart, setRamadanStart] = useState('2026-03-01');
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    };

    const handleGeolocation = () => {
        setLocating(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const detectedCity = await api.getCityByLocation(latitude, longitude);
                        if (detectedCity) {
                            setCity(detectedCity);
                        }
                    } catch (error) {
                        console.error("Geolocation city error", error);
                    } finally {
                        setLocating(false);
                    }
                },
                () => setLocating(false),
                { timeout: 8000 }
            );
        } else {
            setLocating(false);
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        // Save to localStorage
        localStorage.setItem('muslim_app_user_name', userName);
        if (city) api.saveLastCity(city);
        localStorage.setItem('muslim_app_ramadan_start', new Date(ramadanStart).toISOString());

        // Calculate Hijri Offset
        try {
            const date = new Date(ramadanStart);
            const apiHijri = await api.getHijriDate(date);
            if (apiHijri) {
                const apiMonth = parseInt(apiHijri.month.number);
                const apiDay = parseInt(apiHijri.day);

                let offset = 0;
                if (apiMonth === 9) {
                    offset = 1 - apiDay;
                } else if (apiMonth < 9) {
                    offset = (9 - apiMonth) * 30 + (1 - apiDay);
                } else {
                    offset = (apiMonth - 9) * -30 + (1 - apiDay);
                }

                if (Math.abs(offset) > 5) offset = 0;
                localStorage.setItem('muslim_app_hijri_offset', offset.toString());
            }
        } catch (e) {
            console.error("Hijri offset calculation failed", e);
        }

        localStorage.setItem('muslim_app_setup_done', 'true');
        localStorage.setItem('muslim_app_adzan_enabled', 'true');

        // Notification Permission
        if ('Notification' in window) {
            await Notification.requestPermission();
        }

        setLoading(false);
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 flex flex-col transition-colors overflow-y-auto">
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-8 justify-center min-h-[600px]">

                {/* Progress Indicators */}
                <div className="flex gap-2 mb-12 justify-center">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-emerald-500' : 'w-4 bg-slate-100 dark:bg-slate-800'}`}
                        />
                    ))}
                </div>

                {/* Step Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {step === 1 && (
                        <div className="text-center space-y-8">
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-500/10">
                                <Sparkles size={48} />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Ahlan wa Sahlan</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Selamat datang di Qolbi. Mari atur lokasi Anda untuk jadwal sholat yang akurat.</p>
                            </div>

                            <button
                                onClick={handleGeolocation}
                                disabled={locating}
                                className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-500 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                                        {locating ? <Loader2 size={24} className="animate-spin" /> : <MapPin size={24} />}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Lokasi</p>
                                        <p className="text-sm font-black text-slate-800 dark:text-white">{city ? city.lokasi : 'Belum Terdeteksi'}</p>
                                    </div>
                                </div>
                                <Navigation size={20} className="text-emerald-500" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center space-y-8">
                            <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto text-amber-600 shadow-xl shadow-amber-500/10">
                                <User size={48} />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Siapa Nama Anda?</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Beri tahu kami nama Anda agar Qolbi terasa lebih personal.</p>
                            </div>

                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Masukkan nama panggilan..."
                                    className="w-full pl-16 pr-6 py-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-lg font-black text-slate-800 dark:text-white outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-8">
                            <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto text-rose-600 shadow-xl shadow-rose-500/10">
                                <Moon size={48} />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Kapan Ramadan?</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pilih perkiraan tanggal 1 Ramadan 1447H untuk menyesuaikan kalender Anda.</p>
                            </div>

                            <div className="relative">
                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                                <input
                                    type="date"
                                    value={ramadanStart}
                                    onChange={(e) => setRamadanStart(e.target.value)}
                                    className="w-full pl-16 pr-6 py-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-lg font-black text-slate-800 dark:text-white outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 transition-all shadow-inner appearance-none"
                                />
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center space-y-8">
                            <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-500/20">
                                <Bell size={48} />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Siap Beribadah?</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Kami akan aktifkan notifikasi adzan untuk membantu Anda menjaga waktu sholat.</p>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 flex items-center gap-6">
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Notifikasi Adzan</p>
                                    <p className="text-xs font-bold text-emerald-600/70">Waktunya Sholat & Imsak</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-12 space-y-4">
                    <button
                        onClick={handleNext}
                        disabled={(step === 1 && !city) || (step === 2 && !userName) || loading}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black py-6 rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 relative overflow-hidden group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                <span>{step === 4 ? 'Mulai Sekarang' : 'Lanjutkan'}</span>
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {step > 1 && !loading && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="w-full bg-transparent text-slate-400 font-black py-2 rounded-[2rem] text-xs uppercase tracking-widest hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                            Kembali
                        </button>
                    )}
                </div>
            </div>

            {/* Decoration */}
            <div className="absolute bottom-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
                <Moon size={240} />
            </div>
        </div>
    );
};

export default Onboarding;
