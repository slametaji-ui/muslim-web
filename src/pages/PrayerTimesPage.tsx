import React, { useState, useEffect } from 'react';
import { api, City, PrayerTimes } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Loader2, Navigation, Sunrise, Sun, Moon, Volume2, RotateCw, Clock, CheckSquare, Circle, BookOpen, Library, Fingerprint, Sparkles, Download, User, Monitor, Layout as LayoutIcon, ChevronRight, CheckCircle2, MoonStar, Coins } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface HijriDateInfo {
    day: string;
    month: { en: string; ar: string };
    year: string;
}

const PrayerTimesPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [city, setCity] = useState<City | null>(null);
    const [schedule, setSchedule] = useState<PrayerTimes | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activePrayer, setActivePrayer] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<string>('');
    const [hijriDate, setHijriDate] = useState<HijriDateInfo | null>(null);
    const [notifiedPrayer, setNotifiedPrayer] = useState<string | null>(null);
    const [showAdzanModal, setShowAdzanModal] = useState(false);
    const [userName, setUserName] = useState(() => localStorage.getItem('muslim_app_user_name') || '');
    const [isAdzanEnabled, setIsAdzanEnabled] = useState(() => localStorage.getItem('muslim_app_adzan_enabled') === 'true');
    const [showNameInput, setShowNameInput] = useState(!localStorage.getItem('muslim_app_user_name'));
    const [hijriOffset, setHijriOffset] = useState(() => Number(localStorage.getItem('muslim_app_hijri_offset')) || 0);
    const [madhab, setMadhab] = useState(() => localStorage.getItem('muslim_app_madhab') || 'shafi');
    const [theme, setTheme] = useState(() => (localStorage.getItem('theme') || 'light') as 'light' | 'dark');
    const [locating, setLocating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<City[]>([]);
    
    const [prayerStatus, setPrayerStatus] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('muslim_app_prayer_status');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const today = format(new Date(), 'yyyy-MM-dd');
                if (parsed.date === today) return parsed.status;
            } catch (e) { return {}; }
        }
        return {};
    });

    const adzanAudioRef = React.useRef<HTMLAudioElement | null>(null);

    const calculationOptions = {
        madhab: madhab === 'hanafi' ? 2 : 1,
        hijriOffset: hijriOffset
    };

    useEffect(() => {
        adzanAudioRef.current = new Audio('https://www.islamcan.com/audio/adhan/azan1.mp3');
        return () => {
            if (adzanAudioRef.current) {
                adzanAudioRef.current.pause();
                adzanAudioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (schedule) {
            const times = [
                { name: 'Subuh', time: schedule.jadwal.subuh },
                { name: 'Dzuhur', time: schedule.jadwal.dzuhur },
                { name: 'Ashar', time: schedule.jadwal.ashar },
                { name: 'Maghrib', time: schedule.jadwal.maghrib },
                { name: 'Isya', time: schedule.jadwal.isya },
            ];

            const now = currentTime;
            let foundActive = null;
            for (const t of times) {
                const [h, m] = t.time.split(':').map(Number);
                const pStart = new Date();
                pStart.setHours(h, m, 0);
                const pEnd = new Date(pStart);
                pEnd.setMinutes(pStart.getMinutes() + 20);

                if (now >= pStart && now <= pEnd) {
                    foundActive = t.name;
                    break;
                }
            }
            setActivePrayer(foundActive);

            if (foundActive && foundActive !== notifiedPrayer) {
                setNotifiedPrayer(foundActive);
                if (isAdzanEnabled) {
                    setShowAdzanModal(true);
                    if (adzanAudioRef.current) {
                        adzanAudioRef.current.currentTime = 0;
                        adzanAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
                    }
                }
            } else if (!foundActive) {
                setNotifiedPrayer(null);
            }

            const next = getNextPrayer(schedule);
            if (next) {
                const [h, m] = next.time.split(':').map(Number);
                const target = new Date();
                target.setHours(h, m, 0);
                if (target < now) target.setDate(target.getDate() + 1);

                const diff = target.getTime() - now.getTime();
                if (diff > 0) {
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    setCountdown(`${hours}j ${minutes}m`);
                }
            }
        }
    }, [currentTime, schedule, isAdzanEnabled, notifiedPrayer]);

    useEffect(() => {
        const cachedCity = api.getLastCity();
        if (cachedCity) {
            setCity(cachedCity);
            loadData(cachedCity.id);
        } else {
            handleGeolocation();
        }
    }, [madhab]);

    const handleGeolocation = () => {
        setLocating(true);
        setLoading(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const detectedCity = await api.getCityByLocation(latitude, longitude);
                        if (detectedCity) {
                            setCity(detectedCity);
                            api.saveLastCity(detectedCity);
                            loadData(detectedCity.id);
                        } else {
                            loadDefaultCity();
                        }
                    } catch (error) {
                        loadDefaultCity();
                    } finally {
                        setLocating(false);
                    }
                },
                () => {
                    loadDefaultCity();
                    setLocating(false);
                },
                { timeout: 8000 }
            );
        } else {
            loadDefaultCity();
            setLocating(false);
        }
    };

    const loadDefaultCity = async () => {
        const jakarta: City = { id: '1301', lokasi: 'DKI JAKARTA' };
        setCity(jakarta);
        loadData('1301');
    };

    const loadData = async (cityId: string, forceRefresh = false) => {
        setLoading(true);
        try {
            const today = new Date();
            const dailyData = await api.getPrayerTimes(cityId, today, forceRefresh);
            
            if (dailyData?.koordinat) {
                const localOverride = api.getLocalPrayerTimes(
                    dailyData.koordinat.lat, 
                    dailyData.koordinat.lon, 
                    today,
                    calculationOptions
                );
                setSchedule(localOverride);
            } else {
                setSchedule(dailyData);
            }

            const hijri = await api.getHijriDate(today);
            if (hijri) setHijriDate(hijri);
        } catch (error) {
            console.error('Data load error', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const syncSettings = () => {
            setUserName(localStorage.getItem('muslim_app_user_name') || '');
            setIsAdzanEnabled(localStorage.getItem('muslim_app_adzan_enabled') === 'true');
            setHijriOffset(Number(localStorage.getItem('muslim_app_hijri_offset')) || 0);
            setTheme((localStorage.getItem('theme') || 'light') as 'light' | 'dark');
            const cachedCity = api.getLastCity();
            if (cachedCity && city?.id !== cachedCity.id) {
                setCity(cachedCity);
                loadData(cachedCity.id);
            }
        };

        window.addEventListener('theme-set', syncSettings);
        return () => window.removeEventListener('theme-set', syncSettings);
    }, [city]);

    const changeTheme = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        window.dispatchEvent(new Event('theme-set'));
    };

    const togglePrayerStatus = (prayerName: string) => {
        setPrayerStatus(prev => {
            const next = { ...prev, [prayerName]: !prev[prayerName] };
            localStorage.setItem('muslim_app_prayer_status', JSON.stringify({
                date: format(new Date(), 'yyyy-MM-dd'),
                status: next
            }));
            return next;
        });
    };

    const handleSaveName = (name: string) => {
        setUserName(name);
        localStorage.setItem('muslim_app_user_name', name);
        setShowNameInput(false);
    };

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            const results = await api.searchCity(query);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const selectCity = (selectedCity: City) => {
        setCity(selectedCity);
        setSearchQuery('');
        setSearchResults([]);
        api.saveLastCity(selectedCity);
        loadData(selectedCity.id);
    };

    const getTimeGreeting = () => {
        const hour = currentTime.getHours();
        let base = "Selamat Malam";
        if (hour >= 5 && hour < 11) base = "Selamat Pagi";
        else if (hour >= 11 && hour < 15) base = "Selamat Siang";
        else if (hour >= 15 && hour < 18) base = "Selamat Sore";
        return base;
    };

    const progressCount = Object.values(prayerStatus).filter(v => v).length;
    const nextPrayer = getNextPrayer(schedule);

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-32 transition-colors relative overflow-hidden">
            {/* Soft decorative background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* Gradient Blobs */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[40%] aspect-square bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-[100px]"></div>
                
                {/* Subtle Islamic Pattern Overlay */}
                <div className="absolute inset-x-0 top-0 h-64 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15l-15 15l-15 -15z' fill='%23059669' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '60px 60px' }}></div>
            </div>

            {/* New Header: Personalized Greeting at the very top */}
            <div className="max-w-md mx-auto px-6 pt-8 pb-4 flex justify-between items-start relative z-40">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                        {getTimeGreeting()},
                        <br />
                        <span className="text-emerald-500 dark:text-emerald-400">Assalamualaikum {userName}</span>
                    </h2>
                    <div className="flex flex-col gap-0.5 mt-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase ">
                            {format(currentTime, 'EEEE, dd MMMM yyyy', { locale: id })}
                        </p>
                        {hijriDate && (
                            <p className="text-[10px] font-bold text-amber-500 uppercase ">
                                {Number(hijriDate.day) + hijriOffset} {hijriDate.month.en} {hijriDate.year}H
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsAdzanEnabled(!isAdzanEnabled)}
                        className={`p-3 rounded-2xl transition-all ${isAdzanEnabled ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-slate-50 text-slate-400 dark:bg-slate-800'}`}
                    >
                        <Volume2 size={20} />
                    </button>
                    <button 
                        onClick={() => navigate('/profile')}
                        className="bg-amber-500 text-white p-3 rounded-2xl shadow-lg shadow-amber-200 dark:shadow-none transition-all flex items-center justify-center hover:bg-amber-600 active:scale-90"
                    >
                        <User size={20} />
                    </button>
                </div>
            </div>

            {/* Combined Hero Card - Theme Update: Green & Orange */}
            <div className="max-w-md mx-auto px-4 mb-10 mt-2">
                <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 dark:from-slate-900 dark:to-black rounded-[3rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-all duration-700"></div>
                    
                    <div className="flex flex-col mb-8 relative z-10">
                         <div className="flex items-center gap-1.5 mb-2">
                            <MapPin size={10} className="text-amber-400" />
                            <span className="text-[10px] font-bold text-white/50 uppercase ">{city?.lokasi || 'Mencari...'}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="text-4xl font-black text-white flex items-baseline gap-2">
                                {format(currentTime, 'HH:mm')}
                                <span className="text-sm text-emerald-400/50 tabular-nums font-bold animate-pulse">{format(currentTime, 'ss')}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Selanjutnya</p>
                                <p className="text-xs font-black text-amber-400 uppercase tracking-[0.1em]">{nextPrayer?.name} • {countdown}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
                        <div className="text-center">
                            <p className="text-[8px] font-black text-white/40 uppercase  mb-1">Imsyak</p>
                            <p className="text-xl font-black text-white tracking-tight">{schedule?.jadwal.imsak || '--:--'}</p>
                        </div>
                        <div className="text-center bg-white/5 py-4 rounded-2xl border border-white/5 shadow-inner scale-105">
                            <p className="text-[8px] font-black text-amber-500 uppercase  mb-1">Terbit</p>
                            <p className="text-xl font-black text-white tracking-tight">{schedule?.jadwal.terbit || '--:--'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] font-black text-white/40 uppercase  mb-1">Dhuha</p>
                            <p className="text-xl font-black text-white tracking-tight">{schedule?.jadwal.dhuha || '--:--'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Feature Cards - 3-Column Layout */}
            <div className="max-w-md mx-auto px-6 mb-10">
                <div className="grid grid-cols-2 gap-4">
                    {/* Quran Card (Full Width Span) */}
                    <Link to="/quran" className="col-span-2 group relative flex flex-col bg-gradient-to-br from-primary-600 to-primary-700 p-6 rounded-[2.5rem] shadow-xl shadow-primary-500/20 active:scale-95 transition-all overflow-hidden border border-white/10">
                         <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <Library size={140} />
                         </div>
                         <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:rotate-6 transition-transform">
                                    <Library size={28} />
                                </div>
                                <h3 className="text-white font-black text-2xl tracking-tight">Al-Quran</h3>
                                <p className="text-primary-100 text-[10px] font-black uppercase  opacity-80 mt-1">Pelajari & Baca Ayat Suci</p>
                            </div>
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                                <ChevronRight size={20} />
                            </div>
                         </div>
                    </Link>

                    {/* Ramadan Card */}
                    <Link to="/ramadan" className="group relative flex flex-col bg-gradient-to-br from-amber-500 to-amber-600 p-5 rounded-[2.5rem] shadow-lg shadow-amber-500/10 active:scale-95 transition-all overflow-hidden border border-white/10">
                         <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                             <MoonStar size={80} />
                         </div>
                         <div className="relative z-10">
                             <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:rotate-12 transition-transform">
                                 <MoonStar size={22} />
                             </div>
                             <h3 className="text-white font-black text-lg tracking-tight">Ramadan</h3>
                             <p className="text-amber-50 text-[8px] font-black uppercase opacity-80">Countdown & Amalan</p>
                         </div>
                    </Link>

                    {/* Zakat Card */}
                    <Link to="/zakat" className="group relative flex flex-col bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-[2.5rem] shadow-lg shadow-emerald-500/10 active:scale-95 transition-all overflow-hidden border border-white/10">
                         <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                             <Coins size={80} />
                         </div>
                         <div className="relative z-10">
                             <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:-rotate-12 transition-transform">
                                 <Coins size={22} />
                             </div>
                             <h3 className="text-white font-black text-lg tracking-tight">Zakat</h3>
                             <p className="text-emerald-50 text-[8px] font-black uppercase opacity-80">Kalkulator Zakat</p>
                         </div>
                    </Link>

                    {/* Tasbih Card */}
                    <Link to="/tasbih" className="group relative flex flex-col bg-slate-700 to-slate-800 p-5 rounded-[2.5rem] shadow-lg active:scale-95 transition-all overflow-hidden border border-white/10">
                         <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                             <Fingerprint size={80} />
                         </div>
                         <div className="relative z-10">
                             <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:rotate-12 transition-transform">
                                 <Fingerprint size={22} />
                             </div>
                             <h3 className="text-white font-black text-lg tracking-tight">Tasbih</h3>
                             <p className="text-slate-100 text-[8px] font-black uppercase opacity-80">Digital Dzikir</p>
                         </div>
                    </Link>

                    {/* Doa Card */}
                    <Link to="/doa" className="group relative flex flex-col bg-gradient-to-br from-primary-700 to-primary-800 p-5 rounded-[2.5rem] shadow-lg shadow-primary-700/10 active:scale-95 transition-all overflow-hidden border border-white/10">
                         <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                             <Sparkles size={80} />
                         </div>
                         <div className="relative z-10">
                             <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:-rotate-12 transition-transform">
                                 <Sparkles size={22} />
                             </div>
                             <h3 className="text-white font-black text-lg tracking-tight">Doa</h3>
                             <p className="text-primary-50 text-[8px] font-black uppercase opacity-80">Kumpulan Doa</p>
                         </div>
                    </Link>
                </div>
            </div>

            {/* Daily Prayer List & Progress */}
            <div className="max-w-md mx-auto px-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase ">Progres Sholat</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase ">{progressCount}/5 Selesai</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
                ) : schedule && (
                    <div className="space-y-4">
                        <PrayerItem icon={<Sunrise size={20} />} name="Subuh" time={schedule.jadwal.subuh} active={activePrayer === 'Subuh'} checked={!!prayerStatus['Subuh']} onToggle={() => togglePrayerStatus('Subuh')} />
                        <PrayerItem icon={<Sun size={20} />} name="Dzuhur" time={schedule.jadwal.dzuhur} active={activePrayer === 'Dzuhur'} checked={!!prayerStatus['Dzuhur']} onToggle={() => togglePrayerStatus('Dzuhur')} />
                        <PrayerItem icon={<Sun size={20} className="rotate-45" />} name="Ashar" time={schedule.jadwal.ashar} active={activePrayer === 'Ashar'} checked={!!prayerStatus['Ashar']} onToggle={() => togglePrayerStatus('Ashar')} />
                        <PrayerItem icon={<Moon size={20} />} name="Maghrib" time={schedule.jadwal.maghrib} active={activePrayer === 'Maghrib'} checked={!!prayerStatus['Maghrib']} onToggle={() => togglePrayerStatus('Maghrib')} />
                        <PrayerItem icon={<Moon size={20} fill="currentColor" />} name="Isya" time={schedule.jadwal.isya} active={activePrayer === 'Isya'} checked={!!prayerStatus['Isya']} onToggle={() => togglePrayerStatus('Isya')} />
                    </div>
                )}
            </div>


            {/* Adzan Alert & Name Input (Styling updated but logic remains) */}
            {showNameInput && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Ahlan wa Sahlan</h2>
                        <input type="text" placeholder="Siapa nama Anda?" className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 mb-6 font-bold outline-none focus:border-amber-500 transition-colors" onKeyDown={(e) => {if (e.key === 'Enter') handleSaveName((e.target as HTMLInputElement).value);}} />
                        <button onClick={() => {const val = (document.querySelector('input') as HTMLInputElement).value; if (val) handleSaveName(val);}} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-200 dark:shadow-none">Lanjutkan</button>
                    </div>
                </div>
            )}
        </div>
    );
};


