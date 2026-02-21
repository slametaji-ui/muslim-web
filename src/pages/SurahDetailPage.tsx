import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, SurahDetail } from '../services/api';
import { storageService } from '../services/storageService';
import { ChevronLeft, Play, Pause, Loader2, Share2, Info, BookOpen, CheckCircle2, Bookmark } from 'lucide-react';

const SurahDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [surah, setSurah] = useState<SurahDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const [currentVerseAudio, setCurrentVerseAudio] = useState<number | null>(null);
    const [showTafsir, setShowTafsir] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const [isKhatam, setIsKhatam] = useState(false);
    const [lastReadVerse, setLastReadVerse] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            const surahId = parseInt(id);
            loadSurah(surahId);
            setIsKhatam(storageService.getKhatamList().includes(surahId));

            const lastRead = storageService.getLastRead();
            if (lastRead && lastRead.surahId === surahId) {
                setLastReadVerse(lastRead.verseNumber);
            }
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

    const handleToggleKhatam = () => {
        if (!surah) return;
        const newList = storageService.toggleKhatam(surah.number);
        setIsKhatam(newList.includes(surah.number));
    };

    const handleSaveLastRead = (verseNumber: number) => {
        if (!surah) return;
        storageService.saveLastRead(surah.number, surah.name_id, verseNumber);
        setLastReadVerse(verseNumber);
    };

    const shareSurah = async () => {
        if (!surah) return;

        const shareData = {
            title: `Qolbi - Surah ${surah.name_id}`,
            text: `Baca Surah ${surah.name_id} (${surah.translation_id}) di Qolbi. Terdiri dari ${surah.number_of_verses} Ayat.`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                alert('Tautan surah berhasil disalin!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const toggleAudio = (url: string, verseNumber?: number) => {
        if (verseNumber) {
            handleSaveLastRead(verseNumber);
        }

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
                <Loader2 className="animate-spin text-primary-600" size={40} />
                <p className="text-slate-400 font-black text-[10px] uppercase  mt-4">Memuat Ayat...</p>
            </div>
        );
    }

    if (!surah) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen pb-20 dark:bg-slate-950 transition-colors text-center px-4">
                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Gagal memuat data</h2>
                <Link to="/quran" className="mt-4 text-primary-600 dark:text-primary-400 font-bold hover:underline uppercase text-[10px] ">Kembali ke Daftar Surah</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto w-full pb-24 dark:bg-slate-950 transition-colors">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 py-2 px-4 flex items-center justify-between mb-6 shadow-sm">
                <Link to="/quran" className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <div className="text-center">
                    <h1 className="font-bold text-slate-800 dark:text-white text-md tracking-tight uppercase">{surah.name_id}</h1>
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">{surah.translation_id} • {surah.number_of_verses} Ayat</p>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={handleToggleKhatam}
                        className={`p-2 rounded-full transition-all ${isKhatam ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-100'}`}
                        title={isKhatam ? "Sudah Khatam" : "Tandai Selesai Membaca"}
                    >
                        <CheckCircle2 size={22} fill={isKhatam ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={shareSurah}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 transition-colors"
                    >
                        <Share2 size={22} />
                    </button>
                    <button
                        onClick={() => setShowInfoModal(true)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 transition-colors"
                    >
                        <Info size={22} />
                    </button>
                </div>
            </div>

            {/* Surah Info Modal */}
            {showInfoModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 relative">
                        <button
                            onClick={() => setShowInfoModal(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <ChevronLeft className="rotate-90" size={20} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                <BookOpen size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">{surah.name_id}</h2>
                            <p className="text-primary-600 dark:text-primary-400 font-bold text-xs uppercase ">{surah.translation_id}</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black text-slate-400 uppercase ">Tempat Turun</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-white uppercase">{surah.revelation_id}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black text-slate-400 uppercase ">Jumlah Ayat</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-white uppercase">{surah.number_of_verses} Ayat</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black text-slate-400 uppercase ">Nomor Surah</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-white uppercase">Ke-{surah.number}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowInfoModal(false)}
                            className="w-full bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all uppercase  text-[10px]"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            {/* Surah Banner */}
            <div className="mx-4 mb-8 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 rounded-[2.5rem] p-8 text-center text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-700">
                    <BookOpen size={160} />
                </div>
                <div className="relative z-10">
                    <h2 className="font-serif text-5xl mb-3 drop-shadow-sm">{surah.name_short}</h2>
                    <p className="text-primary-50 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{surah.revelation_id} • {surah.number_of_verses} Ayat</p>

                    {/* Bismillah */}
                    {surah.number !== 1 && surah.number !== 9 && (
                        <div className="font-serif text-3xl mt-4 mb-8 opacity-90 drop-shadow-sm">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
                        </div>
                    )}

                    <div className="mt-8 flex justify-center gap-3">
                        <button
                            onClick={() => toggleAudio(surah.audio_url)}
                            className="bg-white text-primary-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase  flex items-center gap-2 hover:bg-primary-50 active:scale-95 transition-all shadow-xl"
                        >
                            {isPlaying && currentVerseAudio === null ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                            Putar Murottal
                        </button>
                        <button
                            onClick={() => setShowTafsir(!showTafsir)}
                            className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-2xl font-black text-[10px] uppercase  flex items-center gap-2 hover:bg-white/20 active:scale-95 transition-all"
                        >
                            <Info size={16} />
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
                    <div
                        key={verse.id}
                        className={`border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 transition-all duration-500 ${lastReadVerse === Number(verse.ayah) ? 'bg-primary-50/30 dark:bg-primary-900/10 -mx-4 px-4 rounded-xl' : ''}`}
                        id={`ayah-${verse.ayah}`}
                    >
                        {/* Actions Row */}
                        <div className="flex justify-between items-center mb-6 bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 text-secondary-600 dark:text-secondary-400 rounded-xl flex items-center justify-center font-black text-xs shadow-inner">
                                    {verse.ayah}
                                </div>
                                {lastReadVerse === Number(verse.ayah) && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-600 text-white rounded-full">
                                        <Bookmark size={10} fill="currentColor" />
                                        <span className="text-[8px] font-black uppercase tracking-tighter">Terakhir Dibaca</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleAudio(verse.audio, Number(verse.ayah))}
                                    className={`p-2.5 rounded-xl transition-all ${isPlaying && currentVerseAudio === Number(verse.ayah) ? 'text-white bg-secondary-500 shadow-lg shadow-secondary-200' : 'text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/50'}`}
                                >
                                    {isPlaying && currentVerseAudio === Number(verse.ayah) ? <Pause size={18} /> : <Play size={18} />}
                                </button>
                                <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Arabic Text */}
                        <div className="text-right mb-6">
                            <p className="font-serif text-3xl leading-[2.5] text-slate-800 dark:text-slate-100" dir="rtl">
                                {verse.arab}
                            </p>
                        </div>

                        {/* Transliteration & Meanings */}
                        <div className="space-y-2">
                            <p className="text-secondary-600 dark:text-secondary-400 font-bold text-sm leading-relaxed tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {verse.latin}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
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
