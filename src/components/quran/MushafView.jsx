import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSettings, getReaderTheme } from '../../utils/settingsStorage.js';

// Süslemeli Medine Mushafı sayfa URL'leri — birden fazla kaynak
const getPageUrls = (page) => {
  // Internet Archive: Quran Mushaf AlMadinah Hafs (süslemeli, yeşil çerçeveli)
  // Sayfa numarası 0-indexed (0000 = kapak, 0001 = 1. sayfa vb.)
  // Mushaf PDF'den çıkarılmış sayfalar — page=1 → index 2 (kapak + boş sayfa sonrası)
  const iaPage = String(page + 2).padStart(4, '0');
  
  return [
    // Internet Archive — BookReader API (süslemeli Medine Mushafı)
    `https://ia601507.us.archive.org/BookReader/BookReaderImages.php?zip=/1/items/quran-mushaf-almadinah-hafs/Quran-Mushaf-AlMadinah-Hafs_jp2.zip&file=Quran-Mushaf-AlMadinah-Hafs_jp2/Quran-Mushaf-AlMadinah-Hafs_${iaPage}.jp2&id=quran-mushaf-almadinah-hafs&scale=2&rotate=0`,
    // QuranHub Hafs (yedek)
    `https://raw.githubusercontent.com/QuranHub/quran-pages-images/main/hafs/${String(page).padStart(3, '0')}.png`,
    // GovarJabbar (son çare)
    `https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${String(page).padStart(3, '0')}.png`,
  ];
};

// Sure → Sayfa eşleştirmesi
const SURAH_START_PAGES = [
  1,1,2,50,77,106,128,151,177,187,208,221,235,249,255,262,267,282,293,
  312,322,332,342,350,359,367,377,385,392,396,404,411,415,418,428,434,
  440,446,453,458,467,477,483,489,495,499,502,507,511,515,518,520,523,
  526,528,531,534,537,542,545,549,551,553,554,556,558,560,562,564,566,
  568,570,572,574,575,577,578,580,581,583,585,586,587,587,589,590,591,
  591,592,593,594,594,595,596,596,597,598,598,599,599,600,600,601,601,
  601,602,602,602,603,603,603,604
];

const TOTAL_PAGES = 604;

