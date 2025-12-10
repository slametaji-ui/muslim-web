// Basic conversion utils

export const monthsHijri = [
    'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir',
    'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Syaban',
    'Ramadhan', 'Syawal', 'Dzulkaidah', 'Dzulhijjah'
];

export const formatHijriDate = (dString: string) => {
    // Assuming API or conversion returns basic structure
    // This part often needs a library like moment-hijri or an API.
    // We will use the API endpoint if available or a simple approximation for demo if API limits.
    // Research showed api.myquran.com might not have a direct converter, so I'll create a basic mock/client-side converter for now
    // or rely on an external free API if needed. 
    // Wait, the API documentation usually has this. Let's start with a library-free Intl approach if possible or Aladhan API for calendar.
    // 'https://api.aladhan.com/v1/gToH' is a common backup.
    // Let's stick to the main API first.
    return dString;
}
