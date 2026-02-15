// src/components/home/HomePage.jsx - Gereksiz yükleme ekranı ve GPS tetiklenmesi engellendi

import React, { useState, useEffect, useRef } from 'react';
import NextPrayerCard from './NextPrayerCard.jsx';
import PrayerTimeCards from './PrayerTimeCards.jsx';
import TabPanel from './TabPanel.jsx';
import { getPrayerTimesByCoordinates, getUserLocation, getNextPrayer, getCityFromCoordinates } from '../../utils/prayerTimesApi.js';
import { getStoredPrayerTimes, storePrayerTimes } from '../../utils/storage.js';

const calculateCountdown = (prayerTime, isTomorrow) => {
  if (!prayerTime) return null;
  const now = new Date();
  const targetTime = new Date();
  const [hours, minutes] = prayerTime.split(':').map(Number);
  targetTime.setHours(hours, minutes, 0, 0);
  if (isTomorrow || targetTime < now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  let diff = targetTime - now;
  if (diff < 0) diff = 0;
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const HomePage = ({ darkMode, onNavigate }) => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('00:00:00');
  const [locationName, setLocationName] = useState('Konum...');
  const [loading, setLoading] = useState(false); // Başlangıçta false
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // 1. Önce hafızadaki vakitleri kontrol et (HIZLI YÜKLEME)
    const storedData = getStoredPrayerTimes();
    if (storedData) {
      setPrayerTimes(storedData.timings);
      setNextPrayer(getNextPrayer(storedData.timings));
      setLocationName(storedData.locationName);
      setLoading(false);
    } else {
      // Eğer hafızada veri yoksa, o zaman yükleme ekranını göster ve çekmeyi dene
      loadPrayerTimesRemote();
    }

    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (nextPrayer) {
        const newCountdown = calculateCountdown(nextPrayer.time, nextPrayer.tomorrow);
        setCountdown(newCountdown);
        if (newCountdown === '00:00:00') {
          const updatedNextPrayer = getNextPrayer(prayerTimes);
          setNextPrayer(updatedNextPrayer);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextPrayer, prayerTimes]);

  const loadPrayerTimesRemote = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const location = await getUserLocation();
      if (!location) throw new Error("Konum bilgisi alınamadı.");

      const [prayerResult, cityResult] = await Promise.all([
        getPrayerTimesByCoordinates(location.latitude, location.longitude),
        getCityFromCoordinates(location.latitude, location.longitude)
      ]);

      if (prayerResult.success && isMounted.current) {
        setPrayerTimes(prayerResult.timings);
        setNextPrayer(getNextPrayer(prayerResult.timings));
        setLocationName(cityResult);
        storePrayerTimes(prayerResult.timings, cityResult);
      }
    } catch (err) {
      if (isMounted.current) setError(err.message);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };
  
  if (loading && !prayerTimes) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{
          border: `4px solid ${darkMode ? '#374151' : '#f3f4f6'}`,
          borderTop: `4px solid ${darkMode ? '#10b981' : '#059669'}`,
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: darkMode ? '#d1d5db' : '#374151', marginTop: '20px' }}>Vakitler Güncelleniyor...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{padding: '10px'}}>
      <NextPrayerCard nextPrayer={nextPrayer} countdown={countdown} darkMode={darkMode} locationName={locationName} />
      <PrayerTimeCards prayerTimes={prayerTimes} darkMode={darkMode} />
      <TabPanel darkMode={darkMode} />
      {error && !prayerTimes && (
        <div style={{textAlign: 'center', color: '#ef4444', padding: '10px', fontSize: '13px'}}>
          Vakitler güncellenemedi. Lütfen internetinizi kontrol edin.
        </div>
      )}
    </div>
  );
};

export default HomePage;
