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
    ChevronRight
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
            </div>
        </div>
    );
};

export default ProfilePage;
