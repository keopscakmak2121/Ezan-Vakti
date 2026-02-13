import React, { useState } from 'react';
import { allSurahs } from '../data/surahs';
import { allJuz } from '../data/juz'; // Import Juz data

// Separate component for the list of surahs
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
          <div
            key={surah.number}
            onClick={() => onSurahClick(surah.number)}
            style={styles(darkMode).listItem}
          >
            {/* Surah item content */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={styles(darkMode).itemNumber}>{surah.number}</div>
                <div>
                  <div style={styles(darkMode).itemTitle}>{surah.transliteration}</div>
                  <div style={styles(darkMode).itemSubtitle}>{surah.totalAyahs} Ayet • {surah.revelationType === 'Meccan' ? 'Mekki' : 'Medeni'}</div>
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

// Separate component for the list of Juz
const JuzView = ({ darkMode, onJuzClick }) => { // Added onJuzClick prop
  return (
    <div style={styles(darkMode).listContainer}>
      {allJuz.map(juz => (
        <div 
          key={juz.number} 
          style={styles(darkMode).listItem} 
          onClick={() => onJuzClick(juz.number)} // Make Juz items clickable
        >
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

// Main component with tabs
const SurahList = ({ darkMode, onSurahClick, onJuzClick }) => { // Added onJuzClick prop
  const [activeTab, setActiveTab] = useState('surah');

  return (
    <div style={styles(darkMode).pageContainer}>
      <h2 style={styles(darkMode).header}>Kuran Oku</h2>
      
      <div style={styles(darkMode).tabContainer}>
        <button 
          onClick={() => setActiveTab('surah')} 
          style={{ ...styles(darkMode).tabButton, ...(activeTab === 'surah' && styles(darkMode).activeTab) }}
        >
          Sure (Fihrist)
        </button>
        <button 
          onClick={() => setActiveTab('juz')} 
          style={{ ...styles(darkMode).tabButton, ...(activeTab === 'juz' && styles(darkMode).activeTab) }}
        >
          Cüz
        </button>
      </div>

      {activeTab === 'surah' ? 
        <SurahsView darkMode={darkMode} onSurahClick={onSurahClick} /> : 
        <JuzView darkMode={darkMode} onJuzClick={onJuzClick} />
      }
    </div>
  );
};

// Centralized styles for the component
const styles = (darkMode) => ({
  pageContainer: { padding: '10px', color: darkMode ? '#e5e7eb' : '#1f2937' },
  header: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' },
  tabContainer: { display: 'flex', marginBottom: '20px', backgroundColor: darkMode ? '#1f2937' : '#e5e7eb', borderRadius: '10px', padding: '4px' },
  tabButton: { flex: 1, padding: '10px', fontSize: '16px', fontWeight: '600', border: 'none', backgroundColor: 'transparent', color: darkMode ? '#9ca3af' : '#6b7280', cursor: 'pointer', borderRadius: '8px', },
  activeTab: { backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f3f4f6' : '#1f2937', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  searchInput: { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#e5e7eb' : '#1f2937', fontSize: '16px' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  listItem: { padding: '15px', borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#ffffff', border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`, cursor: 'pointer', transition: 'background-color 0.2s' },
  itemNumber: { width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: darkMode ? '#1f2937' : '#f3f4f6', borderRadius: '50%', fontWeight: 'bold' },
  itemTitle: { fontWeight: '600', fontSize: '16px' },
  itemSubtitle: { fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '2px' },
  itemArabic: { fontSize: '20px', fontWeight: 'bold', fontFamily: 'Traditional Arabic' }
});

export default SurahList;
