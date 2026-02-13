// src/utils/bookmarkStorage.js

const BOOKMARKS_KEY = 'quran_bookmarks';

// Yer imi yapısı:
// {
//   id: 'unique_id',
//   surahNumber: 1,
//   surahName: 'Fatiha',
//   ayahNumber: 1,
//   arabicText: 'بِسْمِ ٱللَّهِ...',
//   turkishText: 'Rahman ve Rahim...',
//   note: 'İsteğe bağlı not',
//   category: 'genel', // genel, dua, ibret, vs.
//   createdAt: '2025-01-01T00:00:00.000Z'
// }

// Tüm yer imlerini getir
export const getBookmarks = () => {
  try {
    const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Yer imleri yüklenemedi:', error);
    return [];
  }
};

// Yer imi ekle
export const addBookmark = (bookmark) => {
  try {
    const bookmarks = getBookmarks();
    
    // Aynı ayet zaten yer iminde mi kontrol et
    const exists = bookmarks.some(
      b => b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber
    );
    
    if (exists) {
      throw new Error('Bu ayet zaten yer imlerinde');
    }

    const newBookmark = {
      ...bookmark,
      id: `${bookmark.surahNumber}-${bookmark.ayahNumber}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      category: bookmark.category || 'genel',
      note: bookmark.note || ''
    };

    bookmarks.push(newBookmark);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    
    return newBookmark;
  } catch (error) {
    console.error('Yer imi eklenemedi:', error);
    throw error;
  }
};

// Yer imi sil
export const removeBookmark = (bookmarkId) => {
  try {
    const bookmarks = getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== bookmarkId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Yer imi silinemedi:', error);
    return false;
  }
};

// Ayete göre yer imi sil (sure ve ayet numarası ile)
export const removeBookmarkByAyah = (surahNumber, ayahNumber) => {
  try {
    const bookmarks = getBookmarks();
    const filtered = bookmarks.filter(
      b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
    );
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Yer imi silinemedi:', error);
    return false;
  }
};

// Ayet yer iminde mi kontrol et
export const isBookmarked = (surahNumber, ayahNumber) => {
  const bookmarks = getBookmarks();
  return bookmarks.some(
    b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
  );
};

// Yer imi güncelle (not veya kategori değiştir)
export const updateBookmark = (bookmarkId, updates) => {
  try {
    const bookmarks = getBookmarks();
    const index = bookmarks.findIndex(b => b.id === bookmarkId);
    
    if (index === -1) {
      throw new Error('Yer imi bulunamadı');
    }

    bookmarks[index] = {
      ...bookmarks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return bookmarks[index];
  } catch (error) {
    console.error('Yer imi güncellenemedi:', error);
    throw error;
  }
};

// Kategoriye göre filtrele
export const getBookmarksByCategory = (category) => {
  const bookmarks = getBookmarks();
  if (!category || category === 'tümü') {
    return bookmarks;
  }
  return bookmarks.filter(b => b.category === category);
};

// Surelere göre grupla
export const getBookmarksGroupedBySurah = () => {
  const bookmarks = getBookmarks();
  const grouped = {};

  bookmarks.forEach(bookmark => {
    if (!grouped[bookmark.surahNumber]) {
      grouped[bookmark.surahNumber] = {
        surahName: bookmark.surahName,
        surahNumber: bookmark.surahNumber,
        bookmarks: []
      };
    }
    grouped[bookmark.surahNumber].bookmarks.push(bookmark);
  });

  return Object.values(grouped).sort((a, b) => a.surahNumber - b.surahNumber);
};

// Kategorileri getir
export const getCategories = () => {
  return [
    { id: 'genel', name: 'Genel', icon: '📌' },
    { id: 'dua', name: 'Dua', icon: '🤲' },
    { id: 'ibret', name: 'İbret', icon: '💡' },
    { id: 'hatırlatma', name: 'Hatırlatma', icon: '⏰' },
    { id: 'sabır', name: 'Sabır', icon: '💪' },
    { id: 'şükür', name: 'Şükür', icon: '🙏' },
    { id: 'rahmet', name: 'Rahmet', icon: '❤️' },
    { id: 'mağfiret', name: 'Mağfiret', icon: '✨' }
  ];
};

// İstatistikler
export const getBookmarkStats = () => {
  const bookmarks = getBookmarks();
  const stats = {
    total: bookmarks.length,
    byCategory: {},
    bySurah: {},
    withNotes: bookmarks.filter(b => b.note && b.note.trim() !== '').length
  };

  bookmarks.forEach(bookmark => {
    // Kategorilere göre
    if (!stats.byCategory[bookmark.category]) {
      stats.byCategory[bookmark.category] = 0;
    }
    stats.byCategory[bookmark.category]++;

    // Surelere göre
    if (!stats.bySurah[bookmark.surahNumber]) {
      stats.bySurah[bookmark.surahNumber] = 0;
    }
    stats.bySurah[bookmark.surahNumber]++;
  });

  return stats;
};