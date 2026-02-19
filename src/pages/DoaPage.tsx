import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Sparkles, Heart, BookOpen, Clock, Library, Star, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

interface DoaItem {
    id: string;
    title: string;
    arabic: string;
    latin: string;
    translation: string;
    source?: string;
}

const dailyPrayers: DoaItem[] = [
    {
        id: 'h-1',
        title: 'Doa Sebelum Tidur',
        arabic: 'بِسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ',
        latin: 'Bismika allahumma ahya wa amuutu.',
        translation: 'Dengan nama-Mu ya Allah, aku hidup dan aku mati.'
    },
    {
        id: 'h-2',
        title: 'Doa Bangun Tidur',
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        latin: "Alhamdu lillaahil ladzii ahyaanaa ba'da maa amaatanaa wa ilaihin nusyuur.",
        translation: 'Segala puji bagi Allah yang telah menghidupkan kami sesudah mematikan kami (tidur) dan kepada-Nyalah kami kembali.'
    },
    {
        id: 'h-3',
        title: 'Doa Sebelum Makan',
        arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
        latin: 'Allahumma baarik lanaa fiimaa razaqtana waqinaa adzaaban naar.',
        translation: 'Ya Allah, berkahilah kami atas rezeki yang telah Engkau berikan kepada kami dan peliharalah kami dari siksa neraka.'
    },
    {
        id: 'h-4',
        title: 'Doa Sesudah Makan',
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
        latin: "Alhamdu lillaahil ladzii ath'amanaa wa saqaanaa wa ja'alanaa muslimiin.",
        translation: 'Segala puji bagi Allah yang telah memberi kami makan dan minum, serta menjadikan kami muslim.'
    },
    {
        id: 'h-5',
        title: 'Doa Masuk Kamar Mandi',
        arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
        latin: 'Allahumma inni a’udzu bika minal khubutsi wal khabaits.',
        translation: 'Ya Allah, sesungguhnya aku berlindung kepada-Mu dari godaan setan laki-laki dan setan perempuan.'
    },
    {
        id: 'h-6',
        title: 'Doa Keluar Kamar Mandi',
        arabic: 'غُفْرَانَكَ الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الْأَذَى وَعَافَانِي',
        latin: 'Ghufranaka. Alhamdulillahilladzi adzhaba ‘annil adzaa wa ‘aafanii.',
        translation: 'Aku memohon ampunan-Mu. Segala puji bagi Allah yang telah menghilangkan kotoran dari tubuhku dan yang telah menyejahterakanku.'
    },
    {
        id: 'h-7',
        title: 'Doa Berpakaian',
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
        latin: 'Alhamdulillahilladzi kasaani hadza wa razaqaniihi min ghairi haulin minni wa laa quwwatin.',
        translation: 'Segala puji bagi Allah yang telah memakaikan pakaian ini kepadaku dan memberikan rezeki pakaian ini kepadaku tanpa daya dan kekuatan dariku.'
    },
    {
        id: 'h-8',
        title: 'Doa Masuk Masjid',
        arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
        latin: 'Allahummaftahlii abwaaba rahmatik.',
        translation: 'Ya Allah, bukakanlah bagiku pintu-pintu rahmat-Mu.'
    },
    {
        id: 'h-9',
        title: 'Doa Keluar Masjid',
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
        latin: 'Allahumma inni as-aluka min fadhlik.',
        translation: 'Ya Allah, sesungguhnya aku memohon keutamaan dari-Mu.'
    },
    {
        id: 'h-10',
        title: 'Doa Untuk Kedua Orang Tua',
        arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
        latin: 'Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.',
        translation: 'Ya Tuhanku, ampunilah dosaku dan dosa kedua orang tuaku, dan sayangilah mereka sebagaimana mereka mendidikku di waktu kecil.'
    }
];

