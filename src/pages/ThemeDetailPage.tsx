import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Verse } from '../services/api';
import { ChevronLeft, Loader2, BookOpen, Layers } from 'lucide-react';

const ThemeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [verses, setVerses] = useState<Verse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchThemeVerses(Number(id));
        }
    }, [id]);

    const fetchThemeVerses = async (themeId: number) => {
        setLoading(true);
        try {
            const data = await api.getThemeVerses(themeId);
            setVerses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto w-full pb-20">
            {/* Header */}
            <div className="bg-emerald-600 pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg mb-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Layers size={120} />
                </div>
                <div className="relative z-10">
                    <Link to="/quran" className="inline-flex items-center text-emerald-100 hover:text-white mb-4 transition-colors">
                        <ChevronLeft size={20} className="mr-1" /> Kembali
                    </Link>
                    <h1 className="text-2xl font-bold mb-1">Tema Al-Quran</h1>
                    <p className="text-emerald-100 text-sm opacity-90">Ayat-ayat terkait tema ini</p>
                </div>
            </div>

            {/* Verses List */}
            <div className="px-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-emerald-600" size={32} />
                    </div>
                ) : verses.length > 0 ? (
                    verses.map((verse, idx) => (
                        <div key={`${verse.surah}-${verse.ayah}-${idx}`} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                                        Surah {verse.surah} : {verse.ayah}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right mb-4">
                                <p className="font-serif text-2xl leading-loose text-slate-800" dir="rtl">{verse.arab}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-emerald-600 text-sm italic">{verse.latin}</p>
                                <p className="text-slate-600 text-sm leading-relaxed">{verse.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        Tidak ada ayat untuk tema ini.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThemeDetailPage;
