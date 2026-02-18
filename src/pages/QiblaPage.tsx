import React, { useState, useEffect } from 'react';
import { Compass, Navigation, MapPin } from 'lucide-react';

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
            // Simplified handling for now
            compass = 360 - event.alpha; 
        }

        if (compass !== null && compass !== undefined) {
             setHeading(compass);
        }
    };

    // Calculate Qibla direction from current location
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

    // Helper to rotate compass
    // If heading is 0 (North), and Qibla is 295. 
    // We rotate the compass card by -heading using CSS transform.
    // The Qibla marker should be at 295 degrees on the card.

    return (
        <div className="max-w-md mx-auto w-full pb-20 px-4 pt-6 text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Arah Kiblat</h1>
            <p className="text-slate-500 text-sm mb-8">
                {location ? "Arah Kiblat disesuaikan dengan lokasi Anda." : "Menampilkan arah kiblat umum (Jakarta)."}
            </p>

            <div className="relative w-72 h-72 mx-auto mb-8">
                 {/* Compass Body */}
                <div 
                    className="w-full h-full rounded-full border-4 border-slate-200 bg-white shadow-xl relative transition-transform duration-200 ease-out"
                    style={{ transform: `rotate(-${heading || 0}deg)` }}
                >
                     {/* Cardinal Points */}
                     <div className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-slate-400">N</div>
                     <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-slate-400">S</div>
                     <div className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-slate-400">W</div>
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-slate-400">E</div>

                     {/* Qibla Indicator */}
                     <div 
                        className="absolute top-1/2 left-1/2 w-1 h-32 origin-bottom -translate-x-1/2"
                        style={{ transform: `rotate(${qiblaDirection}deg) translateY(-50%)` }}
                     >
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                             <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                                 <Navigation className="text-white rotate-45" size={16} />
                             </div>
                         </div>
                         <div className="h-full w-0.5 bg-emerald-500/50 mx-auto"></div>
                     </div>

                     {/* Center Point */}
                     <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-slate-800 rounded-full -translate-x-1/2 -translate-y-1/2 z-10 border-2 border-white"></div>
                </div>

                {/* Fixed Needle (Phone is static, Compass rotates) OR Phone rotates, Compass stays? 
                    Usually: Compass rotates to match North. 
                */}
            </div>

            {!permissionGranted && (
                <button 
                    onClick={requestAccess}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:bg-emerald-700 transition-colors"
                >
                    Izinkan Akses Kompas
                </button>
            )}

            <div className="mt-8 bg-emerald-50 p-4 rounded-xl text-left border border-emerald-100">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 mt-1">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-900 text-sm mb-1">Tips Akurasi</h3>
                        <p className="text-emerald-700 text-sm opacity-90 leading-relaxed">
                            Pastikan GPS aktif dan lakukan kalibrasi kompas dengan gerakan angka 8 jika arah tidak sesuai. Jauhkan dari benda magnetik.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QiblaPage;
