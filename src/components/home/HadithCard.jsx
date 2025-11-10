import React, { useState, useEffect } from 'react';
import { hadiths } from '../../data/hadiths.js';

const HadithCard = ({ darkMode }) => {
  const [dailyHadith, setDailyHadith] = useState(null);

  useEffect(() => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const hadithIndex = dayOfYear % hadiths.length;
    setDailyHadith(hadiths[hadithIndex]);
  }, []);

  const cardStyles = {
    backgroundColor: darkMode ? '#374151' : '#ffffff',
    borderRadius: '16px',
    padding: '25px 20px 45px 20px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
    color: darkMode ? '#f3f4f6' : '#1f2937',
  };

  return (
    <div style={cardStyles}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: darkMode ? '#10b981' : '#059669', margin: '0 0 15px 0' }}>Günün Hadisi</h3>
      {dailyHadith ? (
        <div>
          <p style={{ fontSize: '16px', fontStyle: 'italic', lineHeight: '1.7' }}>“{dailyHadith.text}”</p>
          <p style={{ fontSize: '14px', textAlign: 'right', marginTop: '15px', color: darkMode ? '#d1d5db' : '#6b7280' }}>- {dailyHadith.source}</p>
        </div>
      ) : (
        <p>Yükleniyor...</p>
      )}
    </div>
  );
};

export default HadithCard;
