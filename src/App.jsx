import React, { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import TabBar from './components/TabBar.jsx';
import HomePage from './components/home/HomePage.jsx';
import SurahList from './components/SurahList.jsx';
import QuranReader from './components/quran/QuranReader.jsx';
import JuzReader from './components/quran/JuzReader.jsx'; // Import the new Juz Reader
import Settings from './components/Settings.jsx';
import Navigation, { menuItems } from './components/Navigation.jsx';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [selectedJuz, setSelectedJuz] = useState(null); // State for selected Juz
  const [frequentItems, setFrequentItems] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('quran_settings') || '{}');
      return !!settings.darkMode;
    } catch { return false; }
  });

  const [toast, setToast] = useState({ show: false, message: '' });
  const backButtonReady = useRef(false);

  useEffect(() => {
    const registerBackButtonListener = async () => {
      const listener = await CapacitorApp.addListener('backButton', () => {
        if (selectedJuz) { // If in Juz reader, go back
          setSelectedJuz(null);
        } else if (selectedSurah) { // If in Surah reader, go back
          setSelectedSurah(null);
        } else if (currentView !== 'home') {
          setCurrentView('home');
        } else {
          if (backButtonReady.current) {
            CapacitorApp.exitApp();
          } else { /* ... toast logic ... */ }
        }
      });
      return listener;
    };
    const listenerPromise = registerBackButtonListener();
    return () => { /* ... cleanup ... */ };
  }, [currentView, selectedSurah, selectedJuz]);

  const trackUsage = (view) => { /* ... */ };
  const updateFrequentItems = () => { /* ... */ };

  useEffect(() => { updateFrequentItems(); }, []);

  const handleNavigate = (view) => {
    trackUsage(view);
    setCurrentView(view);
    setSelectedSurah(null); // Reset other selections
    setSelectedJuz(null);
  };
  
  const handleSurahClick = (surahNumber) => {
    setSelectedSurah(surahNumber);
  }
  
  const handleJuzClick = (juzNumber) => {
    setSelectedJuz(juzNumber);
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    try {
      const settings = JSON.parse(localStorage.getItem('quran_settings') || '{}');
      settings.darkMode = newDarkMode;
      localStorage.setItem('quran_settings', JSON.stringify(settings));
    } catch (e) { console.error("Failed to save dark mode setting:", e); }
  };

  const bg = darkMode ? '#1f2937' : '#f9fafb';

  const renderCurrentView = () => {
    if (selectedJuz) {
        return <JuzReader juzNumber={selectedJuz} darkMode={darkMode} onBack={() => setSelectedJuz(null)} />;
    }
    if (selectedSurah) {
        return <QuranReader surahNumber={selectedSurah} darkMode={darkMode} onBack={() => setSelectedSurah(null)} />;
    }

    switch (currentView) {
      case 'home': return <HomePage darkMode={darkMode} onNavigate={handleNavigate} />;
      case 'quran': return <SurahList onSurahClick={handleSurahClick} onJuzClick={handleJuzClick} darkMode={darkMode} />;
      case 'settings': return <Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      case 'menu': return <Navigation darkMode={darkMode} onNavigate={handleNavigate} />;
      default: return <div><h2>{currentView}</h2><p>Bu sayfa henüz hazır değil.</p></div>;
    }
  }

  const toastStyles = { /* ... */ };

  return (
    <div style={{ height: '100vh', backgroundColor: bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
        {renderCurrentView()}
      </div>
      <div style={toastStyles}>{/* ... */}</div>
      <TabBar darkMode={darkMode} onNavigate={handleNavigate} currentView={currentView} frequentItems={frequentItems} menuItems={menuItems} />
    </div>
  );
};

export default App;
