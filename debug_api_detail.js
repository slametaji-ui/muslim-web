import axios from 'axios';

async function testApi() {
    try {
        console.log("Testing Surah Detail 1...");
        const detailResponse = await axios.get('https://api.myquran.com/v2/quran/surat/1');
        if (detailResponse.data && detailResponse.data.data) {
            const data = detailResponse.data.data;
            // Print keys to see structure
            console.log("Keys:", Object.keys(data));
            console.log("Sample Verse:", JSON.stringify(data.verses ? data.verses[0] : "No verses", null, 2));

            // Print some top level fields
            console.log("Name ID:", data.name_id);
            console.log("Verses count:", data.number_of_verses);
        } else {
            console.log("Detail Response data:", JSON.stringify(detailResponse.data, null, 2));
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

testApi();
