import React, { useState, useEffect } from 'react';
import { prayers } from '../../data/prayers.js';

const DailyPrayerCard = ({ darkMode }) => {
  const [dailyPrayer, setDailyPrayer] = useState(null);

  useEffect(() => {
    // Günlük değişmesi için yılın gününü kullanıyoruz
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const prayerIndex = dayOfYear % prayers.length;
    setDailyPrayer(prayers[prayerIndex]);
  }, []);

  const cardStyles = {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    marginTop: '20px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
    color: darkMode ? '#f3f4f6' : '#1f2937',
  };

  return (
    <div style={cardStyles}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: darkMode ? '#10b981' : '#059669', margin: 0 }}>Günün Duası</h3>
        <span style={{ fontSize: '20px' }}>🤲</span>
      </div>

      {dailyPrayer ? (
        <div style={{ textAlign: 'center' }}>
          <p dir="rtl" style={{ fontSize: '22px', fontFamily: "'Amiri', serif", marginBottom: '15px', lineHeight: '1.8' }}>
            {dailyPrayer.arabic}
          </p>
          <p style={{ fontSize: '15px', fontStyle: 'italic', lineHeight: '1.6', color: darkMode ? '#d1d5db' : '#374151', marginBottom: '10px' }}>
            “{dailyPrayer.translation}”
          </p>
          <p style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', margin: 0 }}>
            — {dailyPrayer.source}
          </p>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: darkMode ? '#9ca3af' : '#6b7280' }}>Dua yükleniyor...</p>
      )}
    </div>
  );
};

export default DailyPrayerCard;
