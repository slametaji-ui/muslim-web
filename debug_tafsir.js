import axios from 'axios';

async function debugTafsir() {
    try {
        const r = await axios.get('https://api.myquran.com/v2/quran/surat/113');
        if (r.data.status) {
            const t = r.data.data.tafsir;
            console.log("Type:", typeof t);
            console.log("Is Array?", Array.isArray(t));
            console.log("Sample:", JSON.stringify(t, null, 2));
        }
    } catch (e) { console.log(e.message); }
}
debugTafsir();
