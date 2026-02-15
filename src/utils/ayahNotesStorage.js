// src/utils/ayahNotesStorage.js - Ayet Not Yönetimi

const AYAH_NOTES_KEY = 'quran_ayah_notes';

/**
 * Not yapısı:
 * {
 *   id: "surah-ayah",
 *   surahNumber: number,
 *   ayahNumber: number,
 *   surahName: string,
 *   note: string,
 *   category: string, // 'personal', 'tafsir', 'reminder', 'question'
 *   tags: string[],
 *   color: string, // '#059669', '#ef4444', '#3b82f6', '#f59e0b'
 *   createdAt: ISO string,
 *   updatedAt: ISO string
 * }
 */

/**
 * Not ekle veya güncelle
 */
export const saveAyahNote = (surahNumber, ayahNumber, surahName, noteData) => {
  try {
    const notes = getAllNotes();
    const id = `${surahNumber}-${ayahNumber}`;
    
    const existingNote = notes[id];
    const now = new Date().toISOString();
    
    notes[id] = {
      id,
      surahNumber,
      ayahNumber,
      surahName,
      note: noteData.note || '',
      category: noteData.category || 'personal',
      tags: noteData.tags || [],
      color: noteData.color || '#059669',
      createdAt: existingNote?.createdAt || now,
      updatedAt: now
    };
    
    localStorage.setItem(AYAH_NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Not kaydetme hatası:', error);
    return false;
  }
};

/**
 * Notu sil
 */
export const deleteAyahNote = (surahNumber, ayahNumber) => {
  try {
    const notes = getAllNotes();
    const id = `${surahNumber}-${ayahNumber}`;
    delete notes[id];
    localStorage.setItem(AYAH_NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Not silme hatası:', error);
    return false;
  }
};

/**
 * Belirli ayetin notunu getir
 */
export const getAyahNote = (surahNumber, ayahNumber) => {
  const notes = getAllNotes();
  return notes[`${surahNumber}-${ayahNumber}`] || null;
};

/**
 * Ayetin notu var mı kontrol et
 */
export const hasNote = (surahNumber, ayahNumber) => {
  return !!getAyahNote(surahNumber, ayahNumber);
};

/**
 * Tüm notları getir
 */
export const getAllNotes = () => {
  try {
    const data = localStorage.getItem(AYAH_NOTES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    return {};
  }
};

/**
 * Notları sırala ve listele
 */
export const getNotesArray = (sortBy = 'recent') => {
  const notes = getAllNotes();
  const notesArray = Object.values(notes);
  
  switch (sortBy) {
    case 'recent':
      return notesArray.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    case 'oldest':
      return notesArray.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
    case 'surah':
      return notesArray.sort((a, b) => {
        if (a.surahNumber !== b.surahNumber) {
          return a.surahNumber - b.surahNumber;
        }
        return a.ayahNumber - b.ayahNumber;
      });
    default:
      return notesArray;
  }
};

/**
 * Kategoriye göre notları getir
 */
export const getNotesByCategory = (category) => {
  const notes = getAllNotes();
  return Object.values(notes).filter(n => n.category === category);
};

/**
 * Etiket ile ara
 */
export const searchNotesByTag = (tag) => {
  const notes = getAllNotes();
  return Object.values(notes).filter(n => 
    n.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
};

/**
 * Not içeriğinde ara
 */
export const searchNotesContent = (searchTerm) => {
  const notes = getAllNotes();
  const term = searchTerm.toLowerCase();
  
  return Object.values(notes).filter(n => 
    n.note.toLowerCase().includes(term) ||
    n.tags.some(t => t.toLowerCase().includes(term)) ||
    n.surahName.toLowerCase().includes(term)
  );
};

/**
 * Not istatistikleri
 */
export const getNotesStats = () => {
  const notes = Object.values(getAllNotes());
  
  const categoryCounts = notes.reduce((acc, note) => {
    acc[note.category] = (acc[note.category] || 0) + 1;
    return acc;
  }, {});
  
  const uniqueSurahs = new Set(notes.map(n => n.surahNumber));
  
  const allTags = notes.flatMap(n => n.tags);
  const uniqueTags = [...new Set(allTags)];
  
  return {
    totalNotes: notes.length,
    categoryCounts,
    uniqueSurahs: uniqueSurahs.size,
    totalTags: uniqueTags.length,
    mostUsedTags: getMostUsedTags(allTags, 5)
  };
};

/**
 * En çok kullanılan etiketler
 */
const getMostUsedTags = (tags, limit = 5) => {
  const tagCounts = tags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
};

/**
 * Notları dışa aktar (JSON)
 */
export const exportNotes = () => {
  const notes = getAllNotes();
  const dataStr = JSON.stringify(notes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `kuran-notlarim-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Notları içe aktar
 */
export const importNotes = (jsonData) => {
  try {
    const importedNotes = typeof jsonData === 'string' 
      ? JSON.parse(jsonData) 
      : jsonData;
    
    const currentNotes = getAllNotes();
    const mergedNotes = { ...currentNotes, ...importedNotes };
    
    localStorage.setItem(AYAH_NOTES_KEY, JSON.stringify(mergedNotes));
    return {
      success: true,
      imported: Object.keys(importedNotes).length
    };
  } catch (error) {
    console.error('İçe aktarma hatası:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Kategori renkleri
 */
export const categoryColors = {
  personal: '#059669',    // Yeşil - Kişisel
  tafsir: '#3b82f6',      // Mavi - Tefsir
  reminder: '#f59e0b',    // Turuncu - Hatırlatma
  question: '#ef4444'     // Kırmızı - Soru
};

/**
 * Kategori isimleri
 */
export const categoryNames = {
  personal: '📝 Kişisel',
  tafsir: '📖 Tefsir',
  reminder: '⏰ Hatırlatma',
  question: '❓ Soru'
};
