import React, { useState, useEffect, useRef, useCallback } from 'react';
import { juzData } from '../../data/juz-data.js';
import { getSettings, getReaderTheme } from '../../utils/settingsStorage.js';
import SurahHeader from './SurahHeader';

const LAST_JUZ_KEY = 'quran_juz_last_read';

const saveJuzBookmark = (juzNumber, surahNum, ayahNum, surahName) => {
  try {
    localStorage.setItem(LAST_JUZ_KEY, JSON.stringify({
      juzNumber, surahNum, ayahNum, surahName,
      timestamp: new Date().toISOString()
    }));
  } catch (e) { }
};

const getJuzBookmark = () => {
  try { const d = localStorage.getItem(LAST_JUZ_KEY); return d ? JSON.parse(d) : null; }
  catch { return null; }
};

const JuzReader = ({ juzNumber, darkMode, onBack }) => {
  const [verses, setVerses] = useState([]);
  const [surahs, setSurahs] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSurahNum, setCurrentSurahNum] = useState(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedBookmark, setSavedBookmark] = useState(null);
  const [bookmarkedVerse, setBookmarkedVerse] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const observer = useRef();

  const settings = getSettings();
  const theme = getReaderTheme(settings.readerTheme);
  const isDark = settings.readerTheme === 'dark' || settings.readerTheme === 'black';

  // Yer imi kontrol
  useEffect(() => {
    const bm = getJuzBookmark();
    if (bm && bm.juzNumber === juzNumber) {
      setSavedBookmark(bm);
      setBookmarkedVerse({ surah: bm.surahNum, ayah: bm.ayahNum });
      setShowResumePrompt(true);
      setTimeout(() => setShowResumePrompt(false), 30000);
    }
  }, [juzNumber]);

  useEffect(() => {
    const juzInfo = juzData[juzNumber];
    if (juzInfo) setCurrentSurahNum(juzInfo.start.surah);
  }, [juzNumber]);

  useEffect(() => {
    if (currentSurahNum && !surahs[currentSurahNum]) fetchSurah(currentSurahNum);
  }, [currentSurahNum]);

  const fetchSurah = async (surahNum) => {
    try {
      const [surahInfoRes, contentRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`),
        fetch(`https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${surahNum}`)
      ]);
      const surahInfoData = await surahInfoRes.json();
      const contentData = await contentRes.json();

      if (surahInfoData.code === 200) setSurahs(prev => ({ ...prev, [surahNum]: surahInfoData.data }));
      if (contentData.verses) {
        const ayahsWithContext = contentData.verses.map(v => ({
          ...v,
          verse_number: v.verse_number || (v.verse_key ? parseInt(v.verse_key.split(':')[1]) : 0),
          surah: { number: surahNum }
        }));
        setVerses(prev => [...prev, ...ayahsWithContext]);
      }
    } catch (error) { console.error(`Error fetching surah ${surahNum}:`, error); }
  };

  const lastAyahElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const lastVerse = verses[verses.length - 1];
        if (!lastVerse) return;
        const juzInfo = juzData[juzNumber];
        if (lastVerse.surah.number < juzInfo.end.surah) setCurrentSurahNum(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [verses, juzNumber]);

  useEffect(() => { setLoading(verses.length === 0); }, [verses]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleAyahBookmark = (surahNum, ayahNum) => {
    const surahName = surahs[surahNum]?.englishName || `Sure ${surahNum}`;
    saveJuzBookmark(juzNumber, surahNum, ayahNum, surahName);
    setBookmarkedVerse({ surah: surahNum, ayah: ayahNum });
    showToast(`📌 ${surahName} ${ayahNum}. ayet kaydedildi`);
  };

  const scrollToAyah = (surahNum, ayahNum) => {
    const el = document.getElementById(`ayah-${surahNum}-${ayahNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.backgroundColor = isDark ? '#065f4640' : '#d1fae580';
      setTimeout(() => { el.style.backgroundColor = 'transparent'; }, 2500);
    }
  };

  const resumeReading = () => {
    if (!savedBookmark) return;
    setShowResumePrompt(false);
    setTimeout(() => scrollToAyah(savedBookmark.surahNum, savedBookmark.ayahNum), 300);
  };

  const surahsToRender = verses.reduce((acc, verse) => {
    const surahNum = verse.surah.number;
    if (!acc[surahNum]) acc[surahNum] = [];
    acc[surahNum].push(verse);
    return acc;
  }, {});

  const isBookmarked = (surahNum, ayahNum) => {
    return bookmarkedVerse && bookmarkedVerse.surah === surahNum && bookmarkedVerse.ayah === ayahNum;
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', transition: 'background-color 0.3s' }}>

      {/* === HEADER === */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
        background: theme.bg, padding: '8px 5px',
        borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
      }}>
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', color: theme.text, fontSize: '24px', padding: '8px' }}>←</button>
        <h2 style={{ color: theme.text, margin: 0, fontSize: '18px' }}>Cüz {juzNumber}</h2>
        <div style={{ width: '40px' }}></div> {/* Denge için boşluk */}
      </div>

      {/* === DEVAM ET === */}
      {showResumePrompt && savedBookmark && (
        <div style={{
          margin: '8px 12px', padding: '12px 16px', borderRadius: '12px',
          backgroundColor: isDark ? '#1e3a2f' : '#ecfdf5',
          border: `1px solid ${isDark ? '#065f46' : '#a7f3d0'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669' }}>
              📌 {savedBookmark.surahName} {savedBookmark.ayahNum}. ayette kalmıştın
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setShowResumePrompt(false)} style={{
              padding: '6px 12px', borderRadius: '8px', border: 'none',
              backgroundColor: isDark ? '#374151' : '#e5e7eb', color: theme.text,
              fontSize: '12px', fontWeight: '600', cursor: 'pointer'
            }}>Kapat</button>
            <button onClick={resumeReading} style={{
              padding: '6px 12px', borderRadius: '8px', border: 'none',
              backgroundColor: '#059669', color: '#fff',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer'
            }}>Devam Et</button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: theme.sub }}>
          <div style={{ fontSize: '30px', marginBottom: '10px' }}>📖</div>
          Yükleniyor...
        </div>
      )}

      {/* === AYETLER === */}
      <div style={{ padding: '5px' }}>
        {Object.keys(surahsToRender).map((surahNum, index) => {
          const surahInfo = surahs[surahNum];
          const surahVerses = surahsToRender[surahNum];
          return (
            <div key={surahNum} data-surah-num={surahNum}>
              {surahInfo && <SurahHeader surah={surahInfo} darkMode={isDark} />}
              <div lang="ar" dir="rtl" style={{
                textAlign: 'justify',
                fontSize: `${settings.fontSize || 24}px`,
                lineHeight: settings.lineHeight || '2.8',
                fontFamily: "'Amiri', serif",
                color: theme.text,
                padding: '0 10px'
              }}>
                {surahVerses.map((verse, vIndex) => {
                  const sNum = parseInt(surahNum);
                  const aNum = verse.verse_number;
                  const marked = isBookmarked(sNum, aNum);
                  return (
                    <span
                      key={verse.verse_key || verse.id || vIndex}
                      id={`ayah-${sNum}-${aNum}`}
                      ref={index === Object.keys(surahsToRender).length - 1 && vIndex === surahVerses.length - 1 ? lastAyahElementRef : null}
                      style={{ transition: 'background-color 0.5s', borderRadius: '4px' }}
                    >
                      <span className="tajweed-text" dangerouslySetInnerHTML={{ __html: verse.text_uthmani_tajweed }} />
                      <span
                        onClick={() => handleAyahBookmark(sNum, aNum)}
                        style={{
                          color: marked ? '#fff' : '#059669',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          backgroundColor: marked ? '#059669' : 'transparent',
                          borderRadius: '6px',
                          padding: marked ? '1px 4px' : '0',
                          transition: 'all 0.3s'
                        }}
                      >﴿{aNum}﴾</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* === TOAST === */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: isDark ? '#065f46' : '#059669', color: '#fff',
          padding: '10px 20px', borderRadius: '25px', fontSize: '13px', fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 100, whiteSpace: 'nowrap'
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default JuzReader;
