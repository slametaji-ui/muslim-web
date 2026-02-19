import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Verse } from '../services/api';
import { ChevronLeft, Loader2, BookOpen, ChevronRight } from 'lucide-react';

const JuzDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [verses, setVerses] = useState<Verse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchVertices(Number(id));
        }
    }, [id]);

    const fetchVertices = async (juzId: number) => {
        setLoading(true);
        try {
            const data = await api.getJuzVerses(juzId);
            setVerses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto w-full pb-20">
            {/* Header - Theme Updated to Green & Orange */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 pt-12 pb-8 px-6 rounded-b-[3rem] shadow-2xl mb-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                    <BookOpen size={160} />
                </div>
                <div className="relative z-10 text-center">
                    <div className="flex justify-start mb-6">
                        <Link to="/quran" className="inline-flex items-center text-primary-100 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 active:scale-95">
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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Memuat Ayat...</p>
                    </div>
                ) : (
                    verses.map((verse, idx) => (
                        <div key={`${verse.surah}-${verse.ayah}-${idx}`} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-primary-500/5 transition-all group">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <span className="bg-primary-50 text-secondary-600 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-inner border border-primary-100/50">
                                        Surah {verse.surah} : {verse.ayah}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right mb-6">
                                <p className="font-serif text-3xl leading-[2.5] text-slate-800 dark:text-slate-100" dir="rtl">{verse.arab}</p>
                            </div>
                            <div className="space-y-3">
                                <p className="text-secondary-600 text-sm font-bold tracking-tight italic group-hover:text-primary-600 transition-colors">{verse.latin}</p>
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
