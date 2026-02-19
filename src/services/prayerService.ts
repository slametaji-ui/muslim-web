import { PrayerTimes, Coordinates, CalculationMethod, Madhab, HighLatitudeRule } from 'adhan';
import { format } from 'date-fns';

export interface LocalPrayerTimes {
    imsak: string;
    subuh: string;
    terbit: string;
    dhuha: string;
    dzuhur: string;
    ashar: string;
    maghrib: string;
    isya: string;
    date: string;
}

export interface CalculationOptions {
    madhab?: any; // Using any for now to avoid enum vs type issues with adhan lib
    fajrAngle?: number;
    ishaAngle?: number;
    maghribAngle?: number;
    imsakOffset?: number; // minutes
    dhuhaOffset?: number; // minutes
    hijriOffset?: number; // days
}

export const calculateLocalPrayerTimes = (
    latitude: number,
    longitude: number,
    date: Date = new Date(),
    options: CalculationOptions = {}
): LocalPrayerTimes => {
    const coords = new Coordinates(latitude, longitude);
    
    // Default to Muslim World League (Kemenag style)
    const params = CalculationMethod.MuslimWorldLeague();
    params.fajrAngle = options.fajrAngle !== undefined ? options.fajrAngle : 20;
    params.ishaAngle = options.ishaAngle !== undefined ? options.ishaAngle : 18;
    params.madhab = options.madhab !== undefined ? options.madhab : Madhab.Shafi;
    
    if (options.maghribAngle !== undefined) {
        params.maghribAngle = options.maghribAngle;
    }

    params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;

    const prayerTimes = new PrayerTimes(coords, date, params);

    const formatTime = (time: Date | undefined) => {
        if (!time) return '--:--';
        return format(time, 'HH:mm');
    };

    // Default Imsak is 10 minutes before Subuh in Indonesia
    const subuhDate = prayerTimes.fajr;
    const imsakOffset = options.imsakOffset !== undefined ? options.imsakOffset : -10;
    const imsakDate = new Date(subuhDate.getTime() + imsakOffset * 60000);
    
    // Default Dhuha is 28 mins after Sunrise
    const terbitDate = prayerTimes.sunrise;
    const dhuhaOffset = options.dhuhaOffset !== undefined ? options.dhuhaOffset : 28;
    const dhuhaDate = new Date(terbitDate.getTime() + dhuhaOffset * 60000);

    return {
        imsak: formatTime(imsakDate),
        subuh: formatTime(subuhDate),
        terbit: formatTime(terbitDate),
        dhuha: formatTime(dhuhaDate),
        dzuhur: formatTime(prayerTimes.dhuhr),
        ashar: formatTime(prayerTimes.asr),
        maghrib: formatTime(prayerTimes.maghrib),
        isya: formatTime(prayerTimes.isha),
        date: format(date, 'yyyy-MM-dd')
    };
};
