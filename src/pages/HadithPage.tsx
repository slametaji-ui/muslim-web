import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Book, Loader2, Library, ChevronRight, Share2, Copy, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const HadithPage: React.FC = () => {
    const [hadiths, setHadiths] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadHadiths();
    }, []);

    const loadHadiths = async () => {
        setLoading(true);
        const data = await api.getHadithArbain();
        setHadiths(data);
        setLoading(false);
    };

    const filteredHadiths = hadiths.filter(h => 
        h.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.indo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-md mx-auto w-full pb-32 dark:bg-slate-950 transition-colors min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg mb-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <BookOpen size={120} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-black mb-1 tracking-tight">Hadits Arbain</h1>
                    <p className="text-primary-100 text-sm font-medium opacity-90">40 Hadits Utama Pilihan</p>

                    <div className="mt-6">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-600" size={18} />
                            <input
                                type="text"
                                placeholder="Cari judul hadits..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-300 shadow-lg border-none text-sm font-bold"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4 px-4">
                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 h-24"></div>
                        ))}
                    </div>
                ) : filteredHadiths.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredHadiths.map((hadith, index) => (
                            <div 
                                key={hadith.no} 
                                className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-primary-500/5 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner">
                                        {hadith.no}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-slate-800 dark:text-white group-hover:text-primary-700 transition-colors uppercase tracking-tight text-sm">{hadith.judul}</h3>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="font-serif text-xl text-slate-800 dark:text-primary-50 leading-relaxed text-right" dir="rtl">
                                        {hadith.arab}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                        "{hadith.indo}"
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-end gap-2">
                                    <button className="p-2.5 text-slate-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"><Share2 size={16} /></button>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${hadith.judul}\n\n${hadith.arab}\n\n${hadith.indo}`);
                                            alert('Hadits berhasil disalin!');
                                        }}
                                        className="p-2.5 text-slate-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Search className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500 font-medium">Hadits tidak ditemukan</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HadithPage;
