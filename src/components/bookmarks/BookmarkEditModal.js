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
  const [editNote, setEditNote] = useState('');
  const [editCategory, setEditCategory] = useState('genel');

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  useEffect(() => {
    if (bookmark) {
      setEditNote(bookmark.note || '');
      setEditCategory(bookmark.category || 'genel');
    }
  }, [bookmark]);

  if (!isOpen || !bookmark) return null;

  const handleSave = () => {
    onSave({
      note: editNote,
      category: editCategory
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: cardBg,
        padding: '25px',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3 style={{ color: text, marginBottom: '20px' }}>
          Yer İmini Düzenle
        </h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: text, 
            fontSize: '14px' 
          }}>
            Kategori:
          </label>
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '6px',
              backgroundColor: darkMode ? '#4b5563' : 'white',
              color: text,
              fontSize: '14px'
            }}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: text, 
            fontSize: '14px' 
          }}>
            Not:
          </label>
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder="Bu ayet hakkında notunuz..."
            rows="4"
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '6px',
              backgroundColor: darkMode ? '#4b5563' : 'white',
              color: text,
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end' 
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: darkMode ? '#6b7280' : '#d1d5db',
              color: text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
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