import axios from 'axios';

async function testRange() {
    const url = 'https://api.myquran.com/v2/quran/ayat/1/1-7';
    try {
        console.log(`Testing ${url}...`);
        const response = await axios.get(url);
        if (response.data.status) {
            console.log(`SUCCESS`);
            const data = response.data.data;
            if (Array.isArray(data)) {
                console.log("Is Array. Length:", data.length);
                console.log("First item:", JSON.stringify(data[0], null, 2));
            } else {
                console.log("Is Object. Keys:", Object.keys(data));
            }
        } else {
            console.log(`FAILED: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        console.log(`ERROR: ${error.message}`);
    }
}

testRange();
