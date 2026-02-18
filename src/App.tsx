import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrayerTimesPage from './pages/PrayerTimesPage';
import CalendarPage from './pages/CalendarPage';
import QuranPage from './pages/QuranPage';
import SurahDetailPage from './pages/SurahDetailPage';
import JuzDetailPage from './pages/JuzDetailPage';
import ThemeDetailPage from './pages/ThemeDetailPage';
import QiblaPage from './pages/QiblaPage';
import TasbihPage from './pages/TasbihPage';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<PrayerTimesPage />} />
                    <Route path="/quran" element={<QuranPage />} />
                    <Route path="/quran/:id" element={<SurahDetailPage />} />
                    <Route path="/quran/juz/:id" element={<JuzDetailPage />} />
                    <Route path="/quran/tema/:id" element={<ThemeDetailPage />} />
                    <Route path="/qibla" element={<QiblaPage />} />
                    <Route path="/tasbih" element={<TasbihPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
