# Muslim App 🌙

A modern, comprehensive Islamic utility application built with React, TypeScript, and Tailwind CSS. Provides accurate prayer times, Al-Quran reading features, and a Hijri calendar in a beautiful, responsive interface.

[**🚀 Live Demo**](https://muslim-web-dun.vercel.app/)

## ✨ Features

### 🕌 Prayer Times & Schedule
- **Accurate Schedule**: Daily prayer times based on your location (Kemenag RI standard).
- **Auto Location**: Automatically detects your city (Geolocation) or manual search/selection.
- **Smart Notifications**: Push notifications and visual alerts when prayer time arrives.
- **Adzan Audio**: Automatically plays Adzan audio when prayer time is entered.
- **Countdown**: Real-time countdown to the next prayer.
- **Weekly/Monthly View**: Switch between weekly and monthly prayer schedules.

### 📖 Al-Quran Digital
- **Complete 30 Juz**: Read the full Quran with clear Arabic text, Latin transliteration, and Indonesian translation.
- **Three Browsing Modes**:
  - **Surah**: Browse by Surah index.
  - **Juz**: Navigate by Juz 1-30.
  - **Theme (Tema)**: Explore verses categorized by topic/theme.
- **Audio Playback**: Listen to audio recitation for each Surah.
- **Tafsir & Info**: View revelation info and tafsir for each Surah.

### 📅 Calendar
- **Hybrid Calendar**: Displays Gregorian (Masehi) and Hijri dates side-by-side.
- **Hijri Conversion**: Powered by Aladhan API for accurate date conversion.

## 🛠️ Technology Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State/Routing**: React Router DOM
- **Utilities**: Axios, Date-fns

## 🔌 APIs Used

This project relies on the following open-source APIs:
- **MyQuran API** (`api.myquran.com/v2`): For Prayer Times, City Search, and Quran data.
- **Aladhan API** (`api.aladhan.com`): For Masehi to Hijri date conversion.
- **Nominatim** (`nominatim.openstreetmap.org`): For reverse geocoding (Location detection).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/muslim-web.git
   cd muslim-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`.

## 📦 Deployment

### Vercel
This project is configured for Vercel deployment.
1. Push to your Git repository.
2. Import project into Vercel.
3. The included `vercel.json` ensures client-side routing works correctly.

## 📄 License

Developed by **Muslim App Team**.
Data provided by MyQuran and Aladhan.
