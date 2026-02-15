// src/components/PrayerTimes.jsx - Gereksiz GPS kullanımı engellendi

import React, { useState, useEffect } from 'react';
import {
  getPrayerTimesByCoordinates,
  getUserLocation,
  turkishCities,
  getNextPrayer
} from '../utils/prayerTimesApi.js';
import { initNotificationService } from '../utils/notificationService.js';
import { getStoredPrayerTimes, storePrayerTimes } from '../utils/storage.js';

const PrayerTimes = ({ darkMode }) => {
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useGPS, setUseGPS] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');
  const [nextPrayer, setNextPrayer] = useState(null);
  const [cityName, setCityName] = useState('Konum Alınıyor...');

  const cardBg = darkMode ? '#1f2937' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  useEffect(() => {
    // 1. Önce hafızadaki vakitleri kontrol et (App.jsx tarafından çekilmiş olmalı)
    const stored = getStoredPrayerTimes();
    if (stored) {
      setTimings(stored.timings);
      setCityName(stored.locationName || 'Konum');
      setNextPrayer(getNextPrayer(stored.timings));
    } else {
      // Eğer hafızada hiç yoksa otomatik yükle
      loadPrayerTimes();
    }

    const interval = setInterval(() => {
      if (timings) setNextPrayer(getNextPrayer(timings));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Vakitler değiştikçe sıradaki vakti güncelle
  useEffect(() => {
    if (timings) setNextPrayer(getNextPrayer(timings));
  }, [timings]);

  const loadPrayerTimes = async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      let finalLocationName = 'Konum';

      if (useGPS) {
        const coords = await getUserLocation();
        if (!coords) throw new Error("Konum alınamadı.");
        result = await getPrayerTimesByCoordinates(coords.latitude, coords.longitude);
      } else {
        if (!selectedCity) return;
        const city = turkishCities.find(c => c.name === selectedCity);
        result = await getPrayerTimesByCoordinates(city.latitude, city.longitude);
        finalLocationName = city.name;
      }

      if (result && result.success) {
        setTimings(result.timings);
        setCityName(finalLocationName);
        storePrayerTimes(result.timings, finalLocationName); // Hafızaya kaydet
        initNotificationService(result.timings);
      }
    } catch (err) {
      setError("Hata: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const prayerNames = [
    { key: 'Fajr', name: 'İmsak', icon: '🌙' },
    { key: 'Sunrise', name: 'Güneş', icon: '🌅' },
    { key: 'Dhuhr', name: 'Öğle', icon: '☀️' },
    { key: 'Asr', name: 'İkindi', icon: '🌤️' },
    { key: 'Maghrib', name: 'Akşam', icon: '🌆' },
    { key: 'Isha', name: 'Yatsı', icon: '🌃' }
  ];

  return (
    <div style={{ padding: '20px', paddingBottom: '80px', color: text }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', margin: '0 0 5px 0' }}>Namaz Vakitleri</h2>
        <p style={{ fontSize: '14px', margin: 0, opacity: 0.7 }}>📍 {cityName}</p>
      </div>

      {nextPrayer && (
        <div style={{ marginBottom: '25px', padding: '25px', backgroundColor: '#059669', borderRadius: '15px', textAlign: 'center', color: 'white', boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Sıradaki Vakit: {nextPrayer.name}</div>
          <div style={{ fontSize: '38px', fontWeight: 'bold', margin: '5px 0' }}>{nextPrayer.time}</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>Konumunuza göre otomatik hesaplanmıştır</div>
        </div>
      )}

      {error && <div style={{ color: '#ef4444', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
        {prayerNames.map(p => (
          <div key={p.key} style={{
            padding: '15px',
            backgroundColor: cardBg,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            border: timings && nextPrayer?.name === p.name ? '2px solid #059669' : 'none'
          }}>
            <div style={{ fontSize: '24px' }}>{p.icon}</div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>{p.name}</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{timings ? timings[p.key] : '--:--'}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: cardBg, borderRadius: '12px' }}>
        <div style={{ fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>Konum Ayarı</div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button onClick={() => setUseGPS(true)} style={{ flex: 1, padding: '10px', backgroundColor: useGPS ? '#059669' : '#ccc', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px' }}>📍 GPS Kullan</button>
          <button onClick={() => setUseGPS(false)} style={{ flex: 1, padding: '10px', backgroundColor: !useGPS ? '#059669' : '#ccc', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px' }}>🏙️ Şehir Seç</button>
        </div>
        {!useGPS && (
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}>
            <option value="">Şehir Seçin...</option>
            {turkishCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        )}
        <button
          onClick={loadPrayerTimes}
          disabled={loading}
          style={{ 
            width: '100%',
            padding: '14px', 
            backgroundColor: loading ? '#6b7280' : '#059669', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? '⏳ Güncelleniyor...' : '🔄 Vakitleri Güncelle'}
        </button>
      </div>
    </div>
  );
};

export default PrayerTimes;
