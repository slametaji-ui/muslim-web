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
                    <div className="flex flex-col justify-center items-center h-40">
                        <Loader2 className="animate-spin text-emerald-600" size={32} />
                        <p className="text-slate-400 text-sm mt-2">Memuat Data...</p>
                    </div>
                ) : activeTab === 'surah' ? (
                    filteredSurahs.length > 0 ? (
                        filteredSurahs.map((surah) => (
                            <div key={surah.number} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:bg-slate-50 transition-colors group relative">
                                <Link to={`/quran/${surah.number}`} className="absolute inset-0 z-0"></Link>
                                <div className="flex items-center gap-4 relative z-10 pointer-events-none">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm relative">
                                        <div className="absolute inset-0 border-2 border-emerald-100 rounded-full"></div>
                                        {surah.number}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{surah.name_id}</h3>
                                        <p className="text-xs text-slate-500">
                                            {surah.translation_id} • {surah.number_of_verses} Ayat
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="text-right mr-2 hidden sm:block pointer-events-none">
                                        <p className="font-serif text-xl text-emerald-800">{surah.name_short}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleAudio(surah.audio_url, surah.number);
                                        }}
                                        className={`p-2 rounded-full transition-all ${playingId === surah.number ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-110' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'}`}
                                    >
                                        {playingId === surah.number ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            Tidak ditemukan surah "{searchQuery}"
                        </div>
                    )
                ) : activeTab === 'juz' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {juzs.map((juz) => (
                            <Link key={juz.number} to={`/quran/juz/${juz.number}`} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all text-center group">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    {juz.number}
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1">Juz {juz.number}</h3>
                                <p className="text-xs text-slate-500">Starts: {juz.name_start_id}</p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredThemes.length > 0 ? (
                            filteredThemes.map((theme) => (
                                <Link key={theme.id} to={`/quran/tema/${theme.id}`} className="block bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
                                    <h3 className="font-medium text-slate-800">{theme.name}</h3>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-400">
                                Tidak ditemukan tema "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuranPage;
