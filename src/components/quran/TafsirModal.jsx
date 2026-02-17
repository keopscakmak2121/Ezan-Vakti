import React, { useState, useEffect } from 'react';
import { tafsirs, fetchTafsir } from '../../utils/tafsirStorage.js';

const TafsirModal = ({ surahNumber, ayahNumber, darkMode, onClose }) => {
  const [tafsirText, setTafsirText] = useState('');
  const [selectedTafsir, setSelectedTafsir] = useState(tafsirs[0].id);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    loadTafsir();
  }, [selectedTafsir]);

  const loadTafsir = async () => {
    setLoading(true);
    try {
      const text = await fetchTafsir(surahNumber, ayahNumber, selectedTafsir);
      setTafsirText(text);
    } catch (e) {
      setTafsirText('Tefsir yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 10000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  };

  const contentStyle = {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '80vh',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: darkMode ? '#f3f4f6' : '#1f2937', fontSize: '18px' }}>Ayet Tefsiri</h3>
            <span style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Sure {surahNumber}, Ayet {ayahNumber}</span>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', color: darkMode ? '#9ca3af' : '#6b7280', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Selection & Settings */}
        <div style={{ padding: '15px', backgroundColor: darkMode ? '#111827' : '#f9fafb', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={selectedTafsir}
            onChange={(e) => setSelectedTafsir(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`, backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#000' }}
          >
            {tafsirs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', backgroundColor: '#059669', color: 'white' }}>A-</button>
            <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', backgroundColor: '#059669', color: 'white' }}>A+</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', color: darkMode ? '#d1d5db' : '#374151', fontSize: `${fontSize}px`, lineHeight: '1.7' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Tefsir Yükleniyor...</div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: tafsirText }} />
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '15px', textAlign: 'center', borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
          <button onClick={onClose} style={{ padding: '10px 30px', borderRadius: '10px', border: 'none', backgroundColor: '#059669', color: 'white', fontWeight: 'bold' }}>Kapat</button>
        </div>
      </div>
    </div>
  );
};

export default TafsirModal;
