import axios from 'axios';

async function debugFallback() {
    try {
        console.log("Checking 113 (Al-Falaq)...");
        const r113 = await axios.get('https://api.myquran.com/v2/quran/surat/113');
        if (r113.data.status) {
            console.log("113 Success.");
            console.log("Tafsir keys:", Object.keys(r113.data.data.tafsir || {}));
            console.log("Revelation:", r113.data.data.revelation);
        } else {
            console.log("113 FAILED");
        }

        console.log("\nChecking 'semua' list for 114 info...");
        const all = await axios.get('https://api.myquran.com/v2/quran/surat/semua');
        if (all.data.status) {
            const s114 = all.data.data.find(s => s.number === 114);
            if (s114) {
                console.log("Found 114 in list:", JSON.stringify(s114, null, 2));

                // Try fetching verses using count from list
                if (s114.number_of_verses) {
                    const url = `https://api.myquran.com/v2/quran/ayat/114/1-${s114.number_of_verses}`;
                    console.log(`Testing verses fetch: ${url}`);
                    const v = await axios.get(url);
                    console.log("Verses status:", v.data.status);
                }
            } else {
                console.log("114 NOT found in list");
            }
        }
    } catch (e) {
        console.error(e.message);
    }
}

debugFallback();
