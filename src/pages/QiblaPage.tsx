import React, { useState, useEffect } from 'react';
import { Compass, Navigation, MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const QiblaPage: React.FC = () => {
    const [heading, setHeading] = useState<number | null>(null);
    const [qiblaDirection, setQiblaDirection] = useState<number>(295.15); // Default to Jakarta/Indonesia roughly
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        // Get user location for more accurate Qibla calculation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    const qibla = calculateQibla(latitude, longitude);
                    setQiblaDirection(qibla);
                },
                (error) => console.error("Location error", error)
            );
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
                        alert('Permission needed for compass');
                    }
                })
                .catch(console.error);
        } else {
            // Non-iOS 13+ devices
            setPermissionGranted(true);
            window.addEventListener('deviceorientation', handleOrientation);
        }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
        let compass = event.alpha;
        
        // Android/iOS differences often require checking absolute/webkitCompassHeading
        if ((event as any).webkitCompassHeading) {
            // iOS
            compass = (event as any).webkitCompassHeading;
        } else if (event.alpha !== null) {
            // Android (alpha is 0 at north usually, but can vary by device context)
            compass = 360 - event.alpha; 
        }

        if (compass !== null && compass !== undefined) {
             setHeading(compass);
        }
    };

    const calculateQibla = (lat: number, lng: number) => {
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
    };

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 transition-colors">
            <PageHeader title="Arah Kiblat" />
            
            <div className="max-w-md mx-auto w-full px-6 pt-8 text-center">
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase  animate-pulse">
                        <MapPin size={12} />
                        {location ? "Lokasi Terdeteksi" : "Lokasi Default"}
                    </div>
                </div>

                <div className="relative w-80 h-80 mx-auto mb-12">
                     <div className="absolute inset-0 rounded-full border border-slate-100 dark:border-slate-800 scale-110"></div>
                     <div className="absolute inset-0 rounded-full border border-emerald-500/10 dark:border-emerald-400/5 scale-125 animate-ping"></div>

                    <div 
                        className="w-full h-full rounded-full bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] dark:shadow-none border-8 border-white dark:border-slate-800 relative transition-transform duration-500 ease-out"
                        style={{ transform: `rotate(-${heading || 0}deg)` }}
                    >
                         <div className="absolute top-4 left-1/2 -translate-x-1/2 font-black text-slate-800 dark:text-white text-lg">N</div>
                         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-black text-slate-300 dark:text-slate-600 text-lg">S</div>
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 dark:text-slate-600 text-lg">W</div>
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300 dark:text-slate-600 text-lg">E</div>

                         {[...Array(24)].map((_, i) => (
                             <div 
                                key={i}
                                className="absolute top-0 left-1/2 w-0.5 h-full -translate-x-1/2"
                                style={{ transform: `rotate(${i * 15}deg)` }}
                             >
                                 <div className={`w-full h-3 ${i % 2 === 0 ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800 opacity-50'}`}></div>
                             </div>
                         ))}

                         <div 
                            className="absolute inset-0 transition-transform duration-1000 ease-in-out"
                            style={{ transform: `rotate(${qiblaDirection}deg)` }}
                         >
                             <div className="absolute top-1/2 left-1/2 w-1 h-36 origin-bottom -translate-x-1/2 -translate-y-full">
                                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                     <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-emerald-500 relative overflow-hidden group">
                                         <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors"></div>
                                         <Navigation className="text-emerald-500 rotate-45" size={24} fill="currentColor" />
                                     </div>
                                     <div className="mt-2 text-[10px] font-black text-emerald-600 uppercase  whitespace-nowrap">KABAH</div>
                                 </div>
                                 <div className="h-full w-1 bg-gradient-to-t from-transparent via-emerald-500/50 to-emerald-500 mx-auto rounded-full"></div>
                             </div>
                         </div>

                         <div className="absolute top-1/2 left-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full -translate-x-1/2 -translate-y-1/2 z-20 shadow-xl border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                         </div>
                    </div>
                </div>

                {!permissionGranted && (
                    <button 
                        onClick={requestAccess}
                        className="bg-emerald-600 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase  shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 active:scale-95 transition-all mb-8"
                    >
                        Aktifkan Kompas
                    </button>
                )}

                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[2rem] text-left border border-slate-100 dark:border-slate-800 flex items-start gap-4 shadow-sm">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-emerald-600 shadow-sm border border-slate-100 dark:border-slate-700">
                        <Compass size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 dark:text-white text-sm mb-1 uppercase tracking-tight">Petunjuk Kalibrasi</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                            Pegang HP secara horizontal (mendatar). Jika arah tidak stabil, gerakkan HP membentuk angka 8 di udara untuk kalibrasi ulang sensor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QiblaPage;
