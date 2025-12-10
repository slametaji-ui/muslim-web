import axios from 'axios';

async function testExtras() {
    const endpoints = [
        'https://api.myquran.com/v2/quran/juz/semua', // Try to get list of juz infos? Or maybe just 1..30 is static
        'https://api.myquran.com/v2/quran/juz/1',    // Try to get detail of Juz 1
        'https://api.myquran.com/v2/quran/tema/semua', // Try to get list of themes
        'https://api.myquran.com/v2/quran/tema/1'      // Try to get detail of theme 1
    ];

    for (const url of endpoints) {
        try {
            console.log(`\nTesting ${url}...`);
            const res = await axios.get(url);
            if (res.data.status) {
                console.log("SUCCESS");
                const data = res.data.data;
                if (Array.isArray(data)) {
                    console.log("Array Length:", data.length);
                    console.log("Sample Item:", JSON.stringify(data[0], null, 2));
                } else {
                    console.log("Object Keys:", Object.keys(data));
                    if (data.verses && Array.isArray(data.verses)) {
                        console.log("Verses count:", data.verses.length);
                    }
                }
            } else {
                console.log("FAILED (Status false):", res.data.message);
            }
        } catch (e) {
            console.log(`ERROR ${url}:`, e.message);
        }
    }
}

testExtras();
