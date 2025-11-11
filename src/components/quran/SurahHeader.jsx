import React from 'react';

const SurahHeader = ({ surah, darkMode }) => {

  const headerStyle = {
    padding: '20px',
    margin: '10px 0 20px 0',
    textAlign: 'center',
    border: `1px solid ${darkMode ? '#4b5563' : '#ddd'}`,
    borderRadius: '12px',
    background: darkMode ? '#374151' : '#f9f9f9',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };

  return (
    <div style={headerStyle}>
      <div style={{ fontSize: '22px', fontWeight: 'bold', color: darkMode ? '#f3f4f6' : '#1f2937' }}>{surah.englishName}</div>
      <div style={{ fontSize: '28px', fontFamily: 'Amiri, serif', color: darkMode ? '#f3f4f6' : '#1f2937', marginTop: '5px' }}>{surah.name}</div>
      <div style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '10px' }}>
        {surah.revelationType === 'Meccan' ? 'Mekki' : 'Medeni'} • {surah.numberOfAyahs} Ayet
      </div>
    </div>
  );
};

export default SurahHeader;
