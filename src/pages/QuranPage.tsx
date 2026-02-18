import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Surah, Juz, Theme } from '../services/api';
import { Search, Play, Pause, Loader2, Layers, Grid, BookOpen } from 'lucide-react';

const QuranPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'surah' | 'juz' | 'theme'>('surah');
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [juzs, setJuzs] = useState<Juz[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [playingId, setPlayingId] = useState<number | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        loadData();
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
            } else if (activeTab === 'theme' && themes.length === 0) {
                const data = await api.getAllThemes();
                setThemes(data);
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

    const filteredThemes = themes.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-md mx-auto w-full pb-20">
            {/* Header */}
            <div className="bg-emerald-600 pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg mb-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BookOpen size={120} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold mb-1">Al-Quran</h1>
                    <p className="text-emerald-100 text-sm opacity-90">Baca dan Dengarkan Ayat Suci</p>

                    <div className="mt-6">
                        <div className="flex bg-white/10 backdrop-blur-sm p-1 rounded-xl mb-4">
                            <button
                                onClick={() => setActiveTab('surah')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'surah' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-100 hover:bg-white/10'}`}
                            >
                                Surah
                            </button>
                            <button
                                onClick={() => setActiveTab('juz')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'juz' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-100 hover:bg-white/10'}`}
                            >
                                Juz
                            </button>
                            <button
                                onClick={() => setActiveTab('theme')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'theme' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-100 hover:bg-white/10'}`}
                            >
                                Tema
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" size={20} />
                            <input
                                type="text"
                                placeholder={`Cari ${activeTab === 'surah' ? 'Surah' : activeTab === 'theme' ? 'Tema' : 'Juz'}...`}
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 px-4">
                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-slate-100 rounded"></div>
                                        <div className="h-3 w-32 bg-slate-100 rounded"></div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'surah' ? (
                    filteredSurahs.length > 0 ? (
                        filteredSurahs.map((surah, index) => (
                            <div 
                                key={surah.number} 
                                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:bg-emerald-50/50 hover:border-emerald-100 hover:shadow-md transition-all group relative animate-in fade-in slide-in-from-bottom-4 duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Link to={`/quran/${surah.number}`} className="absolute inset-0 z-0"></Link>
                                <div className="flex items-center gap-4 relative z-10 pointer-events-none">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-sm relative transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                        <div className="absolute inset-0 border-2 border-emerald-100/50 rounded-2xl"></div>
                                        {surah.number}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{surah.name_id}</h3>
                                        <p className="text-xs text-slate-500">
                                            {surah.translation_id} • {surah.number_of_verses} Ayat
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="text-right mr-2 hidden sm:block pointer-events-none">
                                        <p className="font-serif text-2xl text-emerald-900 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">{surah.name_short}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleAudio(surah.audio_url, surah.number);
                                        }}
                                        className={`p-2.5 rounded-full transition-all ${playingId === surah.number ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110' : 'bg-slate-50 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'}`}
                                    >
                                        {playingId === surah.number ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <Search className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500 font-medium">Tidak ditemukan surah "{searchQuery}"</p>
                            <button onClick={() => setSearchQuery('')} className="mt-4 text-emerald-600 text-sm font-bold">Hapus Pencarian</button>
                        </div>
                    )
                ) : activeTab === 'juz' ? (
                    <div className="grid grid-cols-2 gap-4">
                        {juzs.map((juz, index) => (
                            <Link 
                                key={juz.number} 
                                to={`/quran/juz/${juz.number}`} 
                                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all text-center group animate-in zoom-in-95 duration-300"
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl mx-auto mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                                    {juz.number}
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors text-lg">Juz {juz.number}</h3>
                                <div className="h-1 w-8 bg-emerald-100 mx-auto rounded-full mb-2 group-hover:w-16 transition-all duration-300"></div>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{juz.name_start_id}</p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredThemes.length > 0 ? (
                            filteredThemes.map((theme, index) => (
                                <Link 
                                    key={theme.id} 
                                    to={`/quran/tema/${theme.id}`} 
                                    className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-md transition-all group animate-in fade-in slide-in-from-left-4 duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <Layers size={18} />
                                    </div>
                                    <h3 className="font-bold text-slate-700 group-hover:text-emerald-800 transition-colors flex-1">{theme.name}</h3>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                        <Grid size={16} />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <Search className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-500 font-medium">Tidak ditemukan tema "{searchQuery}"</p>
                                <button onClick={() => setSearchQuery('')} className="mt-4 text-emerald-600 text-sm font-bold">Hapus Pencarian</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuranPage;
