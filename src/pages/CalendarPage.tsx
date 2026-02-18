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

    useEffect(() => {
        fetchHijriDate(selectedDate);
    }, [selectedDate]);

    const fetchHijriDate = async (date: Date) => {
        setLoading(true);
        try {
            const data = await api.getHijriDate(date);
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
            <div className="flex justify-between items-center mb-6 px-2">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-800">
                        {format(currentMonth, 'MMMM yyyy', { locale: id })}
                    </h2>
                </div>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
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
                        className={`relative aspect-square p-1 cursor-pointer`}
                        onClick={() => onDateClick(cloneDay)}
                    >
                        <div className={`w-full h-full flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200
                            ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-50'}
                            ${isSelected ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700' : ''}
                            ${isDateToday && !isSelected ? 'border-2 border-emerald-500 text-emerald-600' : ''}
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
        return <div className="space-y-1">{rows}</div>;
    };

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 transition-colors">
            <PageHeader title="Kalender Hijri" />
            
            <div className="max-w-md mx-auto w-full px-6 pt-8">
            {/* Header / Hijri Detail Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg shadow-emerald-100 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 pointer-events-none">
                    <CalendarIcon size={140} />
                </div>

                <div className="relative z-10 text-center min-h-[140px] flex flex-col justify-center">
                    <div className="text-emerald-100 font-medium text-lg mb-1">
                        {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: id })}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="animate-spin text-white" size={32} />
                        </div>
                    ) : hijriDate ? (
                        <>
                            <h1 className="text-4xl font-bold font-mono my-2">{hijriDate.day}</h1>
                            <div className="text-xl opacity-90">
                                {hijriDate.month.en} {hijriDate.year} H
                            </div>
                            <div className="mt-2 text-emerald-200 font-serif text-lg">
                                {hijriDate.month.ar}
                            </div>
                        </>
                    ) : (
                        <div className="opacity-70">Pilih tanggal untuk melihat kalender Hijriah</div>
                    )}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                {renderHeader()}
                {renderDays()}
                {renderCells()}
            </div>

            {/* Hint */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-xs text-center">
                Tanggal Hijriah dapat berbeda +/- 1 hari sesuai metode penetapan.
            </div>
        </div>
    </div>
    );
};

export default CalendarPage;
