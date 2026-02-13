// src/components/home/InspirationCard.jsx

import React, { useState, useEffect } from 'react';
import { curatedVerses } from '../../data/verses.js';
import { curatedHadiths } from '../../data/hadiths.js';
import { curatedEsmas } from '../../data/esmas.js';

const contentTypes = ['Ayet', 'Hadis', 'Esma'];
const CACHE_KEY = 'inspiration_cache';

// Gets a daily item from an array based on the day of the year
const getDailyItem = (arr) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return arr[dayOfYear % arr.length];
};

const InspirationCard = ({ darkMode }) => {
  const [content, setContent] = useState({});
  const [contentType, setContentType] = useState('Ayet');

  useEffect(() => {
    let cachedData = {};
    try {
      cachedData = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch (e) { /* ignore */ }

    const todayStr = new Date().toDateString();

    if (cachedData.date === todayStr) {
        // Use cached daily content
        setContent(cachedData.content);
    } else {
        // Select new daily content and cache it
        const newDailyContent = {
            Ayet: getDailyItem(curatedVerses),
            Hadis: getDailyItem(curatedHadiths),
            Esma: getDailyItem(curatedEsmas),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayStr, content: newDailyContent }));
        setContent(newDailyContent);
    }
  }, []); // Runs only once on mount

  const cardStyles = styles(darkMode);

  const renderContent = () => {
    const currentItem = content[contentType];

    if (!currentItem) {
      return <div style={cardStyles.loading}>Yükleniyor...</div>;
    }

    switch (contentType) {
      case 'Hadis':
        return (
          <>
            <p style={cardStyles.arabicText}>{currentItem.arabic}</p>
            <p style={cardStyles.translationText}>“{currentItem.translation}”</p>
            <div style={cardStyles.reference}>{currentItem.source}</div>
          </>
        );
      case 'Esma':
        return (
          <>
            <div style={cardStyles.esmaHeader}>
              <p style={{...cardStyles.arabicText, fontSize: '32px', marginBottom: '0'}}>{currentItem.arabic}</p>
              <p style={cardStyles.esmaName}>{currentItem.name}</p>
            </div>
            <p style={cardStyles.translationText}>{currentItem.meaning}</p>
          </>
        );
      case 'Ayet':
      default:
        return (
          <>
            <p style={cardStyles.arabicText}>{currentItem.arabic}</p>
            <p style={cardStyles.translationText}>“{currentItem.translation}”</p>
            <div style={cardStyles.reference}>{currentItem.surah} Suresi, {currentItem.ayahNumber}. Ayet</div>
          </>
        );
    }
  };

  return (
    <div style={cardStyles.card}>
      <div style={cardStyles.header}>
        {contentTypes.map(type => (
          <button 
            key={type} 
            style={contentType === type ? cardStyles.activeButton : cardStyles.button}
            onClick={() => setContentType(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div style={cardStyles.contentArea}>
        {renderContent()}
      </div>
    </div>
  );
};


const styles = (darkMode) => ({
  card: {
    backgroundColor: darkMode ? '#374151' : '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '250px',
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '15px',
    borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
    paddingBottom: '15px', 
  },
  button: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: 'transparent',
    color: darkMode ? '#9ca3af' : '#6b7280',
    fontWeight: '600',
    cursor: 'pointer',
  },
  activeButton: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: darkMode ? '#1e3a8a' : '#3b82f6',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  loading: {
    textAlign: 'center',
    color: darkMode ? '#9ca3af' : '#6b7280',
    padding: '20px',
  },
  arabicText: {
    fontSize: '24px',
    lineHeight: '1.8',
    color: darkMode ? '#f3f4f6' : '#1f2937',
    textAlign: 'right',
    direction: 'rtl',
    marginBottom: '15px',
    fontWeight: '600',
    fontFamily: "'Amiri', 'Traditional Arabic', serif",
  },
  translationText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: darkMode ? '#d1d5db' : '#374151',
    fontStyle: 'italic',
    marginBottom: '15px',
  },
  reference: {
    fontSize: '13px',
    color: darkMode ? '#9ca3af' : '#6b7280',
    textAlign: 'left',
  },
  esmaHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      direction: 'rtl',
  },
  esmaName: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: darkMode ? '#a5b4fc' : '#4f46e5',
      direction: 'ltr',
  }
});

export default InspirationCard;