const postPrayerPrayers: DoaItem[] = [
    {
        id: 's-0',
        title: 'Istighfar (3x)',
        arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ',
        latin: 'Astaghfirullaahal adziim.',
        translation: 'Aku memohon ampun kepada Allah yang Maha Agung.'
    },
    {
        id: 's-1',
        title: 'Tahlil & Pujian',
        arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        latin: 'Laa ilaha illallaahu wahdahu laa syariika lah, lahul mulku wa lahul hamdu yuhyii wa yumiitu wa huwa ‘alaa kulli syai’in qadiir.',
        translation: 'Tidak ada Tuhan selain Allah semesta, tidak ada sekutu bagi-Nya. Bagi-Nya segala kerajaan dan bagi-Nya segala puji. Dia yang menghidupkan dan yang mematikan, dan Dia Maha Kuasa atas segala sesuatu.'
    },
    {
        id: 's-2',
        title: 'Doa Suami (Imam) untuk Keluarga',
        arabic: 'بِسْمِ اللَّه الرَّحْمَنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ، حَمْدًا شَاكِرِينَ حَمْدًا نَاعِمِينَ ، حَمْدًا يُوَافِي نِعَمَهُ وَيُكَافِئُ مَزِيْدَهُ. يَا رَبَّنَا لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيْمِ سُلْطَانِكَ. اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ. رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا. اللَّهُمَّ بَارِكْ لِي فِي أَهْلِي وَبَارِك| لَهُمْ فِيَّ. اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا. رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.',
        latin: "Bismillahir rahmaanir rahiim. Alhamdulillahi rabbil 'aalamin, hamdan syaakiriin hamdan naa'imiin, hamdan yuwaafii ni'amahu wa yukaafiu maziidah. Ya rabbana lakal hamdu kamaa yanbaghii li jalaali wajhika wa 'adhiimi sulthaanik. Allahumma shalli 'ala sayyidina muhammadin wa 'ala aali sayyidina muhammad. Rabbana hab lana min azwajina wa dhurriyatina qurrata a’yun, waj’alna lil muttaqina imama. Allahumma baarik lii fii ahlii wa baarik lahum fiyya. Allahumma inni as-aluka 'ilman naafi'an wa rizqan thayyiban wa 'amalan mutaqabbalan. Rabbana atina fiddunya hasanah, wa fil akhirati hasanah, wa qina 'adhaban naar.",
        translation: 'Ya Tuhan kami, anugerahkanlah kepada kami istri-istri kami dan keturunan kami sebagai penyenang hati (kami), dan jadikanlah kami imam bagi orang-orang yang bertakwa. Ya Allah, berkahilah aku dalam keluargaku dan berkahilah mereka di dalam diriku. Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik (halal), dan amal yang diterima.'
    },
    {
        id: 's-3',
        title: 'Doa Penghapusan Dosa Keluarga',
        arabic: 'اللَّهُمَّ اغْفِرْ لِي ذُنُوبِي وَلِوَالِدَيَّ وَلِأَهْلِي وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ',
        latin: 'Allahummaghfirlii dzunuubii wa liwaalidayya wa li-ahlii wa lilmu’miniina wal mu’minaat.',
        translation: 'Ya Allah, ampunilah dosa-dosaku, dosa kedua orang tuaku, keluargaku, serta seluruh kaum mukminin dan mukminat.'
    },
    {
        id: 's-4',
        title: 'Penutup (Pujian & Syukur)',
        arabic: 'سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ ، وَسَلَامٌ عَلَى الْمُرْسَلِينَ ، وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        latin: 'Subhaana rabbika rabbil ‘izzati ‘ammaa yashifuun, wa salaamun ‘alal mursaliin, wal hamdu lillaahi rabbil ‘aalamiin.',
        translation: 'Maha Suci Tuhanmu, Tuhan yang memiliki keagungan dari apa yang mereka katakan. Dan keselamatan semoga tercurah kepada para rasul. Dan segala puji bagi Allah, Tuhan semesta alam.'
    }
];

const DoaPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'harian' | 'sholat'>('harian');
    const [searchQuery, setSearchQuery] = useState('');

    const currentPrayers = activeTab === 'harian' ? dailyPrayers : postPrayerPrayers;
    const filteredPrayers = currentPrayers.filter(doa => 
        doa.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doa.translation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-md mx-auto w-full pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg mb-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <Sparkles size={120} />
                </div>
                <div className="relative z-10">
                    <Link to="/" className="absolute left-0 top-0 p-2 text-white/80 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-black mb-1 tracking-tight">Koleksi Doa</h1>
                    <p className="text-primary-100 text-sm font-medium opacity-90">Kekuatan Seorang Mukmin</p>

                    {/* Tabs */}
                    <div className="mt-8 flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-inner">
                        <button
                            onClick={() => setActiveTab('harian')}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'harian' ? 'bg-white text-primary-700 shadow-md scale-[0.98]' : 'text-primary-50 hover:bg-white/10'}`}
                        >
                            Daily Prayers
                        </button>
                        <button
                            onClick={() => setActiveTab('sholat')}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sholat' ? 'bg-white text-primary-700 shadow-md scale-[0.98]' : 'text-primary-50 hover:bg-white/10'}`}
                        >
                            After Prayer
                        </button>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="px-6 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" size={18} />
                    <input
                        type="text"
                        placeholder="Search prayers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-900 text-slate-800 dark:text-slate-100 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Prayer List */}
            <div className="px-6 space-y-4">
                {filteredPrayers.length > 0 ? (
                    filteredPrayers.map((doa) => (
                        <div key={doa.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600">
                                    <Star size={16} />
                                </div>
                                <button className="p-2 text-slate-300 hover:text-primary-500 transition-colors">
                                    <Bookmark size={20} />
                                </button>
                            </div>
                            
                            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 leading-tight">{doa.title}</h3>
                            
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4">
                                <p className="text-2xl font-serif text-slate-800 dark:text-primary-50 leading-relaxed text-right mb-4" dir="rtl">
                                    {doa.arabic}
                                </p>
                                <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-2 italic">
                                    {doa.latin}
                                </p>
                            </div>
                            
                            <div className="relative">
                                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary-500/20 rounded-full"></div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-3">
                                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-300 block mb-1">Translation</span>
                                    {doa.translation}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                            <Search size={40} />
                        </div>
                        <p className="text-slate-400 font-medium">No prayers found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoaPage;
