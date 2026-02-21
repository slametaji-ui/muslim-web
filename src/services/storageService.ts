
export const APP_STORAGE_KEYS = [
    'muslim_app_setup_done',
    'muslim_app_user_name',
    'theme',
    'muslim_app_adzan_enabled',
    'muslim_app_hijri_offset',
    'muslim_app_last_city',
    'muslim_app_ramadan_start',
    'muslim_app_tracker_history',
    'muslim_app_is_menstruating',
    'muslim_app_period_duration',
    'muslim_app_period_start_date',
    'muslim_app_fast_debts',
    'muslim_app_quran_last_read',
    'muslim_app_quran_khatam',
    'muslim_app_adzan_config',
    'muslim_app_custom_alarms'
];

export const storageService = {
    /**
     * Export all app data to a JSON object
     */
    exportData: () => {
        const data: Record<string, string | null> = {};
        APP_STORAGE_KEYS.forEach(key => {
            data[key] = localStorage.getItem(key);
        });
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        
        a.href = url;
        a.download = `qolbi_backup_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Import app data from a JSON object
     */
    importData: async (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);
                    
                    // Simple validation: check if at least some keys exist
                    const keys = Object.keys(data);
                    const hasAppKeys = keys.some(key => APP_STORAGE_KEYS.includes(key));
                    
                    if (!hasAppKeys) {
                        resolve(false);
                        return;
                    }

                    // Restore relevant data
                    APP_STORAGE_KEYS.forEach(key => {
                        if (data[key] !== undefined && data[key] !== null) {
                            localStorage.setItem(key, data[key]);
                        }
                    });

                    resolve(true);
                } catch (err) {
                    console.error("Import failed:", err);
                    resolve(false);
                }
            };
            reader.readAsText(file);
        });
    },

    /**
     * Save Last Read Surah/Verse
     */
    saveLastRead: (surahId: number, surahName: string, verseNumber: number) => {
        const lastRead = { surahId, surahName, verseNumber, timestamp: new Date().getTime() };
        localStorage.setItem('muslim_app_quran_last_read', JSON.stringify(lastRead));
    },

    /**
     * Get Last Read
     */
    getLastRead: () => {
        const saved = localStorage.getItem('muslim_app_quran_last_read');
        return saved ? JSON.parse(saved) : null;
    },

    /**
     * Toggle Khatam Status for a Surah
     */
    toggleKhatam: (surahNumber: number) => {
        const saved = localStorage.getItem('muslim_app_quran_khatam');
        let khatamList: number[] = saved ? JSON.parse(saved) : [];
        
        if (khatamList.includes(surahNumber)) {
            khatamList = khatamList.filter(id => id !== surahNumber);
        } else {
            khatamList.push(surahNumber);
        }
        
        localStorage.setItem('muslim_app_quran_khatam', JSON.stringify(khatamList));
        return khatamList;
    },

    /**
     * Get All Khatam Surahs
     */
    getKhatamList: (): number[] => {
        const saved = localStorage.getItem('muslim_app_quran_khatam');
        return saved ? JSON.parse(saved) : [];
    },

    /**
     * Get Adzan Config
     */
    getAdzanConfig: () => {
        const saved = localStorage.getItem('muslim_app_adzan_config');
        return saved ? JSON.parse(saved) : {
            subuh: true,
            dzuhur: true,
            ashar: true,
            maghrib: true,
            isya: true
        };
    },

    /**
     * Save Adzan Config
     */
    saveAdzanConfig: (config: any) => {
        localStorage.setItem('muslim_app_adzan_config', JSON.stringify(config));
    },

    /**
     * Get Custom Alarms
     */
    getCustomAlarms: () => {
        const saved = localStorage.getItem('muslim_app_custom_alarms');
        return saved ? JSON.parse(saved) : {
            imsyak: { enabled: false, offset: -10 },
            tahajjud: { enabled: false, time: '03:30' }
        };
    },

    /**
     * Save Custom Alarms
     */
    saveCustomAlarms: (alarms: any) => {
        localStorage.setItem('muslim_app_custom_alarms', JSON.stringify(alarms));
    }
};
