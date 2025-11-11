import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSettings, saveSettings } from '../utils/settingsStorage.js';
import { addBookmark, removeBookmarkByAyah, isBookmarked } from '../utils/bookmarkStorage.js';
import { getNote, saveNote } from '../utils/noteStorage.js';
import AyahCard from './quran/AyahCard';
import QuranSettings from './quran/QuranSettings'; // Import the new settings screen
import SurahHeader from './quran/SurahHeader'; // Import the new header
import NoteModal from './quran/NoteModal';

const QuranReader = ({ surahNumber, darkMode, onBack }) => {
  const [surahData, setSurahData] = useState(null);
  const [allVerses, setAllVerses] = useState([]);
  const [renderedVerses, setRenderedVerses] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false); // State to control settings screen visibility

  // Settings state
  const [settings, setSettings] = useState(getSettings());

  const observer = useRef();
  const AYAH_PER_PAGE = 15;

  // Other states
  const [currentAyah, setCurrentAyah] = useState(null);
  const [copiedAyah, setCopiedAyah] = useState(null);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState({});
  const [notes, setNotes] = useState({});
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteAyah, setCurrentNoteAyah] = useState(null);
  const [noteText, setNoteText] = useState('');
  const audioRef = useRef(null);

  const cardBg = darkMode ? '#374151' : '#ffffff';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  // ===== CORE LOGIC (Fetching, Rendering) =====
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

  const fetchSurah = async () => {
    try {
      setLoading(true);
      const surahInfoRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const surahInfoData = await surahInfoRes.json();
      if(surahInfoData.code !== 200) throw new Error('Sure bilgileri alınamadı');
      setSurahData(surahInfoData.data);

      const contentRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-simple,tr.diyanet`);
      const contentData = await contentRes.json();

      if (contentData.code === 200 && contentData.data.length >= 2) {
        const arabic = contentData.data[0].ayahs;
        const turkish = contentData.data[1].ayahs;
        const combined = arabic.map((ayah, index) => ({
          number: ayah.numberInSurah, arabic: ayah.text, turkish: turkish[index]?.text || '', globalNumber: ayah.number
        }));
        setAllVerses(combined);
      }
    } catch (error) { console.error('Sure yükleme hatası:', error); } finally { setLoading(false); }
  };

  const loadMoreVerses = useCallback(() => {
    if (loading || renderedVerses.length >= allVerses.length) return;
    const nextPage = page + 1;
    const newVerses = allVerses.slice(0, nextPage * AYAH_PER_PAGE);
    setRenderedVerses(newVerses);
    setPage(nextPage);
  }, [page, loading, allVerses, renderedVerses.length]);

  const lastAyahElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMoreVerses();
    });
    if (node) observer.current.observe(node);
  }, [loading, loadMoreVerses]);

  // ===== SETTINGS LOGIC =====
  const handleSettingsChange = (newSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  // ===== AYAH ACTIONS (Copy, Bookmark, Note) =====
  const loadBookmarks = () => { /* ... */ };
  const loadNotes = () => { /* ... */ };
  const playAyah = async (ayahNumber) => { /* ... */ };
  const copyAyah = (ayah) => { /* ... */ };
  const toggleBookmark = (ayah) => { /* ... */ };
  const openNoteModal = (ayah) => { /* ... */ };
  const saveNoteHandler = () => { /* ... */ };
  const closeNoteModal = () => { /* ... */ };

  // ===== RENDER LOGIC =====
  if (!surahData || (loading && allVerses.length === 0)) {
    return <div style={{ padding: '20px', textAlign: 'center', color: text }}>Yükleniyor...</div>;
  }

  // RENDER SETTINGS SCREEN
  if (showSettings) {
    return <QuranSettings 
      darkMode={darkMode} 
      settings={settings}
      onSettingsChange={handleSettingsChange}
      onBack={() => setShowSettings(false)} 
    />;
  }

  // RENDER READER SCREEN
  return (
    <div style={{ padding: '10px' }}>
      {/* New Header and Settings Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <button onClick={onBack} style={{ padding: '10px', border: 'none', background: 'transparent', color: text, fontSize: '24px' }}>←</button>
        <button onClick={() => setShowSettings(true)} style={{ padding: '10px', border: 'none', background: 'transparent', color: text, fontSize: '24px' }}>⚙️</button>
      </div>
      
      <SurahHeader surah={surahData} darkMode={darkMode} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
        {renderedVerses.map((ayah, index) => (
          <div ref={index === renderedVerses.length - 1 ? lastAyahElementRef : null} key={ayah.globalNumber}>
            <AyahCard
              ayah={ayah}
              surahName={surahData.englishName}
              settings={settings} // Pass settings object
              darkMode={darkMode}
              // ... other props
              onPlay={() => playAyah(ayah.number)}
              onCopy={() => copyAyah(ayah)}
              onToggleBookmark={() => toggleBookmark(ayah)}
              onOpenNote={() => openNoteModal(ayah)}
            />
          </div>
        ))}
      </div>

      {/* Loading indicator and modals */}
      {loading && renderedVerses.length > 0 && <div>Yükleniyor...</div>}
      {showNoteModal && ( <NoteModal /> )}
    </div>
  );
};

export default QuranReader;
