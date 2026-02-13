// src/App.jsx - BİRLEŞTİRİLMİŞ VERSİYON

import React, { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import TabBar from './components/TabBar.jsx';
import HomePage from './components/home/HomePage.jsx';
import SurahList from './components/SurahList.jsx';
import QuranReader from './components/quran/QuranReader.jsx';
import JuzReader from './components/quran/JuzReader.jsx';
import Settings from './components/settings/Settings.jsx';
import Navigation, { menuItems } from './components/Navigation.jsx';
import EsmaUlHusna from './components/EsmaUlHusna.jsx';
import Search from './components/Search.jsx';
import Bookmarks from './components/bookmarks/Bookmarks.jsx';
import Notes from './components/Notes.jsx';
import Downloads from './components/Downloads.jsx';
import PrayerTimes from './components/PrayerTimes.jsx';
import QiblaFinder from './components/QiblaFinder.jsx';
import Statistics from './components/Statistics.jsx';
import FullScreenNotification from './components/FullScreenNotification.jsx';
import {
  initNotificationService
} from './utils/notificationService.js';
import {
  getPrayerTimesByCoordinates,
  getUserLocation
} from './utils/prayerTimesApi.js';

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

  // Search state (Downloads versiyonundan)
  const [highlightWord, setHighlightWord] = useState('');
  const [scrollToAyah, setScrollToAyah] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('turkish');

  // Notification state (Downloads versiyonundan)
  const [showFullScreenNotification, setShowFullScreenNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '' });
  const backButtonExit = useRef(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  // Back button - useRef ile stale closure önleme
  const viewHistoryRef = useRef(viewHistory);
  const selectedSurahRef = useRef(selectedSurah);
  const selectedJuzRef = useRef(selectedJuz);
  const showFullScreenRef = useRef(showFullScreenNotification);

  useEffect(() => { viewHistoryRef.current = viewHistory; }, [viewHistory]);
  useEffect(() => { selectedSurahRef.current = selectedSurah; }, [selectedSurah]);
  useEffect(() => { selectedJuzRef.current = selectedJuz; }, [selectedJuz]);
  useEffect(() => { showFullScreenRef.current = showFullScreenNotification; }, [showFullScreenNotification]);

  useEffect(() => {
    const registerBackButtonListener = async () => {
      const listener = await CapacitorApp.addListener('backButton', (e) => {
        e.preventDefault();

        // Tam ekran bildirim açıksa kapat
        if (showFullScreenRef.current) {
          handleCloseFullScreen();
          return;
        }

        if (selectedJuzRef.current) {
          setSelectedJuz(null);
        } else if (selectedSurahRef.current) {
          setSelectedSurah(null);
          setHighlightWord('');
          setScrollToAyah(null);
        } else if (viewHistoryRef.current.length > 1) {
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
  }, []);

  // Bildirim servisi başlatma (Downloads versiyonundan)
  useEffect(() => {
    const initNotifications = async () => {
      try {
        const prayerTimingsProvider = async () => {
          try {
            const coords = await getUserLocation();
            const result = await getPrayerTimesByCoordinates(coords.latitude, coords.longitude);
            return result.success ? result.timings : null;
          } catch (error) {
            console.error('Prayer timings provider hatası:', error);
            return null;
          }
        };

        const initialTimings = await prayerTimingsProvider();

        if (initialTimings) {
          await initNotificationService(initialTimings, prayerTimingsProvider);

          const { getNotificationSettings } = await import('./utils/notificationStorage.js');
          const settings = getNotificationSettings();

          if (settings.persistentNotification) {
            const { showOngoingNotification } = await import('./utils/ongoingNotification.js');
            await showOngoingNotification(initialTimings);
          }
        }
      } catch (error) {
        console.error('Bildirim servisi başlatma hatası:', error);
      }
    };

    initNotifications();
  }, []);

  // Bildirim listener'ları (Downloads versiyonundan)
  useEffect(() => {
    let actionListener;
    let receiveListener;

    const setupNotificationListeners = async () => {
      actionListener = await LocalNotifications.addListener(
        'notificationActionPerformed',
        (notification) => {
          handleNotificationAction(notification);
        }
      );

      receiveListener = await LocalNotifications.addListener(
        'localNotificationReceived',
        (notification) => {
          handleNotificationAction({ notification });
        }
      );
    };

    const handleNotificationAction = (data) => {
      const extra = data.notification?.extra || data.extra;
      const notificationId = data.notification?.id || data.id;

      if (extra && extra.action === 'SHOW_FULLSCREEN') {
        setNotificationData({
          prayerName: extra.prayerName,
          prayerTime: extra.prayerTime,
          notificationId: notificationId
        });
        setShowFullScreenNotification(true);
      }
    };

    setupNotificationListeners();

    return () => {
      if (actionListener && typeof actionListener.remove === 'function') actionListener.remove();
      if (receiveListener && typeof receiveListener.remove === 'function') receiveListener.remove();
    };
  }, []);

  // Uygulama aktif olunca kalıcı bildirimi yenile (Downloads versiyonundan)
  useEffect(() => {
    let appListener;

    const setupAppListener = async () => {
      appListener = await CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
        if (isActive) {
          const { getNotificationSettings } = await import('./utils/notificationStorage.js');
          const settings = getNotificationSettings();

          if (settings.persistentNotification) {
            try {
              const coords = await getUserLocation();
              const result = await getPrayerTimesByCoordinates(coords.latitude, coords.longitude);
              if (result.success) {
                const { showOngoingNotification } = await import('./utils/ongoingNotification.js');
                await showOngoingNotification(result.timings);
              }
            } catch (error) {
              console.error('Kalıcı bildirim gösterme hatası:', error);
            }
          }
        }
      });
    };

    setupAppListener();
    return () => {
      if (appListener && typeof appListener.remove === 'function') appListener.remove();
    };
  }, []);

  const handleCloseFullScreen = async () => {
    if (notificationData?.notificationId) {
      try {
        await LocalNotifications.cancel({
          notifications: [{ id: notificationData.notificationId }]
        });
      } catch (error) {
        console.error('Bildirim iptal hatası:', error);
      }
    }
    setShowFullScreenNotification(false);
    setNotificationData(null);
  };

  // Sık kullanılanlar takibi
  const trackUsage = (view) => {
    try {
      const usage = JSON.parse(localStorage.getItem('menu_usage') || '{}');
      usage[view] = (usage[view] || 0) + 1;
      localStorage.setItem('menu_usage', JSON.stringify(usage));
      updateFrequentItems();
    } catch (e) { console.error('Usage tracking failed:', e); }
  };

  const updateFrequentItems = () => {
    try {
      const usage = JSON.parse(localStorage.getItem('menu_usage') || '{}');
      const sorted = Object.entries(usage)
        .filter(([key]) => key !== 'home' && key !== 'menu' && key !== 'settings')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([key]) => key);

      if (sorted.length === 0) {
        setFrequentItems(['quran', 'prayerTimes', 'qibla', 'esma']);
      } else {
        setFrequentItems(sorted);
      }
    } catch (e) {
      setFrequentItems(['quran', 'prayerTimes', 'qibla', 'esma']);
    }
  };

  useEffect(() => { updateFrequentItems(); }, []);

  const handleNavigate = (view) => {
    if (view === currentView) return;

    trackUsage(view);

    if (view === 'home') {
      setViewHistory(['home']);
    } else {
      setViewHistory(prev => [...prev, view]);
    }

    setSelectedSurah(null);
    setSelectedJuz(null);
    setHighlightWord('');
    setScrollToAyah(null);
  };

  const handleSurahClick = (surahNumber) => {
    setSelectedSurah(surahNumber);
  };

  const handleJuzClick = (juzNumber) => {
    setSelectedJuz(juzNumber);
  };

  const handleAyahClick = (surahNumber, ayahNumber, searchWord) => {
    setHighlightWord(searchWord || '');
    setScrollToAyah(ayahNumber);
    setSelectedSurah(surahNumber);
    if (currentView !== 'quran') {
      setViewHistory(prev => [...prev, 'quran']);
    }
  };

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
      return <QuranReader
        surahNumber={selectedSurah}
        darkMode={darkMode}
        onBack={() => { setSelectedSurah(null); setHighlightWord(''); setScrollToAyah(null); }}
        highlightWord={highlightWord}
        scrollToAyah={scrollToAyah}
      />;
    }

    switch (currentView) {
      case 'home': return <HomePage darkMode={darkMode} onNavigate={handleNavigate} />;
      case 'quran': return <SurahList onSurahClick={handleSurahClick} onJuzClick={handleJuzClick} darkMode={darkMode} />;
      case 'esma': return <EsmaUlHusna darkMode={darkMode} />;
      case 'search': return <Search
        darkMode={darkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        searchType={searchType}
        setSearchType={setSearchType}
        onAyahClick={(surahNumber, ayahNumber, searchWord) => {
          handleAyahClick(surahNumber, ayahNumber, searchWord);
        }}
      />;
      case 'bookmarks': return <Bookmarks
        darkMode={darkMode}
        onAyahClick={(surahNumber, ayahNumber) => handleAyahClick(surahNumber, ayahNumber, '')}
      />;
      case 'notes': return <Notes
        darkMode={darkMode}
        onAyahClick={(surahNumber, ayahNumber) => handleAyahClick(surahNumber, ayahNumber, '')}
      />;
      case 'downloads': return <Downloads darkMode={darkMode} />;
      case 'prayerTimes': return <PrayerTimes darkMode={darkMode} />;
      case 'qibla': return <QiblaFinder darkMode={darkMode} />;
      case 'stats': return <Statistics darkMode={darkMode} />;
      case 'settings': return <Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      case 'menu': return <Navigation darkMode={darkMode} onNavigate={handleNavigate} />;
      default: return <div><h2>{currentView}</h2><p>Bu sayfa henüz hazır değil.</p></div>;
    }
  };

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

      {showFullScreenNotification && notificationData && (
        <FullScreenNotification
          prayerName={notificationData.prayerName}
          prayerTime={notificationData.prayerTime}
          darkMode={darkMode}
          onClose={handleCloseFullScreen}
        />
      )}
    </div>
  );
};

export default App;
