import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, SurahDetail } from '../services/api';
import { ChevronLeft, Play, Pause, Loader2, Share2, Info, BookOpen } from 'lucide-react';

const SurahDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [surah, setSurah] = useState<SurahDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const [currentVerseAudio, setCurrentVerseAudio] = useState<number | null>(null);
    const [showTafsir, setShowTafsir] = useState(false);

    useEffect(() => {
        if (id) {
            loadSurah(parseInt(id));
        }
        return () => {
            if (playingAudio) {
                playingAudio.pause();
            }
        };
    }, [id]);

    const loadSurah = async (surahId: number) => {
        setLoading(true);
        try {
            const data = await api.getSurahDetails(surahId);
            setSurah(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAudio = (url: string, verseNumber?: number) => {
        if (playingAudio && (verseNumber === currentVerseAudio || (!verseNumber && currentVerseAudio === null))) {
            if (isPlaying) {
                playingAudio.pause();
                setIsPlaying(false);
            } else {
                playingAudio.play();
                setIsPlaying(true);
            }
        } else {
            if (playingAudio) {
                playingAudio.pause();
            }
            const newAudio = new Audio(url);
            newAudio.onended = () => {
                setIsPlaying(false);
                setPlayingAudio(null);
                setCurrentVerseAudio(null);
            };
            newAudio.play();
            setPlayingAudio(newAudio);
            setIsPlaying(true);
            setCurrentVerseAudio(verseNumber || null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen pb-20">
                <Loader2 className="animate-spin text-emerald-600" size={40} />
                <p className="text-slate-400 text-sm mt-4">Memuat Ayat...</p>
            </div>
        );
    }

    if (!surah) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen pb-20 text-center px-4">
                <h2 className="text-xl font-bold text-slate-800">Gagal memuat data</h2>
                <Link to="/quran" className="mt-4 text-emerald-600 font-medium hover:underline">Kembali ke Daftar Surah</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto w-full pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 py-4 px-4 flex items-center justify-between mb-6 shadow-sm">
                <Link to="/quran" className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <div className="text-center">
                    <h1 className="font-bold text-slate-800 text-lg">{surah.name_id}</h1>
                    <p className="text-xs text-slate-500">{surah.translation_id} • {surah.number_of_verses} Ayat</p>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <Info size={24} />
                </button>
            </div>

            {/* Surah Banner */}
            <div className="mx-4 mb-8 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 text-center text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="font-serif text-4xl mb-2">{surah.name_short}</h2>
                    <p className="text-emerald-100 text-sm mb-6">{surah.revelation_id} • {surah.number_of_verses} Ayat</p>

                    {/* Bismillah */}
                    {surah.number !== 1 && surah.number !== 9 && (
                        <div className="font-serif text-2xl mt-4 mb-2 opacity-90">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
                        </div>
                    )}

                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            onClick={() => toggleAudio(surah.audio_url)}
                            className="bg-white text-emerald-700 px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-emerald-50 transition-colors shadow-lg"
                        >
                            {isPlaying && currentVerseAudio === null ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            Putar Murottal
                        </button>
                        <button
                            onClick={() => setShowTafsir(!showTafsir)}
                            className="bg-white/20 backdrop-blur-sm text-white border border-white/40 px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-white/30 transition-colors"
                        >
                            <Info size={18} />
                            {showTafsir ? 'Tutup Tafsir' : 'Baca Tafsir'}
                        </button>
                    </div>

                    {/* Tafsir Content */}
                    {showTafsir && surah.tafsir && (
                        <div className="mt-6 text-left bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <BookOpen size={20} /> Tafsir Jalalayn
                            </h3>
                            <p className="text-sm leading-relaxed opacity-90 text-justify">
                                {surah.tafsir}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Verses List */}
            <div className="space-y-6 px-4">
                {surah.verses?.map((verse) => (
                    <div key={verse.id} className="border-b border-slate-100 pb-6 last:border-0" id={`ayah-${verse.ayah}`}>
                        {/* Actions Row */}
                        <div className="flex justify-between items-center mb-6 bg-slate-50 rounded-lg p-2">
                            <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {verse.ayah}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleAudio(verse.audio, parseInt(verse.ayah))}
                                    className={`p-2 rounded-full transition-colors ${isPlaying && currentVerseAudio === parseInt(verse.ayah) ? 'text-emerald-600 bg-emerald-100' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                >
                                    {isPlaying && currentVerseAudio === parseInt(verse.ayah) ? <Pause size={18} /> : <Play size={18} />}
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-colors">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Arabic Text */}
                        <div className="text-right mb-6">
                            <p className="font-serif text-3xl leading-[2.5] text-slate-800" dir="rtl">
                                {verse.arab}
                            </p>
                        </div>

                        {/* Transliteration & Meanings */}
                        <div className="space-y-2">
                            <p className="text-emerald-600 font-medium text-sm leading-relaxed">
                                {verse.latin}
                            </p>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {verse.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SurahDetailPage;
