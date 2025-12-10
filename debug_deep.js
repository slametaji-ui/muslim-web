import axios from 'axios';

async function testDeep() {
    try {
        console.log("Testing how to get Tema verses...");
        // Maybe /quran/ayat/tema/1 ?
        const temaVersesUrl = 'https://api.myquran.com/v2/quran/ayat/tema/1';
        console.log(`Testing ${temaVersesUrl}`);
        const tv = await axios.get(temaVersesUrl);
        if (tv.data.status) {
            console.log("Team Verses Success:", tv.data.data.length);
            // console.log("Sample:", JSON.stringify(tv.data.data[0], null, 2));
        } else {
            console.log("Tema Verses Failed:", tv.data);
        }

        console.log("\nTesting ranges for Juz 1...");
        // Juz 1 starts 1:1, ends 2:141. We can maybe query verses?
        // But the API seems to support /quran/ayat/{surah}/{range}.
        // Getting ALL verses for a Juz might require multiple calls if it spans surahs.
        // OR is there /juz/{id}/ayat or something?
        // Documentation v1 had /quran/juz/{no}. V2 failed.
        // Let's try /quran/ayat/juz/1
        const juzVersesUrl = 'https://api.myquran.com/v2/quran/ayat/juz/1';
        console.log(`Testing ${juzVersesUrl}`);
        const jv = await axios.get(juzVersesUrl);
        if (jv.data.status) {
            console.log("Juz Verses Success:", jv.data.data.length);
        } else {
            console.log("Juz Verses Failed:", jv.data);
        }

    } catch (e) { console.log(e.message); }
}

testDeep();
