// src/utils/noteStorage.js

const NOTES_KEY = 'quran_notes';

// Tüm notları al
export const getAllNotes = () => {
  try {
    const notes = localStorage.getItem(NOTES_KEY);
    return notes ? JSON.parse(notes) : {};
  } catch (error) {
    console.error('Notlar yüklenirken hata:', error);
    return {};
  }
};

// Belirli bir ayet için not al
export const getNote = (surahNumber, ayahNumber) => {
  const notes = getAllNotes();
  const key = `${surahNumber}-${ayahNumber}`;
  return notes[key] || null;
};

// Not ekle veya güncelle
export const saveNote = (surahNumber, ayahNumber, noteText, surahName) => {
  try {
    const notes = getAllNotes();
    const key = `${surahNumber}-${ayahNumber}`;
    
    if (noteText.trim() === '') {
      // Boş not ise sil
      delete notes[key];
    } else {
      // Not kaydet
      notes[key] = {
        surahNumber,
        ayahNumber,
        surahName,
        note: noteText,
        createdAt: notes[key]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Not kaydedilirken hata:', error);
    return false;
  }
};

// Not sil
export const deleteNote = (surahNumber, ayahNumber) => {
  try {
    const notes = getAllNotes();
    const key = `${surahNumber}-${ayahNumber}`;
    delete notes[key];
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Not silinirken hata:', error);
    return false;
  }
};

// Belirli bir sure için tüm notları al
export const getNotesBySurah = (surahNumber) => {
  const allNotes = getAllNotes();
  return Object.entries(allNotes)
    .filter(([key]) => key.startsWith(`${surahNumber}-`))
    .map(([key, value]) => value);
};

// Not var mı kontrol et
export const hasNote = (surahNumber, ayahNumber) => {
  const note = getNote(surahNumber, ayahNumber);
  return note !== null && note.note.trim() !== '';
};

// Toplam not sayısı
export const getTotalNotesCount = () => {
  return Object.keys(getAllNotes()).length;
};