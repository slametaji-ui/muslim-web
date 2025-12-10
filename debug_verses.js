import axios from 'axios';

async function testEndpoints() {
    const endpoints = [
        'https://api.myquran.com/v2/quran/ayat/1',
        'https://api.myquran.com/v2/quran/ayat/1/semua',
        'https://api.myquran.com/v2/quran/surat/1/ayat'
    ];

    for (const url of endpoints) {
        try {
            console.log(`Testing ${url}...`);
            const response = await axios.get(url);
            if (response.data.status) {
                console.log(`SUCCESS: ${url}`);
                const data = response.data.data;
                if (Array.isArray(data)) {
                    console.log("Is Array. First item keys:", Object.keys(data[0]));
                } else {
                    console.log("Is Object. Keys:", Object.keys(data));
                }
            } else {
                console.log(`FAILED (Status false): ${url}`);
            }
        } catch (error) {
            console.log(`ERROR ${url}: ${error.message}`);
        }
    }
}

testEndpoints();
