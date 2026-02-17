import React, { useState, useEffect, useRef } from 'react';
import { getSettings, saveSettings, getReaderTheme } from '../../utils/settingsStorage.js';
import { saveReadingProgress, getLastReadPosition, isBookmarked, addBookmark, removeBookmark } from '../../utils/readingProgressStorage.js';
import { getAudio, downloadAudio, downloadSurah } from '../../utils/audioStorage.js';
import { getSurahText, downloadSurahText } from '../../utils/quranStorage.js';
import { startReadingSession, endReadingSession, incrementAyahRead } from '../../utils/statsStorage.js';
import AyahCard from './AyahCard';
import QuranSettings from './QuranSettings'; 
import SurahHeader from './SurahHeader'; 
import AppSettings from '../../utils/appSettingsPlugin.js';

const QuranReader = ({ surahNumber, darkMode, onBack }) => {
  const [surahData, setSurahData] = useState(null);
  const [allVerses, setAllVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(getSettings());
  const [playingAyah, setPlayingAyah] = useState(null);
  const [downloadMenu, setDownloadMenu] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [lastReadAyah, setLastReadAyah] = useState(null);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);

  const audioRef = useRef(null);
  const containerRef = useRef(null);

  // Seçili temayı al
  const theme = getReaderTheme(settings.readerTheme);

  // Ekranı açık tutma ayarı kontrolü
  useEffect(() => {
    if (settings.keepScreenOn) {
      AppSettings.setKeepScreenOn({ keepOn: true });
    } else {
      AppSettings.setKeepScreenOn({ keepOn: false });
    }

    return () => {
      AppSettings.setKeepScreenOn({ keepOn: false });
    };
  }, [settings.keepScreenOn]);

  // İstatistik Oturumu Yönetimi
  useEffect(() => {
    if (surahData) {
      startReadingSession(surahNumber, surahData.turkishName);
    }
    return () => {
      endReadingSession();
    };
  }, [surahNumber, surahData]);

  useEffect(() => {
    loadSurah(settings.translation);
    const lastRead = getLastReadPosition();
    if (lastRead && lastRead.surahNumber === surahNumber) {
      setLastReadAyah(lastRead.ayahNumber);
      setShowContinuePrompt(true);
    }
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [surahNumber]);

  const loadSurah = async (translationId) => {
    try {
      setLoading(true);
      const localData = await getSurahText(surahNumber);

      if (localData) {
        setAllVerses(localData.arabic.map((ayah, index) => ({
          number: ayah.numberInSurah,
          arabic: ayah.text,
          turkish: localData.translation[index].text,
          globalNumber: ayah.number
        })));

        const surahInfoRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
        const surahInfoData = await surahInfoRes.json();
        const data = surahInfoData.data;
        setSurahData({
          ...data,
          turkishName: data.englishName,
          ayahsCount: data.numberOfAyahs
        });
      } else {
        const editions = `quran-simple,${translationId}`;
        const [surahInfoRes, contentRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/${editions}`)
        ]);

        const surahInfoData = await surahInfoRes.json();
        const contentData = await contentRes.json();

        if (contentData.code === 200) {
          const data = surahInfoData.data;
          setSurahData({
            ...data,
            turkishName: data.englishName,
            ayahsCount: data.numberOfAyahs
          });

          const combined = contentData.data[0].ayahs.map((ayah, index) => ({
            number: ayah.numberInSurah,
            arabic: ayah.text,
            turkish: contentData.data[1].ayahs[index].text,
            globalNumber: ayah.number
          }));
          setAllVerses(combined);
          downloadSurahText(surahNumber, translationId);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToAyah = (ayahNumber) => {
    const el = document.querySelector(`[data-ayah-number="${ayahNumber}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Ayet okunduğunda istatistiği artır
      incrementAyahRead();
      saveReadingProgress(surahNumber, ayahNumber);
    }
  };

  const playAyah = async (ayahInSurah, globalNumber) => {
    if (playingAyah === globalNumber && audioRef.current) {
      audioRef.current.pause();
      setPlayingAyah(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();

    try {
      const reciter = settings.reciter || 'Alafasy_128kbps';
      let audioUrl = await getAudio(surahNumber, ayahInSurah, reciter);

      if (!audioUrl) {
        const sPadded = String(surahNumber).padStart(3, '0');
        const aPadded = String(ayahInSurah).padStart(3, '0');
        audioUrl = `https://everyayah.com/data/${reciter}/${sPadded}${aPadded}.mp3`;
      }

      const newAudio = new Audio(audioUrl);
      audioRef.current = newAudio;

      newAudio.play().then(() => {
        setPlayingAyah(globalNumber);
        scrollToAyah(ayahInSurah);
      }).catch(() => alert("Ses oynatılamadı."));

      newAudio.onended = () => {
        setPlayingAyah(null);
        if (audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl);

        if (settings.autoPlay) {
          const nextAyah = allVerses.find(v => v.number === ayahInSurah + 1);
          if (nextAyah) {
            playAyah(nextAyah.number, nextAyah.globalNumber);
          }
        }
      };
    } catch (e) {
      console.error("Çalma hatası:", e);
    }
  };

  const handleAyahPlayClick = async (ayah) => {
    if (playingAyah === ayah.globalNumber) {
      playAyah(ayah.number, ayah.globalNumber);
      return;
    }

    const reciter = settings.reciter || 'Alafasy_128kbps';
    const downloadedUrl = await getAudio(surahNumber, ayah.number, reciter);
    if (downloadedUrl) {
      if (downloadedUrl.startsWith('blob:')) URL.revokeObjectURL(downloadedUrl);
      playAyah(ayah.number, ayah.globalNumber);
    } else {
      setDownloadMenu(ayah);
    }
  };

  const handleDownloadAyah = async (ayah) => {
    setIsDownloading(true);
    setDownloadMenu(null);
    try {
      const reciter = settings.reciter || 'Alafasy_128kbps';
      await downloadAudio(surahNumber, ayah.number, (progress) => {
        setDownloadProgress(progress);
      }, reciter);
      playAyah(ayah.number, ayah.globalNumber);
    } catch (e) {
      alert("İndirme hatası oluştu.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleDownloadSurah = async () => {
    if (!surahData) return;
    if (!window.confirm(`${surahData.turkishName} suresindeki tüm ayetler indirilecek. Devam edilsin mi?`)) return;

    setIsDownloading(true);
    setDownloadMenu(null);
    try {
      const reciter = settings.reciter || 'Alafasy_128kbps';
      await downloadSurah(surahNumber, surahData.numberOfAyahs, (progress) => {
        setDownloadProgress(progress);
      }, reciter);
      alert(`✅ ${surahData.turkishName} suresi başarıyla indirildi.`);
    } catch (e) {
      alert("Sure indirilirken bir hata oluştu.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  if (showSettings) {
    return <QuranSettings darkMode={darkMode} settings={settings} onSettingsChange={(s) => { setSettings(s); saveSettings(s); if(s.translation !== settings.translation) loadSurah(s.translation); }} onBack={() => setShowSettings(false)} />;
  }

  const continueFromLastRead = () => {
    if (!lastReadAyah) return;
    setTimeout(() => {
      scrollToAyah(lastReadAyah);
      setShowContinuePrompt(false);
    }, 300);
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', transition: 'background-color 0.3s' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '35px 15px 15px 15px', backgroundColor: theme.bg, borderBottom: `1px solid ${settings.readerTheme === 'dark' || settings.readerTheme === 'black' ? '#374151' : '#e5e7eb'}`, transition: 'background-color 0.3s' }}>
        <button onClick={onBack} style={{ padding: '15px', background: 'none', border: 'none', fontSize: '26px', color: theme.text }}>←</button>
        <span style={{ fontWeight: 'bold', fontSize: '18px', color: theme.text }}>{surahData?.turkishName || "Kur'an"}</span>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => setShowSettings(true)} style={{ padding: '15px', background: 'none', border: 'none', fontSize: '26px', color: theme.text }}>⚙️</button>
        </div>
      </div>
      
      {isDownloading && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, backgroundColor: 'rgba(5, 150, 105, 0.95)', color: 'white', padding: '12px 20px', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
          ⏳ İndiriliyor: %{downloadProgress}
        </div>
      )}

      {showContinuePrompt && lastReadAyah && (
        <div style={{ position: 'sticky', top: '70px', zIndex: 90, margin: '10px 15px', padding: '12px 18px', background: darkMode ? 'linear-gradient(90deg, #059669, #047857)' : 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>📖 {lastReadAyah}. ayetten devam et</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={continueFromLastRead} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.95)', color: '#059669', fontWeight: 'bold', fontSize: '13px' }}>✓ Devam Et</button>
            <button onClick={() => setShowContinuePrompt(false)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '16px' }}>✕</button>
          </div>
        </div>
      )}

      {loading ? ( <div style={{ padding: '50px', textAlign: 'center', color: theme.text }}>Sure Yükleniyor...</div> ) : (
        <>
          <SurahHeader surah={surahData} darkMode={settings.readerTheme === 'dark' || settings.readerTheme === 'black'} />
          <div ref={containerRef} style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>
            {allVerses.map((ayah) => (
              <div key={ayah.globalNumber} data-ayah-number={ayah.number}>
                <AyahCard 
                  ayah={{ ...ayah, surahNumber }}
                  settings={settings} 
                  darkMode={settings.readerTheme === 'dark' || settings.readerTheme === 'black'}
                  surahName={surahData?.turkishName}
                  isPlaying={playingAyah === ayah.globalNumber} 
                  onPlayClick={() => handleAyahPlayClick(ayah)}
                  isBookmarked={isBookmarked(surahNumber, ayah.number)}
                  onBookmarkToggle={() => {
                    if (isBookmarked(surahNumber, ayah.number)) removeBookmark(surahNumber, ayah.number);
                    else addBookmark(surahNumber, ayah.number, surahData?.turkishName || '');
                    setAllVerses([...allVerses]);
                  }}
                  onNoteChange={() => setAllVerses([...allVerses])}
                  theme={theme}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {downloadMenu && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }} onClick={() => setDownloadMenu(null)}>
          <div style={{ backgroundColor: settings.readerTheme === 'dark' || settings.readerTheme === 'black' ? '#1f2937' : 'white', borderRadius: '20px', width: '100%', maxWidth: '320px', padding: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 5px 0', color: settings.readerTheme === 'dark' || settings.readerTheme === 'black' ? '#f3f4f6' : '#1f2937', textAlign: 'center' }}>{surahData?.turkishName} - Ayet {downloadMenu.number}</h3>
            <p style={{ color: settings.readerTheme === 'dark' || settings.readerTheme === 'black' ? '#f3f4f6' : '#1f2937', fontSize: '14px', textAlign: 'center', opacity: 0.8, marginBottom: '10px' }}>Bu ayet henüz indirilmemiş.</p>
            <button onClick={() => { playAyah(downloadMenu.number, downloadMenu.globalNumber); setDownloadMenu(null); }} style={{ padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#059669', color: 'white', fontWeight: 'bold', fontSize: '16px' }}>🌐 Online Dinle</button>
            <button onClick={() => handleDownloadAyah(downloadMenu)} style={{ padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: settings.readerTheme === 'dark' || settings.readerTheme === 'black' ? '#374151' : '#f3f4f6', color: settings.readerTheme === 'dark' || settings.readerTheme === 'black' ? '#f3f4f6' : '#1f2937', fontWeight: '600' }}>📥 Ayeti İndir ve Çal</button>
            <button onClick={handleDownloadSurah} style={{ padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: settings.readerTheme === 'dark' || settings.readerTheme === 'black' ? '#374151' : '#f3f4f6', color: settings.readerTheme === 'dark' || settings.readerTheme === 'black' ? '#f3f4f6' : '#1f2937', fontWeight: '600' }}>📂 Tüm Sureyi İndir</button>
            <button onClick={() => setDownloadMenu(null)} style={{ padding: '10px', marginTop: '5px', background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold' }}>✕ Vazgeç</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranReader;
