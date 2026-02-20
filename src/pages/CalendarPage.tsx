import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addDays,
    isToday
} from 'date-fns';
import { id } from 'date-fns/locale';

interface HijriDate {
    date: string;
    format: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { number: number; en: string; ar: string };
    year: string;
    designation: { abbreviated: string; expanded: string };
}

const CalendarPage: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
    const [loading, setLoading] = useState(false);
    const [hijriOffset] = useState(() => Number(localStorage.getItem('muslim_app_hijri_offset')) || 0);

    useEffect(() => {
        fetchHijriDate(selectedDate);
    }, [selectedDate]);

    const fetchHijriDate = async (date: Date) => {
        setLoading(true);
        try {
            // Apply offset by adjusting the date sent to API or manual correction
            // Here we adjust the source date to get shifted Hijri info
            const adjustedDate = new Date(date);
            adjustedDate.setDate(adjustedDate.getDate() + hijriOffset);

            const data = await api.getHijriDate(adjustedDate);
            setHijriDate(data);
        } catch (error) {
            console.error('Failed to fetch Hijri date', error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const onDateClick = (day: Date) => {
        setSelectedDate(day);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-8 px-2">
                <button onClick={prevMonth} className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all">
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">Bulan Ini</h2>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                        {format(currentMonth, 'MMMM yyyy', { locale: id })}
                    </h2>
                </div>
                <button onClick={nextMonth} className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all">
                    <ChevronRight size={24} />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map((day, index) => (
                    <div key={index} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide py-2">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;

                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isDateToday = isToday(day);

                days.push(
                    <div
                        key={day.toString()}
                        className={`relative aspect-square p-1 cursor-pointer group`}
                        onClick={() => onDateClick(cloneDay)}
                    >
                        <div className={`w-full h-full flex flex-col items-center justify-center rounded-2xl text-[11px] font-black transition-all duration-300
                            ${!isCurrentMonth ? 'text-slate-300 dark:text-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'}
                            ${isSelected ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-110 z-10' : ''}
                            ${isDateToday && !isSelected ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/10' : ''}
                        `}>
                            {formattedDate}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="space-y-2">{rows}</div>;
    };

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 transition-colors">
            <PageHeader title="Kalender Hijri" />

            <div className="max-w-md mx-auto w-full px-6 pt-8">
                {/* Header / Hijri Detail Card - Premium Qolbi Style */}
                <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 dark:from-slate-900 dark:to-black rounded-[2.5rem] p-8 text-white shadow-2xl mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <CalendarIcon size={140} />
                    </div>

                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>

                    <div className="relative z-10 text-center min-h-[140px] flex flex-col justify-center">
                        <div className="text-emerald-300 text-[10px] font-black uppercase  mb-4">
                            {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: id })}
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-4 gap-3">
                                <Loader2 className="animate-spin text-amber-400" size={32} />
                                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Memuat Hijriah...</p>
                            </div>
                        ) : hijriDate ? (
                            <div className="flex flex-col items-center">
                                <div className="relative mb-2">
                                    <h1 className="text-6xl font-black text-white tracking-tighter tabular-nums">{hijriDate.day}</h1>
                                    <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-amber-500 rounded-full"></div>
                                </div>
                                <div className="text-xl font-black text-emerald-50 uppercase tracking-tight">
                                    {hijriDate.month.en} {hijriDate.year} H
                                </div>
                                <div className="mt-4 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-serif text-emerald-200">
                                    {hijriDate.month.ar}
                                </div>
                            </div>
                        ) : (
                            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Pilih tanggal untuk melihat kalender</div>
                        )}
                    </div>
                </div>

                {/* Calendar Grid - Modern UI */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8">
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}
                </div>

                {/* Hint - Premium Alert */}
                <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-widest text-center leading-relaxed">
                    <span className="text-amber-500 mr-2">!</span> Tanggal Hijriah dapat berbeda +/- 1 hari sesuai metode penetapan.
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
