// src/components/bookmarks/BookmarkEditModal.js
import React, { useState, useEffect } from 'react';

const BookmarkEditModal = ({ 
  isOpen, 
  bookmark, 
  darkMode, 
  categories, 
  onSave, 
  onCancel 
}) => {
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('genel');

  useEffect(() => {
    if (bookmark) {
      setNote(bookmark.note || '');
      setCategory(bookmark.category || 'genel');
    }
  }, [bookmark]);

  if (!isOpen || !bookmark) return null;

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: cardBg,
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ 
          fontSize: '22px', 
          color: text, 
          marginBottom: '20px' 
        }}>
          Yer İmini Düzenle
        </h3>
        <p style={{
          fontSize: '16px',
          color: darkMode ? '#d1d5db' : '#374151',
          marginBottom: '20px'
        }}>
          {bookmark.surahName} - {bookmark.ayahNumber}. Ayet
        </p>

        {/* Not Alanı */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ayet hakkında notunuz..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            border: `1px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
            borderRadius: '8px',
            fontSize: '16px',
            marginBottom: '20px',
            backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
            color: text,
            boxSizing: 'border-box'
          }}
        />

        {/* Kategori Seçimi */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: `1px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
            borderRadius: '8px',
            fontSize: '16px',
            backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
            color: text,
            boxSizing: 'border-box'
          }}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        {/* Butonlar */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: darkMode ? '#6b7280' : '#e5e7eb',
              color: text,
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            İptal
          </button>
          <button 
            onClick={() => onSave({ note, category })}
            style={{
              padding: '10px 25px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkEditModal;