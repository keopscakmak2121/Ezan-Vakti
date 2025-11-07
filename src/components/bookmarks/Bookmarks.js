// src/components/bookmarks/Bookmarks.js
import React, { useState, useEffect } from 'react';
import {
  getBookmarksGroupedBySurah,
  getCategories,
  getBookmarksByCategory,
  getBookmarkStats,
  removeBookmark,
  updateBookmark
} from '../../utils/bookmarkStorage';
import BookmarkListView from './BookmarkListView';
import BookmarkGroupedView from './BookmarkGroupedView';
import BookmarkEditModal from './BookmarkEditModal';

const Bookmarks = ({ darkMode, onAyahClick }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [groupedBookmarks, setGroupedBookmarks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('tümü');
  const [viewMode, setViewMode] = useState('list'); // list, grouped
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [stats, setStats] = useState(null);

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const categories = getCategories();

  useEffect(() => {
    loadBookmarks();
  }, [selectedCategory, viewMode]);

  const loadBookmarks = () => {
    const allBookmarks = getBookmarksByCategory(selectedCategory);
    setBookmarks(allBookmarks);
    
    if (viewMode === 'grouped') {
      const grouped = getBookmarksGroupedBySurah();
      setGroupedBookmarks(grouped);
    }

    setStats(getBookmarkStats());
  };

  const handleDelete = (bookmarkId) => {
    if (window.confirm('Bu yer imini silmek istediğinize emin misiniz?')) {
      removeBookmark(bookmarkId);
      loadBookmarks();
    }
  };

  const handleEdit = (bookmark) => {
    setEditingBookmark(bookmark);
  };

  const handleSaveEdit = (updates) => {
    if (editingBookmark) {
      updateBookmark(editingBookmark.id, updates);
      setEditingBookmark(null);
      loadBookmarks();
    }
  };

  const handleCancelEdit = () => {
    setEditingBookmark(null);
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '📌';
  };

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Başlık ve İstatistikler */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', color: text }}>
          Yer İmleri
        </h2>
        
        {stats && (
          <div style={{
            padding: '12px',
            backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
            borderRadius: '8px',
            fontSize: '14px',
            color: text
          }}>
            <strong>Toplam:</strong> {stats.total} ayet
            {stats.withNotes > 0 && <> • <strong>Notlu:</strong> {stats.withNotes}</>}
          </div>
        )}
      </div>

      {/* Filtreler */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setSelectedCategory('tümü')}
          style={{
            padding: '8px 16px',
            backgroundColor: selectedCategory === 'tümü' ? '#059669' : (darkMode ? '#4b5563' : '#e5e7eb'),
            color: selectedCategory === 'tümü' ? 'white' : text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Tümü
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedCategory === category.id ? '#059669' : (darkMode ? '#4b5563' : '#e5e7eb'),
              color: selectedCategory === category.id ? 'white' : text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Görünüm Modu */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setViewMode('list')}
          style={{
            padding: '8px 16px',
            backgroundColor: viewMode === 'list' ? '#059669' : (darkMode ? '#4b5563' : '#e5e7eb'),
            color: viewMode === 'list' ? 'white' : text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📋 Liste
        </button>
        
        <button
          onClick={() => setViewMode('grouped')}
          style={{
            padding: '8px 16px',
            backgroundColor: viewMode === 'grouped' ? '#059669' : (darkMode ? '#4b5563' : '#e5e7eb'),
            color: viewMode === 'grouped' ? 'white' : text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📚 Surelere Göre
        </button>
      </div>

      {/* Yer İmi Düzenleme Modal */}
      <BookmarkEditModal
        isOpen={!!editingBookmark}
        bookmark={editingBookmark}
        darkMode={darkMode}
        categories={categories}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />

      {/* İçerik */}
      {viewMode === 'list' ? (
        <BookmarkListView
          bookmarks={bookmarks}
          darkMode={darkMode}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAyahClick={onAyahClick}
          getCategoryIcon={getCategoryIcon}
        />
      ) : (
        <BookmarkGroupedView
          groupedBookmarks={groupedBookmarks}
          darkMode={darkMode}
          onDelete={handleDelete}
          onAyahClick={onAyahClick}
          getCategoryIcon={getCategoryIcon}
        />
      )}
    </div>
  );
};

export default Bookmarks;