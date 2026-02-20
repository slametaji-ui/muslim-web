import React, { useState, useEffect } from 'react';
import { api, City, PrayerTimes } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Loader2, Navigation, Sunrise, Sun, Moon, Volume2, RotateCw, Clock, CheckSquare, Circle, BookOpen, Library, Fingerprint, Sparkles, Download, User, Monitor, Layout as LayoutIcon, ChevronRight, CheckCircle2, MoonStar, Coins, Book, Trophy, Compass, Copy, Heart, Zap, Star, Calendar } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { useToast } from '../components/CustomToast';
import { notificationService } from '../services/notificationService';

interface HijriDateInfo {
    day: string;
    month: { en: string; ar: string };
    year: string;
}


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
    const [hijriOffset, setHijriOffset] = useState(() => Number(localStorage.getItem('muslim_app_hijri_offset')) || 0);
    const [madhab, setMadhab] = useState(() => localStorage.getItem('muslim_app_madhab') || 'shafi');
    const [theme, setTheme] = useState(() => (localStorage.getItem('theme') || 'light') as 'light' | 'dark');
    const [locating, setLocating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<City[]>([]);
    const [doaRandom, setDoaRandom] = useState<any>(null);
    const [trackerHistory, setTrackerHistory] = useState<Record<string, string[]>>(() => {
        const saved = localStorage.getItem('muslim_app_tracker_history');
        return saved ? JSON.parse(saved) : {};
    });

    const activityItems = [
        { id: 'subuh', label: 'Subuh', time: schedule?.jadwal.subuh, icon: <Sunrise size={20} />, category: 'wajib' },
        { id: 'dzuhur', label: 'Dzuhur', time: schedule?.jadwal.dzuhur, icon: <Sun size={20} />, category: 'wajib' },
        { id: 'ashar', label: 'Ashar', time: schedule?.jadwal.ashar, icon: <Sun size={20} className="rotate-45" />, category: 'wajib' },
        { id: 'maghrib', label: 'Maghrib', time: schedule?.jadwal.maghrib, icon: <Moon size={20} />, category: 'wajib' },
        { id: 'isya', label: 'Isya', time: schedule?.jadwal.isya, icon: <Moon size={20} fill="currentColor" />, category: 'wajib' },
        { id: 'dhuha', label: 'Sholat Dhuha', icon: <Zap size={20} />, category: 'sunnah' },
        { id: 'tahajjud', label: 'Tahajjud / Witir', icon: <Star size={20} />, category: 'sunnah' },
        { id: 'quran', label: 'Baca Al-Quran', icon: <Heart size={20} />, category: 'amalan' },
        { id: 'shadaqah', label: 'Sedekah Harian', icon: <Trophy size={20} />, category: 'amalan' },
    ];

    const dateKey = format(new Date(), 'yyyy-MM-dd');
    const todayDone = trackerHistory[dateKey] || [];
    const trackerProgress = Math.round((todayDone.length / activityItems.length) * 100);

    const toggleActivity = (id: string) => {
        setTrackerHistory(prev => {
            const current = prev[dateKey] || [];
            const next = current.includes(id)
                ? current.filter(item => item !== id)
                : [...current, id];
            const updated = { ...prev, [dateKey]: next };
            localStorage.setItem('muslim_app_tracker_history', JSON.stringify(updated));
            return updated;
        });
    };
    const { showToast, ToastComponent } = useToast();

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
                if (isAdzanEnabled) notificationService.scheduleAdhanNotifications(localOverride);
            } else if (dailyData) {
                setSchedule(dailyData);
                if (isAdzanEnabled) notificationService.scheduleAdhanNotifications(dailyData);
            }

            const hijri = await api.getHijriDate(today);
            if (hijri) setHijriDate(hijri);
        } catch (error) {
            console.error('Data load error', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRandomDoa = async () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const cacheKey = `muslim_app_doa_daily_${today}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            setDoaRandom(JSON.parse(cached));
            return;
        }

        const doa = await api.getRandomDoa();
        if (doa) {
            setDoaRandom(doa);
            localStorage.setItem(cacheKey, JSON.stringify(doa));
        }
    };


    useEffect(() => {
        loadRandomDoa();
    }, []);

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
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-32 transition-colors relative overflow-hidden uppercase-tags-fix">
            {ToastComponent}
            {/* Soft decorative background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* Gradient Blobs */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[40%] aspect-square bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-[100px]"></div>

                {/* Subtle Islamic Pattern Overlay */}
                <div className="absolute inset-x-0 top-0 h-64 opacity-[0.06] dark:opacity-[0.1]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15l-15 15l-15 -15z' fill='%23059669' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '60px 60px' }}></div>
            </div>

            {/* New Header: Personalized Greeting at the very top */}
            <div className="max-w-md mx-auto px-6 pt-8 pb-4 flex justify-between items-start relative z-40">
                <div className="flex flex-col">
                    <h2 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">
                        {getTimeGreeting()},
                        <br />
                        <span className="text-emerald-500 dark:text-emerald-400">Assalamualaikum {userName}</span>
                    </h2>
                    {/* <div className="flex flex-col gap-0.5 mt-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase ">
                            {format(currentTime, 'EEEE, dd MMMM yyyy', { locale: id })}
                        </p>
                        {hijriDate && (
                            <p className="text-[10px] font-bold text-amber-500 uppercase ">
                                {(() => {
                                    const day = parseInt(hijriDate.day) + hijriOffset;
                                    return day > 30 ? day % 30 || 30 : day < 1 ? 30 + day : day;
                                })()} {hijriDate.month.en} {hijriDate.year}H
                            </p>
                        )}
                    </div> */}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            const nextState = !isAdzanEnabled;
                            if (nextState) {
                                const granted = await notificationService.requestPermission();
                                if (!granted) {
                                    showToast('Izin notifikasi diperlukan untuk mengaktifkan adzan', 'error');
                                    return;
                                }
                                showToast('Notifikasi adzan diaktifkan!', 'success');
                            } else {
                                showToast('Notifikasi adzan dimatikan');
                            }
                            setIsAdzanEnabled(nextState);
                            localStorage.setItem('muslim_app_adzan_enabled', nextState.toString());
                        }}
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

            {/* Enhanced Hero Card - Premium Glassmorphic Design */}
            <div className="max-w-md mx-auto px-4 mb-8 mt-2">
                <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 dark:from-slate-900 dark:via-slate-950 dark:to-black rounded-[3rem] p-8 border border-white/10 shadow-[0_20px_50px_rgba(6,78,59,0.3)] dark:shadow-none relative overflow-hidden group">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-all duration-1000"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] group-hover:bg-emerald-400/20 transition-all duration-1000"></div>
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none">
                        <MoonStar size={380} />
                    </div>

                    {/* Header: Location & Date - Responsive Layout */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 relative z-10">
                        <div className="flex flex-col gap-1.5 overflow-hidden">
                            <div className="flex items-center  gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 w-fit">
                                <MapPin size={10} className="text-amber-400 flex-shrink-0" />
                                <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">{city?.lokasi || 'Mencari...'}</span>
                            </div>
                            {hijriDate && (
                                <p className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-tight pl-1">
                                    {(() => {
                                        const day = parseInt(hijriDate.day) + hijriOffset;
                                        return day > 30 ? day % 30 || 30 : day < 1 ? 30 + day : day;
                                    })()} {hijriDate.month.en} {hijriDate.year} H
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
                            <div className="bg-amber-500/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-500/20 flex flex-col items-start sm:items-end min-w-[120px] w-full sm:w-auto">
                                <p className="text-[7px] font-black text-amber-400 uppercase tracking-widest leading-none mb-1.5 opacity-60">Selanjutnya</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[10px] font-black text-white uppercase truncate">{nextPrayer?.name}</span>
                                    <span className="text-[11px] font-black text-amber-400 tabular-nums">{countdown}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Time Display */}
                    <div className="flex flex-col items-center mb-10 relative z-10">
                        <div className="relative">
                            <h1 className="text-7xl font-black text-white  flex items-center gap-1">
                                {format(currentTime, 'HH:mm')}
                                <span className="text-xl text-emerald-400/40 tabular-nums font-bold mt-4 animate-pulse">{format(currentTime, 'ss')}</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.1em] mt-2">{format(currentTime, 'EEEE, d MMMM yyyy', { locale: id })}</p>
                    </div>

                    {/* Secondary Times Grid: Imsyak, Terbit, Dhuha */}
                    <div className="grid grid-cols-3 gap-3 relative z-10">
                        {[
                            { label: 'Imsyak', time: schedule?.jadwal.imsak, icon: <Clock size={12} /> },
                            { label: 'Terbit', time: schedule?.jadwal.terbit, icon: <Sunrise size={12} />, primary: true },
                            { label: 'Dhuha', time: schedule?.jadwal.dhuha, icon: <Sun size={12} /> },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-500 ${item.primary ? 'bg-white/10 border-white/20 shadow-lg scale-105' : 'bg-black/20 border-white/5'}`}
                            >
                                <div className={`mb-1.5 ${item.primary ? 'text-amber-400' : 'text-white/30'}`}>
                                    {item.icon}
                                </div>
                                <p className={`text-[8px] font-black uppercase mb-1 ${item.primary ? 'text-amber-400' : 'text-white/40'}`}>{item.label}</p>
                                <p className="font-black text-white tracking-tight">{item.time || '--:--'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>



            {/* 4x4 Standard Shortcut Grid (3 rows used for 12 items) */}
            <div className="max-w-md mx-auto px-6 mb-10">
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { to: '/quran', icon: <Library className="text-primary-600" size={24} />, label: 'Quran' },
                        { to: '/hadith', icon: <BookOpen className="text-emerald-600" size={24} />, label: 'Hadits' },
                        { to: '/qibla', icon: <Compass className="text-amber-600" size={24} />, label: 'Kiblat' },
                        { to: '/doa', icon: <Sparkles className="text-purple-600" size={24} />, label: 'Doa' },
                        { to: '/tracker', icon: <Trophy className="text-orange-600" size={24} />, label: 'Tracker' },
                        { to: '/tasbih', icon: <Fingerprint className="text-slate-600" size={24} />, label: 'Tasbih' },
                        { to: '/ramadan', icon: <MoonStar className="text-amber-500" size={24} />, label: 'Ramadan' },
                        { to: '/zakat', icon: <Coins className="text-emerald-500" size={24} />, label: 'Zakat' },
                        { to: '/muslimah', icon: <Heart className="text-rose-500" size={24} />, label: 'Muslimah' },
                        { to: '/calendar', icon: <Calendar className="text-blue-500" size={24} />, label: 'Kalender' },
                        { to: '/schedule', icon: <Clock className="text-indigo-500" size={24} />, label: 'Jadwal' },
                        { to: '/profile', icon: <User className="text-slate-500" size={24} />, label: 'Profil' },
                    ].map((item, idx) => (
                        <Link
                            key={idx}
                            to={item.to}
                            className="flex flex-col items-center gap-2 group active:scale-95 transition-all"
                        >
                            <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-[1.25rem] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:shadow-md group-hover:-translate-y-1 transition-all">
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase  text-center">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Integrated Activity Tracking (Combining Prayers and Tracker) */}
            <div className="max-w-md mx-auto px-6 pb-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Aktivitas Hari Ini</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Pantau Ibadah & Amalanmu</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                        <div className="relative w-8 h-8">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="16" cy="16" r="14" fill="transparent" stroke="currentColor" strokeWidth="3" className="text-emerald-100 dark:text-emerald-900/50" />
                                <circle cx="16" cy="16" r="14" fill="transparent" stroke="currentColor" strokeWidth="3" className="text-emerald-500" strokeDasharray={87.96} strokeDashoffset={87.96 - (87.96 * (todayDone.length / activityItems.length))} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[8px] font-black text-emerald-600">{trackerProgress}%</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase ">{todayDone.length}/{activityItems.length}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 p-2 shadow-sm">
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
                    ) : (
                        <div className="grid grid-cols-1 gap-1">
                            {activityItems.map((item) => {
                                const done = todayDone.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleActivity(item.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-[2rem] transition-all ${done ? 'bg-emerald-50/50 dark:bg-emerald-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${done ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                {item.icon}
                                            </div>
                                            <div className="text-left">
                                                <h3 className={`font-black text-[13px] uppercase tracking-wide ${done ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{item.label}</h3>
                                                {item.time && <p className="text-[11px] font-bold text-slate-400 mt-0.5">{item.time}</p>}
                                                {!item.time && <p className="text-[11px] font-black text-amber-500 uppercase mt-0.5">{item.category}</p>}
                                            </div>
                                        </div>
                                        <div className={`transition-all ${done ? 'text-emerald-500' : 'text-slate-200 dark:text-slate-800'}`}>
                                            {done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Doa Hari Ini Card - Relocated to Bottom */}
            {doaRandom && (
                <div className="max-w-md mx-auto px-6 mb-12">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-[2.6rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-amber-600 rotate-12 group-hover:scale-110 transition-transform duration-700">
                                <Sparkles size={120} />
                            </div>
                            <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-[0.3em] mb-6 flex items-center gap-2">
                                <Sparkles size={14} className="animate-spin-slow" /> Doa Hari Ini
                            </h4>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-base leading-tight">{doaRandom.judul}</h3>
                                    <div className="h-1 w-12 bg-amber-500 rounded-full"></div>
                                </div>

                                <p className="font-serif text-3xl text-slate-800 dark:text-amber-50 leading-loose text-right" dir="rtl">
                                    {doaRandom.doa}
                                </p>

                                <div className="space-y-3 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">Artinya:</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">
                                        "{doaRandom.artinya}"
                                    </p>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <Link to="/doa" className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:bg-amber-500 hover:text-white transition-all">
                                        Koleksi Doa <ChevronRight size={14} />
                                    </Link>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${doaRandom.judul}\n\n${doaRandom.doa}\n\n${doaRandom.artinya}`);
                                            showToast('Doa berhasil disalin!');
                                        }}
                                        className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 hover:bg-amber-600 active:scale-95 transition-all"
                                    >
                                        <Copy size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Adzan Alert & Name Input (Styling updated but logic remains) */}
            {/* Adzan Alert */}
        </div>
    );
};

export default PrayerTimesPage;
