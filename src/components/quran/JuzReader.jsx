import React, { useState, useEffect, useRef, useCallback } from 'react';
import { juzData } from '../../data/juz-data.js';
import { getSettings, getReaderTheme } from '../../utils/settingsStorage.js';
import SurahHeader from './SurahHeader'; 

const JuzReader = ({ juzNumber, darkMode, onBack }) => {
  const [verses, setVerses] = useState([]);
  const [surahs, setSurahs] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSurahNum, setCurrentSurahNum] = useState(null);
  const observer = useRef();

  // Kuran okuyucu ayarlarını al — tema, font boyutu vs.
  const settings = getSettings();
  const theme = getReaderTheme(settings.readerTheme);
  const isDark = settings.readerTheme === 'dark' || settings.readerTheme === 'black';

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
        const ayahsWithContext = contentData.verses.map(v => ({...v, surah: { number: surahNum } }));
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

  const surahsToRender = verses.reduce((acc, verse) => {
    const surahNum = verse.surah.number;
    if (!acc[surahNum]) acc[surahNum] = [];
    acc[surahNum].push(verse);
    return acc;
  }, {});

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', transition: 'background-color 0.3s' }}>
      {/* Sticky Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
        background: theme.bg,
        padding: '10px 5px',
        borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
      }}>
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', color: theme.text, fontSize: '24px', padding: '10px' }}>←</button>
        <h2 style={{ color: theme.text, margin: 0, fontSize: '20px' }}>Cüz {juzNumber}</h2>
        <div style={{width: '44px'}}></div>
      </div>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: theme.sub }}>
          <div style={{ fontSize: '30px', marginBottom: '10px' }}>📖</div>
          Yükleniyor...
        </div>
      )}

      {/* Page Content */}
      <div style={{ padding: '5px' }}>
        {Object.keys(surahsToRender).map((surahNum, index) => {
          const surahInfo = surahs[surahNum];
          const surahVerses = surahsToRender[surahNum];
          return (
            <div key={surahNum}>
              {surahInfo && <SurahHeader surah={surahInfo} darkMode={isDark} />}
              <div lang="ar" dir="rtl" style={{
                textAlign: 'justify',
                fontSize: `${settings.fontSize || 24}px`,
                lineHeight: settings.lineHeight || '2.8',
                fontFamily: "'Amiri', serif",
                color: theme.text,
                padding: '0 10px'
              }}>
                {surahVerses.map((verse, vIndex) => (
                  <span key={verse.id} ref={index === Object.keys(surahsToRender).length - 1 && vIndex === surahVerses.length - 1 ? lastAyahElementRef : null}>
                    <span className="tajweed-text" dangerouslySetInnerHTML={{ __html: verse.text_uthmani_tajweed }} />
                    <span style={{ color: '#059669', fontWeight: 'bold' }}>﴿{verse.verse_number}﴾</span>
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default JuzReader;
