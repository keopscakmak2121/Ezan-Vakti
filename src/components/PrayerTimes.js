// src/components/PrayerTimes.js - WIDGET GÜNCELLEMESI EKLENDI

import React, { useState, useEffect } from 'react';
import {
  getPrayerTimesByCoordinates,
  getWeeklyPrayerTimes,
  getUserLocation,
  turkishCities,
  getNextPrayer,
  isPrayerTimePassed
} from '../utils/prayerTimesApi';
import {
  initNotificationService,
  checkAndRefreshNotifications
} from '../utils/notificationService';
import { updatePrayerWidget } from '../utils/widgetBridge';
import { 
  showOngoingNotification, 
  hideOngoingNotification 
} from '../utils/ongoingNotification';
import { getNotificationSettings } from '../utils/notificationStorage';

const PrayerTimes = ({ darkMode }) => {
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [useGPS, setUseGPS] = useState(true);
  const [viewMode, setViewMode] = useState('today');
  const [weeklyTimings, setWeeklyTimings] = useState([]);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [showPrayerAlert, setShowPrayerAlert] = useState(false);
  const [currentPrayerAlert, setCurrentPrayerAlert] = useState(null);

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  const prayerDuas = {
    'Fajr': 'Allahümme bârik lenâ fî sehârinâ',
    'Dhuhr': 'Allahümme innî es\'elüke hayre hâzâ-l yevmi',
    'Asr': 'Allahümme innî a\'ûzü bike min şerri mâ ba\'de-l asri',
    'Maghrib': 'Allahümme hâze ikbâlü leylike ve idbârü nehârike',
    'Isha': 'Allahümme bike emsaynâ ve bike nümsi'
  };

  const prayerVerses = {
    'Fajr': 'Sabah namazını kıl. Çünkü sabah namazı şahitlidir. (İsra 78)',
    'Dhuhr': 'Güneş tepe noktasından kayıncaya kadar namazını kıl. (İsra 78)',
    'Asr': 'Namazlarınızı ve orta namazı muhafaza edin. (Bakara 238)',
    'Maghrib': 'Gecenin karanlığına kadar namazı dosdoğru kıl. (İsra 78)',
    'Isha': 'Yatsı namazı kılanlar için ne büyük ecir vardır.'
  };

  useEffect(() => {
    loadPrayerTimes();
    
    const interval = setInterval(() => {
      if (timings) {
        const next = getNextPrayer(timings);
        setNextPrayer(next);
        checkPrayerTime();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timings) setNextPrayer(getNextPrayer(timings));
  }, [timings]);

  const checkPrayerTime = () => {
    if (!timings) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    prayers.forEach(prayerKey => {
      if (timings[prayerKey] === currentTime) {
        const prayerName = getPrayerName(prayerKey);
        setCurrentPrayerAlert({
          name: prayerName,
          key: prayerKey,
          time: currentTime,
          dua: prayerDuas[prayerKey],
          verse: prayerVerses[prayerKey]
        });
        setShowPrayerAlert(true);
      }
    });
  };

  const getPrayerName = (key) => {
    const names = {
      'Fajr': 'İmsak',
      'Dhuhr': 'Öğle',
      'Asr': 'İkindi',
      'Maghrib': 'Akşam',
      'Isha': 'Yatsı'
    };
    return names[key] || key;
  };

  const getPrayerTimingsProvider = async () => {
    try {
      if (useGPS) {
        const coords = await getUserLocation();
        const result = await getPrayerTimesByCoordinates(coords.latitude, coords.longitude);
        return result.success ? result.timings : null;
      } else if (selectedCity) {
        const city = turkishCities.find(c => c.name === selectedCity);
        if (city) {
          const result = await getPrayerTimesByCoordinates(city.latitude, city.longitude);
          return result.success ? result.timings : null;
        }
      }
    } catch (err) {
      console.error('Prayer timings provider error:', err);
    }
    return null;
  };

  const loadPrayerTimes = async () => {
    setLoading(true);
    setError(null);

    try {
      if (useGPS) {
        const coords = await getUserLocation();
        setLocation(coords);
        const result = await getPrayerTimesByCoordinates(coords.latitude, coords.longitude);
        if (result.success) {
          setTimings(result.timings);
          await initNotificationService(result.timings, getPrayerTimingsProvider);
          
          // ✅ Widget'ı güncelle
          await updatePrayerWidget(result.timings);
          
          console.log('✅ Bildirimler ve widget ayarlandı!');
        } else {
          throw new Error(result.error);
        }
      } else {
        if (!selectedCity) {
          setError('Lütfen bir şehir seçin');
          setLoading(false);
          return;
        }

        const city = turkishCities.find(c => c.name === selectedCity);
        if (city) {
          const result = await getPrayerTimesByCoordinates(city.latitude, city.longitude);
          if (result.success) {
            setTimings(result.timings);
            setLocation({ latitude: city.latitude, longitude: city.longitude });
            await initNotificationService(result.timings, getPrayerTimingsProvider);
            
            // ✅ Widget'ı güncelle
            await updatePrayerWidget(result.timings);
            
            console.log('✅ Bildirimler ve widget ayarlandı!');
          } else {
            throw new Error(result.error);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyTimes = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const result = await getWeeklyPrayerTimes(location.latitude, location.longitude);
      if (result.success) setWeeklyTimings(result.weekly);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'weekly' && location) loadWeeklyTimes();
  }, [viewMode, location]);

  const prayerNames = [
    { key: 'Fajr', name: 'İmsak', icon: '🌙' },
    { key: 'Sunrise', name: 'Güneş', icon: '🌅' },
    { key: 'Dhuhr', name: 'Öğle', icon: '☀️' },
    { key: 'Asr', name: 'İkindi', icon: '🌤️' },
    { key: 'Maghrib', name: 'Akşam', icon: '🌆' },
    { key: 'Isha', name: 'Yatsı', icon: '🌃' }
  ];

  return (
    <>
      {showPrayerAlert && currentPrayerAlert && (() => {
        const colors = {
          'Fajr': { bg: '#1a1f3a', accent: '#4a5578' },
          'Dhuhr': { bg: '#2c3e50', accent: '#5a7a94' },
          'Asr': { bg: '#34495e', accent: '#7f8c8d' },
          'Maghrib': { bg: '#2d3436', accent: '#636e72' },
          'Isha': { bg: '#0f1419', accent: '#374151' }
        };
        
        const currentColor = colors[currentPrayerAlert.key] || { bg: '#1a1f3a', accent: '#4a5578' };

        return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: currentColor.bg,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.4s ease-in',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 20% 50%, ${currentColor.accent}15 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, ${currentColor.accent}10 0%, transparent 50%)`,
            opacity: 0.6
          }} />

          <div style={{
            textAlign: 'center',
            color: '#ffffff',
            padding: '50px 40px',
            maxWidth: '480px',
            position: 'relative',
            zIndex: 1,
            animation: 'slideUp 0.5s ease-out'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 40px',
              background: `linear-gradient(135deg, ${currentColor.accent}40, ${currentColor.accent}60)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'float 3s ease-in-out infinite',
              boxShadow: `0 10px 40px ${currentColor.accent}30`
            }}>
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8H21L16 12L18 18L12 14L6 18L8 12L3 8H9L12 2Z" fill="white" opacity="0.9"/>
                <circle cx="12" cy="20" r="1.5" fill="white" opacity="0.9"/>
              </svg>
            </div>

            <h1 style={{
              fontSize: '52px',
              fontWeight: '300',
              marginBottom: '12px',
              letterSpacing: '1px',
              color: '#ffffff'
            }}>
              {currentPrayerAlert.name}
            </h1>

            <div style={{
              fontSize: '18px',
              fontWeight: '400',
              marginBottom: '30px',
              opacity: 0.7,
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}>
              VAKTİ
            </div>

            <div style={{
              fontSize: '56px',
              fontWeight: '200',
              marginBottom: '50px',
              letterSpacing: '2px',
              fontFamily: 'monospace'
            }}>
              {currentPrayerAlert.time}
            </div>

            <div style={{
              fontSize: '15px',
              lineHeight: '1.8',
              marginBottom: '25px',
              padding: '25px 30px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: '16px',
              borderLeft: '3px solid rgba(255,255,255,0.3)',
              textAlign: 'left',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.95)'
            }}>
              {currentPrayerAlert.verse}
            </div>

            <div style={{
              fontSize: '13px',
              marginBottom: '50px',
              opacity: 0.6,
              padding: '18px 25px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              letterSpacing: '0.5px',
              color: 'rgba(255,255,255,0.9)'
            }}>
              {currentPrayerAlert.dua}
            </div>

            <button
              onClick={() => setShowPrayerAlert(false)}
              style={{
                padding: '16px 60px',
                fontSize: '15px',
                fontWeight: '500',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.25)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.15)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Tamam
            </button>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(30px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </div>
        );
      })()}

      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 20px 0', color: text }}>Namaz Vakitleri</h2>

        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button
              onClick={() => { setUseGPS(true); setError(null); }}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: useGPS ? '#059669' : (darkMode ? '#6b7280' : '#d1d5db'),
                color: useGPS ? 'white' : text,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📍 Konumumu Kullan
            </button>
            
            <button
              onClick={() => { setUseGPS(false); setError(null); }}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: !useGPS ? '#059669' : (darkMode ? '#6b7280' : '#d1d5db'),
                color: !useGPS ? 'white' : text,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🏙️ Şehir Seç
            </button>
          </div>

          {!useGPS && (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
                borderRadius: '6px',
                backgroundColor: darkMode ? '#374151' : 'white',
                color: text,
                fontSize: '14px',
                marginBottom: '10px'
              }}
            >
              <option value="">Şehir seçin...</option>
              {turkishCities.map((city) => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={loadPrayerTimes}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? (darkMode ? '#6b7280' : '#d1d5db') : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {loading ? 'Yükleniyor...' : 'Vakitleri Getir'}
          </button>
        </div>

        {error && (
          <div style={{
            padding: '15px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {nextPrayer && timings && (
          <div style={{
            padding: '20px',
            backgroundColor: '#059669',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>
              {nextPrayer.tomorrow ? 'Yarın' : 'Bir Sonraki Vakit'}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {nextPrayer.time}
            </div>
            <div style={{ fontSize: '18px' }}>{nextPrayer.name}</div>
          </div>
        )}

        {timings && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => setViewMode('today')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: viewMode === 'today' ? '#059669' : (darkMode ? '#6b7280' : '#d1d5db'),
                color: viewMode === 'today' ? 'white' : text,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📅 Bugün
            </button>
            
            <button
              onClick={() => setViewMode('weekly')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: viewMode === 'weekly' ? '#059669' : (darkMode ? '#6b7280' : '#d1d5db'),
                color: viewMode === 'weekly' ? 'white' : text,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📆 Haftalık
            </button>
          </div>
        )}

        {viewMode === 'today' && timings && (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
            {prayerNames.map((prayer) => {
              const time = timings[prayer.key];
              const passed = isPrayerTimePassed(time);

              return (
                <div
                  key={prayer.key}
                  style={{
                    minWidth: '110px',
                    flex: '0 0 auto',
                    padding: '12px',
                    backgroundColor: passed ? (darkMode ? '#374151' : '#e5e7eb') : (darkMode ? '#4b5563' : '#f9fafb'),
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: passed ? 0.6 : 1,
                    border: passed ? `2px solid ${darkMode ? '#6b7280' : '#d1d5db'}` : '2px solid transparent'
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>{prayer.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: text, marginBottom: '4px', textAlign: 'center' }}>
                    {prayer.name}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: text }}>{time}</div>
                  {passed && (
                    <div style={{ fontSize: '10px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '2px' }}>
                      Geçti
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'weekly' && weeklyTimings.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: darkMode ? '#4b5563' : '#f3f4f6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: text }}>Gün</th>
                  {prayerNames.slice(0, 5).map((prayer) => (
                    <th key={prayer.key} style={{ padding: '12px', textAlign: 'center', color: text }}>
                      {prayer.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklyTimings.map((day, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: `1px solid ${darkMode ? '#6b7280' : '#e5e7eb'}`,
                      backgroundColor: index === 0 ? (darkMode ? '#374151' : '#f9fafb') : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px', fontWeight: index === 0 ? 'bold' : 'normal', color: text }}>
                      {day.dayName}{index === 0 && ' (Bugün)'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: text }}>{day.timings.Fajr}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: text }}>{day.timings.Dhuhr}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: text }}>{day.timings.Asr}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: text }}>{day.timings.Maghrib}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: text }}>{day.timings.Isha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !timings && !error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🕌</div>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>Namaz vakitlerini görmek için</div>
            <div style={{ fontSize: '14px' }}>Konumunuzu paylaşın veya şehir seçin</div>
          </div>
        )}
      </div>
    </>
  );
};

export default PrayerTimes;