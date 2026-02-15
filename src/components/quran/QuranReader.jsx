import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { getSettings, saveSettings } from '../../utils/settingsStorage.js';
import AyahCard from './AyahCard';
import QuranSettings from './QuranSettings'; 
import SurahHeader from './SurahHeader'; 

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

  const audioRef = useRef(null);
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  useEffect(() => {
    fetchSurah(settings.translation);
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [surahNumber]);

  const fetchSurah = async (translationId) => {
    try {
      setLoading(true);
      const editions = `quran-simple,${translationId}`;
      const [surahInfoRes, contentRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/${editions}`)
      ]);
      const surahInfoData = await surahInfoRes.json();
      const contentData = await contentRes.json();
      if (contentData.code === 200) {
        setSurahData(surahInfoData.data);
        const combined = contentData.data[0].ayahs.map((ayah, index) => ({
          number: ayah.numberInSurah,
          arabic: ayah.text,
          turkish: contentData.data[1].ayahs[index].text,
          globalNumber: ayah.number
        }));
        setAllVerses(combined);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const getAudioUrl = (ayahInSurah) => {
    const sPadded = String(surahNumber).padStart(3, '0');
    const aPadded = String(ayahInSurah).padStart(3, '0');
    return `https://everyayah.com/data/${settings.reciter || 'Alafasy_128kbps'}/${sPadded}${aPadded}.mp3`;
  };

  const getSurahAudioUrl = () => {
    const sPadded = String(surahNumber).padStart(3, '0');
    // Sure indirme sunucuları ve doğru klasör yapıları
    const reciterMap = {
      'Alafasy_128kbps': 'https://server7.mp3quran.net/alafasi',
      'Abdul_Basit_Murattal_192kbps': 'https://server7.mp3quran.net/basit',
      'Abdurrahmaan_As-Sudais_192kbps': 'https://server11.mp3quran.net/sds',
      'Maher_AlMuaiqly_128kbps': 'https://server12.mp3quran.net/maher',
      'Ghamadi_40kbps': 'https://server7.mp3quran.net/s_ghamidi'
    };
    const baseUrl = reciterMap[settings.reciter] || 'https://server7.mp3quran.net/alafasi';
    return `${baseUrl}/${sPadded}.mp3`;
  };

  const playAyah = (ayahInSurah, globalNumber) => {
    if (playingAyah === globalNumber && audioRef.current) {
      audioRef.current.pause();
      setPlayingAyah(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const newAudio = new Audio(getAudioUrl(ayahInSurah));
    audioRef.current = newAudio;
    newAudio.play().then(() => setPlayingAyah(globalNumber)).catch(() => alert("Ses oynatılamadı."));
    newAudio.onended = () => setPlayingAyah(null);
  };

  const downloadAndSave = async (url, fileName) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      // BUILD HATASINI ÖNLEYEN DİNAMİK YAPI
      let Filesystem, Directory;
      try {
        const fsModule = '@capacitor/filesystem';
        const mod = await import(/* @vite-ignore */ fsModule);
        Filesystem = mod.Filesystem;
        Directory = mod.Directory;
      } catch (e) {
        console.warn("Filesystem paketi yüklü değil, tarayıcıya yönlendiriliyor.");
        window.open(url, '_system');
        return;
      }

      if (!Capacitor.isNativePlatform()) {
        window.open(url, '_blank');
        return;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Dosya bulunamadı (404)");

      const reader = response.body.getReader();
      const contentLength = +response.headers.get('Content-Length');
      let receivedLength = 0;
      let chunks = [];

      while(true) {
        const {done, value} = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        setDownloadProgress(Math.round((receivedLength / contentLength) * 100));
      }

      const blob = new Blob(chunks);
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });

      // Klasör: EzanVakti/Kuran
      await Filesystem.mkdir({ path: 'EzanVakti/Kuran', directory: Directory.ExternalStorage, recursive: true }).catch(() => {});
      await Filesystem.writeFile({
        path: `EzanVakti/Kuran/${fileName}`,
        data: base64Data,
        directory: Directory.ExternalStorage
      });

      alert(`Dosya indirildi: EzanVakti/Kuran/${fileName}`);
    } catch (e) {
      console.error(e);
      window.open(url, '_system');
    } finally {
      setIsDownloading(false);
      setDownloadMenu(null);
    }
  };

  if (showSettings) {
    return <QuranSettings darkMode={darkMode} settings={settings} onSettingsChange={(s) => { setSettings(s); saveSettings(s); if(s.translation !== settings.translation) fetchSurah(s.translation); }} onBack={() => setShowSettings(false)} />;
  }

  return (
    <div style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb', minHeight: '100vh' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '35px 15px 15px 15px', backgroundColor: darkMode ? '#1f2937' : '#ffffff', borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
        <button onClick={onBack} style={{ padding: '15px', background: 'none', border: 'none', fontSize: '26px', color: text }}>←</button>
        <span style={{ fontWeight: 'bold', fontSize: '18px', color: text }}>{surahData?.turkishName || "Kur'an"}</span>
        <button onClick={() => setShowSettings(true)} style={{ padding: '15px', background: 'none', border: 'none', fontSize: '26px', color: text }}>⚙️</button>
      </div>

      {loading ? ( <div style={{ padding: '50px', textAlign: 'center', color: text }}>Sure Yükleniyor...</div> ) : (
        <>
          <SurahHeader surah={surahData} darkMode={darkMode} />
          <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>
            {allVerses.map((ayah) => (
              <AyahCard key={ayah.globalNumber} ayah={ayah} settings={settings} darkMode={darkMode} isPlaying={playingAyah === ayah.globalNumber} onPlayClick={() => setDownloadMenu(ayah)} />
            ))}
          </div>
        </>
      )}

      {downloadMenu && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }} onClick={() => !isDownloading && setDownloadMenu(null)}>
          <div style={{ backgroundColor: darkMode ? '#1f2937' : 'white', borderRadius: '20px', width: '100%', maxWidth: '320px', padding: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 5px 0', color: text, textAlign: 'center' }}>{surahData?.turkishName}</h3>
            <button onClick={() => { playAyah(downloadMenu.number, downloadMenu.globalNumber); setDownloadMenu(null); }} style={{ padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#059669', color: 'white', fontWeight: 'bold', fontSize: '16px' }}>🔊 Dinle (Ayet {downloadMenu.number})</button>
            <button onClick={() => downloadAndSave(getAudioUrl(downloadMenu.number), `${surahData.turkishName}_Ayet_${downloadMenu.number}.mp3`)} disabled={isDownloading} style={{ padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: darkMode ? '#374151' : '#f3f4f6', color: text }}>
              {isDownloading ? `📥 %${downloadProgress}` : '📥 Ayeti İndir'}
            </button>
            <button onClick={() => downloadAndSave(getSurahAudioUrl(), `${surahData.turkishName}_Tam.mp3`)} disabled={isDownloading} style={{ padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: darkMode ? '#374151' : '#f3f4f6', color: text }}>
              {isDownloading ? `📥 %${downloadProgress}` : '📂 Sureyi İndir'}
            </button>
            <button onClick={() => setDownloadMenu(null)} disabled={isDownloading} style={{ padding: '10px', marginTop: '5px', background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold' }}>Vazgeç</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranReader;
