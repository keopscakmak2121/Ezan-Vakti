// src/App.jsx - Çift tetiklenme koruması eklendi

import React, { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import TabBar from './components/TabBar.jsx';
import HomePage from './components/home/HomePage.jsx';
import SurahList from './components/SurahList.jsx';
import QuranReader from './components/quran/QuranReader.jsx';
import QuranSearch from './components/quran/QuranSearch.jsx';
import JuzReader from './components/quran/JuzReader.jsx';
import Settings from './components/Settings.jsx';
import Navigation, { menuItems } from './components/Navigation.jsx';
import EsmaUlHusna from './components/EsmaUlHusna.jsx';
import PrayerTimes from './components/PrayerTimes.jsx';
import QiblaFinder from './components/QiblaFinder.jsx';
import BookmarksPage from './components/BookmarksPage.jsx';
import NotesPage from './components/NotesPage.jsx';
import StatisticsPage from './components/StatisticsPage.jsx';
import Downloads from './components/Downloads.jsx';
import { initNotificationService } from './utils/notificationService.js';
import { getPrayerTimesByCoordinates, getUserLocation, getCityFromCoordinates } from './utils/prayerTimesApi.js';
import { getStoredPrayerTimes, storePrayerTimes } from './utils/storage.js';

const App = () => {
  const [viewHistory, setViewHistory] = useState(['home']);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [selectedJuz, setSelectedJuz] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [toast, setToast] = useState({ show: false, message: '' });

  const currentView = viewHistory[viewHistory.length - 1];
  const backButtonExit = useRef(false);
  const initialized = useRef(false);

  const stateRef = useRef({ viewHistory, selectedSurah, selectedJuz });
  useEffect(() => {
    stateRef.current = { viewHistory, selectedSurah, selectedJuz };
  }, [viewHistory, selectedSurah, selectedJuz]);

  // Dark mode kaydet
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const setupBackButton = async () => {
      const listener = await CapacitorApp.addListener('backButton', () => {
        const { viewHistory, selectedSurah, selectedJuz } = stateRef.current;
        if (selectedJuz) { setSelectedJuz(null); return; }
        if (selectedSurah) { setSelectedSurah(null); return; }
        if (viewHistory.length > 1) { setViewHistory(prev => prev.slice(0, -1)); return; }

        if (backButtonExit.current) {
          CapacitorApp.exitApp();
        } else {
          backButtonExit.current = true;
          setToast({ show: true, message: 'Çıkmak için tekrar basın' });
          setTimeout(() => { backButtonExit.current = false; setToast({ show: false, message: '' }); }, 2000);
        }
      });
      return listener;
    };
    
    // Arama event listener
    const handleSearchNavigation = () => {
      handleNavigate('quranSearch');
    };
    window.addEventListener('navigateToQuranSearch', handleSearchNavigation);
    
    const l = setupBackButton();
    return () => { 
      l.then(res => res.remove()); 
      window.removeEventListener('navigateToQuranSearch', handleSearchNavigation);
    };
  }, []);

  useEffect(() => {
    // SADECE BİR KEZ ÇALIŞTIR
    if (initialized.current) return;
    initialized.current = true;

    const initApp = async () => {
      let isFirstRun = true;
      try {
        const stored = getStoredPrayerTimes();
        if (stored) {
          isFirstRun = false;
          initNotificationService(stored.timings);
        }

        const coords = await getUserLocation();

        if (coords) {
          const res = await getPrayerTimesByCoordinates(coords.latitude, coords.longitude);
          if (res?.success) {
            const cityName = await getCityFromCoordinates(coords.latitude, coords.longitude);
            storePrayerTimes(res.timings, cityName);
            initNotificationService(res.timings);
          }
        } else if (isFirstRun) {
          // Eğer konum alınamadıysa ama zaten hafızada veri varsa (isFirstRun=false), kullanıcıyı rahatsız etme.
        }
      } catch (e) {
        console.error("Init hatası:", e);
        if (isFirstRun) {
          setToast({ show: true, message: 'Konum izni verilmedi veya vakitler alınamadı.' });
          setTimeout(() => setToast({ show: false, message: '' }), 4000);
        }
      }
    };
    initApp();
  }, []);

  const handleNavigate = (view) => {
    if (view === currentView) return;
    if (view === 'home') setViewHistory(['home']);
    else setViewHistory(prev => [...prev, view]);
    setSelectedSurah(null);
    setSelectedJuz(null);
  };

  const renderCurrentView = () => {
    if (selectedJuz) return <JuzReader juzNumber={selectedJuz} darkMode={darkMode} onBack={() => setSelectedJuz(null)} />;
    if (selectedSurah) return <QuranReader surahNumber={selectedSurah?.number || selectedSurah} darkMode={darkMode} onBack={() => setSelectedSurah(null)} />;

    switch (currentView) {
      case 'home': return <HomePage darkMode={darkMode} onNavigate={handleNavigate} />;
      case 'quran': return <SurahList onSurahClick={setSelectedSurah} onJuzClick={setSelectedJuz} darkMode={darkMode} />;
      case 'search': 
      case 'quranSearch': 
        return <QuranSearch darkMode={darkMode} onNavigateToAyah={(s, a) => setSelectedSurah(s)} onBack={() => handleNavigate('quran')} />;
      case 'bookmarks': 
        return <BookmarksPage darkMode={darkMode} onNavigateToAyah={(s) => setSelectedSurah(s)} />;
      case 'notes': 
        return <NotesPage darkMode={darkMode} onNavigateToAyah={(s) => setSelectedSurah(s)} />;
      case 'downloads':
        return <Downloads darkMode={darkMode} onSurahClick={setSelectedSurah} />;
      case 'stats': 
        return <StatisticsPage darkMode={darkMode} />;
      case 'prayerTimes': return <PrayerTimes darkMode={darkMode} />;
      case 'qibla': return <QiblaFinder darkMode={darkMode} />;
      case 'settings': return <Settings darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />;
      case 'menu': return <Navigation darkMode={darkMode} onNavigate={handleNavigate} />;
      case 'esma': return <EsmaUlHusna darkMode={darkMode} />;
      default: return <HomePage darkMode={darkMode} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: darkMode ? '#111827' : '#f9fafb', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
        {renderCurrentView()}
      </div>
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.85)', color: '#fff', padding: '12px 24px', borderRadius: '25px', zIndex: 99999, fontSize: '14px' }}>
          {toast.message}
        </div>
      )}
      <TabBar darkMode={darkMode} onNavigate={handleNavigate} currentView={currentView} frequentItems={['quran', 'prayerTimes', 'qibla', 'esma']} menuItems={menuItems || []} />
    </div>
  );
};

export default App;
