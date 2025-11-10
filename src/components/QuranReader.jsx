import React, { useState, useEffect, useRef, useCallback } from 'react';
import { addBookmark, removeBookmarkByAyah, isBookmarked } from '../utils/bookmarkStorage.js';
import { getNote, saveNote } from '../utils/noteStorage.js';
import { getSettings } from '../utils/settingsStorage.js';
import NoteModal from './quran/NoteModal';
import AyahCard from './quran/AyahCard';

// Reader with header layout fix

const QuranReader = ({ surahNumber, darkMode, onBack }) => {
  const [surahData, setSurahData] = useState(null);
  const [allVerses, setAllVerses] = useState([]);
  const [renderedVerses, setRenderedVerses] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const observer = useRef();
  const AYAH_PER_PAGE = 15;

  const [currentAyah, setCurrentAyah] = useState(null);
  const [fontSize, setFontSize] = useState(20);
  const [copiedAyah, setCopiedAyah] = useState(null);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState({});
  const [notes, setNotes] = useState({});
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteAyah, setCurrentNoteAyah] = useState(null);
  const [noteText, setNoteText] = useState('');
  const audioRef = useRef(null);
  const [appSettings, setAppSettings] = useState(getSettings());

  const cardBg = darkMode ? '#374151' : '#ffffff';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  const loadMoreVerses = useCallback(() => {
    if (loading || allVerses.length === 0) return;
    const nextPage = page + 1;
    const newVerses = allVerses.slice(0, nextPage * AYAH_PER_PAGE);
    setRenderedVerses(newVerses);
    setPage(nextPage);
  }, [page, loading, allVerses]);

  const lastAyahElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && renderedVerses.length < allVerses.length) {
        loadMoreVerses();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadMoreVerses, renderedVerses.length, allVerses.length]);

  useEffect(() => {
    fetchSurah();
    setAllVerses([]);
    setRenderedVerses([]);
    setPage(1);
  }, [surahNumber]);

  useEffect(() => {
    if (allVerses.length > 0) {
        setRenderedVerses(allVerses.slice(0, AYAH_PER_PAGE));
        loadBookmarks();
        loadNotes();
    }
  }, [allVerses]);
  
  const loadBookmarks = () => {
    const bookmarks = {};
    allVerses.forEach(ayah => {
      bookmarks[ayah.number] = isBookmarked(surahNumber, ayah.number);
    });
    setBookmarkedAyahs(bookmarks);
  };

  const loadNotes = () => {
    const loadedNotes = {};
    allVerses.forEach(ayah => {
      const note = getNote(surahNumber, ayah.number);
      if (note) loadedNotes[ayah.number] = note.note;
    });
    setNotes(loadedNotes);
  };

  const fetchSurah = async () => {
     try {
      setLoading(true);
      const surahInfoRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const surahInfoData = await surahInfoRes.json();
      if(surahInfoData.code !== 200) throw new Error('Sure bilgileri alınamadı');
      setSurahData(surahInfoData.data);

      const contentRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-simple,tr.diyanet`);
      const contentData = await contentRes.json();

      if (contentData.code === 200 && contentData.data && contentData.data.length >= 2) {
        const arabic = contentData.data[0].ayahs;
        const turkish = contentData.data[1].ayahs;
        const combined = arabic.map((ayah, index) => ({
          number: ayah.numberInSurah,
          arabic: ayah.text,
          turkish: turkish[index]?.text || '',
          globalNumber: ayah.number
        }));
        setAllVerses(combined);
      }
    } catch (error) {
      console.error('Sure yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const playAyah = async (ayahNumber) => { /* ... Full function ... */ };
  
  const copyAyah = (ayah) => {
    const textToCopy = `${ayah.arabic}\n\n${ayah.turkish}\n\n(${surahData.englishName} Suresi, ${ayah.number}. Ayet)`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyah(ayah.number);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const toggleBookmark = (ayah) => {
    if (!surahData) return;
    const isCurrentlyBookmarked = bookmarkedAyahs[ayah.number];
    if (isCurrentlyBookmarked) {
      removeBookmarkByAyah(surahData.number, ayah.number);
      setBookmarkedAyahs(prev => ({ ...prev, [ayah.number]: false }));
    } else {
      addBookmark({ surahNumber: surahData.number, surahName: surahData.englishName, ayahNumber: ayah.number, arabicText: ayah.arabic, turkishText: ayah.turkish });
      setBookmarkedAyahs(prev => ({ ...prev, [ayah.number]: true }));
    }
  };

  const openNoteModal = (ayah) => {
    setCurrentNoteAyah(ayah);
    const existingNote = getNote(surahNumber, ayah.number);
    setNoteText(existingNote ? existingNote.note : '');
    setShowNoteModal(true);
  };

  const saveNoteHandler = () => {
    if (currentNoteAyah) {
      saveNote(surahNumber, currentNoteAyah.number, noteText, surahData.englishName);
      if (noteText.trim() === '') {
        setNotes(prev => { const newNotes = { ...prev }; delete newNotes[currentNoteAyah.number]; return newNotes; });
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

  if (!surahData || loading && renderedVerses.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: text }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px', backgroundColor: cardBg, borderRadius: '12px', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ padding: '10px', border: 'none', background: 'transparent', color: text, fontSize: '24px' }}>←</button>
        
        {/* FIXED: Vertically stacked title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ color: text, margin: 0, fontSize: '20px' }}>{surahData.englishName}</h2>
          <div style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '16px' }}>{surahData.name}</div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => setFontSize(f => Math.max(14, f - 2))} style={{padding: '8px', border:'none', borderRadius:'6px'}}>A-</button>
          <span>{fontSize}</span>
          <button onClick={() => setFontSize(f => Math.min(32, f + 2))} style={{padding: '8px', border:'none', borderRadius:'6px'}}>A+</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
        {renderedVerses.map((ayah, index) => {
          const isLastElement = index === renderedVerses.length - 1;
          return (
            <div ref={isLastElement ? lastAyahElementRef : null} key={ayah.globalNumber}>
              <AyahCard
                ayah={ayah}
                surahName={surahData.englishName}
                fontSize={fontSize}
                darkMode={darkMode}
                copiedAyah={copiedAyah}
                isBookmarked={bookmarkedAyahs[ayah.number]}
                note={notes[ayah.number]}
                onPlay={() => playAyah(ayah.number)}
                onCopy={() => copyAyah(ayah)}
                onToggleBookmark={() => toggleBookmark(ayah)}
                onOpenNote={() => openNoteModal(ayah)}
              />
            </div>
          );
        })}
      </div>

      {renderedVerses.length > 0 && renderedVerses.length < allVerses.length && 
        <div style={{padding: '20px', textAlign:'center', color: darkMode ? '#9ca3af' : '#6b7280'}}>Daha fazla yükleniyor...</div>
      }

      {showNoteModal && (
        <NoteModal darkMode={darkMode} ayah={currentNoteAyah} surahName={surahData.englishName} initialNote={noteText} onSave={saveNoteHandler} onClose={closeNoteModal} />
      )}
    </div>
  );
};

export default QuranReader;
