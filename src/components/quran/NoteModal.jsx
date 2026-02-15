// src/components/quran/NoteModal.jsx - Ayet Not Ekleme/Düzenleme Modal

import React, { useState, useEffect } from 'react';
import { saveAyahNote, getAyahNote, categoryColors, categoryNames } from '../../utils/ayahNotesStorage';

const NoteModal = ({ 
  surahNumber, 
  ayahNumber, 
  surahName, 
  darkMode, 
  onClose, 
  onSave 
}) => {
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('personal');
  const [tags, setTags] = useState('');
  const [color, setColor] = useState('#059669');
  
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    const existingNote = getAyahNote(surahNumber, ayahNumber);
    if (existingNote) {
      setNote(existingNote.note);
      setCategory(existingNote.category);
      setTags(existingNote.tags.join(', '));
      setColor(existingNote.color);
    }
  }, [surahNumber, ayahNumber]);

  const handleSave = () => {
    const noteData = {
      note: note.trim(),
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      color
    };

    const success = saveAyahNote(surahNumber, ayahNumber, surahName, noteData);
    if (success) {
      onSave && onSave();
      onClose();
    }
  };

  useEffect(() => {
    setColor(categoryColors[category] || '#059669');
  }, [category]);

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderRadius: '20px', width: '100%', maxWidth: '500px',
          maxHeight: '90vh', overflow: 'auto', padding: '25px',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px', paddingBottom: '15px',
          borderBottom: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: text }}>
              📝 Not Ekle/Düzenle
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: textSec }}>
              {surahName} - Ayet {ayahNumber}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: '35px', height: '35px', borderRadius: '50%', border: 'none',
            backgroundColor: darkMode ? '#374151' : '#f3f4f6', color: text,
            fontSize: '20px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block', fontSize: '14px', fontWeight: '600',
            color: text, marginBottom: '10px'
          }}>Kategori</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {Object.entries(categoryNames).map(([key, name]) => (
              <button key={key} onClick={() => setCategory(key)} style={{
                padding: '12px', borderRadius: '10px',
                border: category === key ? `2px solid ${categoryColors[key]}` : '2px solid transparent',
                backgroundColor: category === key ? `${categoryColors[key]}15` : darkMode ? '#374151' : '#f3f4f6',
                color: category === key ? categoryColors[key] : text,
                fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
              }}>{name}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block', fontSize: '14px', fontWeight: '600',
            color: text, marginBottom: '10px'
          }}>Not</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Notunuzu buraya yazın..." rows={6} style={{
              width: '100%', padding: '15px', borderRadius: '10px',
              border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              backgroundColor: darkMode ? '#374151' : '#f9fafb',
              color: text, fontSize: '15px', lineHeight: '1.6',
              resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = color}
            onBlur={(e) => e.target.style.borderColor = darkMode ? '#374151' : '#e5e7eb'}
          />
          <div style={{ fontSize: '12px', color: textSec, marginTop: '5px' }}>
            {note.length} karakter
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block', fontSize: '14px', fontWeight: '600',
            color: text, marginBottom: '10px'
          }}>Etiketler (virgülle ayırın)</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
            placeholder="tefsir, öğüt, dua..." style={{
              width: '100%', padding: '12px 15px', borderRadius: '10px',
              border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              backgroundColor: darkMode ? '#374151' : '#f9fafb',
              color: text, fontSize: '14px', outline: 'none', boxSizing: 'border-box'
            }}
          />
          {tags && (
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tags.split(',').map((tag, i) => tag.trim() && (
                <span key={i} style={{
                  padding: '4px 10px', borderRadius: '12px',
                  backgroundColor: `${color}20`, color: color,
                  fontSize: '12px', fontWeight: '600'
                }}>#{tag.trim()}</span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
            backgroundColor: darkMode ? '#374151' : '#e5e7eb',
            color: text, fontSize: '16px', fontWeight: '600', cursor: 'pointer'
          }}>İptal</button>
          <button onClick={handleSave} disabled={!note.trim()} style={{
            flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
            backgroundColor: note.trim() ? color : darkMode ? '#4b5563' : '#d1d5db',
            color: 'white', fontSize: '16px', fontWeight: 'bold',
            cursor: note.trim() ? 'pointer' : 'not-allowed',
            opacity: note.trim() ? 1 : 0.6
          }}>💾 Kaydet</button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default NoteModal;
