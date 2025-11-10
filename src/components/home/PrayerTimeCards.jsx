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
            {/* In light mode, icons for passed times are also less visible */}
            <div style={{ ...styles(darkMode).icon, opacity: (isPassed && !isNext) ? 0.5 : 1, filter: isNext ? 'none' : (darkMode ? 'grayscale(1)' : 'none') }}>{prayer.icon}</div>
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
    marginTop: '20px', // Add space between the main card and these small cards
  },
  chip: {
    background: darkMode ? '#374151' : '#ffffff',
    borderRadius: '16px',
    padding: '10px',
    textAlign: 'center',
    border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
    // Use a more modern, consistent shadow for the light theme
    boxShadow: darkMode ? `3px 3px 5px #2d3748, -3px -3px 5px #414b5a` : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passedChip: {
    opacity: 0.65,
    // In light mode, a slightly off-white background looks better than gray for passed items
    background: darkMode ? '#323c4a' : '#f9fafb',
    boxShadow: 'none', // No shadow for passed items to make them recede
    border: `1px solid ${darkMode ? '#404a58' : '#f3f4f6'}`,
  },
  nextChip: {
    opacity: 1, // Ensure next prayer is fully opaque
    background: `linear-gradient(145deg, ${darkMode ? '#10b981' : '#10b981'}, ${darkMode ? '#059669' : '#059669'})`,
    borderColor: darkMode ? '#10b981' : '#059669',
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 12px -3px ${darkMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
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
