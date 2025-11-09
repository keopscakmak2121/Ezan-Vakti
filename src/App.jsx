// src/App.jsx - Added Settings View

import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import TabBar from './components/TabBar.jsx';
import HomePage from './components/home/HomePage.jsx';
import SurahList from './components/SurahList.jsx';
import QuranReader from './components/QuranReader.jsx';
import Settings from './components/Settings.jsx'; // Import Settings component

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('quran_settings') || '{}');
      return !!settings.darkMode;
    } catch {
      return false;
    }
  });

  const [selectedSurah, setSelectedSurah] = useState(null);

  const handleNavigate = (view) => {
    setCurrentView(view);
    if (view !== 'quran') {
      setSelectedSurah(null);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    try {
      const settings = JSON.parse(localStorage.getItem('quran_settings') || '{}');
      settings.darkMode = newDarkMode;
      localStorage.setItem('quran_settings', JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save dark mode setting:", e);
    }
  };

  const bg = darkMode ? '#1f2937' : '#f3f4f6';

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage darkMode={darkMode} onNavigate={handleNavigate} />;
      case 'quran':
        return selectedSurah ? 
               <QuranReader surah={selectedSurah} darkMode={darkMode} onBack={() => setSelectedSurah(null)} /> : 
               <SurahList onSurahClick={setSelectedSurah} darkMode={darkMode} />;
      case 'settings':
        return <Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      default:
        return (
          <div style={{textAlign: 'center', paddingTop: '50px', color: darkMode ? 'white' : 'black'}}>
            <h2>{currentView}</h2>
            <p>Bu sayfa henüz hazır değil.</p>
          </div>
        );
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg }}>
      <div style={{ padding: '10px', paddingBottom: '70px' }}>
        {renderCurrentView()}
      </div>
      <TabBar darkMode={darkMode} onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
