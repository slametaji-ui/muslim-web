import axios from 'axios';

const API_BASE_URL = 'https://api.myquran.com/v2';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Interface definitions
export interface City {
    id: string;
    lokasi: string;
}

export interface PrayerTimes {
    id: number;
    lokasi: string;
    daerah: string;
    koordinat: {
        lat: number;
        lon: number;
        lintang: string;
        bujur: string;
    };
    jadwal: {
        tanggal: string;
        imsak: string;
        subuh: string;
        terbit: string;
        dhuha: string;
        dzuhur: string;
        ashar: string;
        maghrib: string;
        isya: string;
        date: string;
    };
}

export interface Surah {
    number: number;
    name_short: string; // Arabic
    name_long: string;
    name_en: string;
    name_id: string; // Latin/Indonesian
    number_of_verses: number;
    revelation_id: string; // Meccan/Medinan
    tafsir_id: number;
    audio_url: string;
    translation_id: string;
    translation_en: string;
}

// Simplified interface based on actual API response
export interface Verse {
    id: string;
    surah: string;
    ayah: string;
    arab: string;
    latin: string;
    text: string; // Translation
    audio: string;
}

// Fallback data for broken API endpoints
const FALLBACK_SURAH_114: Partial<SurahDetail> = {
    number: 114,
    name_short: "الناس",
    name_long: "سورة الناس",
    name_en: "An-Nas",
    name_id: "An-Nas",
    number_of_verses: 6,
    revelation_id: "Makkiyah",
    tafsir: "Surat An Naas ini terdiri atas 6 ayat, termasuk golongan surat-surat Makkiyah, diturunkan sesudah surat Al Falaq. Nama An Naas diambil dari kata An Naas yang berulang kali disebut dalam surat ini yang artinya manusia. Surat ini termasuk golongan surat muawwidzatain (surat perlindungan).",
    audio_url: "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/114.mp3",
    translation_en: "Mankind",
    translation_id: "Manusia"
};

export interface Juz {
    number: string;
    name: string;
    name_start_id: string;
    name_end_id: string;
    verse_start: string;
    verse_end: string;
}

export interface Theme {
    id: string;
    name: string;
}

export interface SurahDetail extends Surah {
    tafsir?: string;
    verses: Verse[];
}

