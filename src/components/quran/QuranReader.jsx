import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSettings, saveSettings } from '../../utils/settingsStorage.js';
import { addBookmark, removeBookmarkByAyah, isBookmarked } from '../../utils/bookmarkStorage.js';
import { getNote, saveNote } from '../../utils/noteStorage.js'; // Corrected Path
import AyahCard from './AyahCard';
import QuranSettings from './QuranSettings'; 
import SurahHeader from './SurahHeader'; 
import NoteModal from './NoteModal';

const QuranReader = ({ surahNumber, darkMode, onBack }) => {
  const [surahData, setSurahData] = useState(null);
  const [allVerses, setAllVerses] = useState([]);
  const [renderedVerses, setRenderedVerses] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(getSettings());

  const observer = useRef();
  const AYAH_PER_PAGE = 15;

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

  useEffect(() => {
    fetchSurah(settings.translation);
  }, [surahNumber]);

  useEffect(() => {
    if (allVerses.length > 0) {
      setRenderedVerses(allVerses.slice(0, AYAH_PER_PAGE));
      loadBookmarks();
      loadNotes();
    }
  }, [allVerses]);

  const fetchSurah = async (translationId) => {
    try {
      setLoading(true);
      setAllVerses([]);
      setRenderedVerses([]);
      setPage(1);

      const surahInfoRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const surahInfoData = await surahInfoRes.json();
      if(surahInfoData.code !== 200) throw new Error('Sure bilgileri alınamadı');
      setSurahData(surahInfoData.data);
      
      const cacheBuster = `&_=${new Date().getTime()}`;
      const editions = `quran-simple,${translationId}`;
      const contentRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/${editions}?${cacheBuster}`);
      const contentData = await contentRes.json();

      if (contentData.code === 200 && contentData.data && contentData.data.length > 0) {
        const arabic = contentData.data[0].ayahs;
        const turkish = contentData.data.length > 1 ? contentData.data[1].ayahs : null;
        const combined = arabic.map((ayah, index) => ({ number: ayah.numberInSurah, arabic: ayah.text, turkish: turkish && turkish[index] ? turkish[index].text : '', globalNumber: ayah.number }));
        setAllVerses(combined);
      } else { throw new Error("Meal verileri bu kaynak için bulunamadı."); }
    } catch (error) { console.error('Sure yükleme hatası:', error); } finally { setLoading(false); }
  };

  const handleSettingsChange = (newSettings) => {
    const oldTranslation = settings.translation;
    saveSettings(newSettings);
    setSettings(newSettings);
    if (oldTranslation !== newSettings.translation) {
        fetchSurah(newSettings.translation);
    }
  };

  const loadMoreVerses = useCallback(()=>{/*...*/},[/*...*/]);
  const lastAyahElementRef = useCallback(node=>{/*...*/},[/*...*/]);
  const loadBookmarks = () => {};
  const loadNotes = () => {};
  const playAyah = () => {};
  const copyAyah = () => {};
  const toggleBookmark = () => {};
  const openNoteModal = () => {};
  const saveNoteHandler = () => {};
  const closeNoteModal = () => {};

  if (showSettings) {
    return <QuranSettings darkMode={darkMode} settings={settings} onSettingsChange={handleSettingsChange} onBack={() => setShowSettings(false)} />;
  }
  
  if (!surahData || loading) {
      return <div style={{ padding: '20px', textAlign: 'center', color: text }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <button onClick={onBack}>←</button>
        <button onClick={() => setShowSettings(true)}>⚙️</button>
      </div>
      <SurahHeader surah={surahData} darkMode={darkMode} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
        {renderedVerses.map((ayah, index) => (
          <div ref={index === renderedVerses.length - 1 ? lastAyahElementRef : null} key={ayah.globalNumber}>
            <AyahCard
              ayah={ayah}
              surahName={surahData.englishName}
              settings={settings}
              darkMode={darkMode}
              onPlay={() => playAyah(ayah.number)}
              onCopy={() => copyAyah(ayah)}
              onToggleBookmark={() => toggleBookmark(ayah)}
              onOpenNote={() => openNoteModal(ayah)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuranReader;
