import React, { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import TabBar from './components/TabBar.jsx';
import HomePage from './components/home/HomePage.jsx';
import SurahList from './components/SurahList.jsx';
import QuranReader from './components/QuranReader.jsx';
import Settings from './components/Settings.jsx';
import Navigation, { menuItems } from './components/Navigation.jsx';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedSurah, setSelectedSurah] = useState(null);
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
        if (selectedSurah) { // If in reader, go back to list
          setSelectedSurah(null);
        } else if (currentView !== 'home') {
          setCurrentView('home');
        } else {
          if (backButtonReady.current) {
            CapacitorApp.exitApp();
          } else {
            backButtonReady.current = true;
            setToast({ show: true, message: 'Çıkmak için tekrar basın' });
            setTimeout(() => {
              setToast({ show: false, message: '' });
              backButtonReady.current = false;
            }, 2000);
          }
        }
      });
      return listener;
    };
    const listenerPromise = registerBackButtonListener();
    return () => {
      const unregister = async () => {
        const listener = await listenerPromise;
        listener.remove();
      };
      unregister();
    };
  }, [currentView, selectedSurah]);

  const trackUsage = (view) => {
    try {
      const stats = JSON.parse(localStorage.getItem('navigation_stats') || '{}');
      stats[view] = (stats[view] || 0) + 1;
      localStorage.setItem('navigation_stats', JSON.stringify(stats));
      updateFrequentItems();
    } catch (e) { console.error("Failed to track usage:", e); }
  };

  const updateFrequentItems = () => {
    try {
      const stats = JSON.parse(localStorage.getItem('navigation_stats') || '{}');
      const sortedItems = Object.keys(stats)
        .filter(id => id !== 'home' && id !== 'menu')
        .sort((a, b) => stats[b] - stats[a]);
      setFrequentItems(sortedItems.slice(0, 3));
    } catch (e) { console.error("Failed to update frequent items:", e); }
  };

  useEffect(() => {
    updateFrequentItems();
  }, []);

  const handleNavigate = (view) => {
    trackUsage(view);
    setCurrentView(view);
    if (view !== 'quran') {
      setSelectedSurah(null);
    }
  };
  
  const handleSurahClick = (surahNumber) => {
    setSelectedSurah(surahNumber);
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
  };

  const bg = darkMode ? '#1f2937' : '#f9fafb';

  const renderCurrentView = () => {
    if (selectedSurah) {
        return <QuranReader surahNumber={selectedSurah} darkMode={darkMode} onBack={() => setSelectedSurah(null)} />;
    }

    switch (currentView) {
      case 'home':
        return <HomePage darkMode={darkMode} onNavigate={handleNavigate} />;
      case 'quran':
        return <SurahList onSurahClick={handleSurahClick} darkMode={darkMode} />;
      case 'settings':
        return <Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      case 'menu':
        return <Navigation darkMode={darkMode} onNavigate={handleNavigate} />;
      default:
        return (
          <div style={{textAlign: 'center', paddingTop: '50px', color: darkMode ? 'white' : 'black'}}>
            <h2>{currentView}</h2>
            <p>Bu sayfa henüz hazır değil.</p>
          </div>
        );
    }
  }

  const toastStyles = {
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '20px',
    zIndex: 200,
    transition: 'opacity 0.3s',
    opacity: toast.show ? 1 : 0,
    pointerEvents: toast.show ? 'auto' : 'none',
  };

  return (
    <div style={{ height: '100vh', backgroundColor: bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
        {renderCurrentView()}
      </div>
      
      <div style={toastStyles}>
        {toast.message}
      </div>

      <TabBar 
        darkMode={darkMode} 
        onNavigate={handleNavigate} 
        currentView={currentView} 
        frequentItems={frequentItems}
        menuItems={menuItems}
      />
    </div>
  );
};

export default App;
