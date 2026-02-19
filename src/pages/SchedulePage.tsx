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
}

const SchedulePage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [city, setCity] = useState<City | null>(null);
    const [monthlySchedule, setMonthlySchedule] = useState<MonthlySchedule[]>([]);
    const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
    const [currentMonth, setCurrentMonth] = useState(new Date());

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
            
            // Try to get coordinates first to use local calculation for higher precision
            const dailyData = await api.getPrayerTimes(cityId, monthDate);
            const lat = dailyData?.koordinat?.lat;
            const lon = dailyData?.koordinat?.lon;

            const daysInMonth = new Date(year, month, 0).getDate();
            const scheduleData: MonthlySchedule[] = [];

            if (lat && lon) {
                for (let d = 1; d <= daysInMonth; d++) {
                    const calcDate = new Date(year, month - 1, d);
                    const times = api.getLocalPrayerTimes(lat, lon, calcDate, calculationOptions);
                    scheduleData.push({
                        ...times.jadwal,
                        tanggal: format(calcDate, 'EEEE, dd/MM/yyyy', { locale: id })
                    });
                }
            } else {
                // Fallback to API monthly schedule if no coordinates
                const apiData = await api.getMonthlyPrayerTimes(cityId, year, month);
            }
            
            setMonthlySchedule(scheduleData);
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
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-10 transition-colors">
            {/* Header */}
            <div className="max-w-md mx-auto px-6 pt-8 pb-4 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-800 dark:text-white" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">Jadwal Sholat</h1>
                        <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400">
                             <MapPin size={10} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">{city?.lokasi}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Madzhab</p>
                    <p className="text-[10px] font-bold text-amber-500 uppercase">{madhab === 'shafi' ? "Syafi'i" : "Hanafi"}</p>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 mt-6">
                {/* Tab Switcher - Using Green for active */}
                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
                    <button 
                        onClick={() => setActiveTab('week')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'week' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-emerald-600'}`}
                    >
                        Minggu Ini
                    </button>
                    <button 
                        onClick={() => setActiveTab('month')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'month' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-emerald-600'}`}
                    >
                        Bulan Ini
                    </button>
                </div>

                {activeTab === 'month' && (
                    <div className="flex items-center justify-between mb-4 px-2">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">
                            {format(currentMonth, 'MMMM yyyy', { locale: id })}
                        </span>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-emerald-500" size={40} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Memuat Jadwal...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayedSchedule.map((day, idx) => {
                            const dayDate = parseApiDate(day.tanggal);
                            const isToday = isSameDay(dayDate, new Date());
                            return (
                                <div 
                                    key={idx} 
                                    className={`bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border transition-all ${isToday ? 'border-amber-400 shadow-xl shadow-amber-500/5 ring-4 ring-amber-500/5' : 'border-slate-100 dark:border-slate-800 shadow-sm'}`}
                                >
                                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50 dark:border-slate-800">
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-black ${isToday ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-white'}`}>{format(dayDate, 'EEEE', { locale: id })}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{format(dayDate, 'dd MMMM yyyy', { locale: id })}</span>
                                        </div>
                                        {isToday && <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase rounded-full tracking-widest">Hari Ini</span>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-y-4 gap-x-2">
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
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const ScheduleItem = ({ name, time, highlight = false }: { name: string; time: string; highlight?: boolean }) => (
    <div className="flex flex-col items-center">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{name}</span>
        <span className={`text-sm font-black tabular-nums ${highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>{time}</span>
    </div>
);

export default SchedulePage;
