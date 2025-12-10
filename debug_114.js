import axios from 'axios';

async function debugSurah114() {
    try {
        console.log("Fetching Header for 114...");
        const header = await axios.get('https://api.myquran.com/v2/quran/surat/114');
        if (header.data.status) {
            const info = header.data.data;
            console.log("Header success. Verses count:", info.number_of_verses);

            const rangeUrl = `https://api.myquran.com/v2/quran/ayat/114/1-${info.number_of_verses}`;
            console.log(`Fetching Verses: ${rangeUrl}`);

            const verses = await axios.get(rangeUrl);
            if (verses.data.status) {
                console.log("Verses success. Count:", verses.data.data.length);
                console.log("First verse:", JSON.stringify(verses.data.data[0], null, 2));
            } else {
                console.log("Verses FAILED:", JSON.stringify(verses.data));
            }

            console.log("Tafsir check:", JSON.stringify(info.tafsir, null, 2));

        } else {
            console.log("Header FAILED:", JSON.stringify(header.data));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

debugSurah114();
