// src/components/bookmarks/BookmarkGroupedView.js
import React from 'react';

const BookmarkGroupedView = ({ 
  groupedBookmarks, 
  darkMode, 
  onDelete, 
  onAyahClick, 
  getCategoryIcon 
}) => {
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  if (groupedBookmarks.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px', 
        color: darkMode ? '#9ca3af' : '#6b7280' 
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📖</div>
        <div style={{ fontSize: '18px' }}>Henüz yer imi yok</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {groupedBookmarks.map((group) => (
        <div key={group.surahNumber}>
          <h3 style={{ 
            fontSize: '20px', 
            color: text, 
            marginBottom: '15px',
            borderBottom: '2px solid #059669',
            paddingBottom: '8px'
          }}>
            {group.surahName} ({group.bookmarks.length} ayet)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {group.bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                style={{
                  padding: '15px',
                  backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
                  borderRadius: '8px'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: text, 
                      marginBottom: '5px' 
                    }}>
                      <strong>Ayet {bookmark.ayahNumber}</strong> {getCategoryIcon(bookmark.category)}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: darkMode ? '#9ca3af' : '#6b7280' 
                    }}>
                      {bookmark.turkishText.substring(0, 80)}...
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
                    <button
                      onClick={() => onAyahClick && onAyahClick(bookmark.surahNumber, bookmark.ayahNumber)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => onDelete(bookmark.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookmarkGroupedView;