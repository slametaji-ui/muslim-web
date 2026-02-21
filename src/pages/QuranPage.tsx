import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Surah, Juz, Theme } from '../services/api';
import { storageService } from '../services/storageService';
import { Search, Play, Pause, Loader2, Layers, Grid, Library, ChevronRight, Bookmark, CheckCircle2 } from 'lucide-react';

const QuranPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'surah' | 'juz'>('surah');
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [juzs, setJuzs] = useState<Juz[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [playingId, setPlayingId] = useState<number | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const [lastRead, setLastRead] = useState<any>(null);
    const [khatamList, setKhatamList] = useState<number[]>([]);

    useEffect(() => {
        loadData();
        setLastRead(storageService.getLastRead());
        setKhatamList(storageService.getKhatamList());

        return () => {
            if (audio) {
                audio.pause();
            }
        };
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'surah' && surahs.length === 0) {
                const data = await api.getQuranSurahs();
                setSurahs(data);
            } else if (activeTab === 'juz' && juzs.length === 0) {
                const data = await api.getAllJuz();
                setJuzs(data);
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAudio = (url: string, id: number) => {
        if (playingId === id) {
            audio?.pause();
            setPlayingId(null);
            setAudio(null);
        } else {
            if (audio) audio.pause();
            const newAudio = new Audio(url);
            newAudio.play();
            newAudio.onended = () => {
                setPlayingId(null);
                setAudio(null);
            };
            setAudio(newAudio);
            setPlayingId(id);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredSurahs = surahs.filter(s =>
        s.name_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.translation_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-md mx-auto w-full pb-20 dark:bg-slate-950 transition-colors">
            {/* Header - Theme Updated to Green & Orange */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg mb-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <Library size={120} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-black mb-1 tracking-tight">Al-Quran</h1>
                    <p className="text-primary-100 text-sm font-medium opacity-90">Baca dan Dengarkan Ayat Suci</p>

                    <div className="mt-6">
                        <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl mb-4 border border-white/10 shadow-inner">
                            <button
                                onClick={() => setActiveTab('surah')}
                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase  transition-all ${activeTab === 'surah' ? 'bg-white text-primary-700 shadow-md scale-[0.98]' : 'text-primary-50 hover:bg-white/10'}`}
                            >
                                Surah
                            </button>
                            <button
                                onClick={() => setActiveTab('juz')}
                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase  transition-all ${activeTab === 'juz' ? 'bg-white text-primary-700 shadow-md scale-[0.98]' : 'text-primary-50 hover:bg-white/10'}`}
                            >
                                Juz
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-600" size={18} />
                            <input
                                type="text"
                                placeholder={`Cari ${activeTab === 'surah' ? 'Surah' : 'Juz'}...`}
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-300 shadow-lg border-none text-sm font-bold"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 px-4">
                {/* Last Read Card */}
                {!loading && activeTab === 'surah' && lastRead && !searchQuery && (
                    <Link
                        to={`/quran/${lastRead.surahId}`}
                        className="block bg-gradient-to-r from-primary-600 to-primary-700 p-6 rounded-[2rem] shadow-xl shadow-primary-500/10 mb-6 relative overflow-hidden group border border-white/10"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
                            <Bookmark size={80} fill="white" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Bookmark size={14} className="text-secondary-400" fill="currentColor" />
                                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Lanjutkan Membaca</span>
                            </div>
                            <h2 className="text-xl font-black text-white uppercase">{lastRead.surahName}</h2>
                            <p className="text-primary-100 text-xs font-bold opacity-80 uppercase ">Ayat {lastRead.verseNumber}</p>
                        </div>
                    </Link>
                )}

                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                        <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'surah' ? (
                    filteredSurahs.length > 0 ? (
                        filteredSurahs.map((surah, index) => (
                            <div
                                key={surah.number}
                                className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center hover:bg-primary-50/50 dark:hover:bg-primary-900/10 hover:border-primary-100 dark:hover:border-primary-800 hover:shadow-xl hover:shadow-primary-500/5 transition-all group relative animate-in fade-in slide-in-from-bottom-4 duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Link to={`/quran/${surah.number}`} className="absolute inset-0 z-0"></Link>
                                <div className="flex items-center gap-4 relative z-10 pointer-events-none">
                                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center font-black text-sm relative transition-all group-hover:bg-primary-600 group-hover:text-white shadow-inner">
                                        <div className="absolute inset-0 border-2 border-primary-100/50 dark:border-primary-900/30 rounded-2xl"></div>
                                        {surah.number}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors uppercase tracking-tight text-sm">{surah.name_id}</h3>
                                            {khatamList.includes(surah.number) && (
                                                <CheckCircle2 size={14} className="text-emerald-500" fill="currentColor" />
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                            {surah.translation_id} • {surah.number_of_verses} Ayat
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="text-right mr-2 hidden sm:block pointer-events-none">
                                        <p className="font-serif text-2xl text-primary-900/80 group-hover:text-secondary-600 group-hover:scale-110 transition-all">{surah.name_short}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleAudio(surah.audio_url, surah.number);
                                        }}
                                        className={`p-2.5 rounded-2xl transition-all ${playingId === surah.number ? 'bg-secondary-500 text-white shadow-lg shadow-secondary-200 scale-110' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-primary-100 dark:hover:bg-primary-900/50 hover:text-primary-600 dark:hover:text-primary-400'}`}
                                    >
                                        {playingId === surah.number ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                            <Search className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Tidak ditemukan surah "{searchQuery}"</p>
                            <button onClick={() => setSearchQuery('')} className="mt-4 text-emerald-600 dark:text-emerald-400 text-sm font-bold">Hapus Pencarian</button>
                        </div>
                    )
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {juzs.map((juz, index) => (
                            <Link
                                key={juz.number}
                                to={`/quran/juz/${juz.number}`}
                                className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-200 dark:hover:border-primary-800 hover:-translate-y-1 transition-all text-center group animate-in zoom-in-95 duration-300"
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-3xl flex items-center justify-center font-black text-2xl mx-auto mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-inner">
                                    {juz.number}
                                </div>
                                <h3 className="font-black text-slate-800 dark:text-white mb-1 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors text-lg uppercase tracking-tight">Juz {juz.number}</h3>
                                <div className="h-1 w-6 bg-secondary-400 mx-auto rounded-full mb-3 group-hover:w-12 transition-all duration-500"></div>
                                <p className="text-[9px] text-slate-400 font-black uppercase  leading-relaxed">{juz.name_start_id}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuranPage;