export const api = {
    // Search for a city
    searchCity: async (query: string): Promise<City[]> => {
        try {
            // Endpoint: /sholat/kota/cari/{nama_kota}
            const response = await axios.get(`https://api.myquran.com/v2/sholat/kota/cari/${query}`);
            // Response format often: { status: true, data: [...] }
            if (response.data.status) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error searching city:', error);
            return [];
        }
    },

    // Helper to fetch with LocalStorage Cache
    fetchWithCache: async <T>(key: string, fetcher: () => Promise<T>, forceRefresh = false, ttlMinutes = 60 * 24): Promise<T | null> => {
        if (!forceRefresh) {
            const cached = localStorage.getItem(key);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    const now = new Date().getTime();
                    // Check if expired
                    if (now - parsed.timestamp < ttlMinutes * 60 * 1000) {
                        return parsed.data;
                    }
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }
        }

        try {
            const data = await fetcher();
            if (data) {
                localStorage.setItem(key, JSON.stringify({
                    timestamp: new Date().getTime(),
                    data: data
                }));
            }
            return data;
        } catch (error) {
            console.error("Fetch error", error);
            return null;
        }
    },

    // Get prayer times for a city and date
    getPrayerTimes: async (cityId: string, date: Date, forceRefresh = false): Promise<PrayerTimes | null> => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        const cacheKey = `muslim_app_prayer_${cityId}_${formattedDate}`;

        return api.fetchWithCache(cacheKey, async () => {
            try {
                const response = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${formattedDate}`);
                if (response.data.status) {
                    return response.data.data;
                }
                return null;
            } catch (error) {
                console.error('Error fetching prayer times:', error);
                return null;
            }
        }, forceRefresh);
    },

    // Get Hijri Date from Masehi
    getHijriDate: async (date: Date): Promise<any> => {
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            // Using Aladhan API for reliable Calendar conversion
            const response = await axios.get(`https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`);

            if (response.data.code === 200) {
                return response.data.data.hijri;
            }
            return null;
        } catch (error) {
            console.error('Error converting Masehi to Hijri:', error);
            return null;
        }
    },

    // Get Monthly Prayer Times
    getMonthlyPrayerTimes: async (cityId: string, year: number, month: number): Promise<PrayerTimes | null> => {
        try {
            // URL: https://api.myquran.com/v2/sholat/jadwal/:kota/:tahun/:bulan
            const formattedMonth = String(month).padStart(2, '0');
            const response = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${year}/${formattedMonth}`);
            if (response.data.status) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching monthly prayer times', error);
            return null;
        }
    },

    // Get City by Location (Reverse Geocode -> Search)
    getCityByLocation: async (lat: number, lon: number): Promise<City | null> => {
        try {
            // 1. Reverse Geocode using simple Nominatim (OpenStreetMap)
            const geoResponse = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            if (geoResponse.data && (geoResponse.data.address.city || geoResponse.data.address.town || geoResponse.data.address.county)) {
                const cityName = geoResponse.data.address.city || geoResponse.data.address.town || geoResponse.data.address.county;
                // Remove "Kota" or "Kabupaten" prefix if common for better search match
                const cleanName = cityName.replace(/^(Kota|Kabupaten)\s+/i, '');

                // 2. Search exact city in MyQuran API
                const searchResults = await api.searchCity(cleanName);
                if (searchResults.length > 0) {
                    // Try to find best match or return first
                    return searchResults[0];
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting city by location:', error);
            return null;
        }
    },

    // Get All Surahs
    getQuranSurahs: async (): Promise<any[]> => {
        try {
            // Endpoint: https://api.myquran.com/v2/quran/surat/semua
            const response = await axios.get('https://api.myquran.com/v2/quran/surat/semua');
            if (response.data.status) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching surahs:', error);
            return [];
        }
    },

    // Get Surah Details (Header + Verses)
    getSurahDetails: async (id: number): Promise<SurahDetail | null> => {
        try {
            let surahInfo: any = null;
            let verseCount = 0;

            // 1. Get Header Info
            try {
                const headerResponse = await axios.get(`https://api.myquran.com/v2/quran/surat/${id}`);
                if (headerResponse.data.status) {
                    surahInfo = headerResponse.data.data;
                    verseCount = surahInfo.number_of_verses;
                }
            } catch (e) {
                console.warn(`Header fetch failed for ${id}, checking fallback...`);
            }

            // Fallback for 114 or others
            if (!surahInfo) {
                if (id === 114) {
                    surahInfo = FALLBACK_SURAH_114;
                    verseCount = 6;
                } else {
                    return null; // Cannot proceed without header
                }
            }

            // 2. Get Verses (Batched Strategy to bypass API limits)
            const BATCH_SIZE = 20;
            const batchPromises = [];

            for (let i = 1; i <= verseCount; i += BATCH_SIZE) {
                const start = i;
                const end = Math.min(i + BATCH_SIZE - 1, verseCount);
                batchPromises.push(
                    axios.get(`https://api.myquran.com/v2/quran/ayat/${id}/${start}-${end}`)
                        .then(res => res.data.status ? res.data.data : [])
                        .catch(err => {
                            console.error(`Error fetching batch ${start}-${end}:`, err);
                            return [];
                        })
                );
            }

            const batchResults = await Promise.all(batchPromises);
            const verses: Verse[] = batchResults.flat();

            return {
                ...surahInfo,
                verses: verses
            };
        } catch (error) {
            console.error('Error fetching surah details:', error);
            return null;
        }
    },

    // Get All Juz
    getAllJuz: async (): Promise<Juz[]> => {
        try {
            const response = await axios.get('https://api.myquran.com/v2/quran/juz/semua');
            if (response.data.status) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching juz list:', error);
            return [];
        }
    },

    // Get All Themes
    getAllThemes: async (): Promise<Theme[]> => {
        try {
            const response = await axios.get('https://api.myquran.com/v2/quran/tema/semua');
            if (response.data.status) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching themes:', error);
            return [];
        }
    },

    // Get Juz Verses
    getJuzVerses: async (id: number): Promise<Verse[]> => {
        try {
            const response = await axios.get(`https://api.myquran.com/v2/quran/ayat/juz/${id}`);
            if (response.data.status) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching juz verses:', error);
            return [];
        }
    },

    // Get Theme Verses
    getThemeVerses: async (id: number): Promise<Verse[]> => {
        try {
            const response = await axios.get(`https://api.myquran.com/v2/quran/ayat/tema/${id}`);
            if (response.data.status) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching theme verses:', error);
            return [];
        }
    }
};
