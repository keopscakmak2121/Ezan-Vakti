import React, { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import TabBar from './components/TabBar.jsx';
import HomePage from './components/home/HomePage.jsx';
import SurahList from './components/SurahList.jsx';
import QuranReader from './components/quran/QuranReader.jsx';
import JuzReader from './components/quran/JuzReader.jsx';
import Settings from './components/Settings.jsx';
import Navigation, { menuItems } from './components/Navigation.jsx';

const App = () => {
  const [viewHistory, setViewHistory] = useState(['home']);
  const currentView = viewHistory[viewHistory.length - 1];

  const [selectedSurah, setSelectedSurah] = useState(null);
  const [selectedJuz, setSelectedJuz] = useState(null);
  const [frequentItems, setFrequentItems] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('quran_settings') || '{}');
      return !!settings.darkMode;
    } catch { return false; }
  });

  const [toast, setToast] = useState({ show: false, message: '' });
  const backButtonExit = useRef(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  useEffect(() => {
    const registerBackButtonListener = async () => {
      const listener = await CapacitorApp.addListener('backButton', (e) => {
        e.preventDefault();

        if (selectedJuz) {
          setSelectedJuz(null);
        } else if (selectedSurah) {
          setSelectedSurah(null);
        } else if (viewHistory.length > 1) {
          setViewHistory(prev => prev.slice(0, -1));
        } else {
          if (backButtonExit.current) {
            CapacitorApp.exitApp();
          } else {
            backButtonExit.current = true;
            setToast({ show: true, message: 'Çıkmak için tekrar dokunun' });
            toastTimer.current = setTimeout(() => {
              backButtonExit.current = false;
              setToast({ show: false, message: '' });
            }, 2000);
          }
        }
      });
      return listener;
    };
    const listenerPromise = registerBackButtonListener();
    return () => { listenerPromise.then(l => l.remove()); };
  }, [viewHistory, selectedSurah, selectedJuz]);

  const trackUsage = (view) => { /* ... */ };
  const updateFrequentItems = () => { /* ... */ };

  useEffect(() => { updateFrequentItems(); }, []);

  const handleNavigate = (view) => {
    if (view === currentView) {
      return;
    }
  
    const newHistory = [...viewHistory];
    const existingIndex = newHistory.lastIndexOf(view);
    
    if (existingIndex > -1) {
      // If the view already exists, trim the history to prevent loops.
      setViewHistory(prev => prev.slice(0, existingIndex + 1));
    } else {
      // If it's a new view, add it to the history.
      setViewHistory(prev => [...prev, view]);
    }
  
    setSelectedSurah(null);
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

  const toastStyles = {
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '20px',
    zIndex: 1000,
    visibility: toast.show ? 'visible' : 'hidden',
    opacity: toast.show ? 1 : 0,
    transition: 'visibility 0s, opacity 0.3s linear',
  };

  return (
    <div style={{ height: '100vh', backgroundColor: bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
        {renderCurrentView()}
      </div>
      <div style={toastStyles}>{toast.message}</div>
      <TabBar darkMode={darkMode} onNavigate={handleNavigate} currentView={currentView} frequentItems={frequentItems} menuItems={menuItems} />
    </div>
  );
};

export default App;
