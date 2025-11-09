import React, { useState } from 'react';
import { allSurahs } from '../data/surahs';

const SurahList = ({ darkMode, onSurahSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSurahs = allSurahs.filter(surah =>
    surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.transliteration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      padding: '20px',
      color: darkMode ? '#e5e7eb' : '#1f2937'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Sureler
      </h2>

      <input
        type="text"
        placeholder="Sure ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '8px',
          border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
          backgroundColor: darkMode ? '#374151' : '#ffffff',
          color: darkMode ? '#e5e7eb' : '#1f2937',
          fontSize: '16px'
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredSurahs.map((surah) => (
          <div
            key={surah.number}
            onClick={() => onSurahSelect(surah.number)}
            style={{
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: darkMode ? '#374151' : '#f9fafb',
              border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? '#4b5563' : '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: darkMode ? '#1f2937' : '#e5e7eb',
                  borderRadius: '50%',
                  fontWeight: 'bold'
                }}>
                  {surah.number}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>
                    {surah.transliteration}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    marginTop: '2px'
                  }}>
                    {surah.totalAyahs} Ayet • {surah.revelationType === 'Meccan' ? 'Mekki' : 'Medeni'}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                fontFamily: 'Traditional Arabic'
              }}>
                {surah.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurahList;
