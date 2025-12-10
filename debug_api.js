import axios from 'axios';

async function testApi() {
    try {
        console.log("Testing All Surahs...");
        const response = await axios.get('https://api.myquran.com/v2/quran/surat/semua');
        console.log("Status:", response.status);
        if (response.data && response.data.data) {
            console.log("Data/Data type:", typeof response.data.data);
            if (Array.isArray(response.data.data)) {
                console.log("First item:", JSON.stringify(response.data.data[0], null, 2));
            } else {
                console.log("Data structure:", JSON.stringify(response.data, null, 2));
            }
        } else {
            console.log("Response data:", JSON.stringify(response.data, null, 2));
        }

        console.log("\nTesting Surah Detail 1...");
        const detailResponse = await axios.get('https://api.myquran.com/v2/quran/surat/1');
        if (detailResponse.data && detailResponse.data.data) {
            console.log("Detail item:", JSON.stringify(detailResponse.data.data, null, 2));
        } else {
            console.log("Detail Response data:", JSON.stringify(detailResponse.data, null, 2));
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

testApi();
