// src/components/quran/Bismillah.js
import React from 'react';
import { getArabicFontFamily } from '../../utils/settingsStorage';

const Bismillah = ({ surahNumber, fontSize, arabicFont, darkMode }) => {
  // Sure 1 (Fatiha) ve Sure 9 (Tevbe) için Bismillah gösterme
  if (surahNumber === 1 || surahNumber === 9) {
    return null;
  }

  return (
    <div style={{
      textAlign: 'center',
      fontSize: fontSize + 8,
      color: '#059669',
      fontWeight: 'bold',
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
      borderRadius: '8px',
      fontFamily: getArabicFontFamily(arabicFont),
      letterSpacing: '1px',
      lineHeight: '2'
    }}>
      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
    </div>
  );
};

export default Bismillah;