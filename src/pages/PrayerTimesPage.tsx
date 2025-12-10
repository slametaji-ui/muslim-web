import React, { useState, useEffect } from 'react';
import { api, City, PrayerTimes } from '../services/api';
import { Search, MapPin, Loader2, Calendar as CalendarIcon, Navigation, ChevronDown, Sunrise, Sun, Sunset, Moon, CloudSun, CloudMoon, Coffee } from 'lucide-react';
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

    // Adzan Audio Source (Using a reliable external source or placeholder)
    const adzanAudio = new Audio('https://media.sd.ma/assorted/adhans/makkah.mp3');

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

                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(`Waktu ${foundActive} Telah Tiba!`, {
                            body: `Saatnya menunaikan sholat ${foundActive} untuk wilayah ${city?.lokasi || 'Anda'}.`,
                            icon: '/pwa-192x192.png' // Ensure this exists or use default
                        });
                    }

                    // Play Adzan
                    adzanAudio.play().catch(e => console.log("Audio play failed (user interaction needed first):", e));
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
                            setCountdown(`${hours} Jam ${minutes} Menit`);
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
        handleGeolocation();
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

    const loadData = async (cityId: string) => {
        setLoading(true);
        try {
            const today = new Date();
            const dailyData = await api.getPrayerTimes(cityId, today);
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
        <div className="max-w-md mx-auto w-full pb-20">
            <div className="flex gap-2 mb-4 relative z-20">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Cari kota..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />
                    {showDropdown && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto">
                            {searchResults.map((city) => (
                                <button
                                    key={city.id}
                                    className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors flex items-center gap-2 border-b border-slate-50 last:border-0"
                                    onClick={() => selectCity(city)}
                                >
                                    <MapPin size={16} className="text-emerald-500" />
                                    <span className="text-slate-700 text-sm">{city.lokasi}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleGeolocation}
                    disabled={locating}
                    className="bg-emerald-100 text-emerald-700 p-3 rounded-2xl hover:bg-emerald-200 transition-colors disabled:opacity-50"
                >
                    {locating ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center h-64 gap-4">
                    <Loader2 className="animate-spin text-emerald-600" size={40} />
                    <p className="text-slate-400 text-sm animate-pulse">Mengambil data jadwal...</p>
                </div>
            ) : schedule ? (
                <div className="space-y-6">

                    {/* Enhanced Hero UI */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-1 shadow-xl shadow-emerald-100 overflow-hidden relative">
                        <div className="bg-white/10 p-4 rounded-t-3xl flex flex-col gap-2 text-white backdrop-blur-sm relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-emerald-200" />
                                    <span className="font-semibold text-sm tracking-wide">{city?.lokasi}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end border-t border-white/10 pt-2 mt-1">
                                <div>
                                    <div className="text-xs text-emerald-200 font-medium mb-0.5">Masehi</div>
                                    <div className="font-bold text-sm">
                                        {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
                                    </div>
                                </div>
                                {hijriDate && (
                                    <div className="text-right">
                                        <div className="text-xs text-emerald-200 font-medium mb-0.5">Hijriah</div>
                                        <div className="font-bold text-sm">
                                            {hijriDate.day} {hijriDate.month.en} {hijriDate.year}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 relative text-center">
                            {/* Background Pattern */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                                <CalendarIcon size={140} />
                            </div>

                            {activePrayer ? (
                                <div className="animate-in zoom-in duration-500">
                                    <p className="text-emerald-100 text-sm font-medium tracking-widest uppercase mb-2">Sedang Berlangsung</p>
                                    <h2 className="text-4xl font-extrabold text-white mb-2 drop-shadow-sm">WAKTU {activePrayer.toUpperCase()}</h2>
                                    <div className="inline-block bg-white/20 backdrop-blur-md rounded-full px-6 py-2 text-white font-mono font-bold mt-2">
                                        {format(currentTime, 'HH:mm')}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-8">
                                        <p className="text-emerald-200 text-xs font-bold tracking-widest uppercase mb-2">Waktu Sekarang</p>
                                        <div className="text-6xl font-black text-white tabular-nums tracking-tight font-mono drop-shadow-sm">
                                            {format(currentTime, 'HH:mm')}
                                            <span className="text-2xl text-emerald-200/80 ml-2 align-top mt-2 inline-block font-bold">
                                                {format(currentTime, 'ss')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-4 border border-white/5 inline-block min-w-[280px]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-emerald-100 text-xs">Menuju {nextPrayer?.name}</span>
                                            <span className="text-emerald-100 text-xs text-right">Adzan {nextPrayer?.time}</span>
                                        </div>
                                        <div className="text-xl font-bold text-white font-mono border-t border-white/10 pt-2 mt-1">
                                            {countdown}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Daily Schedule List with Icons */}
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                        <h3 className="text-slate-800 font-bold mb-4 px-2 flex items-center gap-2">
                            <CalendarIcon size={18} className="text-emerald-500" />
                            Jadwal Hari Ini
                        </h3>
                        <div className="space-y-1">
                            <PrayerItem icon={<CloudMoon size={18} />} name="Imsak" time={schedule.jadwal.imsak} />
                            <PrayerItem icon={<Sunrise size={18} />} name="Subuh" time={schedule.jadwal.subuh} active={nextPrayer?.name === 'Subuh'} />
                            <PrayerItem icon={<Sun size={18} />} name="Terbit" time={schedule.jadwal.terbit} isSecondary />
                            <PrayerItem icon={<Coffee size={18} />} name="Dhuha" time={schedule.jadwal.dhuha} isSecondary />
                            <PrayerItem icon={<Sun size={18} className="rotate-0" />} name="Dzuhur" time={schedule.jadwal.dzuhur} active={nextPrayer?.name === 'Dzuhur'} />
                            <PrayerItem icon={<CloudSun size={18} />} name="Ashar" time={schedule.jadwal.ashar} active={nextPrayer?.name === 'Ashar'} />
                            <PrayerItem icon={<Sunset size={18} />} name="Maghrib" time={schedule.jadwal.maghrib} active={nextPrayer?.name === 'Maghrib'} />
                            <PrayerItem icon={<Moon size={18} />} name="Isya" time={schedule.jadwal.isya} active={nextPrayer?.name === 'Isya'} />
                        </div>
                    </div>

                    {/* Combined Schedule Card */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                        <div className="p-5 border-b border-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">
                                Prayer times in <span className="text-emerald-600">{city?.lokasi}</span>
                            </h2>
                            <p className="text-slate-400 text-xs mt-1">Jadwal sholat terpercaya sesuai Kemenag RI</p>
                        </div>

                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setActiveTab('week')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'week' ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                This Week
                            </button>
                            <button
                                onClick={() => setActiveTab('month')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'month' ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                This Month
                            </button>
                        </div>

                        <div className="overflow-x-auto p-0 animate-in fade-in duration-300">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 min-w-[80px]">Tgl</th>
                                        <th className="px-2 py-3">Subuh</th>
                                        <th className="px-2 py-3">Dzuhur</th>
                                        <th className="px-2 py-3">Ashar</th>
                                        <th className="px-2 py-3">Maghrib</th>
                                        <th className="px-2 py-3 pr-4">Isya</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedSchedule.map((day, idx) => {
                                        const dayDate = parseApiDate(day.tanggal);
                                        const isToday = isSameDay(dayDate, new Date());

                                        return (
                                            <tr key={idx} className={`border-b border-slate-100 last:border-0 transition-colors ${isToday ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                                                <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                                                    {formatMonthlyDate(day.tanggal)}
                                                    {isToday && <span className="ml-1 inline-block w-2 h-2 rounded-full bg-emerald-500"></span>}
                                                </td>
                                                <td className="px-2 py-3 text-slate-600">{day.subuh}</td>
                                                <td className="px-2 py-3 text-slate-600">{day.dzuhur}</td>
                                                <td className="px-2 py-3 text-slate-600">{day.ashar}</td>
                                                <td className="px-2 py-3 text-slate-600">{day.maghrib}</td>
                                                <td className="px-2 py-3 pr-4 text-slate-600">{day.isya}</td>
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
                    <div className="bg-emerald-50 p-6 rounded-full inline-block mb-4">
                        <MapPin size={40} className="text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Lokasi Tidak Ditemukan</h2>
                    <p className="text-slate-500 mb-6">
                        Kami tidak dapat mendeteksi lokasi Anda. Silakan cari kota Anda secara manual.
                    </p>
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

const PrayerItem = ({ name, time, icon, active = false, isSecondary = false }: { name: string; time: string; icon: React.ReactNode; active?: boolean; isSecondary?: boolean }) => (
    <div className={`flex justify-between items-center p-3 rounded-xl mb-1 transition-all ${active
        ? 'bg-emerald-50 border border-emerald-100 translate-x-1 shadow-sm'
        : 'hover:bg-slate-50'
        } ${isSecondary ? 'opacity-60 saturate-0 scale-95' : ''}`}>
        <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full ${active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {icon}
            </div>
            <span className={`font-medium ${active ? 'text-emerald-700' : 'text-slate-700'}`}>{name}</span>
        </div>
        <span className={`font-mono ${active ? 'text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-md shadow-sm' : 'text-slate-600'}`}>{time}</span>
    </div>
);

export default PrayerTimesPage;
