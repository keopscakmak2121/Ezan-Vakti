
import React, { useState, useEffect, useRef } from 'react';
import { getAudio } from '../utils/audioStorage';
import { addBookmark, removeBookmarkByAyah, isBookmarked } from '../utils/bookmarkStorage';
import { getNote, saveNote } from '../utils/noteStorage';
import { startReadingSession, endReadingSession } from '../utils/statsStorage';
import { getSettings } from '../utils/settingsStorage';
import NoteModal from './quran/NoteModal';
import Bismillah from './quran/Bismillah';
import AyahCard from './quran/AyahCard';

// BUILD VERSION: 0.2.0 - UPDATED $(date)
console.log('QuranReader Version 0.2.0 loaded!');

const QuranReader = ({ surah, darkMode, onBack, highlightWord = '', scrollToAyah = null }) => {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAyah, setCurrentAyah] = useState(null);
  const [fontSize, setFontSize] = useState(20);
  const [arabicFont, setArabicFont] = useState('amiri');
  const [showTajweed, setShowTajweed] = useState(true);
  const [copiedAyah, setCopiedAyah] = useState(null);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState({});
  const [notes, setNotes] = useState({});
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteAyah, setCurrentNoteAyah] = useState(null);
  const [noteText, setNoteText] = useState('');
  const audioRef = useRef(null);
  const [appSettings, setAppSettings] = useState(getSettings());
  const ayahRefs = useRef({});

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  useEffect(() => {
    fetchSurah();
  }, [surah.number]);

  useEffect(() => {
    const settings = getSettings();
    if (settings) {
      setArabicFont(settings.arabicFont);
      setShowTajweed(settings.showTajweed);
      setAppSettings(settings);
    }
  }, []);

  useEffect(() => {
    startReadingSession(surah.number, surah.name);
    return () => {
      endReadingSession();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [surah.number, surah.name]);

  useEffect(() => {
    if (verses.length > 0) {
      loadBookmarks();
      loadNotes();
    }
  }, [verses]);

  // Belirli bir ayete scroll
  useEffect(() => {
    if (scrollToAyah && ayahRefs.current[scrollToAyah]) {
      setTimeout(() => {
        ayahRefs.current[scrollToAyah].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);
    }
  }, [scrollToAyah, verses]);

  useEffect(() => {
    if (currentAyah && ayahRefs.current[currentAyah]) {
      ayahRefs.current[currentAyah].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentAyah]);

  const loadBookmarks = () => {
    const bookmarks = {};
    verses.forEach(ayah => {
      bookmarks[ayah.number] = isBookmarked(surah.number, ayah.number);
    });
    setBookmarkedAyahs(bookmarks);
  };

  const loadNotes = () => {
    const loadedNotes = {};
    verses.forEach(ayah => {
      const note = getNote(surah.number, ayah.number);
      if (note) {
        loadedNotes[ayah.number] = note.note;
      }
    });
    setNotes(loadedNotes);
  };

  const fetchSurah = async () => {
    try {
      setLoading(true);
      const settings = getSettings();

      if (settings.showTajweed) {
        const response = await fetch(
          `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${surah.number}`
        );
        const data = await response.json();

        const translationResponse = await fetch(
          `https://api.alquran.cloud/v1/surah/${surah.number}/tr.diyanet`
        );
        const translationData = await translationResponse.json();

        if (data && data.verses) {
          const combined = data.verses.map((verse, index) => ({
            number: verse.verse_number ? verse.verse_number : (index + 1),
            arabic: verse.text_uthmani_tajweed,
            turkish: translationData.data.ayahs[index]?.text || '',
            globalNumber: verse.id
          }));
          setVerses(combined);
        }
      } else {
        const response = await fetch(
          `https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-simple,tr.diyanet`
        );
        const data = await response.json();

        if (data.code === 200 && data.data && data.data.length >= 2) {
          const arabic = data.data[0].ayahs;
          const turkish = data.data[1].ayahs;

          const combined = arabic.map((ayah, index) => ({
            number: ayah.numberInSurah ? ayah.numberInSurah : (index + 1),
            arabic: ayah.text,
            turkish: turkish && turkish[index] ? turkish[index].text : '',
            globalNumber: ayah.number
          }));
          setVerses(combined);
        }
      }
    } catch (error) {
      console.error('Sure yükleme hatası:', error);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  };

  const playAyah = async (ayahNumber) => {
  const currentSettings = getSettings();
  setAppSettings(currentSettings);

  try {
    if (currentAyah === ayahNumber && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setCurrentAyah(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', audioRef.current._endedHandler);
    }

    const targetAyah = verses.find(v => v.number === ayahNumber);
    if (!targetAyah) {
      alert('Ayet bilgisi bulunamadı.');
      return;
    }

    // ✅ EVERYAYAH API - Sure ve Ayet formatı: SSSAAA
    const selectedReciter = currentSettings.reciter || 'Alafasy_128kbps';
    
    // Sure numarasını 3 haneli, ayet numarasını 3 haneli yap
    const surahPadded = String(surah.number).padStart(3, '0');
    const ayahPadded = String(ayahNumber).padStart(3, '0');
    const audioFileName = `${surahPadded}${ayahPadded}`;
    
    const audioUrl = `https://everyayah.com/data/${selectedReciter}/${audioFileName}.mp3`;
    
    console.log(`🎙️ Kari: ${selectedReciter}`);
    console.log(`🔊 Ses URL: ${audioUrl}`);
    console.log(`📄 Dosya adı: ${audioFileName}.mp3`);

    const audio = new Audio();
    audio.crossOrigin = 'anonymous'; // CORS için
    audio.preload = 'auto';
    audio.src = audioUrl;
    
    // 🎚️ SES HIZI AYARLA
    audio.playbackRate = currentSettings.audioSpeed || 1.0;
    
    audioRef.current = audio;
    setCurrentAyah(ayahNumber);

    audio.addEventListener('canplaythrough', () => {
      audio.play().catch(error => {
        console.error('Ses çalma hatası:', error);
        setCurrentAyah(null);
      });
    }, { once: true });

    audio.addEventListener('error', (e) => {
      console.error('Ses yükleme hatası:', e);
      console.error('Hatalı URL:', audioUrl);
      alert(`Ses dosyası yüklenemedi.\nKari: ${selectedReciter}\nDosya: ${audioFileName}.mp3`);
      setCurrentAyah(null);
    }, { once: true });

    const endedHandler = () => {
      const settings = getSettings();
      setAppSettings(settings);

      if (settings.autoRepeat) {
        playAyah(ayahNumber);
        return;
      }

      if (settings.autoPlay) {
        const lastAyahNumber = verses[verses.length - 1]?.number;
        let nextAyahNumber = ayahNumber + 1;
        if (nextAyahNumber && nextAyahNumber <= lastAyahNumber) {
          playAyah(nextAyahNumber);
          setTimeout(() => {
            if (ayahRefs.current[nextAyahNumber]) {
              ayahRefs.current[nextAyahNumber].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        } else {
          setCurrentAyah(null);
          audioRef.current = null;
        }
      } else {
        setCurrentAyah(null);
        audioRef.current = null;
      }
    };

    audio.addEventListener('ended', endedHandler);
    audio._endedHandler = endedHandler;

  } catch (error) {
    console.error('playAyah hatası:', error);
    alert(`Ses yüklenemedi: ${error.message}`);
    setCurrentAyah(null);
  }
};

  const copyAyah = (ayah) => {
    const textToCopy = `${ayah.arabic}\n\n${ayah.turkish}\n\n(${surah.name} Suresi, ${ayah.number}. Ayet)`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyah(ayah.number);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const toggleBookmark = (ayah) => {
    const isCurrentlyBookmarked = bookmarkedAyahs[ayah.number];

    if (isCurrentlyBookmarked) {
      removeBookmarkByAyah(surah.number, ayah.number);
      setBookmarkedAyahs(prev => ({ ...prev, [ayah.number]: false }));
    } else {
      try {
        addBookmark({
          surahNumber: surah.number,
          surahName: surah.name,
          ayahNumber: ayah.number,
          arabicText: ayah.arabic,
          turkishText: ayah.turkish,
          category: 'genel'
        });
        setBookmarkedAyahs(prev => ({ ...prev, [ayah.number]: true }));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const openNoteModal = (ayah) => {
    setCurrentNoteAyah(ayah);
    const existingNote = getNote(surah.number, ayah.number);
    setNoteText(existingNote ? existingNote.note : '');
    setShowNoteModal(true);
  };

  const saveNoteHandler = () => {
    if (currentNoteAyah) {
      saveNote(surah.number, currentNoteAyah.number, noteText, surah.name);

      if (noteText.trim() === '') {
        setNotes(prev => {
          const newNotes = { ...prev };
          delete newNotes[currentNoteAyah.number];
          return newNotes;
        });
      } else {
        setNotes(prev => ({ ...prev, [currentNoteAyah.number]: noteText }));
      }

      closeNoteModal();
    }
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setCurrentNoteAyah(null);
    setNoteText('');
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        color: text
      }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Geri
        </button>

        <h2 style={{ color: text, margin: 0 }}>
          {surah.name} ({surah.nameArabic})
        </h2>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setFontSize(Math.max(14, fontSize - 2))}
            style={{
              padding: '8px 12px',
              backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
              color: text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            A-
          </button>
          <span style={{ color: text, fontSize: '14px' }}>{fontSize}px</span>
          <button
            onClick={() => setFontSize(Math.min(32, fontSize + 2))}
            style={{
              padding: '8px 12px',
              backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
              color: text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            A+
          </button>
        </div>
      </div>

      <Bismillah
        surahNumber={surah.number}
        fontSize={fontSize}
        arabicFont={arabicFont}
        darkMode={darkMode}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {verses.map((ayah) => (
          <div ref={el => ayahRefs.current[ayah.number] = el} key={ayah.number}>
            <AyahCard
              key={ayah.number}
              ayah={ayah}
              surahName={surah.name}
              fontSize={fontSize}
              arabicFont={arabicFont}
              showTajweed={showTajweed}
              darkMode={darkMode}
              currentAyah={currentAyah}
              copiedAyah={copiedAyah}
              isBookmarked={bookmarkedAyahs[ayah.number]}
              note={notes[ayah.number]}
              highlightWord={highlightWord}
              onPlay={playAyah}
              onCopy={copyAyah}
              onToggleBookmark={toggleBookmark}
              onOpenNote={openNoteModal}
            />
          </div>
        ))}
      </div>

      {showNoteModal && (
        <NoteModal
          darkMode={darkMode}
          ayah={currentNoteAyah}
          surahName={surah.name}
          initialNote={noteText}
          onSave={saveNoteHandler}
          onClose={closeNoteModal}
        />
      )}
    </div>
  );
};

export default QuranReader;