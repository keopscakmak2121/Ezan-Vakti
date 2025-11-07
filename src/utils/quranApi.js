// Quran.com API - Tecvidli metinler için
const QURAN_API_BASE = 'https://api.quran.com/api/v4';

// Tecvidli sure çekme
export const fetchSurahWithTajweed = async (surahNumber) => {
  try {
    const response = await fetch(
      `${QURAN_API_BASE}/verses/by_chapter/${surahNumber}?words=true&translations=131&fields=text_uthmani`
    );
    
    if (!response.ok) {
      throw new Error('Veri yüklenemedi');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Tecvidli API hatası:', error);
    throw error;
  }
};

// Türkçe meal için mevcut API
export const fetchSurah = async (surahNumber, translationId) => {
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-simple,${translationId}`
    );
    if (!response.ok) throw new Error('Veri yüklenemedi');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('API hatası:', error);
    throw error;
  }
};