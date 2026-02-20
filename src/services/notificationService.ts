import { PrayerTimes } from './api';

class NotificationService {
    private isSupported = 'Notification' in window;

    async requestPermission(): Promise<boolean> {
        if (!this.isSupported) return false;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    async scheduleAdhanNotifications(prayerTimes: PrayerTimes) {
        if (!this.isSupported || Notification.permission !== 'granted') return;

        // In a PWA, we can't truly "schedule" for future moments without a backend or 
        // a very complex SW implementation with PeriodSync (which is limited).
        // However, we can set up local timeouts if the app is open, or 
        // better yet, we can register periodic tasks if the OS allows.
        
        // For this implementation, we will:
        // 1. Schedule for the current session (timeouts).
        // 2. Clear previous timeouts.
        
        console.log("Scheduling Adhan for today:", prayerTimes.lokasi);
        
        const schedule = prayerTimes.jadwal;
        const prayers = [
            { name: 'Subuh', time: schedule.subuh },
            { name: 'Dzuhur', time: schedule.dzuhur },
            { name: 'Ashar', time: schedule.ashar },
            { name: 'Maghrib', time: schedule.maghrib },
            { name: 'Isya', time: schedule.isya },
            { name: 'Imsak', time: schedule.imsak }
        ];

        prayers.forEach(prayer => {
            this.scheduleNotification(prayer.name, prayer.time);
        });
    }

    private scheduleNotification(name: string, timeStr: string) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const now = new Date();
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0, 0);

        if (prayerDate > now) {
            const delay = prayerDate.getTime() - now.getTime();
            setTimeout(() => {
                this.showNotification(`Waktunya ${name}`, {
                    body: `Sudah masuk waktu ${name} untuk wilayah setempat.`,
                    icon: '/logo-muslimapp.png',
                    vibrate: [200, 100, 200]
                } as any);
            }, delay);
        }
    }

    private showNotification(title: string, options?: NotificationOptions) {
        if (!this.isSupported || Notification.permission !== 'granted') return;

        // Try to show via Service Worker registration if available for better PWA support
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, options);
            });
        } else {
            new Notification(title, options);
        }
    }
}

export const notificationService = new NotificationService();
