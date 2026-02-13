// src/components/bookmarks/BookmarkListView.js
import React from 'react';

const BookmarkListView = ({ 
  bookmarks, 
  darkMode, 
  onEdit, 
  onDelete, 
  onAyahClick, 
  getCategoryIcon 
}) => {
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  if (bookmarks.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px', 
        color: darkMode ? '#9ca3af' : '#6b7280' 
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📖</div>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Henüz yer imi yok</div>
        <div style={{ fontSize: '14px' }}>Beğendiğiniz ayetleri yer imlerine ekleyin</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          style={{
            padding: '20px',
            backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
            borderRadius: '10px',
            border: '2px solid transparent',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#059669';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          {/* Başlık */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>{getCategoryIcon(bookmark.category)}</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: text }}>
                  {bookmark.surahName} - Ayet {bookmark.ayahNumber}
                </div>
                <div style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  {new Date(bookmark.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onAyahClick && onAyahClick(bookmark.surahNumber, bookmark.ayahNumber)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                👁️ Görüntüle
              </button>
              <button
                onClick={() => onEdit(bookmark)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: darkMode ? '#6b7280' : '#d1d5db',
                  color: text,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                ✏️ Düzenle
              </button>
              <button
                onClick={() => onDelete(bookmark.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Arapça */}
          <div style={{
            fontSize: '18px',
            textAlign: 'right',
            lineHeight: '1.8',
            color: text,
            marginBottom: '10px',
            direction: 'rtl'
          }}>
            {bookmark.arabicText}
          </div>

          {/* Türkçe */}
          <div style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: text,
            marginBottom: bookmark.note ? '10px' : '0'
          }}>
            {bookmark.turkishText}
          </div>

          {/* Not */}
          {bookmark.note && (
            <div style={{
              padding: '12px',
              backgroundColor: darkMode ? '#374151' : '#e5e7eb',
              borderRadius: '6px',
              borderLeft: '3px solid #059669',
              fontSize: '14px',
              color: text,
              fontStyle: 'italic'
            }}>
              📝 {bookmark.note}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BookmarkListView;