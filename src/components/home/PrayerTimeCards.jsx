// src/components/home/PrayerTimeCards.jsx

import React from 'react';
import { isPrayerTimePassed, getNextPrayer } from '../../utils/prayerTimesApi.js';

const PrayerTimeCards = ({ prayerTimes, darkMode }) => {
  if (!prayerTimes) {
    return null;
  }

  const prayerInfo = [
    { key: 'Fajr', name: 'İmsak', icon: '🌙' },
    { key: 'Sunrise', name: 'Güneş', icon: '☀️' },
    { key: 'Dhuhr', name: 'Öğle', icon: '🏙️' },
    { key: 'Asr', name: 'İkindi', icon: '🌇' },
    { key: 'Maghrib', name: 'Akşam', icon: '🌆' },
    { key: 'Isha', name: 'Yatsı', icon: '🌃' },
  ];

  const nextPrayer = getNextPrayer(prayerTimes);

  return (
    <div style={styles(darkMode).container}>
      {prayerInfo.map((prayer) => {
        const time = prayerTimes[prayer.key];
        const isPassed = isPrayerTimePassed(time);
        const isNext = nextPrayer && nextPrayer.name === prayer.name;

        const chipStyle = {
          ...styles(darkMode).chip,
          ...(isPassed && !isNext && styles(darkMode).passedChip),
          ...(isNext && styles(darkMode).nextChip),
        };

        return (
          <div key={prayer.key} style={chipStyle}>
            <div style={{ ...styles(darkMode).icon, filter: isNext ? 'none' : (darkMode ? 'grayscale(1)' : 'none') }}>{prayer.icon}</div>
            <div style={{ ...styles(darkMode).prayerName, ...(isNext && styles(darkMode).nextText) }}>{prayer.name}</div>
            <div style={{ ...styles(darkMode).time, ...(isNext && styles(darkMode).nextText) }}>{time}</div>
          </div>
        );
      })}
    </div>
  );
};

const styles = (darkMode) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  chip: {
    background: darkMode ? '#374151' : '#ffffff',
    borderRadius: '16px',
    padding: '10px',
    textAlign: 'center',
    border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
    boxShadow: darkMode ? `3px 3px 5px #2d3748, -3px -3px 5px #414b5a` : `4px 4px 8px #d1d5db, -4px -4px 8px #ffffff`,
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passedChip: {
    opacity: 0.6,
    boxShadow: 'none',
    background: darkMode ? '#323c4a' : '#f3f4f6',
  },
  nextChip: {
    background: `linear-gradient(145deg, ${darkMode ? '#10b981' : '#10b981'}, ${darkMode ? '#059669' : '#059669'})`,
    borderColor: darkMode ? '#10b981' : '#059669',
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 12px -3px ${darkMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
  },
  icon: {
    fontSize: '20px',
    marginBottom: '4px',
    opacity: 0.8,
  },
  prayerName: {
    fontSize: '12px',
    fontWeight: '600',
    color: darkMode ? '#9ca3af' : '#6b7280',
  },
  time: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: darkMode ? '#f9fafb' : '#1f2937',
  },
  nextText: {
    color: '#ffffff',
    fontWeight: 'bold',
  }
});

export default PrayerTimeCards;
