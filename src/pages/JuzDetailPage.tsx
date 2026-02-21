import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Verse } from '../services/api';
import { storageService } from '../services/storageService';
import { ChevronLeft, Loader2, BookOpen, ChevronRight, Bookmark } from 'lucide-react';

const JuzDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [verses, setVerses] = useState<Verse[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastReadVerse, setLastReadVerse] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            const juzId = Number(id);
            fetchVertices(juzId);

            const lastRead = storageService.getLastRead();
            if (lastRead && lastRead.surahName.includes(`Juz ${juzId}`)) {
                setLastReadVerse(lastRead.verseNumber);
            }
        }
    }, [id]);

    const fetchVertices = async (juzId: number) => {
        setLoading(true);
        try {
            const data = await api.getJuzVerses(juzId);
            setVerses(data);

            // Auto save first verse of Juz as last read if viewed
            if (data.length > 0) {
                storageService.saveLastRead(Number(data[0].surah), `Juz ${juzId}`, Number(data[0].ayah));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLastRead = (verse: Verse) => {
        storageService.saveLastRead(Number(verse.surah), `Juz ${id} (${verse.surah})`, Number(verse.ayah));
        setLastReadVerse(Number(verse.ayah));
    };

    return (
        <div className="max-w-md mx-auto w-full pb-20 dark:bg-slate-950 transition-colors">
            {/* Header - Theme Updated to Green & Orange */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 pt-12 pb-8 px-6 rounded-b-[3rem] shadow-2xl mb-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                    <BookOpen size={160} />
                </div>
                <div className="relative z-10 text-center">
                    <div className="flex justify-start mb-6">
                        <Link to="/quran" className="inline-flex items-center text-primary-100 hover:text-white transition-all font-black text-[10px] uppercase  bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 active:scale-95">
                            <ChevronLeft size={16} className="mr-1" /> Kembali
                        </Link>
                    </div>
                    <h1 className="text-5xl font-black mb-1 tracking-tight drop-shadow-sm">Juz {id}</h1>
                    <p className="text-primary-100 text-[10px] font-black uppercase tracking-[0.2em] opacity-80 leading-relaxed">Panduan Bacaan Juz Terpilih</p>
                </div>
            </div>

            {/* Verses List */}
            <div className="px-4 space-y-5">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-24 gap-4">
                        <Loader2 className="animate-spin text-primary-600" size={40} />
                        <p className="text-[10px] font-black text-slate-400 uppercase  animate-pulse">Memuat Ayat...</p>
                    </div>
                ) : (
                    verses.map((verse, idx) => (
                        <div
                            key={`${verse.surah}-${verse.ayah}-${idx}`}
                            onClick={() => handleSaveLastRead(verse)}
                            className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-primary-500/5 transition-all group cursor-pointer ${lastReadVerse === Number(verse.ayah) ? 'border-primary-200 bg-primary-50/10' : ''}`}
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-inner border transition-colors ${lastReadVerse === Number(verse.ayah) ? 'bg-primary-600 text-white border-primary-600' : 'bg-primary-50 dark:bg-primary-900/30 text-secondary-600 dark:text-secondary-400 border-primary-100/50 dark:border-primary-900/30'}`}>
                                        Surah {verse.surah} : {verse.ayah}
                                    </span>
                                    {lastReadVerse === Number(verse.ayah) && (
                                        <Bookmark size={14} className="text-primary-600 animate-pulse" fill="currentColor" />
                                    )}
                                </div>
                            </div>

                            <div className="text-right mb-6">
                                <p className="font-serif text-3xl leading-[2.5] text-slate-800 dark:text-slate-100" dir="rtl">{verse.arab}</p>
                            </div>
                            <div className="space-y-3">
                                <p className="text-secondary-600 dark:text-secondary-400 text-sm font-bold tracking-tight italic group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{verse.latin}</p>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed text-justify">{verse.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default JuzDetailPage;
