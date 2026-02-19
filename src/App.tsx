import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import PrayerTimesPage from './pages/PrayerTimesPage';
import CalendarPage from './pages/CalendarPage';
import QuranPage from './pages/QuranPage';
import SurahDetailPage from './pages/SurahDetailPage';
import JuzDetailPage from './pages/JuzDetailPage';
import ThemeDetailPage from './pages/ThemeDetailPage';
import QiblaPage from './pages/QiblaPage';
import TasbihPage from './pages/TasbihPage';
import SchedulePage from './pages/SchedulePage';

import RamadanPage from './pages/RamadanPage';
import ZakatCalculatorPage from './pages/ZakatCalculatorPage';
import WomenHealthPage from './pages/WomenHealthPage';
import DoaPage from './pages/DoaPage';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Layout>
                <Routes>
                    <Route path="/" element={<PrayerTimesPage />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/quran" element={<QuranPage />} />
                    <Route path="/quran/:id" element={<SurahDetailPage />} />
                    <Route path="/quran/juz/:id" element={<JuzDetailPage />} />
                    <Route path="/quran/tema/:id" element={<ThemeDetailPage />} />
                    <Route path="/qibla" element={<QiblaPage />} />
                    <Route path="/tasbih" element={<TasbihPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/ramadan" element={<RamadanPage />} />
                    <Route path="/zakat" element={<ZakatCalculatorPage />} />
                    <Route path="/muslimah" element={<WomenHealthPage />} />
                    <Route path="/doa" element={<DoaPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
