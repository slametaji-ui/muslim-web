import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, Sparkles, BookOpen, Clock, ScrollText, Users, Zap, Star, Bookmark, Volume2, Info, X, Share2, Copy, Heart, Home } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/CustomToast';

interface DoaItem {
    id: string;
    title: string;
    arabic: string;
    latin: string;
    translation: string;
    source?: string;
    fullText?: boolean;
}

interface Category {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
    description: string;
}

const categories: Category[] = [
    { id: 'matsurat', title: 'Al-Ma\'tsurat', icon: <Volume2 size={24} />, color: 'from-amber-500 to-amber-600', description: 'Zikir pagi & petang harian' },
    { id: 'asmaul', title: 'Asmaul Husna', icon: <Sparkles size={24} />, color: 'from-purple-500 to-purple-600', description: '99 Nama Allah SWT' },
    { id: 'harian', title: 'Doa Harian', icon: <Heart size={24} />, color: 'from-rose-500 to-rose-600', description: 'Kumpulan doa aktivitas harian' },
    { id: 'sholat', title: 'Setelah Sholat', icon: <Zap size={24} />, color: 'from-blue-500 to-blue-600', description: 'Dzikir & doa sesudah sholat' },
    { id: 'bilal', title: 'Bilal & Tarawih', icon: <Users size={24} />, color: 'from-emerald-600 to-emerald-700', description: 'Zikir khusus Ramadhan' },
];

