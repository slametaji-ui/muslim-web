import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrayerTimesPage from './pages/PrayerTimesPage';
import CalendarPage from './pages/CalendarPage';
import QuranPage from './pages/QuranPage';
import SurahDetailPage from './pages/SurahDetailPage';
import JuzDetailPage from './pages/JuzDetailPage';
import ThemeDetailPage from './pages/ThemeDetailPage';

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
                    <Route path="/calendar" element={<CalendarPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
