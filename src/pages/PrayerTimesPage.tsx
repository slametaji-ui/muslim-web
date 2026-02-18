import React, { useState, useEffect } from 'react';
import { api, City, PrayerTimes } from '../services/api';
import { Link } from 'react-router-dom';
import { Search, MapPin, Loader2, Calendar as CalendarIcon, Navigation, ChevronDown, Sunrise, Sun, Sunset, Moon, CloudSun, CloudMoon, Coffee, Volume2, RotateCw, Clock, CheckSquare, Square, Circle, BookOpen, Compass } from 'lucide-react';
import { format, isSameDay, startOfWeek, endOfWeek, isWithinInterval, parse } from 'date-fns';
import { id } from 'date-fns/locale';

interface MonthlySchedule {
    tanggal: string;
    imsak: string;
    subuh: string;
    terbit: string;
    dhuha: string;
    dzuhur: string;
    dzuhur_time?: string;
    ashar: string;
    maghrib: string;
    isya: string;
    date: string;
}

interface HijriDateInfo {
    day: string;
    month: { en: string; ar: string };
    year: string;
}

const PrayerTimesPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [city, setCity] = useState<City | null>(null);
    const [schedule, setSchedule] = useState<PrayerTimes | null>(null);
    const [monthlySchedule, setMonthlySchedule] = useState<MonthlySchedule[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<City[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
    const [locating, setLocating] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activePrayer, setActivePrayer] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<string>('');
    const [hijriDate, setHijriDate] = useState<HijriDateInfo | null>(null);
    const [notifiedPrayer, setNotifiedPrayer] = useState<string | null>(null);
    const [showAdzanModal, setShowAdzanModal] = useState(false);
    const [prayerStatus, setPrayerStatus] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('muslim_app_prayer_status');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Only keep today's status
                const today = format(new Date(), 'yyyy-MM-dd');
                if (parsed.date === today) return parsed.status;
            } catch (e) { return {}; }
        }
        return {};
    });

    // Adzan Audio Source (Using a reliable external source or placeholder)
    const adzanAudioRef = React.useRef<HTMLAudioElement | null>(null);

    const handleStopAdzan = () => {
        if (adzanAudioRef.current) {
            adzanAudioRef.current.pause();
            adzanAudioRef.current.currentTime = 0;
        }
        setShowAdzanModal(false);
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

    const getTimeGreeting = () => {
        const hour = currentTime.getHours();
        if (hour >= 5 && hour < 11) return "Selamat Pagi";
        if (hour >= 11 && hour < 15) return "Selamat Siang";
        if (hour >= 15 && hour < 18) return "Selamat Sore";
        return "Selamat Malam";
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
        // Request Notification Permission
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (schedule) {
            const checkPrayerStatus = () => {
                const now = new Date();
                const times = [
                    { name: 'Subuh', time: schedule.jadwal.subuh },
                    { name: 'Dzuhur', time: schedule.jadwal.dzuhur },
                    { name: 'Ashar', time: schedule.jadwal.ashar },
                    { name: 'Maghrib', time: schedule.jadwal.maghrib },
                    { name: 'Isya', time: schedule.jadwal.isya },
                ];

                // Check if currently inside a prayer window (e.g., 15 mins after azan)
                let foundActive = null;
                for (const t of times) {
                    const [h, m] = t.time.split(':').map(Number);
                    const pStart = new Date();
                    pStart.setHours(h, m, 0);
                    const pEnd = new Date(pStart);
                    pEnd.setMinutes(pStart.getMinutes() + 20); // 20 mins active window

                    if (now >= pStart && now <= pEnd) {
                        foundActive = t.name;
                        break;
                    }

                }
                setActivePrayer(foundActive);

                // Trigger Notification & Audio
                if (foundActive && foundActive !== notifiedPrayer) {
                    setNotifiedPrayer(foundActive);
                    setShowAdzanModal(true);

                    try {
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification(`Waktu ${foundActive} Telah Tiba!`, {
                                body: `Saatnya menunaikan sholat ${foundActive} untuk wilayah ${city?.lokasi || 'Anda'}.`,
                                icon: '/pwa-192x192.png' // Ensure this exists or use default
                            });
                        }
                    } catch (error) {
                        console.error("Notification failed:", error);
                    }

                    // Play Adzan
                    if (adzanAudioRef.current) {
                        adzanAudioRef.current.currentTime = 0;
                        adzanAudioRef.current.play().catch(e => console.log("Audio play failed (user interaction needed first):", e));
                    }
                } else if (!foundActive) {
                    setNotifiedPrayer(null); // Reset when prayer time is over
                }

                if (!foundActive) {
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
                            setCountdown(`${hours}h ${minutes}m`);
                        } else {
                            setCountdown('Waktu Tiba');
                        }
                    }
                }
            };
            checkPrayerStatus();
        }
    }, [currentTime, schedule]);

    useEffect(() => {
        const cachedCity = api.getLastCity();
        if (cachedCity) {
            setCity(cachedCity);
            loadData(cachedCity.id);
        } else {
            handleGeolocation();
        }
    }, []);

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
                            loadData(detectedCity.id);
                        } else {
                            loadDefaultCity();
                        }
                    } catch (error) {
                        console.error(error);
                        loadDefaultCity();
                    } finally {
                        setLocating(false);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    loadDefaultCity();
                    setLocating(false);
                }
            );
        } else {
            loadDefaultCity();
            setLocating(false);
        }
    };

    const loadDefaultCity = async () => {
        try {
            const jakarta: City = { id: '1301', lokasi: 'DKI JAKARTA' };
            setCity(jakarta);
            loadData('1301');
        } catch (error) {
            console.error('Failed to load default city', error);
            setLoading(false);
        }
    };

    const loadData = async (cityId: string, forceRefresh = false) => {
        setLoading(true);
        try {
            const today = new Date();
            // Use new API method with cache support
            const dailyData = await api.getPrayerTimes(cityId, today, forceRefresh);
            setSchedule(dailyData);

            const hijri = await api.getHijriDate(today);
            if (hijri) {
                setHijriDate(hijri);
            }

            const monthlyData: any = await api.getMonthlyPrayerTimes(cityId, today.getFullYear(), today.getMonth() + 1);

            if (monthlyData && monthlyData.jadwal && Array.isArray(monthlyData.jadwal)) {
                setMonthlySchedule(monthlyData.jadwal);
            } else if (monthlyData && monthlyData.jadwal && typeof monthlyData.jadwal === 'object') {
                setMonthlySchedule([monthlyData.jadwal]);
            }

        } catch (error) {
            console.error('Data load error', error);
        } finally {
            setLoading(false);
        }
    };

    const handleManualRefresh = () => {
        if (city) {
            loadData(city.id, true);
        }
    };

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setShowDropdown(true);

        if (query.length > 2) {
            const results = await api.searchCity(query);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const selectCity = (selectedCity: City) => {
        setCity(selectedCity);
        setSearchQuery(selectedCity.lokasi);
        setShowDropdown(false);
        api.saveLastCity(selectedCity);
        loadData(selectedCity.id);
    };

    const nextPrayer = getNextPrayer(schedule);

    const parseApiDate = (dateStr: string) => {
        try {
            const parts = dateStr.split(',');
            if (parts.length > 1) {
                const datePart = parts[1].trim();
                const [day, month, year] = datePart.split('/').map(Number);
                return new Date(year, month - 1, day);
            }
            return new Date();
        } catch {
            return new Date();
        }
    };

    const formatMonthlyDate = (rawDate: string) => {
        try {
            const d = parseApiDate(rawDate);
            return format(d, 'd MMM', { locale: id });
        } catch (e) {
            return rawDate;
        }
    };

    const getCurrentWeekSchedule = () => {
        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 1 });
        const end = endOfWeek(now, { weekStartsOn: 1 });

        return monthlySchedule.filter(day => {
            const dayDate = parseApiDate(day.tanggal);
            return isWithinInterval(dayDate, { start, end });
        });
    };

    const displayedSchedule = activeTab === 'week' ? getCurrentWeekSchedule() : monthlySchedule;

    return (
        <div className="bg-white dark:bg-slate-900 min-h-screen pb-24 transition-colors">
            {/* Search & Header Controls */}
            <div className="max-w-md mx-auto px-4 pt-6 flex gap-2 relative z-50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari kota..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner text-slate-800 dark:text-white placeholder-slate-400 transition-all text-sm"
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />
                    {showDropdown && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                            {searchResults.map((city) => (
                                <button
                                    key={city.id}
                                    className="w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors flex items-center gap-2 border-b border-slate-50 dark:border-slate-700 last:border-0"
                                    onClick={() => selectCity(city)}
                                >
                                    <MapPin size={16} className="text-emerald-500" />
                                    <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">{city.lokasi}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleGeolocation}
                    disabled={locating}
                    className="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all disabled:opacity-50 border border-emerald-100/50 dark:border-emerald-800/50"
                >
                    {locating ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
                </button>
                <button
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800"
                >
                    <RotateCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                    <div className="relative">
                        <Loader2 className="animate-spin text-emerald-600" size={48} />
                        <div className="absolute inset-0 blur-xl bg-emerald-400/20 animate-pulse"></div>
                    </div>
                    <p className="text-slate-400 text-sm font-black uppercase tracking-widest animate-pulse">Menyiapkan Jadwal...</p>
                </div>
            ) : schedule ? (
                <div className="max-w-md mx-auto py-8 px-4">
                    {/* Greeting Section */}
                    <div className="flex justify-between items-end mb-8 px-2 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div>
                            <h2 className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
                                {getTimeGreeting()}
                            </h2>
                            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                                Assalamu'alaikum
                            </h1>
                        </div>
                        <div className="text-right">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-0.5">Masehi</div>
                                <div className="text-xs font-black text-slate-700 dark:text-emerald-100">
                                    {format(new Date(), 'dd MMM yyyy')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Dashboard Hero */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[3rem] p-1 shadow-2xl shadow-emerald-200/50 dark:shadow-none overflow-hidden relative group mb-10 transition-transform duration-500 hover:scale-[1.01]">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-[60px] -ml-24 -mb-24"></div>

                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-t-[2.8rem] flex justify-between items-center relative z-10 border-b border-white/10">
                            <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
                                <MapPin size={14} className="text-emerald-200" />
                                <span className="font-black text-[10px] text-white tracking-widest uppercase">{city?.lokasi}</span>
                            </div>
                            {hijriDate && (
                                <div className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.15em]">
                                    {hijriDate.day} {hijriDate.month.en}
                                </div>
                            )}
                        </div>

                        <div className="p-10 relative text-center overflow-hidden">
                            <div className="relative z-10">
                                <div className="mb-10">
                                    <div className="text-[80px] font-black text-white tabular-nums tracking-tighter font-mono drop-shadow-2xl leading-none flex items-start justify-center">
                                        {format(currentTime, 'HH:mm')}
                                        <span className="text-2xl text-emerald-200/60 ml-2 mt-4 font-black animate-pulse tabular-nums">
                                            {format(currentTime, 'ss')}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/20 inline-block w-full shadow-2xl overflow-hidden relative group/card">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000"></div>
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                                            <span className="text-emerald-50 text-[10px] font-black uppercase tracking-widest">Berikutnya: {nextPrayer?.name}</span>
                                        </div>
                                        <span className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest bg-emerald-900/40 px-3 py-1 rounded-full">{nextPrayer?.time}</span>
                                    </div>
                                    <div className="text-4xl font-black text-white font-mono border-t border-white/10 pt-4 flex items-center justify-center gap-4">
                                        <Clock size={32} className="text-emerald-300" />
                                        {countdown}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-10 px-1">
                        <Link to="/quran" className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 dark:shadow-none group relative overflow-hidden transition-all hover:-translate-y-1">
                            <div className="absolute top-0 right-0 p-4 opacity-20 transition-transform group-hover:scale-125 group-hover:rotate-12 duration-500">
                                <BookOpen size={60} />
                            </div>
                            <h3 className="font-black text-lg mb-1 relative z-10 tracking-tight">Al-Quran</h3>
                            <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest relative z-10 opacity-70">Baca & Simak</p>
                        </Link>

                        <Link to="/tasbih" className="bg-gradient-to-br from-emerald-500 to-teal-700 p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200 dark:shadow-none group relative overflow-hidden transition-all hover:-translate-y-1">
                            <div className="absolute top-0 right-0 p-4 opacity-20 transition-transform group-hover:scale-125 group-hover:rotate-12 duration-500">
                                <RotateCw size={60} />
                            </div>
                            <h3 className="font-black text-lg mb-1 relative z-10 tracking-tight">Tasbih</h3>
                            <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest relative z-10 opacity-70">Dzikir Harian</p>
                        </Link>
                        
                        <Link to="/qibla" className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-lg shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-700 group relative overflow-hidden transition-all hover:-translate-y-1">
                            <div className="absolute top-0 right-0 p-4 text-emerald-600 dark:text-emerald-500 opacity-10 transition-transform group-hover:scale-125 group-hover:rotate-12 duration-500">
                                <Compass size={60} />
                            </div>
                            <h3 className="font-black text-lg mb-1 text-slate-800 dark:text-white tracking-tight">Kiblat</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Arah Sholat</p>
                        </Link>
                        
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center gap-2">
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mb-1 leading-none">Progres Hari Ini</p>
                             <div className="flex items-center gap-3">
                                 <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{Object.values(prayerStatus).filter(Boolean).length}/5</span>
                                 <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner flex">
                                     <div 
                                         className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                         style={{ width: `${(Object.values(prayerStatus).filter(Boolean).length / 5) * 100}%` }}
                                     ></div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Prayer Times Section */}
                    <div className="px-1 overflow-visible">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest pl-2">Jadwal Sholat</h2>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1 ml-4 mr-4"></div>
                        </div>

                        {schedule && (
                            <div className="grid grid-cols-1 gap-4">
                                <PrayerItem 
                                    icon={<Sunrise size={20} />} 
                                    name="Subuh" 
                                    time={schedule.jadwal.subuh} 
                                    active={activePrayer === 'Subuh' || nextPrayer?.name === 'Subuh'}
                                    checked={!!prayerStatus['Subuh']}
                                    onToggle={() => togglePrayerStatus('Subuh')}
                                />
                                <PrayerItem 
                                    icon={<Sun size={20} />} 
                                    name="Dzuhur" 
                                    time={schedule.jadwal.dzuhur} 
                                    active={activePrayer === 'Dzuhur' || nextPrayer?.name === 'Dzuhur'}
                                    checked={!!prayerStatus['Dzuhur']}
                                    onToggle={() => togglePrayerStatus('Dzuhur')}
                                />
                                <PrayerItem 
                                    icon={<Sun size={20} className="rotate-45" />} 
                                    name="Ashar" 
                                    time={schedule.jadwal.ashar} 
                                    active={activePrayer === 'Ashar' || nextPrayer?.name === 'Ashar'}
                                    checked={!!prayerStatus['Ashar']}
                                    onToggle={() => togglePrayerStatus('Ashar')}
                                />
                                <PrayerItem 
                                    icon={<Moon size={20} />} 
                                    name="Maghrib" 
                                    time={schedule.jadwal.maghrib} 
                                    active={activePrayer === 'Maghrib' || nextPrayer?.name === 'Maghrib'}
                                    checked={!!prayerStatus['Maghrib']}
                                    onToggle={() => togglePrayerStatus('Maghrib')}
                                />
                                <PrayerItem 
                                    icon={<Moon size={20} fill="currentColor" />} 
                                    name="Isya" 
                                    time={schedule.jadwal.isya} 
                                    active={activePrayer === 'Isya' || nextPrayer?.name === 'Isya'}
                                    checked={!!prayerStatus['Isya']}
                                    onToggle={() => togglePrayerStatus('Isya')}
                                />
                                
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 opacity-60">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Imsak & Terbit</p>
                                            <div className="flex gap-4">
                                                <div className="text-xs font-black text-slate-700 dark:text-slate-300">Imsak {schedule.jadwal.imsak}</div>
                                                <div className="text-xs font-black text-slate-700 dark:text-slate-300">Terbit {schedule.jadwal.terbit}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                             <div className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-1">Dhuha</div>
                                             <div className="text-xl font-black text-slate-800 dark:text-white tabular-nums leading-none">{schedule.jadwal.dhuha}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Monthly Preview Tab */}
                    <div className="mt-12 bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-50 dark:border-slate-800">
                         <div className="flex border-b border-slate-50 dark:border-slate-800">
                            <button
                                onClick={() => setActiveTab('week')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'week' ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            >
                                Minggu Ini
                            </button>
                            <button
                                onClick={() => setActiveTab('month')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'month' ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            >
                                Bulan Ini
                            </button>
                        </div>
                        <div className="overflow-x-auto p-2">
                             <table className="w-full text-[10px] text-left">
                                 <thead className="text-slate-400 font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                     <tr>
                                         <th className="px-4 py-3">Tgl</th>
                                         <th className="px-2 py-3">Subuh</th>
                                         <th className="px-2 py-3">Dzuhur</th>
                                         <th className="px-2 py-3">Ashar</th>
                                         <th className="px-2 py-3">Maghrib</th>
                                         <th className="px-2 py-3 pr-4">Isya</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                     {displayedSchedule.map((day, idx) => {
                                         const dayDate = parseApiDate(day.tanggal);
                                         const isToday = isSameDay(dayDate, new Date());
                                         return (
                                             <tr key={idx} className={`${isToday ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                                                 <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                                                     {formatMonthlyDate(day.tanggal)}
                                                 </td>
                                                 <td className="px-2 py-3 font-mono">{day.subuh}</td>
                                                 <td className="px-2 py-3 font-mono">{day.dzuhur}</td>
                                                 <td className="px-2 py-3 font-mono">{day.ashar}</td>
                                                 <td className="px-2 py-3 font-mono">{day.maghrib}</td>
                                                 <td className="px-2 py-3 pr-4 font-mono">{day.isya}</td>
                                             </tr>
                                         );
                                     })}
                                 </tbody>
                             </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center mt-20 px-6">
                    <div className="bg-emerald-50 p-6 rounded-full inline-block mb-4 shadow-inner">
                        <MapPin size={40} className="text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Lokasi Tidak Ditemukan</h2>
                    <p className="text-slate-500 mb-6">
                        Kami tidak dapat mendeteksi lokasi Anda secara otomatis.
                    </p>
                </div>
            )}

            {/* Adzan Alert Modal */}
            {showAdzanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center relative border border-white/20 dark:border-slate-800">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 rounded-full p-4 shadow-lg shadow-emerald-500/30 animate-pulse">
                            <Volume2 size={32} className="text-white" />
                        </div>

                        <div className="mt-6">
                            <h3 className="text-emerald-600 dark:text-emerald-400 font-bold text-lg uppercase tracking-widest mb-1">Waktu Sholat Telah Tiba</h3>
                            <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">{notifiedPrayer}</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                Saatnya menunaikan ibadah sholat untuk wilayah <span className="font-semibold text-slate-700 dark:text-slate-200">{city?.lokasi}</span> dan sekitarnya.
                            </p>

                            <button
                                onClick={handleStopAdzan}
                                className="w-full bg-slate-900 dark:bg-slate-700 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:bg-slate-800 dark:hover:bg-slate-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span>Matikan Suara</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

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

    let next = null;
    for (const t of times) {
        const [h, m] = t.time.split(':').map(Number);
        const pTime = new Date();
        pTime.setHours(h, m, 0);
        if (pTime > now) {
            next = t;
            break;
        }
    }

    if (!next && times.length > 0) {
        next = { ...times[0], nextDay: true };
    }

    return next || times[0];
};



const PrayerItem = ({ 
    name, 
    time, 
    icon, 
    active = false, 
    isSecondary = false, 
    checked = false, 
    onToggle 
}: { 
    name: string; 
    time: string; 
    icon: React.ReactNode; 
    active?: boolean; 
    isSecondary?: boolean;
    checked?: boolean;
    onToggle?: () => void;
}) => (
    <div 
        onClick={onToggle}
        className={`group flex items-center justify-between p-5 rounded-[2rem] transition-all duration-300 cursor-pointer relative overflow-hidden ${
        active 
            ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 dark:shadow-none scale-[1.03] z-10' 
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:border-emerald-200 hover:shadow-lg'
        } ${checked && !active ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
        {active && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000"></div>
        )}
        
        <div className="flex items-center gap-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${
                active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-emerald-600'
            }`}>
                {icon}
            </div>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${active ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {name}
                </p>
                <p className="text-xl font-black tabular-nums tracking-tight">
                    {time}
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
            {active && (
                <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Waktunya
                </div>
            )}
            {!isSecondary && (
                <div 
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        checked 
                            ? (active ? 'bg-white text-emerald-600' : 'bg-emerald-100 text-emerald-600 scale-110 shadow-inner') 
                            : (active ? 'bg-white/20 text-white border border-white/40' : 'bg-slate-50 dark:bg-slate-700 text-slate-300 dark:text-slate-500 border border-slate-200 dark:border-slate-600 hover:scale-110')
                    }`}
                >
                    {checked ? <CheckSquare size={18} /> : <Circle size={18} className="opacity-40" />}
                </div>
            )}
        </div>
    </div>
);

export default PrayerTimesPage;