const PrayerItem = ({ name, time, icon, active, checked, onToggle }: { name: string, time: string, icon: React.ReactNode, active: boolean, checked: boolean, onToggle: () => void }) => (
    <div 
        onClick={onToggle}
        className={`flex items-center justify-between p-5 rounded-[2rem] transition-all cursor-pointer ${
            active ? 'bg-emerald-600 text-white shadow-xl scale-[1.02] ring-4 ring-emerald-500/10' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-emerald-100 dark:hover:border-emerald-900/30'
        } ${checked && !active ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800 text-emerald-600'}`}>
                {icon}
            </div>
            <div>
                <p className={`text-[8px] font-black uppercase  ${active ? 'text-emerald-100' : 'text-slate-400'}`}>{name}</p>
                <div className="flex items-center gap-2">
                    <p className="text-xl font-black tabular-nums">{time}</p>
                    {checked && <CheckCircle2 size={14} className={active ? 'text-white' : 'text-emerald-500'} />}
                </div>
            </div>
        </div>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${checked ? (active ? 'bg-white/30' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600') : 'bg-slate-50 dark:bg-slate-800 text-slate-200'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${checked ? (active ? 'bg-white' : 'bg-emerald-500') : 'bg-transparent'}`}></div>
        </div>
    </div>
);

const getNextPrayer = (schedule: any) => {
    if (!schedule) return null;
    const now = new Date();
    const times = [
        { name: 'Subuh', time: schedule.jadwal.subuh },
        { name: 'Dzuhur', time: schedule.jadwal.dzuhur },
        { name: 'Ashar', time: schedule.jadwal.ashar },
        { name: 'Maghrib', time: schedule.jadwal.maghrib },
        { name: 'Isya', time: schedule.jadwal.isya },
    ];
    for (const t of times) {
        const [h, m] = t.time.split(':').map(Number);
        const pTime = new Date();
        pTime.setHours(h, m, 0);
        if (pTime > now) return t;
    }
    return times[0];
};

export default PrayerTimesPage;
