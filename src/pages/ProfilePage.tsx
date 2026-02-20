import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    User, 
    ChevronLeft, 
    Search, 
    MapPin, 
    Navigation, 
    Loader2, 
    Sun, 
    Moon, 
    Volume2, 
    VolumeX,
    Bell,
    BellOff,
    CheckCircle2,
    Clock,
    RotateCw,
    Trash2,
    ChevronRight,
    Info,
    ShieldCheck,
    Share2,
    Smartphone,
    Heart,
    ExternalLink,
    X,
    Sparkles,
    Download
} from 'lucide-react';
import { api, City } from '../services/api';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState(() => localStorage.getItem('muslim_app_user_name') || '');
    const [theme, setTheme] = useState(() => (localStorage.getItem('theme') || 'light') as 'light' | 'dark');
    const [isAdzanEnabled, setIsAdzanEnabled] = useState(() => localStorage.getItem('muslim_app_adzan_enabled') === 'true');
    const [hijriOffset, setHijriOffset] = useState(() => Number(localStorage.getItem('muslim_app_hijri_offset')) || 0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<City[]>([]);
    const [locating, setLocating] = useState(false);
    const [city, setCity] = useState<City | null>(() => api.getLastCity());
    const [showSuccess, setShowSuccess] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showDonation, setShowDonation] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isPwaInstalled, setIsPwaInstalled] = useState(false);

    useEffect(() => {
        const isDark = theme === 'dark';
        document.documentElement.classList.toggle('dark', isDark);
    }, [theme]);

    const handleSave = () => {
        localStorage.setItem('muslim_app_user_name', userName);
        localStorage.setItem('theme', theme);
        localStorage.setItem('muslim_app_adzan_enabled', isAdzanEnabled.toString());
        localStorage.setItem('muslim_app_hijri_offset', hijriOffset.toString());
        if (city) api.saveLastCity(city);
        
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            navigate('/');
        }, 1500);
        
        // Dispatch event for theme change synchronization
        window.dispatchEvent(new Event('theme-set'));
    };

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            const results = await api.searchCity(query);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const selectCity = (selectedCity: City) => {
        setCity(selectedCity);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleGeolocation = () => {
        setLocating(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const detectedCity = await api.getCityByLocation(latitude, longitude);
                        if (detectedCity) {
                            setCity(detectedCity);
                        }
                    } catch (error) {
                        console.error("Geolocation city error", error);
                    } finally {
                        setLocating(false);
                    }
                },
                () => setLocating(false),
                { timeout: 8000 }
            );
        } else {
            setLocating(false);
        }
    };

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsPwaInstalled(isStandalone);

        window.addEventListener('appinstalled', () => {
             setIsPwaInstalled(true);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallPWA = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Qolbi - Pendamping Muslim Modern',
                    text: 'Yuk install aplikasi Qolbi untuk menemani ibadah harianmu!',
                    url: window.location.origin,
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.origin);
            alert('Link aplikasi disalin ke klibor!');
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-32 transition-colors">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 pt-12 pb-8 px-6 rounded-b-[3rem] shadow-lg text-white relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <User size={140} />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <Link to="/" className="absolute left-0 top-0 p-2 text-white/80 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mb-4 border border-white/30 shadow-xl">
                        <User size={40} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black mb-1 tracking-tight">Profil Pengguna</h1>
                    <p className="text-amber-100 text-[10px] font-black uppercase  opacity-80 pb-2">Pengaturan Akun & Lokasi</p>
                </div>
            </div>

            <div className="max-w-md mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-8">
                    
                    {/* User Name */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase  block px-1">Nama Panggilan</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="text" 
                                value={userName} 
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Siapa nama Anda?"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none text-slate-800 dark:text-white font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                            />
                        </div>
                    </div>

                    {/* Adzan Notification Toggle */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase  block px-1">Notifikasi Adzan</label>
                        <button 
                            onClick={() => setIsAdzanEnabled(!isAdzanEnabled)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isAdzanEnabled ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAdzanEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                    {isAdzanEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                </div>
                                <div className="text-left">
                                    <p className={`text-sm font-black ${isAdzanEnabled ? 'text-emerald-900 dark:text-emerald-400' : 'text-slate-500'}`}>
                                        Suara Adzan
                                    </p>
                                    <p className={`text-[10px] font-bold ${isAdzanEnabled ? 'text-emerald-600/70' : 'text-slate-400'}`}>
                                        {isAdzanEnabled ? 'Aktif' : 'Nonaktif'}
                                    </p>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${isAdzanEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAdzanEnabled ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </button>
                    </div>

                    {/* Theme Toggle */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase  block px-1">Tema Aplikasi</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setTheme('light')}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${theme === 'light' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 ring-4 ring-amber-500/5' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                            >
                                <Sun size={18} className={theme === 'light' ? 'text-amber-600' : 'text-slate-400'} />
                                <span className={`text-[11px] font-black uppercase  ${theme === 'light' ? 'text-amber-900 dark:text-amber-400' : 'text-slate-400'}`}>Terang</span>
                            </button>
                            <button 
                                onClick={() => setTheme('dark')}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 ring-4 ring-white/5' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                            >
                                <Moon size={18} className={theme === 'dark' ? 'text-amber-400' : 'text-slate-400'} />
                                <span className={`text-[11px] font-black uppercase  ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Gelap</span>
                            </button>
                        </div>
                    </div>

                    {/* Location Settings */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase  block px-1">Lokasi Sholat</label>
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[8px] font-black text-emerald-600/70 uppercase ">Kota Saat Ini</p>
                                        <p className="text-[10px] font-black text-emerald-900 dark:text-emerald-400">{city?.lokasi || 'Belum diatur'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleGeolocation} 
                                    disabled={locating}
                                    className="p-2 bg-white dark:bg-slate-800 rounded-xl text-emerald-600 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {locating ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                                </button>
                            </div>
                            
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Cari nama kota lain..." 
                                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none text-xs font-bold text-slate-800 dark:text-white focus:border-emerald-500 transition-all" 
                                    value={searchQuery} 
                                    onChange={handleSearch} 
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-[110] max-h-48 overflow-y-auto p-2 scrollbar-none animate-in slide-in-from-bottom duration-300">
                                        {searchResults.map(c => (
                                            <button 
                                                key={c.id} 
                                                onClick={() => selectCity(c)} 
                                                className="w-full p-4 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 transition-colors uppercase tracking-tight"
                                            >
                                                {c.lokasi}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Hijri Adjustment */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase  block px-1">Penyesuaian Kalender Hijrah</label>
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                            <button 
                                onClick={() => setHijriOffset(prev => prev - 1)} 
                                className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-700 rounded-2xl shadow-sm text-rose-500 font-black text-xl hover:bg-rose-50 transition-all active:scale-90"
                            >-</button>
                            <div className="flex-1 text-center font-black text-slate-800 dark:text-white text-xs tracking-[0.2em]">
                                {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset} HARI
                            </div>
                            <button 
                                onClick={() => setHijriOffset(prev => prev + 1)} 
                                className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-700 rounded-2xl shadow-sm text-emerald-600 font-black text-xl hover:bg-emerald-50 transition-all active:scale-90"
                            >+</button>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button 
                        onClick={handleSave} 
                        className="w-full bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-black py-5 rounded-[2rem] active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none flex items-center justify-center gap-3 group overflow-hidden relative"
                    >
                        {showSuccess ? (
                            <>
                                <CheckCircle2 size={24} className="text-emerald-400" />
                                <span>Tersimpan!</span>
                            </>
                        ) : (
                            <>
                                <span>Simpan Perubahan</span>
                                <div className="absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </>
                        )}
                    </button>
                </div>

                {/* New Section: App Info & Support */}
                <div className="mt-8 space-y-4">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-6">Informasi & Dukungan</h2>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-2 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
                        <ProfileMenuItem 
                            icon={<Info size={18} className="text-blue-500" />} 
                            label="Tentang Aplikasi" 
                            onClick={() => setShowAbout(true)} 
                        />
                        <ProfileMenuItem 
                            icon={<ShieldCheck size={18} className="text-emerald-500" />} 
                            label="Kebijakan Privasi" 
                            onClick={() => setShowPrivacy(true)} 
                        />
                        <ProfileMenuItem 
                            icon={<Share2 size={18} className="text-purple-500" />} 
                            label="Bagikan Aplikasi" 
                            onClick={handleShare} 
                        />
                        {!isPwaInstalled && deferredPrompt && (
                            <ProfileMenuItem 
                                icon={<Download size={18} className="text-orange-500" />} 
                                label="Pasang Aplikasi (PWA)" 
                                onClick={handleInstallPWA} 
                            />
                        )}
                        <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                             <button 
                                onClick={() => setShowDonation(true)}
                                className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all group"
                             >
                                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                                    <Heart size={20} fill="currentColor" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-black text-slate-800 dark:text-white">Donasi Pengembang</p>
                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">Dukung Keberlanjutan App</p>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                             </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center pb-8">
                     <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">Qolbi v2.1.0</p>
                     <p className="text-[8px] font-bold text-slate-200 dark:text-slate-700 uppercase mt-1">Slamedia Creative Studio</p>
                </div>
            </div>

            {/* Modals */}
            {showAbout && (
                <Modal onClose={() => setShowAbout(false)} title="Tentang Qolbi">
                    <div className="space-y-4 text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2rem] flex items-center justify-center shadow-xl">
                                <Sparkles size={40} className="text-white" />
                            </div>
                        </div>
                        <p className="text-center font-black text-slate-800 dark:text-white uppercase tracking-widest text-[10px] mb-6">Pendamping Muslim Modern</p>
                        <p>
                            <span className="font-black text-emerald-600">Qolbi</span> adalah aplikasi pendamping ibadah muslim modern yang dirancang dengan estetika premium dan fitur yang lengkap untuk memudahkan rutinitas ibadah harian Anda.
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] uppercase font-black text-slate-400">Versi</span>
                                <span className="text-slate-800 dark:text-white font-black">2.1.0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] uppercase font-black text-slate-400">Developer</span>
                                <span className="text-slate-800 dark:text-white font-black">Slamedia Creative</span>
                            </div>
                        </div>
                        <p>Developed with ❤️ to help Ummah stay connected with Allah.</p>
                    </div>
                </Modal>
            )}

            {showPrivacy && (
                <Modal onClose={() => setShowPrivacy(false)} title="Kebijakan Privasi">
                    <div className="space-y-4 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase leading-relaxed text-left">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 mb-4">
                             <p className="text-emerald-700 dark:text-emerald-400">Keamanan data Anda adalah prioritas kami.</p>
                        </div>
                        <p className="font-black text-slate-800 dark:text-white">1. Pengumpulan Data</p>
                        <p>Aplikasi ini menyimpan preferensi Anda (nama, lokasi, tema) secara lokal di perangkat Anda (LocalStorage). Kami tidak menyimpan data pribadi Anda di server kami.</p>
                        
                        <p className="font-black text-slate-800 dark:text-white">2. Lokasi</p>
                        <p>Izin lokasi digunakan hanya untuk menghitung jadwal sholat dan arah kiblat secara akurat di perangkat Anda.</p>
                        
                        <p className="font-black text-slate-800 dark:text-white">3. Pihak Ketiga</p>
                        <p>Kami menggunakan API publik untuk mendapatkan data jadwal sholat dan Al-Quran. Data yang dikirimkan ke API tersebut hanyalah koordinat atau ID kota, bukan identitas Anda.</p>
                    </div>
                </Modal>
            )}

            {showDonation && (
                <Modal onClose={() => setShowDonation(false)} title="Donasi Pengembang">
                    <div className="text-center space-y-6">
                        <div className="p-4 bg-white rounded-3xl shadow-inner border border-slate-100 flex flex-col items-center">
                            <img 
                                src="/qris.jpeg" 
                                alt="QRIS Donation" 
                                className="w-full max-w-[240px] rounded-2xl mb-4"
                                onError={(e) => {
                                    (e.target as any).src = 'https://placehold.co/400x400?text=QRIS+Internal+Error';
                                }}
                            />
                            <div className="space-y-1">
                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">garpela by slamedia creative</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pindai kode QR di atas untuk berdonasi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl text-left border border-rose-100 dark:border-rose-900/30">
                            <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Heart size={20} fill="currentColor" />
                            </div>
                            <p className="text-[10px] font-black text-rose-800 dark:text-rose-400 uppercase leading-snug">
                                Setiap kontribusi sangat berarti bagi pengembangan fitur & pemeliharaan server aplikasi ini. Terima kasih!
                            </p>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const ProfileMenuItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
    >
        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <span className="flex-1 text-sm font-black text-slate-800 dark:text-white text-left">{label}</span>
        <ChevronRight size={18} className="text-slate-300" />
    </button>
);

const Modal = ({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">{title}</h3>
                <button 
                    onClick={onClose}
                    className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
            {children}
            <button 
                onClick={onClose}
                className="w-full mt-8 py-2 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest"
            >
                Tutup
            </button>
        </div>
    </div>
);

export default ProfilePage;
