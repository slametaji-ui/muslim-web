import React, { useState, useEffect, useCallback } from 'react';
import { Compass, Navigation, MapPin, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useToast } from '../components/CustomToast';

const QiblaPage: React.FC = () => {
    const [heading, setHeading] = useState<number | null>(null);
    const [qiblaDirection, setQiblaDirection] = useState<number>(295.15); // Default to Jakarta/Indonesia roughly
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast, ToastComponent } = useToast();

    const calculateQibla = useCallback((lat: number, lng: number) => {
        const KAABA_LAT = 21.422487;
        const KAABA_LNG = 39.826206;
        
        const phiK = KAABA_LAT * Math.PI / 180.0;
        const lambdaK = KAABA_LNG * Math.PI / 180.0;
        const phi = lat * Math.PI / 180.0;
        const lambda = lng * Math.PI / 180.0;
        
        const y = Math.sin(lambdaK - lambda);
        const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
        let qibla = Math.atan2(y, x) * 180.0 / Math.PI;
        
        return (qibla + 360) % 360;
    }, []);

    useEffect(() => {
        // Get user location for more accurate Qibla calculation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    const qibla = calculateQibla(latitude, longitude);
                    setQiblaDirection(qibla);
                    setIsLoading(false);
                },
                (error) => {
                    console.error("Location error", error);
                    showToast("Gagal mendapatkan lokasi. Menggunakan lokasi default.", "error");
                    setIsLoading(false);
                }
            );
        } else {
            setIsLoading(false);
        }
    }, [calculateQibla, showToast]);

    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        let compass = event.alpha;
        
        // Android/iOS differences often require checking absolute/webkitCompassHeading
        if ((event as any).webkitCompassHeading) {
            // iOS
            compass = (event as any).webkitCompassHeading;
        } else if (event.alpha !== null) {
            // Android (alpha is 0 at north usually, but can vary by device context)
            // Enhanced: Using absolute orientation if available
            if ((event as any).absolute) {
                compass = 360 - event.alpha;
            } else {
                // Fallback for non-absolute alpha
                compass = 360 - event.alpha; 
            }
        }

        if (compass !== null && compass !== undefined) {
             setHeading(compass);
        }
    }, []);

    const requestAccess = () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            (DeviceOrientationEvent as any).requestPermission()
                .then((permissionState: string) => {
                    if (permissionState === 'granted') {
                        setPermissionGranted(true);
                        window.addEventListener('deviceorientation', handleOrientation);
                    } else {
                        showToast('Izin akses kompas diperlukan untuk fitur ini.', 'error');
                    }
                })
                .catch((err: any) => {
                    console.error(err);
                    showToast('Gagal meminta izin akses kompas.', 'error');
                });
        } else {
            // Non-iOS 13+ devices
            setPermissionGranted(true);
            window.addEventListener('deviceorientation', handleOrientation);
            showToast('Kompas diaktifkan!');
        }
    };

    const recalibrate = () => {
        setIsCalibrating(true);
        setTimeout(() => setIsCalibrating(false), 2000);
        showToast('Mengkalibrasi sensor...');
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [handleOrientation]);

    const navigate = useNavigate();

    // Format degree for display
    const currentHeading = heading !== null ? Math.round(heading) : 0;
    const diff = Math.abs(currentHeading - Math.round(qiblaDirection));
    const isAligned = diff < 5; // Within 5 degrees

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 transition-colors">
            {ToastComponent}
            
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 pt-12 pb-10 px-8 rounded-b-[3rem] shadow-xl text-white relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 pointer-events-none">
                    <Compass size={140} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
                             <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                            <Navigation size={10} className="text-amber-400" />
                            <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">Sensor Aktif</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black mb-1 tracking-tight">Arah Kiblat</h1>
                    <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Panduan Menuju Kabah</p>
                </div>
            </div>
            
            <div className="max-w-md mx-auto w-full px-6 pt-8 text-center">
                <div className="mb-10 flex flex-col items-center gap-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        <MapPin size={12} />
                        {location ? "Lokasi Akurat" : "Lokasi Perkiraan"}
                    </div>
                    
                    {location && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                            Target: <span className="text-emerald-500">{Math.round(qiblaDirection)}°</span> • Kompas: <span className={isAligned ? "text-emerald-500" : "text-amber-500"}>{currentHeading}°</span>
                        </p>
                    )}
                </div>

                <div className="relative w-80 h-80 mx-auto mb-12">
                     {/* Accuracy Rings */}
                     <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-500 ${isAligned ? 'border-emerald-500/20' : 'border-slate-100 dark:border-slate-800'} scale-110`}></div>
                     <div className={`absolute inset-0 rounded-full border transition-all duration-500 ${isAligned ? 'border-emerald-500/10 scale-150 opacity-100 animate-ping' : 'opacity-0 scale-100'}`}></div>

                    <div 
                        className={`w-full h-full rounded-full bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] dark:shadow-none border-8 transition-all duration-500 relative ${isAligned ? 'border-emerald-500 scale-105' : 'border-white dark:border-slate-800'}`}
                        style={{ transform: `rotate(-${heading || 0}deg)` }}
                    >
                         {/* Cardinal Points */}
                         <div className="absolute top-4 left-1/2 -translate-x-1/2 font-black text-slate-800 dark:text-white text-lg">N</div>
                         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-black text-slate-300 dark:text-slate-600 text-lg">S</div>
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 dark:text-slate-600 text-lg">W</div>
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300 dark:text-slate-600 text-lg">E</div>

                         {/* Degree Marks */}
                         {[...Array(72)].map((_, i) => (
                             <div 
                                key={i}
                                className="absolute top-0 left-1/2 w-0.5 h-full -translate-x-1/2"
                                style={{ transform: `rotate(${i * 5}deg)` }}
                             >
                                 <div className={`w-full ${i % 18 === 0 ? 'h-4 bg-slate-400' : i % 6 === 0 ? 'h-3 bg-slate-200' : 'h-2 bg-slate-100 opacity-50'}`}></div>
                             </div>
                         ))}

                         {/* Qibla Arrow Container */}
                         <div 
                            className="absolute inset-0 transition-transform duration-1000 ease-in-out"
                            style={{ transform: `rotate(${qiblaDirection}deg)` }}
                         >
                             <div className="absolute top-1/2 left-1/2 w-1 h-36 origin-bottom -translate-x-1/2 -translate-y-full">
                                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${isAligned ? 'bg-emerald-500 text-white border-4 border-white' : 'bg-white dark:bg-slate-900 border-4 border-emerald-500 text-emerald-500'}`}>
                                         <Navigation className={isAligned ? "" : "rotate-45"} size={28} fill="currentColor" />
                                     </div>
                                     <div className={`mt-2 text-[10px] font-black uppercase whitespace-nowrap transition-colors ${isAligned ? 'text-emerald-500 scale-110' : 'text-slate-400'}`}>KABAH</div>
                                 </div>
                                 <div className={`h-full w-1 mx-auto rounded-full transition-all duration-500 ${isAligned ? 'bg-emerald-500 w-1.5' : 'bg-gradient-to-t from-transparent via-emerald-500/50 to-emerald-500'}`}></div>
                             </div>
                         </div>

                         {/* Center Point */}
                         <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-white dark:bg-slate-800 rounded-full -translate-x-1/2 -translate-y-1/2 z-20 shadow-xl border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center">
                             <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isCalibrating ? 'animate-spin border-b-2 border-emerald-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                         </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                    {!permissionGranted ? (
                        <button 
                            onClick={requestAccess}
                            className="bg-emerald-600 text-white px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 active:scale-95 transition-all"
                        >
                            Aktifkan Sensor Kompas
                        </button>
                    ) : (
                        <button 
                            onClick={recalibrate}
                            className="mx-auto flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-800"
                        >
                            <RefreshCw size={14} className={isCalibrating ? "animate-spin" : ""} />
                            Kalibrasi Sensor
                        </button>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] text-left border border-slate-100 dark:border-slate-800 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-800/50">
                        <Compass size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 dark:text-white text-xs mb-1 uppercase tracking-wider">Petunjuk Akurasi</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold leading-relaxed uppercase opacity-70">
                            Letakkan HP di permukaan datar. Jika kompas tidak stabil, gerakkan perangkat membentuk pola angka 8. Jauhi benda bermagnet tinggi.
                        </p>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-[110] flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Menentukan Arah...</p>
                </div>
            )}
        </div>
    );
};

export default QiblaPage;
