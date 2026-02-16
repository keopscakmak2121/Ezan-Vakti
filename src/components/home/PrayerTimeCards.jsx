import React from 'react';
import { isPrayerTimePassed, getNextPrayer } from '../../utils/prayerTimesApi.js';

const PrayerTimeCards = ({ prayerTimes, darkMode, themeColors }) => {
  if (!prayerTimes) {
    return null;
  }

  // tc burada tanımlı
  const tc = themeColors || { 
    cardBg: darkMode ? '#374151' : '#ffffff', 
    accent: '#059669', 
    text: darkMode ? '#f9fafb' : '#1f2937', 
    textSec: darkMode ? '#9ca3af' : '#6b7280' 
  };

  const prayerInfo = [
    { key: 'Fajr', name: 'İmsak', icon: '🌙' },
    { key: 'Sunrise', name: 'Güneş', icon: '☀️' },
    { key: 'Dhuhr', name: 'Öğle', icon: '🏙️' },
    { key: 'Asr', name: 'İkindi', icon: '🌇' },
    { key: 'Maghrib', name: 'Akşam', icon: '🌆' },
    { key: 'Isha', name: 'Yatsı', icon: '🌃' },
  ];

  const nextPrayer = getNextPrayer(prayerTimes);

  // styles fonksiyonuna tc'yi de gönderiyoruz
  const s = styles(darkMode, tc);

  return (
    <div style={s.container}>
      {prayerInfo.map((prayer) => {
        const time = prayerTimes[prayer.key];
        const isPassed = isPrayerTimePassed(time);
        const isNext = nextPrayer && nextPrayer.name === prayer.name;

        const chipStyle = {
          ...s.chip,
          ...(isPassed && !isNext && s.passedChip),
          ...(isNext && s.nextChip),
        };

        return (
          <div key={prayer.key} style={chipStyle}>
            <div style={{ ...s.icon, opacity: (isPassed && !isNext) ? 0.5 : 1, filter: isNext ? 'none' : (darkMode ? 'grayscale(1)' : 'none') }}>{prayer.icon}</div>
            <div style={{ ...s.prayerName, ...(isNext && s.nextText) }}>{prayer.name}</div>
            <div style={{ ...s.time, ...(isNext && s.nextText) }}>{time}</div>
          </div>
        );
      })}
    </div>
  );
};

// tc parametresini buraya ekledik
const styles = (darkMode, tc) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginTop: '20px',
  },
  chip: {
    background: tc.cardBg, // Artık tc'ye erişebilir
    borderRadius: '16px',
    padding: '10px',
    textAlign: 'center',
    border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
    boxShadow: darkMode ? `3px 3px 5px #2d3748, -3px -3px 5px #414b5a` : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passedChip: {
    opacity: 0.65,
    background: darkMode ? '#323c4a' : '#f9fafb',
    boxShadow: 'none',
    border: `1px solid ${darkMode ? '#404a58' : '#f3f4f6'}`,
  },
  nextChip: {
    opacity: 1,
    background: `linear-gradient(145deg, ${tc.accent}, ${tc.accent}dd)`,
    border: `1px solid ${tc.accent}`,
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 12px -3px ${tc.accent}66`,
  },
  icon: {
    fontSize: '20px',
    marginBottom: '4px',
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