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
import ProfilePage from './pages/ProfilePage';
import HadithPage from './pages/HadithPage';
import TrackerPage from './pages/TrackerPage';

import RamadanPage from './pages/RamadanPage';
import ZakatCalculatorPage from './pages/ZakatCalculatorPage';
import WomenHealthPage from './pages/WomenHealthPage';
import DoaPage from './pages/DoaPage';
import Onboarding from './components/Onboarding';

function App() {
    const [showOnboarding, setShowOnboarding] = React.useState(() => {
        return localStorage.getItem('muslim_app_setup_done') !== 'true';
    });

    return (
        <Router>
            {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
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
                    <Route path="/doa/:category" element={<DoaPage />} />
                    <Route path="/hadith" element={<HadithPage />} />
                    <Route path="/tracker" element={<TrackerPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