const MushafView = ({ darkMode }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [imgSrc, setImgSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [goToInput, setGoToInput] = useState('');
  const [inputMode, setInputMode] = useState('page'); // 'page' veya 'surah'
  const [showControls, setShowControls] = useState(true);
  const urlIndexRef = useRef(0);

  const settings = getSettings();
  const theme = getReaderTheme(settings.readerTheme);
  const isDark = settings.readerTheme === 'dark' || settings.readerTheme === 'black';

  // Sayfa değiştiğinde
  useEffect(() => {
    urlIndexRef.current = 0;
    setLoading(true);
    setError(false);
    const urls = getPageUrls(currentPage);
    setImgSrc(urls[0]);
  }, [currentPage]);

  // Resim yüklenemezse sonraki URL
  const handleImageError = useCallback(() => {
    const urls = getPageUrls(currentPage);
    urlIndexRef.current += 1;
    if (urlIndexRef.current < urls.length) {
      setImgSrc(urls[urlIndexRef.current]);
    } else {
      setLoading(false);
      setError(true);
    }
  }, [currentPage]);

  const goTo = () => {
    const val = parseInt(goToInput);
    if (!val) return;
    if (inputMode === 'page' && val >= 1 && val <= TOTAL_PAGES) {
      setCurrentPage(val);
    } else if (inputMode === 'surah' && val >= 1 && val <= 114) {
      setCurrentPage(SURAH_START_PAGES[val - 1] || 1);
    }
    setGoToInput('');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') goTo(); };

  return (
    <div style={{
      backgroundColor: isDark ? '#1a1a2e' : '#f5f0e8',
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Üst Kontroller */}
      {showControls && (
        <div style={{
          padding: '10px 12px',
          backgroundColor: isDark ? '#16213e' : '#e8dcc8',
          borderBottom: `1px solid ${isDark ? '#2a2a4a' : '#d4c5a9'}`
        }}>
          {/* Sayfa / Sure Git */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isDark ? '#3a3a5e' : '#c4b896'}` }}>
              <button onClick={() => setInputMode('page')} style={{
                padding: '7px 12px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                backgroundColor: inputMode === 'page' ? '#8b6914' : 'transparent',
                color: inputMode === 'page' ? '#fff' : (isDark ? '#c4b896' : '#8b6914')
              }}>Sayfa</button>
              <button onClick={() => setInputMode('surah')} style={{
                padding: '7px 12px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                backgroundColor: inputMode === 'surah' ? '#8b6914' : 'transparent',
                color: inputMode === 'surah' ? '#fff' : (isDark ? '#c4b896' : '#8b6914')
              }}>Sure</button>
            </div>
            <input
              type="number"
              placeholder={inputMode === 'page' ? `1-${TOTAL_PAGES}` : '1-114'}
              value={goToInput}
              onChange={(e) => setGoToInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '8px',
                border: `1px solid ${isDark ? '#3a3a5e' : '#c4b896'}`,
                backgroundColor: isDark ? '#1a1a2e' : '#faf6ed',
                color: isDark ? '#e8dcc8' : '#4a3f2f', fontSize: '14px'
              }}
              min="1" max={inputMode === 'page' ? TOTAL_PAGES : 114}
            />
            <button onClick={goTo} style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              backgroundColor: '#8b6914', color: '#fff',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer'
            }}>Git</button>
          </div>
        </div>
      )}

      {/* Sayfa Görseli */}
      <div
        onClick={() => setShowControls(!showControls)}
        style={{
          flex: 1, display: 'flex', justifyContent: 'center',
          alignItems: 'flex-start', padding: '8px',
          minHeight: '450px', position: 'relative'
        }}
      >
        {loading && !error && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            color: isDark ? '#c4b896' : '#8b6914', textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📖</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Mushaf yükleniyor...</div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>Sayfa {currentPage}</div>
          </div>
        )}
        {error && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', color: isDark ? '#f87171' : '#dc2626'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>❌</div>
            <div>Sayfa yüklenemedi.</div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>İnternet bağlantınızı kontrol edin.</div>
            <button onClick={() => {
              urlIndexRef.current = 0; setError(false); setLoading(true);
              setImgSrc(getPageUrls(currentPage)[0]);
            }} style={{
              marginTop: '15px', padding: '10px 24px', borderRadius: '8px',
              border: 'none', backgroundColor: '#8b6914', color: '#fff', fontWeight: '700'
            }}>Tekrar Dene</button>
          </div>
        )}
        <img
          src={imgSrc}
          alt={`Sayfa ${currentPage}`}
          onLoad={() => { setLoading(false); setError(false); }}
          onError={handleImageError}
          style={{
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 180px)',
            height: 'auto',
            borderRadius: '6px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            display: loading || error ? 'none' : 'block',
            filter: isDark ? 'brightness(0.85)' : 'none'
          }}
        />
      </div>

      {/* Alt Navigasyon */}
      <div style={{
        backgroundColor: isDark ? '#16213e' : '#e8dcc8',
        borderTop: `1px solid ${isDark ? '#2a2a4a' : '#d4c5a9'}`,
        padding: '10px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            padding: '10px 18px', borderRadius: '10px', border: 'none',
            backgroundColor: currentPage <= 1 ? (isDark ? '#1a1a2e' : '#d4c5a9') : '#8b6914',
            color: currentPage <= 1 ? (isDark ? '#3a3a5e' : '#a09070') : '#fff',
            fontWeight: '700', fontSize: '14px', cursor: currentPage <= 1 ? 'default' : 'pointer'
          }}>◀ Önceki</button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontWeight: '800', fontSize: '18px',
            color: isDark ? '#c4b896' : '#4a3f2f',
            fontFamily: 'serif'
          }}>
            {currentPage} / {TOTAL_PAGES}
          </div>
          <div style={{ fontSize: '10px', color: isDark ? '#8b7a50' : '#8b6914', marginTop: '2px' }}>
            📖 Medine Mushafı
          </div>
        </div>

        <button onClick={() => currentPage < TOTAL_PAGES && setCurrentPage(currentPage + 1)}
          disabled={currentPage >= TOTAL_PAGES}
          style={{
            padding: '10px 18px', borderRadius: '10px', border: 'none',
            backgroundColor: currentPage >= TOTAL_PAGES ? (isDark ? '#1a1a2e' : '#d4c5a9') : '#8b6914',
            color: currentPage >= TOTAL_PAGES ? (isDark ? '#3a3a5e' : '#a09070') : '#fff',
            fontWeight: '700', fontSize: '14px', cursor: currentPage >= TOTAL_PAGES ? 'default' : 'pointer'
          }}>Sonraki ▶</button>
      </div>
    </div>
  );
};

export default MushafView;
