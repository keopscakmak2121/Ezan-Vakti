import React, { useState } from 'react';
import { allSurahs } from '../data/surahs';
import { allJuz } from '../data/juz';
import { getLastReadPosition } from '../utils/readingProgressStorage.js';

// Kaldığın yer kartı
const ResumeCard = ({ darkMode, onSurahClick, onJuzClick }) => {
  const lastRead = getLastReadPosition();
  const lastJuz = (() => {
    try {
      const d = localStorage.getItem('quran_juz_last_read');
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  })();

  if (!lastRead && !lastJuz) return null;

  return (
    <div style={{
      marginBottom: '16px', padding: '14px 16px', borderRadius: '14px',
      backgroundColor: darkMode ? '#1e3a2f' : '#ecfdf5',
      border: `1px solid ${darkMode ? '#065f46' : '#a7f3d0'}`
    }}>
      <div style={{ fontSize: '14px', fontWeight: '700', color: '#059669', marginBottom: '10px' }}>
        📌 Kaldığın Yer
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {lastRead && (
          <button onClick={() => onSurahClick(lastRead.surahNumber)} style={{
            flex: 1, padding: '10px 14px', borderRadius: '10px', border: 'none',
            backgroundColor: darkMode ? '#065f46' : '#d1fae5', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '120px'
          }}>
            <span style={{ fontSize: '11px', color: darkMode ? '#a7f3d0' : '#065f46', fontWeight: '600' }}>Sure Okuma</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: darkMode ? '#fff' : '#064e3b' }}>
              {allSurahs.find(s => s.number === lastRead.surahNumber)?.transliteration || `Sure ${lastRead.surahNumber}`}
            </span>
            <span style={{ fontSize: '10px', color: darkMode ? '#6ee7b7' : '#047857' }}>
              Ayet {lastRead.ayahNumber} • %{lastRead.percentage || 0}
            </span>
          </button>
        )}
        {lastJuz && (
          <button onClick={() => onJuzClick(lastJuz.juzNumber)} style={{
            flex: 1, padding: '10px 14px', borderRadius: '10px', border: 'none',
            backgroundColor: darkMode ? '#065f46' : '#d1fae5', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '120px'
          }}>
            <span style={{ fontSize: '11px', color: darkMode ? '#a7f3d0' : '#065f46', fontWeight: '600' }}>Cüz Okuma</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: darkMode ? '#fff' : '#064e3b' }}>
              Cüz {lastJuz.juzNumber}
            </span>
            <span style={{ fontSize: '10px', color: darkMode ? '#6ee7b7' : '#047857' }}>
              {new Date(lastJuz.timestamp).toLocaleDateString('tr-TR')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

// Sure listesi
const SurahsView = ({ darkMode, onSurahClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredSurahs = allSurahs.filter(surah =>
    surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.transliteration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Sure ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles(darkMode).searchInput}
      />
      <div style={styles(darkMode).listContainer}>
        {filteredSurahs.map((surah) => (
          <div key={surah.number} onClick={() => onSurahClick(surah.number)} style={styles(darkMode).listItem}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={styles(darkMode).itemNumber}>{surah.number}</div>
                <div>
                  <div style={styles(darkMode).itemTitle}>{surah.transliteration}</div>
                  <div style={styles(darkMode).itemSubtitle}>{surah.totalAyahs} Ayet • {surah.revelationType === 'Meccan' ? '🕋 Mekki' : '🕌 Medeni'}{surah.meaning ? ` • "${surah.meaning}"` : ''}</div>
                </div>
              </div>
              <div style={styles(darkMode).itemArabic}>{surah.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Cüz listesi
const JuzView = ({ darkMode, onJuzClick }) => {
  return (
    <div style={styles(darkMode).listContainer}>
      {allJuz.map(juz => (
        <div key={juz.number} style={styles(darkMode).listItem} onClick={() => onJuzClick(juz.number)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={styles(darkMode).itemNumber}>{juz.number}</div>
            <div>
              <div style={styles(darkMode).itemTitle}>{juz.name}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Ana component
const SurahList = ({ darkMode, onSurahClick, onJuzClick }) => {
  const [activeTab, setActiveTab] = useState('surah');

  return (
    <div style={styles(darkMode).pageContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ ...styles(darkMode).header, margin: 0 }}>Kuran Oku</h2>
        <button
          onClick={() => {
            const event = new CustomEvent('navigateToQuranSearch');
            window.dispatchEvent(event);
          }}
          style={{
            padding: '10px 16px', borderRadius: '10px', border: 'none',
            backgroundColor: darkMode ? '#374151' : '#e5e7eb',
            color: darkMode ? '#f3f4f6' : '#1f2937',
            fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600'
          }}
        >
          🔍 Ara
        </button>
      </div>

      {/* Kaldığın Yer */}
      <ResumeCard darkMode={darkMode} onSurahClick={onSurahClick} onJuzClick={onJuzClick} />

      {/* Tablar */}
      <div style={styles(darkMode).tabContainer}>
        <button onClick={() => setActiveTab('surah')}
          style={{ ...styles(darkMode).tabButton, ...(activeTab === 'surah' && styles(darkMode).activeTab) }}>
          Sure
        </button>
        <button onClick={() => setActiveTab('juz')}
          style={{ ...styles(darkMode).tabButton, ...(activeTab === 'juz' && styles(darkMode).activeTab) }}>
          Cüz
        </button>
      </div>

      {activeTab === 'surah' && <SurahsView darkMode={darkMode} onSurahClick={onSurahClick} />}
      {activeTab === 'juz' && <JuzView darkMode={darkMode} onJuzClick={onJuzClick} />}
    </div>
  );
};

const styles = (darkMode) => ({
  pageContainer: { padding: '10px', color: darkMode ? '#e5e7eb' : '#1f2937' },
  header: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' },
  tabContainer: { display: 'flex', marginBottom: '20px', backgroundColor: darkMode ? '#1f2937' : '#e5e7eb', borderRadius: '10px', padding: '4px' },
  tabButton: { flex: 1, padding: '10px', fontSize: '16px', fontWeight: '600', border: 'none', backgroundColor: 'transparent', color: darkMode ? '#9ca3af' : '#6b7280', cursor: 'pointer', borderRadius: '8px' },
  activeTab: { backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f3f4f6' : '#1f2937', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  searchInput: { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#e5e7eb' : '#1f2937', fontSize: '16px', boxSizing: 'border-box' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  listItem: { padding: '15px', borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#ffffff', border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`, cursor: 'pointer', transition: 'background-color 0.2s' },
  itemNumber: { width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: darkMode ? '#1f2937' : '#f3f4f6', borderRadius: '50%', fontWeight: 'bold' },
  itemTitle: { fontWeight: '600', fontSize: '16px' },
  itemSubtitle: { fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '2px' },
  itemArabic: { fontSize: '20px', fontWeight: 'bold', fontFamily: 'Traditional Arabic' }
});

export default SurahList;
