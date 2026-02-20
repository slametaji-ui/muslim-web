import React, { useState, useEffect } from 'react';
import { api, City, PrayerTimes } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader2, Calendar as CalendarIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { format, isSameDay, startOfWeek, endOfWeek, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';

interface MonthlySchedule {
    tanggal: string;
    imsak: string;
    subuh: string;
    terbit: string;
    dhuha: string;
    dzuhur: string;
    ashar: string;
    maghrib: string;
    isya: string;
    date: string;
    hijri?: string;
}

const SchedulePage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [city, setCity] = useState<City | null>(null);
    const [monthlySchedule, setMonthlySchedule] = useState<MonthlySchedule[]>([]);
    const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [hijriDate, setHijriDate] = useState<any>(null);

    const madhab = localStorage.getItem('muslim_app_madhab') || 'shafi';
    const hijriOffset = Number(localStorage.getItem('muslim_app_hijri_offset')) || 0;

    const calculationOptions = {
        madhab: madhab === 'hanafi' ? 2 : 1,
        hijriOffset: hijriOffset
    };

    useEffect(() => {
        const cachedCity = api.getLastCity();
        if (cachedCity) {
            setCity(cachedCity);
            loadSchedule(cachedCity.id, currentMonth);
        } else {
            navigate('/');
        }
    }, [currentMonth]);

    const loadSchedule = async (cityId: string, monthDate: Date) => {
        setLoading(true);
        try {
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth() + 1;
            
            const dailyData = await api.getPrayerTimes(cityId, monthDate);
            const lat = dailyData?.koordinat?.lat;
            const lon = dailyData?.koordinat?.lon;

            const daysInMonth = new Date(year, month, 0).getDate();
            const scheduleData: MonthlySchedule[] = [];

            // Pre-fetch Hijri for the current day to show in header or for offset calculation
            // For monthly, we might need a better way, but for now let's add it per item in loop
            
            if (lat && lon) {
                for (let d = 1; d <= daysInMonth; d++) {
                    const calcDate = new Date(year, month - 1, d);
                    const times = api.getLocalPrayerTimes(lat, lon, calcDate, calculationOptions);
                    
                    // Note: We avoid calling API for every day in loop. 
                    // We'll calculate Hijri offset locally if possible or just show Greg.
                    // For now, let's just make sure the offset is applied to calculations.
                    scheduleData.push({
                        ...times.jadwal,
                        tanggal: format(calcDate, 'EEEE, dd/MM/yyyy', { locale: id })
                    });
                }
            } else {
                const apiData = await api.getMonthlyPrayerTimes(cityId, year, month);
                if (apiData && (apiData as any).jadwal) {
                    const list = (apiData as any).jadwal || [];
                    list.forEach((item: any) => {
                         scheduleData.push({
                            ...item,
                            date: item.date
                         } as MonthlySchedule);
                    });
                }
            }
            
            setMonthlySchedule(scheduleData);
            
            // Fetch Hijri for header
            const hData = await api.getHijriDate(monthDate);
            setHijriDate(hData);
        } catch (error) {
            console.error('Failed to load schedule:', error);
        } finally {
            setLoading(false);
        }
    };

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
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-12 transition-colors">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none">
                    <CalendarIcon size={120} />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="text-right">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 ml-auto w-fit">
                                <MapPin size={10} className="text-amber-400" />
                                <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">{city?.lokasi}</span>
                            </div>
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Jadwal Sholat</h1>
                    
                    <div className="mt-6 flex flex-col items-center">
                        <h2 className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.3em] mb-4">
                            Jadwal Sholat {format(currentMonth, 'MMMM yyyy', { locale: id })}
                        </h2>
                        {hijriDate && (
                            <div className="flex flex-col items-center">
                                <h1 className="text-4xl font-black text-white tracking-tighter mb-1">
                                    {(() => {
                                        const day = parseInt(hijriDate.day) + hijriOffset;
                                        return day > 30 ? day % 30 || 30 : day < 1 ? 30 + day : day;
                                    })()} {hijriDate.month.en}
                                </h1>
                                <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">{hijriDate.year} Hijriah</p>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-2 mt-6">
                            <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase rounded-full">Madzhab {madhab === 'shafi' ? "Syafi'i" : "Hanafi"}</span>
                            <span className="text-emerald-100/60 text-[10px] font-black uppercase tracking-widest">Offset Hijri: {hijriOffset}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hijri Adjustment Indicator */}
            {hijriOffset !== 0 && (
                <div className="max-w-md mx-auto px-6 mt-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-2 text-[8px] font-black text-amber-600 uppercase tracking-widest text-center">
                        Penyesuaian Hijriah: {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset} Hari
                    </div>
                </div>
            )}

            <div className="max-w-md mx-auto px-6 py-8">
                {/* Tab Switcher - Using Premium Modern Style */}
                <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 shadow-sm mb-8">
                    <button 
                        onClick={() => setActiveTab('week')}
                        className={`flex-1 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'week' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-emerald-600'}`}
                    >
                        Minggu Ini
                    </button>
                    <button 
                        onClick={() => setActiveTab('month')}
                        className={`flex-1 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'month' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-emerald-600'}`}
                    >
                        Bulan Ini
                    </button>
                </div>

                {activeTab === 'month' && (
                    <div className="flex items-center justify-between mb-4 px-2">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-black text-slate-800 dark:text-white uppercase ">
                            {format(currentMonth, 'MMMM yyyy', { locale: id })}
                        </span>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Memuat Jadwal...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {displayedSchedule.length > 0 ? displayedSchedule.map((day, idx) => {
                            const dayDate = parseApiDate(day.tanggal);
                            const isToday = isSameDay(dayDate, new Date());
                            const hijriDay = day.hijri ? (parseInt(day.hijri.split(' ')[0]) + hijriOffset) : null;
                            const hijriMonthYear = day.hijri ? day.hijri.split(' ').slice(1).join(' ') : null;

                            return (
                                <div 
                                    key={idx} 
                                    className={`bg-white dark:bg-slate-900 p-8 rounded-[3rem] border transition-all duration-500 overflow-hidden relative group ${isToday ? 'border-amber-400 shadow-2xl shadow-amber-500/10 ring-4 ring-amber-500/5' : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md'}`}
                                >
                                    {isToday && (
                                        <div className="absolute top-0 right-0 px-6 py-2 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-3xl shadow-sm z-10">
                                            Hari Ini
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50 dark:border-slate-800">
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-black tracking-tight ${isToday ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-white'}`}>{format(dayDate, 'EEEE', { locale: id })}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{format(dayDate, 'dd MMMM yyyy', { locale: id })}</span>
                                        </div>
                                        {day.hijri && (
                                            <div className="text-right">
                                                <span className={`text-sm font-black tracking-tight ${isToday ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-white'}`}>
                                                    {hijriDay}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 ml-1">
                                                    {hijriMonthYear}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-6 gap-x-2">
                                        <ScheduleItem name="Imsyak" time={day.imsak} highlight={isToday} />
                                        <ScheduleItem name="Subuh" time={day.subuh} highlight={isToday} />
                                        <ScheduleItem name="Terbit" time={day.terbit} highlight={isToday} />
                                        <ScheduleItem name="Dzuhur" time={day.dzuhur} highlight={isToday} />
                                        <ScheduleItem name="Ashar" time={day.ashar} highlight={isToday} />
                                        <ScheduleItem name="Maghrib" time={day.maghrib} highlight={isToday} />
                                        <ScheduleItem name="Isya" time={day.isya} highlight={isToday} />
                                    </div>
                                </div>
                            );
                        }) : (
                             <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                                <CalendarIcon size={48} className="text-slate-200" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jadwal tidak tersedia</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ScheduleItem = ({ name, time, highlight = false }: { name: string; time: string; highlight?: boolean }) => (
    <div className="flex flex-col items-center">
        <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{name}</span>
        <div className={`px-3 py-1.5 rounded-xl text-xs font-black tabular-nums transition-colors ${highlight ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
            {time || '--:--'}
        </div>
    </div>
);

export default SchedulePage;
