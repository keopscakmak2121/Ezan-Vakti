// src/App.js - SEARCH STATE DÜZELTİLDİ

import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import Header from './components/Header';
import HomePage from './components/home/HomePage';
import SurahList from './components/SurahList';
import QuranReader from './components/QuranReader';
import EsmaUlHusna from './components/EsmaUlHusna';
import Bookmarks from './components/bookmarks/Bookmarks';
import PrayerTimes from './components/PrayerTimes';
import QiblaFinder from './components/QiblaFinder';
import Search from './components/Search';
import Settings from './components/settings/Settings';
import Statistics from './components/Statistics';
import Notes from './components/Notes';
import FullScreenNotification from './components/FullScreenNotification';
import { allSurahs } from './data/surahs';
import { 
  downloadSurah, 
  deleteSurah, 
  getDownloadedSurahs,
  getTotalSize,
  formatBytes
} from './utils/audioStorage';
import { 
  initNotificationService, 
  scheduleNotifications 
} from './utils/notificationService';
import { 
  getPrayerTimesByCoordinates, 
  getUserLocation 
} from './utils/prayerTimesApi';

const App = () => {
  const [highlightWord, setHighlightWord] = useState('');
  const [scrollToAyah, setScrollToAyah] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [previousView, setPreviousView] = useState('home');
  const [darkMode, setDarkMode] = useState(() => {
  const settings = JSON.parse(localStorage.getItem('quran_settings') || '{}');
  return settings.darkMode || false;
});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [downloadedSurahs, setDownloadedSurahs] = useState({});
  const [totalStorageSize, setTotalStorageSize] = useState(0);
  
  const [navigationHistory, setNavigationHistory] = useState(['home']);

  const [showFullScreenNotification, setShowFullScreenNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);

  // ✅ SEARCH STATE - YENİ
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('turkish');

  const toggleDarkMode = () => {
  const newDarkMode = !darkMode;
  setDarkMode(newDarkMode);
  
  // localStorage'a kaydet
  const settings = JSON.parse(localStorage.getItem('quran_settings') || '{}');
  settings.darkMode = newDarkMode;
  localStorage.setItem('quran_settings', JSON.stringify(settings));
};

  const bg = darkMode ? '#1f2937' : '#f0fdf4';
  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  useEffect(() => {
    let backButtonListener;
    
    const setupBackButton = async () => {
      backButtonListener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        console.log('🔙 Geri tuşuna basıldı, mevcut view:', currentView);
        console.log('📚 Navigasyon geçmişi:', navigationHistory);

        if (showFullScreenNotification) {
          console.log('📢 Tam ekran bildirim kapatılıyor...');
          handleCloseFullScreen();
          return;
        }

        if (selectedSurah) {
          console.log('📖 Kuran okuma ekranından çıkılıyor...');
          handleBackFromQuran();
          return;
        }

        if (currentView !== 'home') {
          console.log('🏠 Ana sayfaya dönülüyor...');
          navigateBack();
          return;
        }

        console.log('❌ Uygulamadan çıkılıyor...');
        CapacitorApp.exitApp();
      });
    };

    setupBackButton();

    return () => {
      if (backButtonListener && typeof backButtonListener.remove === 'function') {
        backButtonListener.remove();
      }
    };
  }, [currentView, selectedSurah, navigationHistory, showFullScreenNotification]);

  const navigateBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      
      console.log('🔄 Geri gidiliyor:', currentView, '→', previousPage);
      
      setNavigationHistory(newHistory);
      setCurrentView(previousPage);
      setSelectedSurah(null);
    } else {
      setCurrentView('home');
      setNavigationHistory(['home']);
    }
  };

  const handleNavigate = (view) => {
    console.log('🔄 Sayfa değiştiriliyor:', currentView, '→', view);
    
    if (view === currentView) {
      return;
    }

    setNavigationHistory([...navigationHistory, view]);
    setCurrentView(view);
    
    if (view === 'home' || view === 'quran' || view === 'esma') {
      setSelectedSurah(null);
    }
  };

  useEffect(() => {
    const initNotifications = async () => {
      try {
        console.log('🚀 Bildirim servisi başlatılıyor...');
        
        const prayerTimingsProvider = async () => {
          try {
            const coords = await getUserLocation();
            const result = await getPrayerTimesByCoordinates(
              coords.latitude,
              coords.longitude
            );
            return result.success ? result.timings : null;
          } catch (error) {
            console.error('❌ Prayer timings provider hatası:', error);
            return null;
          }
        };

        const initialTimings = await prayerTimingsProvider();
        
        if (initialTimings) {
          console.log('✅ Namaz vakitleri alındı:', initialTimings);
          
          await initNotificationService(initialTimings, prayerTimingsProvider);
          console.log('✅ Bildirim servisi başarıyla başlatıldı');
          
          const { getNotificationSettings } = await import('./utils/notificationStorage');
          const settings = getNotificationSettings();
          
          if (settings.persistentNotification) {
            const { showOngoingNotification } = await import('./utils/ongoingNotification');
            await showOngoingNotification(initialTimings);
            console.log('📌 Kalıcı bildirim gösteriliyor');
          }
        } else {
          console.error('❌ İlk namaz vakitleri alınamadı');
        }
      } catch (error) {
        console.error('❌ Bildirim servisi başlatma hatası:', error);
      }
    };

    initNotifications();
    loadDownloadedSurahs();
    loadStorageSize();
  }, []);

  useEffect(() => {
    let actionListener;
    let receiveListener;

    const setupNotificationListeners = async () => {
      actionListener = await LocalNotifications.addListener(
        'notificationActionPerformed',
        (notification) => {
          console.log('📢 ACTION PERFORMED:', notification);
          handleNotificationAction(notification);
        }
      );

      receiveListener = await LocalNotifications.addListener(
        'localNotificationReceived',
        (notification) => {
          console.log('📥 NOTIFICATION RECEIVED:', notification);
          handleNotificationAction({ notification });
        }
      );
    };

    const handleNotificationAction = (data) => {
      console.log('🎯 Handling notification:', data);
      
      const extra = data.notification?.extra || data.extra;
      const notificationId = data.notification?.id || data.id;
      const actionType = data.actionId; // Gerçek tıklama mı?
      
      if (extra && extra.action === 'SHOW_FULLSCREEN') {
        console.log('📱 Tam ekran gösteriliyor:', extra);
        console.log('🆔 Bildirim ID:', notificationId);
        
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
      if (actionListener && typeof actionListener.remove === 'function') {
        actionListener.remove();
      }
      if (receiveListener && typeof receiveListener.remove === 'function') {
        receiveListener.remove();
      }
    };
  }, []);

  // ✅ KALICI BİLDİRİMİ UYGULAMA AÇILINCA YENİDEN GÖSTER
  useEffect(() => {
    let appListener;
    
    const setupAppListener = async () => {
      appListener = await CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
        console.log('📱 App state changed:', isActive);
        
        if (isActive) {
          console.log('📱 Uygulama aktif, kalıcı bildirim kontrol ediliyor...');
          
          const { getNotificationSettings } = await import('./utils/notificationStorage');
          const settings = getNotificationSettings();
          
          console.log('📱 Kalıcı bildirim ayarı:', settings.persistentNotification);
          
          if (settings.persistentNotification) {
            try {
              const coords = await getUserLocation();
              const result = await getPrayerTimesByCoordinates(coords.latitude, coords.longitude);
              if (result.success) {
                const { showOngoingNotification } = await import('./utils/ongoingNotification');
                await showOngoingNotification(result.timings);
                console.log('✅ Kalıcı bildirim yeniden gösterildi');
              }
            } catch (error) {
              console.error('❌ Kalıcı bildirim gösterme hatası:', error);
            }
          }
        }
      });
    };
    
    setupAppListener();

    return () => {
      if (appListener && typeof appListener.remove === 'function') {
        appListener.remove();
      }
    };
  }, []);

  const handleCloseFullScreen = async () => {
    if (notificationData?.notificationId) {
      try {
        await LocalNotifications.cancel({
          notifications: [{ id: notificationData.notificationId }]
        });
        console.log('🔇 Bildirim iptal edildi, ezan durdu:', notificationData.notificationId);
      } catch (error) {
        console.error('❌ Bildirim iptal hatası:', error);
      }
    }
    setShowFullScreenNotification(false);
    setNotificationData(null);
  };

  const loadDownloadedSurahs = async () => {
    const downloaded = await getDownloadedSurahs();
    setDownloadedSurahs(downloaded);
  };

  const loadStorageSize = async () => {
    const size = await getTotalSize();
    setTotalStorageSize(size);
  };

  const filteredSurahs = allSurahs.filter(surah =>
    surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.nameArabic.includes(searchTerm) ||
    surah.number.toString().includes(searchTerm)
  );

  const handleDownload = async (surah, onProgress) => {
    try {
      await downloadSurah(surah.number, surah.ayahCount, onProgress);
      await loadDownloadedSurahs();
      await loadStorageSize();
      alert(`${surah.name} suresi başarıyla indirildi!`);
    } catch (error) {
      console.error('İndirme hatası:', error);
      alert('İndirme sırasında bir hata oluştu.');
    }
  };

  const handleDelete = async (surah) => {
    try {
      await deleteSurah(surah.number, surah.ayahCount);
      await loadDownloadedSurahs();
      await loadStorageSize();
      alert(`${surah.name} suresi silindi.`);
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme sırasında bir hata oluştu.');
    }
  };

  const getDownloadedSurahsList = () => {
    return allSurahs.filter(surah => downloadedSurahs[surah.number]);
  };

  const handleAyahClick = (surahNumber, ayahNumber, fromView) => {
    const surah = allSurahs.find(s => s.number === surahNumber);
    if (surah) {
      setPreviousView(fromView);
      setSelectedSurah(surah);
      
      setNavigationHistory([...navigationHistory, 'quran']);
      setCurrentView('quran');
    }
  };

  const handleBackFromQuran = () => {
    setSelectedSurah(null);
    setCurrentView(previousView);
    setHighlightWord('');
    setScrollToAyah(null);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, fontFamily: 'Arial, sans-serif' }}>
      <Header 
        onNavigate={handleNavigate}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '20px'
      }}>
        {currentView === 'home' && (
          <HomePage 
            darkMode={darkMode}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'quran' && (
          <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
            {selectedSurah ? (
              <QuranReader 
                surah={selectedSurah}
                darkMode={darkMode}
                onBack={handleBackFromQuran}
                highlightWord={highlightWord}
                scrollToAyah={scrollToAyah}
              />
            ) : (
              <SurahList 
                surahs={filteredSurahs}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                darkMode={darkMode}
                downloadedSurahs={downloadedSurahs}
                onSurahClick={(surah) => {
                  setPreviousView('quran');
                  setSelectedSurah(surah);
                  setHighlightWord('');
                  setScrollToAyah(null);
                }}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {currentView === 'esma' && (
          <EsmaUlHusna darkMode={darkMode} />
        )}

        {currentView === 'search' && (
          <Search 
            darkMode={darkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            searchType={searchType}
            setSearchType={setSearchType}
            onAyahClick={(surahNumber, ayahNumber, searchWord) => {
              setHighlightWord(searchWord);
              setScrollToAyah(ayahNumber);
              handleAyahClick(surahNumber, ayahNumber, 'search');
            }}
          />
        )}

        {currentView === 'bookmarks' && (
          <Bookmarks 
            darkMode={darkMode}
            onAyahClick={(surahNumber, ayahNumber) => 
              handleAyahClick(surahNumber, ayahNumber, 'bookmarks', '')
            }
          />
        )}

        {currentView === 'downloads' && (
          <div style={{
            backgroundColor: cardBg,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px 0', color: text }}>
              İndirilen Sureler
            </h2>
            
            <div style={{
              padding: '15px',
              backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '16px', color: text, marginBottom: '5px' }}>
                <strong>Toplam:</strong> {getDownloadedSurahsList().length} Sure
              </div>
              <div style={{ fontSize: '16px', color: text }}>
                <strong>Disk Kullanımı:</strong> {formatBytes(totalStorageSize)}
              </div>
            </div>

            {getDownloadedSurahsList().length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: darkMode ? '#9ca3af' : '#6b7280' 
              }}>
                Henüz indirilmiş sure yok
              </div>
            ) : (
              <SurahList 
                surahs={getDownloadedSurahsList()}
                searchTerm=""
                setSearchTerm={() => {}}
                darkMode={darkMode}
                downloadedSurahs={downloadedSurahs}
                onSurahClick={(surah) => {
                  setPreviousView('downloads');
                  setSelectedSurah(surah);
                  setNavigationHistory([...navigationHistory, 'quran']);
                  setCurrentView('quran');
                }}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {currentView === 'prayerTimes' && (
          <PrayerTimes darkMode={darkMode} />
        )}

        {currentView === 'qibla' && (
          <QiblaFinder darkMode={darkMode} />
        )}

        {currentView === 'notes' && (
          <Notes 
            darkMode={darkMode}
            onAyahClick={(surahNumber, ayahNumber) => 
              handleAyahClick(surahNumber, ayahNumber, 'notes', '')
            }
          />
        )}

        {currentView === 'settings' && (
          <Settings darkMode={darkMode} onDarkModeToggle={toggleDarkMode} />
        )}

        {currentView === 'stats' && (
          <Statistics darkMode={darkMode} />
        )}
      </div>

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