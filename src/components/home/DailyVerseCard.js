// src/components/home/DailyVerseCard.js
import React from 'react';

const DailyVerseCard = ({ dailyVerse, verseLoading, darkMode }) => {
  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      padding: '25px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderLeft: '4px solid #059669'
    }}>
      <h3 style={{ 
        fontSize: '18px', 
        color: '#059669',
        margin: '0 0 15px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📜 Günün Ayeti
      </h3>
      
      {verseLoading ? (
        <div style={{ textAlign: 'center', color: textSec, padding: '20px' }}>
          Yükleniyor...
        </div>
      ) : dailyVerse ? (
        <>
          <p style={{
            fontSize: '20px',
            lineHeight: '1.8',
            color: text,
            textAlign: 'right',
            direction: 'rtl',
            marginBottom: '15px',
            fontWeight: '600',
            fontFamily: "'Amiri', 'Traditional Arabic', serif"
          }}>
            {dailyVerse.arabic}
          </p>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: text,
            marginBottom: '15px'
          }}>
            {dailyVerse.translation}
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '15px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{
              fontSize: '13px',
              color: textSec
            }}>
              {dailyVerse.surah} Suresi, {dailyVerse.ayahNumber}. Ayet
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', color: textSec, padding: '20px' }}>
          Ayet yüklenemedi
        </div>
      )}
    </div>
  );
};

export default DailyVerseCard;