const doaContent: Record<string, DoaItem[]> = {
    'asmaul': [
        { id: 'a-1', title: 'Ar-Rahman', arabic: 'الرحمن', latin: 'Ar-Rahman', translation: 'Maha Pengasih' },
        { id: 'a-2', title: 'Ar-Rahim', arabic: 'الرحيم', latin: 'Ar-Rahim', translation: 'Maha Penyayang' },
        { id: 'a-3', title: 'Al-Malik', arabic: 'الملك', latin: 'Al-Malik', translation: 'Maha Merajai' },
        { id: 'a-4', title: 'Al-Quddus', arabic: 'القدوس', latin: 'Al-Quddus', translation: 'Maha Suci' },
        { id: 'a-5', title: 'As-Salam', arabic: 'السلام', latin: 'As-Salam', translation: 'Maha Sejahtera' },
        { id: 'a-6', title: 'Al-Mu\'min', arabic: 'المؤمن', latin: 'Al-Mu\'min', translation: 'Maha Pemberi Keamanan' },
        { id: 'a-7', title: 'Al-Muhaimin', arabic: 'المهيمن', latin: 'Al-Muhaimin', translation: 'Maha Pelestari' },
        { id: 'a-8', title: 'Al-Aziz', arabic: 'العزيز', latin: 'Al-Aziz', translation: 'Maha Mulia' },
        { id: 'a-9', title: 'Al-Jabbar', arabic: 'الجبار', latin: 'Al-Jabbar', translation: 'Maha Perkasa' },
        { id: 'a-10', title: 'Al-Mutakabbir', arabic: 'المتكبر', latin: 'Al-Mutakabbir', translation: 'Maha Megah' },
        { id: 'a-11', title: 'Al-Khaliq', arabic: 'الخالق', latin: 'Al-Khaliq', translation: 'Maha Pencipta' },
        { id: 'a-12', title: 'Al-Baari\'', arabic: 'البارئ', latin: 'Al-Baari\'', translation: 'Maha Melepaskan' },
        { id: 'a-13', title: 'Al-Mushawwir', arabic: 'المصور', latin: 'Al-Mushawwir', translation: 'Maha Membentuk Rupa' },
        { id: 'a-14', title: 'Al-Ghaffar', arabic: 'الغفار', latin: 'Al-Ghaffar', translation: 'Maha Pengampun' },
        { id: 'a-15', title: 'Al-Qahhar', arabic: 'القهار', latin: 'Al-Qahhar', translation: 'Maha Menaklukkan' },
        { id: 'a-16', title: 'Al-Wahhab', arabic: 'الوهاب', latin: 'Al-Wahhab', translation: 'Maha Pemberi Karunia' },
        { id: 'a-17', title: 'Ar-Razzaq', arabic: 'الرزاق', latin: 'Ar-Razzaq', translation: 'Maha Pemberi Rezeki' },
        { id: 'a-18', title: 'Al-Fattah', arabic: 'الفتاح', latin: 'Al-Fattah', translation: 'Maha Pembuka Rahmat' },
        { id: 'a-19', title: 'Al-\'Alim', arabic: 'العليم', latin: 'Al-\'Alim', translation: 'Maha Mengetahui' },
        { id: 'a-20', title: 'Al-Qabiidzh', arabic: 'القابض', latin: 'Al-Qabiidzh', translation: 'Maha Menyempitkan' },
        { id: 'a-21', title: 'Al-Baasith', arabic: 'الباسط', latin: 'Al-Baasith', translation: 'Maha Melapangkan' },
        { id: 'a-22', title: 'Al-Khaafidh', arabic: 'الخافض', latin: 'Al-Khaafidh', translation: 'Maha Merendahkan' },
        { id: 'a-23', title: 'Ar-Raafi\'', arabic: 'الرافع', latin: 'Ar-Raafi\'', translation: 'Maha Meninggikan' },
        { id: 'a-24', title: 'Al-Mu\'izz', arabic: 'المعز', latin: 'Al-Mu\'izz', translation: 'Maha Memuliakan' },
        { id: 'a-25', title: 'Al-Mudzil', arabic: 'المذل', latin: 'Al-Mudzil', translation: 'Maha Menghinakan' },
        { id: 'a-26', title: 'As-Samii\'', arabic: 'السميع', latin: 'As-Samii\'', translation: 'Maha Mendengar' },
        { id: 'a-27', title: 'Al-Bashiir', arabic: 'البصير', latin: 'Al-Bashiir', translation: 'Maha Melihat' },
        { id: 'a-28', title: 'Al-Hakam', arabic: 'الحكم', latin: 'Al-Hakam', translation: 'Maha Menetapkan' },
        { id: 'a-29', title: 'Al-\'Adl', arabic: 'العدل', latin: 'Al-\'Adl', translation: 'Maha Adil' },
        { id: 'a-30', title: 'Al-Lathiif', arabic: 'اللطيف', latin: 'Al-Lathiif', translation: 'Maha Lembut' },
        { id: 'a-31', title: 'Al-Khabiir', arabic: 'الخبير', latin: 'Al-Khabiir', translation: 'Maha Mengenal' },
        { id: 'a-32', title: 'Al-Haliim', arabic: 'الحليم', latin: 'Al-Haliim', translation: 'Maha Penyantun' },
        { id: 'a-33', title: 'Al-\'Azhiim', arabic: 'العظيم', latin: 'Al-\'Azhiim', translation: 'Maha Agung' },
        { id: 'a-34', title: 'Al-Ghafuur', arabic: 'الغفور', latin: 'Al-Ghafuur', translation: 'Maha Memberi Pengampunan' },
        { id: 'a-35', title: 'Asy-Syakuur', arabic: 'الشكور', latin: 'Asy-Syakuur', translation: 'Maha Pembalas Budi' },
        { id: 'a-36', title: 'Al-\'Aliyy', arabic: 'العلي', latin: 'Al-\'Aliyy', translation: 'Maha Tinggi' },
        { id: 'a-37', title: 'Al-Kabiir', arabic: 'الكبير', latin: 'Al-Kabiir', translation: 'Maha Besar' },
        { id: 'a-38', title: 'Al-Hafiizh', arabic: 'الحfiفظ', latin: 'Al-Hafiizh', translation: 'Maha Memelihara' },
        { id: 'a-39', title: 'Al-Muqiit', arabic: 'المقيت', latin: 'Al-Muqiit', translation: 'Maha Pemberi Kecukupan' },
        { id: 'a-40', title: 'Al-Hasiib', arabic: 'الحسيب', latin: 'Al-Hasiib', translation: 'Maha Membuat Perhitungan' },
        { id: 'a-41', title: 'Al-Jaliil', arabic: 'الجليل', latin: 'Al-Jaliil', translation: 'Maha Luhur' },
        { id: 'a-42', title: 'Al-Kariim', arabic: 'الكريم', latin: 'Al-Kariim', translation: 'Maha Pemurah' },
        { id: 'a-43', title: 'Ar-Raqiib', arabic: 'الرقيب', latin: 'Ar-Raqiib', translation: 'Maha Mengawasi' },
        { id: 'a-44', title: 'Al-Mujiib', arabic: 'المجيب', latin: 'Al-Mujiib', translation: 'Maha Mengabulkan' },
        { id: 'a-45', title: 'Al-Waasi\'', arabic: 'الواسع', latin: 'Al-Waasi\'', translation: 'Maha Luas' },
        { id: 'a-46', title: 'Al-Hakiim', arabic: 'الحكيم', latin: 'Al-Hakiim', translation: 'Maha Bijaksana' },
        { id: 'a-47', title: 'Al-Waduud', arabic: 'الودود', latin: 'Al-Waduud', translation: 'Maha Mengasihi' },
        { id: 'a-48', title: 'Al-Majiid', arabic: 'المجيد', latin: 'Al-Majiid', translation: 'Maha Mulia' },
        { id: 'a-49', title: 'Al-Baa\'its', arabic: 'الباعث', latin: 'Al-Baa\'its', translation: 'Maha Mengetahui' },
        { id: 'a-50', title: 'Asy-Syahiid', arabic: 'الشهيد', latin: 'Asy-Syahiid', translation: 'Maha Menyaksikan' },
        { id: 'a-51', title: 'Al-Haqq', arabic: 'الحق', latin: 'Al-Haqq', translation: 'Maha Benar' },
        { id: 'a-52', title: 'Al-Wakiil', arabic: 'الوكيل', latin: 'Al-Wakiil', translation: 'Maha Memelihara' },
        { id: 'a-53', title: 'Al-Qawiyyy', arabic: 'القوي', latin: 'Al-Qawiyyy', translation: 'Maha Kuat' },
        { id: 'a-54', title: 'Al-Matiin', arabic: 'المتين', latin: 'Al-Matiin', translation: 'Maha Kokoh' },
        { id: 'a-55', title: 'Al-Waliyy', arabic: 'الولي', latin: 'Al-Waliyy', translation: 'Maha Melindungi' },
        { id: 'a-56', title: 'Al-Hamiid', arabic: 'الحميد', latin: 'Al-Hamiid', translation: 'Maha Terpuji' },
        { id: 'a-57', title: 'Al-Muhshii', arabic: 'المحصي', latin: 'Al-Muhshii', translation: 'Maha Mengalkulasi' },
        { id: 'a-58', title: 'Al-Mubdi\'', arabic: 'المبدئ', latin: 'Al-Mubdi\'', translation: 'Maha Memulai' },
        { id: 'a-59', title: 'Al-Mu\'iid', arabic: 'المعيد', latin: 'Al-Mu\'iid', translation: 'Maha Mengembalikan' },
        { id: 'a-60', title: 'Al-Muhyii', arabic: 'المحيي', latin: 'Al-Muhyii', translation: 'Maha Menghidupkan' },
        { id: 'a-61', title: 'Al-Mumiit', arabic: 'المميت', latin: 'Al-Mumiit', translation: 'Maha Mematikan' },
        { id: 'a-62', title: 'Al-Hayyu', arabic: 'الحي', latin: 'Al-Hayyu', translation: 'Maha Hidup' },
        { id: 'a-63', title: 'Al-Qayyuum', arabic: 'القيوم', latin: 'Al-Qayyuum', translation: 'Maha Mandiri' },
        { id: 'a-64', title: 'Al-Waajid', arabic: 'الواجد', latin: 'Al-Waajid', translation: 'Maha Penemu' },
        { id: 'a-65', title: 'Al-Maajid', arabic: 'الماجد', latin: 'Al-Maajid', translation: 'Maha Mulia' },
        { id: 'a-66', title: 'Al-Waahid', arabic: 'الواحد', latin: 'Al-Waahid', translation: 'Maha Tunggal' },
        { id: 'a-67', title: 'Al-Ahad', arabic: 'الاحد', latin: 'Al-Ahad', translation: 'Maha Esa' },
        { id: 'a-68', title: 'Ash-Shamad', arabic: 'الصمد', latin: 'Ash-Shamad', translation: 'Maha Dibutuhkan' },
        { id: 'a-69', title: 'Al-Qaadir', arabic: 'القادر', latin: 'Al-Qaadir', translation: 'Maha Menentukan' },
        { id: 'a-70', title: 'Al-Muqtadir', arabic: 'المقتدر', latin: 'Al-Muqtadir', translation: 'Maha Berkuasa' },
        { id: 'a-71', title: 'Al-Muqaddim', arabic: 'المقدم', latin: 'Al-Muqaddim', translation: 'Maha Mendahulukan' },
        { id: 'a-72', title: 'Al-Mu\'akkhir', arabic: 'المؤخر', latin: 'Al-Mu\'akkhir', translation: 'Maha Mengakhirkan' },
        { id: 'a-73', title: 'Al-Awwal', arabic: 'الأول', latin: 'Al-Awwal', translation: 'Maha Awal' },
        { id: 'a-74', title: 'Al-Aakhir', arabic: 'الأخر', latin: 'Al-Aakhir', translation: 'Maha Akhir' },
        { id: 'a-75', title: 'Adzh-Dzhaahir', arabic: 'الظاهر', latin: 'Adzh-Dzhaahir', translation: 'Maha Nyata' },
        { id: 'a-76', title: 'Al-Baathin', arabic: 'الباطن', latin: 'Al-Baathin', translation: 'Maha Tersembunyi' },
        { id: 'a-77', title: 'Al-Waali', arabic: 'الوالي', latin: 'Al-Waali', translation: 'Maha Memerintah' },
        { id: 'a-78', title: 'Al-Muta\'aalii', arabic: 'المتعالي', latin: 'Al-Muta\'aalii', translation: 'Maha Tinggi' },
        { id: 'a-79', title: 'Al-Barr', arabic: 'البر', latin: 'Al-Barr', translation: 'Maha Penderma' },
        { id: 'a-80', title: 'At-Tawwaab', arabic: 'التواب', latin: 'At-Tawwaab', translation: 'Maha Penerima Tobat' },
        { id: 'a-81', title: 'Al-Muntaqim', arabic: 'المنتقم', latin: 'Al-Muntaqim', translation: 'Maha Pemberi Balasan' },
        { id: 'a-82', title: 'Al-\'Afuww', arabic: 'العفو', latin: 'Al-\'Afuww', translation: 'Maha Pemaaf' },
        { id: 'a-83', title: 'Ar-Ra\'uuf', arabic: 'الرؤوف', latin: 'Ar-Ra\'uuf', translation: 'Maha Pengasuh' },
        { id: 'a-84', title: 'Maalikul-Mulk', arabic: 'مالك الملك', latin: 'Maalikul-Mulk', translation: 'Penguasa Kerajaan' },
        { id: 'a-85', title: 'Dzul-Jalaali wal-Ikraam', arabic: 'ذو الجلال و الإكرام', latin: 'Dzul-Jalaali wal-Ikraam', translation: 'Pemilik Keagungan dan Kemuliaan' },
        { id: 'a-86', title: 'Al-Muqshith', arabic: 'المقسط', latin: 'Al-Muqshith', translation: 'Maha Pemberi Keadilan' },
        { id: 'a-87', title: 'Al-Jaami\'', arabic: 'الجامع', latin: 'Al-Jaami\'', translation: 'Maha Mengumpulkan' },
        { id: 'a-88', title: 'Al-Ghaniyy', arabic: 'الغني', latin: 'Al-Ghaniyy', translation: 'Maha Kaya' },
        { id: 'a-89', title: 'Al-Mughnii', arabic: 'المغني', latin: 'Al-Mughnii', translation: 'Maha Pemberi Kekayaan' },
        { id: 'a-90', title: 'Al-Maani\'', arabic: 'المانع', latin: 'Al-Maani\'', translation: 'Maha Mencegah' },
        { id: 'a-91', title: 'Adzh-Dzharr', arabic: 'الضار', latin: 'Adzh-Dzharr', translation: 'Maha Penimpa Kemudharatan' },
        { id: 'a-92', title: 'An-Naafi\'', arabic: 'النافع', latin: 'An-Naafi\'', translation: 'Maha Pemberi Manfaat' },
        { id: 'a-93', title: 'An-Nuur', arabic: 'النور', latin: 'An-Nuur', translation: 'Maha Bercahaya' },
        { id: 'a-94', title: 'Al-Haadii', arabic: 'الهادي', latin: 'Al-Haadii', translation: 'Maha Pemberi Petunjuk' },
        { id: 'a-95', title: 'Al-Badii\'', arabic: 'البديع', latin: 'Al-Badii\'', translation: 'Maha Pencipta Tiada Banding' },
        { id: 'a-96', title: 'Al-Baaqii', arabic: 'الباقي', latin: 'Al-Baaqii', translation: 'Maha Kekal' },
        { id: 'a-97', title: 'Al-Waarits', arabic: 'الوارث', latin: 'Al-Waarits', translation: 'Maha Pewaris' },
        { id: 'a-98', title: 'Ar-Rasyiid', arabic: 'الرشيد', latin: 'Ar-Rasyiid', translation: 'Maha Pandai' },
        { id: 'a-99', title: 'Ash-Shabuur', arabic: 'الصبور', latin: 'Ash-Shabuur', translation: 'Maha Sabar' },
    ],
    'bilal': [
        { id: 'bt-1', title: 'Shalawat Pembuka Tarawih', arabic: 'اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ', latin: 'Allahumma shalli \'ala sayyidina Muhammad.', translation: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad.' },
        { id: 'bt-2', title: 'Seruan Bilal Rakaat Pertama', arabic: 'صَلُّوْا سُنَّةَ التَّرَاوِيْحِ جَامِعَةً رَحِمَكُمُ اللهُ', latin: 'Shollu sunnatat tarawiihi jaami\'atan rahimakumullah.', translation: 'Laksanakanlah shalat sunnah tarawih secara berjamaah, semoga Allah melimpahkan rahmat kepada kalian.' },
        { id: 'bt-3', title: 'Doa Kamilin (Setelah Tarawih)', arabic: 'اللّٰهُمَّ اجْعَلْنَا بِالْإِيْمَانِ كَامِلِيْنَ...', latin: 'Allahummaj\'alna bil iimaani kaamiliin...', translation: 'Ya Allah, jadikanlah kami orang-orang yang sempurna imannya...' }
    ],
    'matsurat': [
        {
            id: 'm-1',
            title: 'Al-Fatihah',
            arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ (١) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (٢) الرَّحْمَنِ الرَّحِيمِ (٣) مَالِكِ يَوْمِ الدِّينِ (٤) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (٥) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (٦) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (٧)',
            latin: 'Bismillahir rahmānir rahīm. Al-hamdu lillāhi rabbil-ālamīn. Ar-rahmānir-rahīm. Māliki yaumid-dīn. Iyyāka na\'budu wa iyyāka nasta\'īn. Ihdinash-shirāthal-mustaqīm. Shirāthalladzīna an\'amta \'alaihim ghairil-maghdhūbi \'alaihim waladh-dhāllīn.',
            translation: 'Dengan menyebut nama Allah Yang Maha Pemurah lagi Maha Penyayang. Segala puji bagi Allah, Tuhan semesta alam. Maha Pemurah lagi Maha Penyayang. Yang menguasai di Hari Pembalasan. Hanya Engkaulah yang kami sembah, dan hanya kepada Engkaulah kami meminta pertolongan. Tunjukilah kami jalan yang lurus. (yaitu) Jalan orang-orang yang telah Engkau beri nikmat kepada mereka; bukan (jalan) mereka yang dimurkai dan bukan (pula jalan) mereka yang sesat.',
            fullText: true
        },
        {
            id: 'm-2',
            title: 'Al-Baqarah 1-5',
            arabic: 'الم (١) ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِلْمُتَّقِينَ (٢) الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ (٣) وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ وَمَا أُنْزِلَ مِنْ قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ (٤) أُولَئِكَ عَلَى هُدًى مِنْ رَبِّهِمْ وَأُولَئِكَ هُمُ الْمُفْلِحُونَ (٥)',
            latin: 'Alif-lām-mīm. Dzālikal-kitābu lā raiba fīhi hudal-lil-muttaqīn. Alladzīna yu\'minūna bil-ghaibi wa yuqīmūnash-shalāta wa mimmā razaqnāhum yunfiqūn. Walladzīna yu\'minūna bimā unzila ilaika wa mā unzila min qablika wa bil-ākhirati hum yūqinūn. Ulā\'ika \'alā hudam-mir-rabbihim wa ulā\'ika humul-muflihūn.',
            translation: 'Alif Lam Mim. Kitab (Al-Quran) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa. (Yaitu) mereka yang beriman kepada yang ghaib, yang mendirikan shalat, dan menafkahkan sebagian rezeki yang Kami anugerahkan kepada mereka. Dan mereka yang beriman kepada Kitab (Al-Quran) yang telah diturunkan kepadamu dan kitab-kitab yang telah diturunkan sebelummu, serta mereka yakin akan adanya (kehidupan) akhirat. Mereka itulah yang tetap mendapat petunjuk dari Tuhan mereka, dan merekalah orang-orang yang beruntung.',
            fullText: true
        },
        {
            id: 'm-3',
            title: 'Ayat Kursi',
            arabic: 'اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
            latin: 'Allāhu lā ilāha illā huwal-hayyul-qayyūm, lā ta\'khudzuhū sinatuw walā naum, lahū mā fis-samāwāti wa mā fil-ardh, man dzalladzī yasyfa\'u \'indahū illā bi\'idznih, ya\'lamu mā baina aidīhim wa mā khalfahum, walā yuhīthūna bisyai\'im min \'ilmihī illā bimā syā\', wasi\'a kursiyyuhus-samāwāti wal-ardh, walā ya\'ūduhū hifzhuhumā wa huwal-\'aliyyul-\'azhīm.',
            translation: 'Allah, tidak ada Tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya); tidak mengantuk dan tidak tidur. Kepunyaan-Nya apa yang di langit dan di bumi. Tiada yang dapat memberi syafaat di sisi Allah tanpa izin-Nya? Allah mengetahui apa-apa yang di hadapan mereka dan di belakang mereka, dan mereka tidak mengetahui apa-apa dari ilmu Allah melainkan apa yang dikehendaki-Nya. Kursi Allah meliputi langit dan bumi. Dan Allah tidak merasa berat memelihara keduanya, dan Allah Maha Tinggi lagi Maha Besar.',
            fullText: true
        },
        {
            id: 'm-4',
            title: 'Al-Baqarah 284-286',
            arabic: 'لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ وَإِنْ تُبْدُوا مَا فِي أَنْفُسِكُمْ أَوْ تُخْفُوهُ يُحَاسِبْكُمْ بِهِ اللَّهُ... آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ...',
            latin: 'Lillāhi mā fis-samāwāti wa mā fil-ardh, wa in tubdū mā fī anfusikum au tukhfūhu yuhāsibkum bihillāh... Āmanar-rasūlu bimā unzila ilaihi mir-rabbihī wal-mu\'minūn...',
            translation: 'Kepunyaan Allah-lah segala apa yang ada di langit dan apa yang ada di bumi. Dan jika kamu melahirkan apa yang ada di dalam hatimu atau kamu menyembunyikannya, niscaya Allah akan membuat perhitungan dengan kamu tentang perbuatanmu itu... Rasul telah beriman kepada Al-Quran yang diturunkan kepadanya dari Tuhannya, demikian pula orang-orang yang beriman...',
            fullText: true
        },
        {
            id: 'm-5',
            title: 'Al-Ikhlas, Al-Falaq, An-Naas (3x)',
            arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ... قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ...',
            latin: 'Qul huwallāhu ahad... Qul a\'ūdzu birabbil-falaq... Qul a\'ūdzu birabbin-nās...',
            translation: 'Katakanlah: Dialah Allah, Yang Maha Esa... Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh... Katakanlah: Aku berlindung kepada Tuhan (pemelihara) manusia...',
            fullText: true
        },
        {
            id: 'm-6',
            title: 'Dzikir Pagi & Petang',
            arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ...',
            latin: 'Ashbahnā wa ashbahal-mulku lillāhi wal-hamdu lillāh, lā ilāha illallāhu wahdahū lā syarīka lah...',
            translation: 'Kami memasuki waktu pagi sedang kerajaan tetap milik Allah dan segala puji bagi Allah, tidak ada Tuhan melainkan Allah Yang Maha Esa, tiada sekutu bagi-Nya...',
            fullText: true
        },
        {
            id: 'm-7',
            title: 'Sayyidul Istighfar',
            arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ...',
            latin: 'Allāhumma anta rabbī lā ilāha illā anta khalaqtanī wa ana \'abduka wa ana \'alā \'ahdika wa wa\'dika masta-tha\'tu...',
            translation: 'Ya Allah, Engkau adalah Tuhanku, tiada Tuhan melainkan Engkau yang telah menciptakan aku dan aku adalah hamba-Mu. Aku pun dalam ketentuan serta janji-Mu semampuku...',
            fullText: true
        },
        {
            id: 'm-8',
            title: 'Doa Perlindungan',
            arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ...',
            latin: 'Allāhumma innī a\'ūdzu bika minal-hammi wal-hazani wa a\'ūdzu bika minal-\'ajzi wal-kasali...',
            translation: 'Ya Allah, aku berlindung pada-Mu dari kemurungan dan kesedihan, dan aku berlindung pada-Mu dari kelemahan dan kemalasan...',
            fullText: true
        },
        {
            id: 'm-9',
            title: 'Subhanallahi wa Bihamdihi (100x)',
            arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
            latin: 'Sub-hānallāhi wa bi-hamdihi.',
            translation: 'Maha Suci Allah, dan dengan memuji-Nya.',
            fullText: true
        },
        {
            id: 'm-10',
            title: 'Shalawat Nabawi',
            arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
            latin: 'Allāhumma shalli \'alā Muhammad wa \'alā āli Muhammad.',
            translation: 'Ya Allah, berilah rahmat kepada Muhammad dan juga keluarga Muhammad.',
            fullText: true
        }
    ],
    'sholat': [
        { id: 's-1', title: 'Istighfar (3x)', arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ', latin: 'Astaghfirullaahal adziim.', translation: 'Aku memohon ampun kepada Allah yang Maha Agung.' },
        { id: 's-2', title: 'Doa Keselamatan', arabic: 'اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ', latin: 'Allahumma antas salaam wa minkas salaam tabaarakta yaa dzal jalaali wal ikraam.', translation: 'Ya Allah, Engkau adalah Dzat yang memberi keselamatan, dan dari-Mu lah segala keselamatan. Maha Berkah Engkau, wahai Dzat yang memiliki keagungan dan kemuliaan.' },
        { id: 's-3', title: 'Tasbih (33x)', arabic: 'سُبْحَانَ اللَّهِ', latin: 'Sub-haanallaah', translation: 'Maha Suci Allah.' },
        { id: 's-4', title: 'Tahmid (33x)', arabic: 'الْحَمْدُ لِلَّهِ', latin: 'Al-hamdulillaah', translation: 'Segala puji bagi Allah.' },
        { id: 's-5', title: 'Takbir (33x)', arabic: 'اللَّهُ أَكْبَرُ', latin: 'Allaahu akbar', translation: 'Allah Maha Besar.' },
        { id: 's-6', title: 'Tahlil', arabic: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', latin: 'Laa ilaaha illallaahu wahdahū lā syariika lah, lahul-mulku wa lahul-hamdu wa huwa \'alā kulli syai\'in qadiir.', translation: 'Tiada Tuhan selain Allah Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala puji dan Dia Maha Kuasa atas segala sesuatu.' },
        { id: 's-7', title: 'Ayat Kursi', arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...', latin: 'Allaahu laa ilaaha illaa huwal-hayyul-qayyuūm...', translation: 'Allah, tidak ada Tuhan melainkan Dia yang Hidup kekal lagi terus-menerus mengurus makhluk-Nya...', fullText: true },
        { id: 's-8', title: 'Doa Setelah Sholat', arabic: 'اَللّٰهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', latin: 'Allaahumma a’innii ‘alaa dzikrika wa syukrika wa husni ‘ibaadatika.', translation: 'Ya Allah, tolonglah aku untuk selalu mengingat-Mu, bersyukur kepada-Mu, dan beribadah dengan baik kepada-Mu.' }
    ],
    'harian': [
        { id: 'h-1', title: 'Sebelum Makan', arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ', latin: 'Allahumma baarik lanaa fiimaa razaqtana wa qinaa ‘adzaaban naar.', translation: 'Ya Allah, berkahilah kami atas rezeki yang telah Engkau berikan kepada kami dan jagalah kami dari siksa api neraka.' },
        { id: 'h-2', title: 'Setelah Makan', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ', latin: 'Alhamdu lillaahil ladzii ath’amanaa wa saqaanaa wa ja’alanaa minal muslimiin.', translation: 'Segala puji bagi Allah yang telah memberi makan kami dan memberi minum kami, dan menjadikan kami termasuk orang-orang muslim.' },
        { id: 'h-3', title: 'Sebelum Tidur', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', latin: 'Bismika allahumma amuutu wa ahyaa.', translation: 'Dengan nama-Mu, ya Allah, aku mati dan aku hidup.' },
        { id: 'h-4', title: 'Bangun Tidur', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', latin: 'Alhamdu lillaahil ladzii ahyaanaa ba’da maa amaatanaa wa ilaihin nusyuur.', translation: 'Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya lah tempat kembali.' },
        { id: 'h-5', title: 'Masuk Masjid', arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', latin: 'Allahummaftah lii abwaaba rahmatik.', translation: 'Ya Allah, bukalah pintu-pintu rahmat-Mu untukku.' },
        { id: 'h-6', title: 'Keluar Masjid', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', latin: 'Allahumma innii as’aluka min fadhlik.', translation: 'Ya Allah, sesungguhnya aku memohon keutamaan dari-Mu.' },
        { id: 'h-7', title: 'Untuk Orang Tua', arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', latin: 'Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.', translation: 'Ya Tuhanku, ampunilah dosaku dan dosa kedua orang tuaku, dan kasihilah mereka keduanya sebagaimana mereka berdua telah mendidik aku di waktu kecil.' },
        { id: 'h-8', title: 'Masuk Rumah', arabic: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا', latin: 'Bismillaahi walajnaa wa bismillaahi kharajnaa wa ‘alallaahi rabbinaa tawakkalnaa.', translation: 'Dengan nama Allah kami masuk, dengan nama Allah kami keluar, dan kepada Allah Tuhan kami, kami bertawakal.' },
        { id: 'h-9', title: 'Keluar Rumah', arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', latin: 'Bismillaahi tawakkaltu ‘alallaah, laa haula wa laa quwwata illa billaah.', translation: 'Dengan nama Allah, aku bertawakal kepada Allah. Tiada daya dan kekuatan kecuali dengan pertolongan Allah.' },
        { id: 'h-10', title: 'Naik Kendaraan', arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ', latin: 'Subhaanalladzi sakhkhara lanaa haadzaa wa maa kunnaa lahu muqriniin wa innaa ilaa rabbinaa lamunqalibuun.', translation: 'Maha Suci Allah yang telah menundukkan kendaraan ini untuk kami, padahal kami sebelumnya tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Tuhan kami.' },
        { id: 'h-11', title: 'Masuk Kamar Mandi', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ', latin: 'Allahumma inni a’uudzu bika minal khubutsi wal khabaa-its.', translation: 'Ya Allah, aku berlindung kepada-Mu dari godaan setan laki-laki dan perempuan.' },
        { id: 'h-12', title: 'Keluar Kamar Mandi', arabic: 'غُفْرَانَكَ', latin: 'Ghufraanaka.', translation: 'Aku memohon ampunan-Mu.' },
        { id: 'h-13', title: 'Memakai Pakaian', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', latin: 'Alhamdu lillaahil ladzii kasaanii haadzats tsauba wa razaqaniihi min ghairi haulin minnii wa laa quwwah.', translation: 'Segala puji bagi Allah yang telah memberiku pakaian ini dan memberikannya kepadaku tanpa daya dan kekuatanku.' },
        { id: 'h-14', title: 'Bercermin', arabic: 'اللَّهُمَّ كَمَا أَحْسَنْتَ خَلْقِي فَأَحْسِنْ خُلُقِي', latin: 'Allahumma kamaa ahsanta khalqii fa ahsin khuluqii.', translation: 'Ya Allah, sebagaimana Engkau telah membaguskan rupaku, maka baguskanlah akhlakku.' },
        { id: 'h-15', title: 'Ketika Hujan Turun', arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا', latin: 'Allahumma shayyiban naafi’an.', translation: 'Ya Allah, jadikanlah hujan ini hujan yang bermanfaat.' }
    ]
};

const DoaPage: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDoa, setSelectedDoa] = useState<DoaItem | null>(null);
    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [category]);

    const handleCopy = useCallback((doa: DoaItem) => {
        const textToCopy = `${doa.title}\n\n${doa.arabic}\n\n${doa.latin}\n\nArtinya: ${doa.translation}`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => showToast('Doa berhasil disalin!'))
            .catch(() => showToast('Gagal menyalin doa.', 'error'));
    }, [showToast]);

    const handleShare = useCallback((doa: DoaItem) => {
        const shareData = {
            title: doa.title,
            text: `${doa.title}\n\n${doa.arabic}\n\n${doa.translation}`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => showToast('Berhasil membagikan!'))
                .catch((err) => {
                    if (err.name !== 'AbortError') {
                        showToast('Gagal membagikan.', 'error');
                    }
                });
        } else {
            handleCopy(doa);
            showToast('Fitur bagikan tidak tersedia, doa disalin ke clipboard.');
        }
    }, [handleCopy, showToast]);

    const filteredCategories = categories.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCategory = category ? categories.find(c => c.id === category) : null;
    const prayers = category ? (doaContent[category] || []) : [];
    const filteredPrayers = prayers.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.translation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBack = () => {
        if (category) {
            navigate('/doa');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="max-w-md mx-auto w-full pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors text-left uppercase-tags-fix">
            {ToastComponent}
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg mb-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <Sparkles size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <button onClick={handleBack} className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        {category && (
                            <button
                                onClick={() => navigate('/doa')}
                                className="text-[10px] font-black uppercase  bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10"
                            >
                                Semua Kategori
                            </button>
                        )}
                    </div>
                    <h1 className="text-2xl font-black mb-1 tracking-tight">
                        {activeCategory ? activeCategory.title : 'Koleksi Doa'}
                    </h1>
                    <p className="text-primary-100 text-sm font-medium opacity-90">Kekuatan Seorang Mukmin</p>
                </div>
            </div>

            {/* Content Container */}
            <div className="px-6">
                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" size={18} />
                    <input
                        type="text"
                        placeholder={category ? "Cari doa..." : "Cari kategori doa..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-900 text-slate-800 dark:text-slate-100 transition-all font-medium"
                    />
                </div>

                {!category ? (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredCategories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/doa/${cat.id}`}
                                className="flex flex-col items-start p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1 transition-all group text-left relative overflow-hidden"
                            >
                                <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700`}>
                                    {cat.icon}
                                </div>
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:rotate-12 transition-transform`}>
                                    {cat.icon}
                                </div>
                                <h3 className="font-black text-slate-800 dark:text-white mb-1 uppercase tracking-tight text-sm leading-tight">{cat.title}</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase ">{cat.description}</p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        {category === 'matsurat' && (
                            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-900/50 rounded-[2.5rem] p-6 mb-8 relative overflow-hidden">
                                <h4 className="text-[10px] font-black uppercase  text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                                    <Info size={14} /> Keutamaan Al-Ma&apos;tsurat
                                </h4>
                                <ul className="space-y-2">
                                    {['Perlindungan dari sihir & gangguan jin', 'Ketenangan batin & kejernihan pikiran', 'Pahala besar & keberkahan rezeki'].map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                            <div className="w-1 h-1 bg-amber-500 rounded-full"></div> {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 pt-4 border-t border-amber-200/50">
                                    <p className="text-[10px] italic text-amber-800 dark:text-amber-200 leading-relaxed font-medium text-center">
                                        Klik kartu doa untuk melihat teks lengkap
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Responsive Grid for Asmaul Husna and compact sections */}
                        <div className={['asmaul', 'harian', 'sholat'].includes(category) ? "grid grid-cols-2 gap-3" : "space-y-3"}>
                            {filteredPrayers.length > 0 ? (
                                filteredPrayers.map((doa) => (
                                    <button
                                        key={doa.id}
                                        onClick={() => setSelectedDoa(doa)}
                                        className={`text-left bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-primary-200 transition-all group ${['asmaul', 'harian', 'sholat'].includes(category) ? 'p-4' : 'p-6 w-full'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            {!['asmaul', 'harian', 'sholat'].includes(category) && (
                                                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                                    <BookOpen size={16} />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className={`font-black text-slate-800 dark:text-white leading-tight group-hover:text-primary-700 transition-colors ${['asmaul', 'harian', 'sholat'].includes(category) ? 'text-sm mb-2 truncate' : 'text-lg mb-4'}`}>{doa.title}</h3>

                                        <div className={`bg-slate-50 dark:bg-slate-800/50 rounded-2xl ${['asmaul', 'harian', 'sholat'].includes(category) ? 'p-3' : 'p-5 mb-4'}`}>
                                            <p className={`font-serif text-slate-800 dark:text-primary-50 leading-relaxed text-right ${['asmaul', 'harian', 'sholat'].includes(category) ? 'text-lg overflow-hidden whitespace-nowrap overflow-ellipsis' : 'text-xl'}`} dir="rtl">
                                                {doa.arabic}
                                            </p>
                                            <p className={`font-bold text-primary-600 dark:text-primary-400 italic ${['asmaul', 'harian', 'sholat'].includes(category) ? 'text-[8px] truncate' : 'text-[10px]'}`}>
                                                {doa.latin}
                                            </p>
                                        </div>

                                        {!['harian', 'sholat'].includes(category) && (
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {doa.translation}
                                            </p>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-20 col-span-2">
                                    <p className="text-slate-400 font-bold text-sm uppercase ">Belum ada data</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Prayer Detail Modal */}
            {selectedDoa && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedDoa(null)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 duration-500">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-primary-600 text-white">
                            <h3 className="font-black text-lg uppercase tracking-tight truncate mr-4">{selectedDoa.title}</h3>
                            <button onClick={() => setSelectedDoa(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 mb-6 flex items-center gap-2">
                                    <div className="w-6 h-[1px] bg-primary-200"></div> Arab
                                </h4>
                                <p className="text-4xl font-serif text-slate-800 dark:text-primary-50 leading-[1.8] text-right" dir="rtl">
                                    {selectedDoa.arabic}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-500 flex items-center gap-2">
                                    <div className="w-6 h-[1px] bg-secondary-200"></div> Transliterasi
                                </h4>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border-l-4 border-secondary-400">
                                    {selectedDoa.latin}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 flex items-center gap-2">
                                    <div className="w-6 h-[1px] bg-emerald-200"></div> Terjemahan
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-4 border-l-4 border-emerald-400">
                                    {selectedDoa.translation}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3 text-left">
                            <button
                                onClick={() => handleCopy(selectedDoa)}
                                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:bg-primary-50 hover:text-primary-600 transition-all"
                            >
                                <Copy size={16} /> Salin
                            </button>
                            <button
                                onClick={() => handleShare(selectedDoa)}
                                className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all"
                            >
                                <Share2 size={16} /> Bagikan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoaPage;
