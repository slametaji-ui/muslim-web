import { PrayerTimes } from './api';

/**
 * NotificationService handles scheduling and displaying notifications for prayer times.
 * 
 * IMPORTANT (PWA Background Limitations):
 * - In a web browser/PWA, precise scheduling when the app is CLOSED is limited.
 * - This implementation uses `setTimeout` which works best if the app/browser is active.
 * - We use Service Workers to trigger notifications, which provides better background 
 *   support than the standard Notification API, but still depends on the OS keeping
 *   the browser process alive in the background.
 * - For 100% reliability even when the app is completely "killed", a Backend Push 
 *   Notification (FCM/WebPush) would be required.
 */
class NotificationService {
    private isSupported = 'Notification' in window;

    async requestPermission(): Promise<boolean> {
        if (!this.isSupported) return false;
        
        // Some browsers require a user gesture to request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            return true;
        }
        return false;
    }

    /**
     * Schedules notifications for all prayer times today.
     */
    async scheduleAdhanNotifications(prayerTimes: PrayerTimes) {
        if (!this.isSupported) return;
        
        if (Notification.permission !== 'granted') {
            console.warn("Notification permission not granted. Adhan won't play.");
            return;
        }

        console.log("Scheduling Adhan for today:", prayerTimes.lokasi);
        
        const schedule = prayerTimes.jadwal;
        const adzanConfig = JSON.parse(localStorage.getItem('muslim_app_adzan_config') || '{}');
        const customAlarms = JSON.parse(localStorage.getItem('muslim_app_custom_alarms') || '{}');

        const prayers = [
            { name: 'Subuh', time: schedule.subuh, enabled: adzanConfig.subuh !== false },
            { name: 'Dzuhur', time: schedule.dzuhur, enabled: adzanConfig.dzuhur !== false },
            { name: 'Ashar', time: schedule.ashar, enabled: adzanConfig.ashar !== false },
            { name: 'Maghrib', time: schedule.maghrib, enabled: adzanConfig.maghrib !== false },
            { name: 'Isya', time: schedule.isya, enabled: adzanConfig.isya !== false }
        ];

        // Schedule standard prayers
        prayers.forEach(prayer => {
            if (prayer.time && prayer.enabled) {
                this.scheduleNotification(prayer.name, prayer.time);
            }
        });

        // Schedule Custom Alarms (Imsyak, Tahajjud)
        if (customAlarms.imsyak?.enabled && schedule.imsak) {
            const [h, m] = schedule.imsak.split(':').map(Number);
            const imsakDate = new Date();
            imsakDate.setHours(h, m + (customAlarms.imsyak.offset || 0), 0, 0);
            const timeStr = `${String(imsakDate.getHours()).padStart(2, '0')}:${String(imsakDate.getMinutes()).padStart(2, '0')}`;
            this.scheduleNotification('Imsyak', timeStr);
        }

        if (customAlarms.tahajjud?.enabled && customAlarms.tahajjud?.time) {
            this.scheduleNotification('Tahajjud', customAlarms.tahajjud.time);
        }
    }

    private scheduleNotification(name: string, timeStr: string) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const now = new Date();
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0, 0);

        // If time has passed today, don't schedule
        if (prayerDate <= now) return;

        const delay = prayerDate.getTime() - now.getTime();
        
        setTimeout(() => {
            // Play Adzan Audio
            try {
                const audioUrl = name === 'Subuh' 
                    ? '/subuh.mp3' 
                    : '/regular.mp3';
                const audio = new Audio(audioUrl);
                audio.play().catch(e => console.log("Bg audio play failed:", e));
            } catch (e) {
                console.error("Audio error", e);
            }

            this.showNotification(`Waktunya ${name}`, {
                body: `Sudah masuk waktu ${name} untuk wilayah ${localStorage.getItem('muslim_app_last_city') ? JSON.parse(localStorage.getItem('muslim_app_last_city')!).lokasi : 'setempat'}.`,
                icon: '/logo-muslimapp.png',
                badge: '/logo-muslimapp.png',
                vibrate: [200, 100, 200, 100, 200],
                tag: `adhan-${name.toLowerCase()}`, // Prevent duplicate notifications
                renotify: true,
                requireInteraction: true, // Keep notification until user dismisses
                data: {
                    url: window.location.origin + '/prayer-times'
                }
            } as any);
        }, delay);
        
        console.log(`Scheduled ${name} in ${Math.round(delay/1000/60)} minutes.`);
    }

    /**
     * Shows a notification using the Service Worker for better background performance.
     */
    private async showNotification(title: string, options?: NotificationOptions) {
        if (!this.isSupported || Notification.permission !== 'granted') return;

        try {
            // Service Worker registration is the preferred way for PWAs
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                registration.showNotification(title, options);
            } else {
                // Fallback to standard API
                new Notification(title, options);
            }
        } catch (error) {
            console.error('Error showing notification:', error);
            // Last resort fallback
            new Notification(title, options);
        }
    }
}

export const notificationService = new NotificationService();
