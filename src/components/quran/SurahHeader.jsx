import React, { useState } from 'react';
import { allSurahs } from '../../data/surahs';

const SurahHeader = ({ surah, darkMode }) => {
  const [showDetails, setShowDetails] = useState(false);

  // surahs.js'den detaylı bilgiyi al
  const surahInfo = allSurahs.find(s => s.number === surah.number);

  const headerStyle = {
    padding: '20px',
    margin: '10px 15px 20px 15px',
    textAlign: 'center',
    border: `1px solid ${darkMode ? '#4b5563' : '#ddd'}`,
    borderRadius: '16px',
    background: darkMode ? '#374151' : '#f9f9f9',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  };

  const badgeStyle = (color) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: color,
    color: 'white',
    margin: '3px'
  });

  const isMeccan = surah.revelationType === 'Meccan';

  return (
    <div style={headerStyle}>
      {/* Arapça İsim */}
      <div style={{ fontSize: '32px', fontFamily: 'Amiri, serif', color: darkMode ? '#f3f4f6' : '#1f2937', marginBottom: '5px' }}>
        {surah.name}
      </div>

      {/* Türkçe İsim ve Anlam */}
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: darkMode ? '#f3f4f6' : '#1f2937' }}>
        {surah.englishName || surahInfo?.transliteration}
      </div>
      {surahInfo?.meaning && (
        <div style={{ fontSize: '14px', color: '#059669', fontWeight: '600', marginTop: '4px' }}>
          "{surahInfo.meaning}"
        </div>
      )}

      {/* Badge'ler */}
      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
        <span style={badgeStyle(isMeccan ? '#8b5cf6' : '#3b82f6')}>
          {isMeccan ? '🕋 Mekki' : '🕌 Medeni'}
        </span>
        <span style={badgeStyle('#059669')}>
          📖 {surah.numberOfAyahs} Ayet
        </span>
        {surahInfo?.nuzulOrder && (
          <span style={badgeStyle('#f59e0b')}>
            #{surahInfo.nuzulOrder}. iniş sırası
          </span>
        )}
      </div>

      {/* Detay Butonu */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          marginTop: '12px',
          padding: '8px 20px',
          borderRadius: '20px',
          border: `1px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
          backgroundColor: 'transparent',
          color: darkMode ? '#d1d5db' : '#6b7280',
          fontSize: '13px',
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        {showDetails ? '▲ Bilgileri Gizle' : '▼ Sure Hakkında'}
      </button>

      {/* Detay Paneli */}
      {showDetails && surahInfo && (
        <div style={{
          marginTop: '15px',
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: darkMode ? '#1f2937' : '#f3f4f6',
          textAlign: 'left',
          fontSize: '14px',
          lineHeight: '1.7',
          color: darkMode ? '#d1d5db' : '#374151'
        }}>
          {/* İsim Sebebi */}
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontWeight: '700', color: '#059669', display: 'block', marginBottom: '4px' }}>
              📌 İsim Sebebi
            </span>
            {surahInfo.nameReason}
          </div>

          {/* İniş Yeri */}
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontWeight: '700', color: '#059669', display: 'block', marginBottom: '4px' }}>
              📍 İniş Yeri
            </span>
            {isMeccan
              ? 'Bu sure Mekke döneminde inmiştir. Genellikle inanç esasları, tevhid ve ahiret konularını işler.'
              : 'Bu sure Medine döneminde inmiştir. Genellikle hukuki hükümler, toplumsal düzen ve ibadet kurallarını içerir.'}
          </div>

          {/* Genel Bilgi */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginTop: '10px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: darkMode ? '#374151' : '#e5e7eb'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>{surah.number}</div>
              <div style={{ fontSize: '11px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Mushaf Sırası</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>{surahInfo.nuzulOrder}</div>
              <div style={{ fontSize: '11px', color: darkMode ? '#9ca3af' : '#6b7280' }}>İniş Sırası</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>{surah.numberOfAyahs}</div>
              <div style={{ fontSize: '11px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Ayet Sayısı</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#8b5cf6' }}>{isMeccan ? 'Mekki' : 'Medeni'}</div>
              <div style={{ fontSize: '11px', color: darkMode ? '#9ca3af' : '#6b7280' }}>İniş Dönemi</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurahHeader;
