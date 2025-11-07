// src/components/home/PrayerTimeCards.js
import React from 'react';
import { isPrayerTimePassed } from '../../utils/prayerTimesApi';

const PrayerTimeCards = ({ timings, loading, darkMode, onRefresh }) => {
  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  const prayerInfo = [
    { key: 'Fajr', name: 'İmsak', icon: '🌙', color: '#6366f1' },
    { key: 'Sunrise', name: 'Güneş', icon: '🌅', color: '#f59e0b' },
    { key: 'Dhuhr', name: 'Öğle', icon: '☀️', color: '#eab308' },
    { key: 'Asr', name: 'İkindi', icon: '🌤️', color: '#fb923c' },
    { key: 'Maghrib', name: 'Akşam', icon: '🌆', color: '#f97316' },
    { key: 'Isha', name: 'Yatsı', icon: '🌃', color: '#8b5cf6' }
  ];

  if (loading) {
    return (
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: text
      }}>
        🕌 Namaz vakitleri yükleniyor...
      </div>
    );
  }

  if (!timings) {
    return (
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: text
      }}>
        ⚠️ Namaz vakitleri yüklenemedi. Lütfen konum izni verin.
      </div>
    );
  }

  return (
    <>
      {/* Namaz Vakitleri Kartları */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px'
      }}>
        {prayerInfo.map((prayer) => {
          const time = timings[prayer.key];
          const passed = isPrayerTimePassed(time);

          return (
            <div
              key={prayer.key}
              style={{
                backgroundColor: cardBg,
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `3px solid ${passed ? (darkMode ? '#4b5563' : '#e5e7eb') : prayer.color}`,
                opacity: passed ? 0.5 : 1,
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => !passed && (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>
                {prayer.icon}
              </div>
              <div style={{ 
                fontSize: '15px', 
                fontWeight: 'bold',
                color: text,
                marginBottom: '6px'
              }}>
                {prayer.name}
              </div>
              <div style={{ 
                fontSize: '22px', 
                fontWeight: 'bold',
                color: passed ? textSec : prayer.color
              }}>
                {time}
              </div>
              {passed && (
                <div style={{ fontSize: '11px', color: textSec, marginTop: '4px' }}>
                  Geçti
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Konumu Güncelle Butonu */}
      <div style={{ textAlign: 'center', margin: '10px 0' }}>
        <button 
          onClick={onRefresh}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#059669',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📍 Konumu Güncelle
        </button>
      </div>
    </>
  );
};

export default PrayerTimeCards;