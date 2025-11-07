// src/components/home/HomePage.js
import React, { useState, useEffect } from 'react';
import {
  getPrayerTimesByCoordinates,
  getUserLocation,
  getNextPrayer,
  isPrayerTimePassed
} from '../../utils/prayerTimesApi';

// Günlük Ayet ve Hadis Verileri
const dailyVerses = [
  {
    arabic: "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
    turkish: "Rahman ve Rahim olan Allah'ın adıyla...",
    surah: "Fâtiha Suresi",
    ayah: 1
  },
  {
    arabic: "وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ",
    turkish: "Kullarım sana Beni sorduğunda, şüphesiz Ben onlara çok yakınım.",
    surah: "Bakara Suresi",
    ayah: 186
  },
  {
    arabic: "فَاذۡكُرُونِىٓ أَذۡكُرۡكُمۡ وَٱشۡكُرُواْ لِى وَلَا تَكۡفُرُونِ",
    turkish: "Beni anın ki, Ben de sizi anayım. Bana şükredin, nankörlük etmeyin.",
    surah: "Bakara Suresi",
    ayah: 152
  },
  {
    arabic: "إِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرًا",
    turkish: "Şüphesiz her güçlükle birlikte bir kolaylık vardır.",
    surah: "İnşirah Suresi",
    ayah: 6
  },
  {
    arabic: "وَهُوَ مَعَكُمۡ أَيۡنَ مَا كُنتُمۡ",
    turkish: "Nerede olursanız olun O sizinle beraberdir.",
    surah: "Hadid Suresi",
    ayah: 4
  },
  {
    arabic: "فَإِنَّ ٱللَّهَ غَفُورٌۭ رَّحِيمٌۭ",
    turkish: "Şüphesiz Allah çok bağışlayan ve çok merhamet edendir.",
    surah: "Bakara Suresi",
    ayah: 173
  },
  {
    arabic: "وَٱللَّهُ خَيۡرٌۭ حَٰفِظًۭا وَهُوَ أَرۡحَمُ ٱلرَّٰحِمِينَ",
    turkish: "Allah en hayırlı koruyucudur. O, merhametlilerin en merhametlisidir.",
    surah: "Yusuf Suresi",
    ayah: 64
  }
];

const dailyHadiths = [
  {
    text: "Müslüman, insanların elinden ve dilinden emin oldukları kimsedir.",
    source: "Buhari, İman 4; Müslim, İman 64-65"
  },
  {
    text: "Güzel ahlak, imanın en ağır basanıdır.",
    source: "Ebu Davud, Sünnet 15"
  },
  {
    text: "Allah'ın rızasını kazanmak için kardeşine yardım eden kimseye, Allah da yardım eder.",
    source: "Müslim, Birr 58"
  },
  {
    text: "İnsanların hayırlısı, insanlara faydalı olandır.",
    source: "Kenzü'l-Ummal 43519"
  },
  {
    text: "Başkalarına dilediğini kendin için de dile, mümin olursun.",
    source: "Tirmizi, Kıyamet 59"
  },
  {
    text: "Güçlü olan, güreşte rakibini yenen değil, öfkelendiğinde nefsine hakim olan kişidir.",
    source: "Buhari, Edeb 76; Müslim, Birr 107-108"
  },
  {
    text: "Kolaylaştırınız, zorlaştırmayınız. Müjdeleyiniz, nefret ettirmeyiniz.",
    source: "Buhari, İlim 11; Müslim, Cihad 6"
  }
];

// İslami Önemli Günler
const islamicDates = [
  { hijri: "1 Muharrem", name: "Hicri Yılbaşı" },
  { hijri: "10 Muharrem", name: "Aşure Günü" },
  { hijri: "12 Rebiülevvel", name: "Mevlid Kandili" },
  { hijri: "27 Recep", name: "Regaib Kandili" },
  { hijri: "15 Şaban", name: "Berat Kandili" },
  { hijri: "1 Ramazan", name: "Ramazan Başlangıcı" },
  { hijri: "27 Ramazan", name: "Kadir Gecesi" },
  { hijri: "1 Şevval", name: "Ramazan Bayramı" },
  { hijri: "9 Zilhicce", name: "Arefe Günü" },
  { hijri: "10 Zilhicce", name: "Kurban Bayramı" }
];

const HomePage = ({ darkMode, onNavigate }) => {
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [dailyVerse, setDailyVerse] = useState(null);
  const [dailyHadith, setDailyHadith] = useState(null);
  const [hijriDate, setHijriDate] = useState('');

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadPrayerTimesWithCache();
    loadDailyContent();
    calculateHijriDate();
  }, []);

  useEffect(() => {
    // Geri sayımı her saniye güncelle
    if (nextPrayer && timings) {
      updateCountdown(); // İlk güncelleme
      
      const interval = setInterval(() => {
        updateCountdown();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [nextPrayer, timings]);

  // Cache ile namaz vakitlerini yükle
  const loadPrayerTimesWithCache = async () => {
    try {
      const today = new Date().toDateString();
      const cachedData = localStorage.getItem('prayerTimesCache');
      
      if (cachedData) {
        const { date, timings: cachedTimings } = JSON.parse(cachedData);
        
        // Eğer bugünün verisi varsa cache'den kullan
        if (date === today) {
          setTimings(cachedTimings);
          setNextPrayer(getNextPrayer(cachedTimings));
          setLoading(false);
          return;
        }
      }
      
      // Cache yoksa veya eski ise API'den çek
      await loadPrayerTimes();
    } catch (error) {
      console.error('Cache okuma hatası:', error);
      await loadPrayerTimes();
    }
  };

  // Hicri tarihi hesapla (basit yaklaşım)
  const calculateHijriDate = () => {
    const gregorianDate = new Date();
    // Yaklaşık hesaplama: Miladi - 622 yıl, ardından 354/365 oranı
    const hijriYear = Math.floor((gregorianDate.getFullYear() - 622) * 1.030684);
    
    const islamicMonths = [
      "Muharrem", "Safer", "Rebiülevvel", "Rebiülahir",
      "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban",
      "Ramazan", "Şevval", "Zilkade", "Zilhicce"
    ];
    
    // Basit ay hesaplama
    const dayOfYear = Math.floor((gregorianDate - new Date(gregorianDate.getFullYear(), 0, 0)) / 86400000);
    const hijriMonth = Math.floor((dayOfYear % 354) / 29.5);
    const hijriDay = Math.floor((dayOfYear % 354) % 29.5) + 1;
    
    setHijriDate(`${hijriDay} ${islamicMonths[hijriMonth]} ${hijriYear}`);
  };

  // Geri sayım hesapla
  const updateCountdown = () => {
    if (!nextPrayer || !nextPrayer.time) {
      setCountdown('Hesaplanıyor...');
      return;
    }

    const now = new Date();
    const [hours, minutes] = nextPrayer.time.split(':').map(Number);
    
    let targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);
    
    // Eğer vakit geçmişse veya yarına aitse, bir gün ekle
    if (targetTime <= now || nextPrayer.tomorrow) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const diff = targetTime - now;
    
    if (diff <= 0) {
      setCountdown('Vakit girdi');
      return;
    }
    
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);
    
    setCountdown(`${hoursLeft}s ${minutesLeft}d ${secondsLeft}sn`);
  };

  const loadDailyContent = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    
    const verseIndex = dayOfYear % dailyVerses.length;
    const hadithIndex = dayOfYear % dailyHadiths.length;
    
    setDailyVerse(dailyVerses[verseIndex]);
    setDailyHadith(dailyHadiths[hadithIndex]);
  };

  const loadPrayerTimes = async () => {
    try {
      const coords = await getUserLocation();
      const result = await getPrayerTimesByCoordinates(
        coords.latitude,
        coords.longitude
      );

      if (result.success) {
        setTimings(result.timings);
        setNextPrayer(getNextPrayer(result.timings));
        
        // Bugünün verisini cache'e kaydet
        const today = new Date().toDateString();
        localStorage.setItem('prayerTimesCache', JSON.stringify({
          date: today,
          timings: result.timings
        }));
      }
    } catch (error) {
      console.error('Namaz vakitleri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Hoşgeldin Mesajı */}
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          color: '#059669',
          marginBottom: '10px',
          margin: 0
        }}>
          🕌 Kuran-ı Kerim
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: textSec,
          margin: '10px 0 0 0'
        }}>
          {new Date().toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* İslami Takvim */}
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderLeft: '4px solid #8b5cf6'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          color: '#8b5cf6',
          margin: '0 0 10px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🌙 İslami Takvim
        </h3>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: text,
          marginBottom: '5px'
        }}>
          {hijriDate}
        </div>
        <div style={{
          fontSize: '13px',
          color: textSec,
          fontStyle: 'italic'
        }}>
          Yaklaşık Hicri Tarih
        </div>
      </div>

      {/* Bir Sonraki Vakit + Geri Sayım */}
      {nextPrayer && timings && (
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          borderRadius: '16px',
          padding: '30px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(5,150,105,0.3)',
          color: 'white'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.9 }}>
            {nextPrayer.tomorrow ? 'Yarın' : 'Bir Sonraki Vakit'}
          </div>
          <div style={{ fontSize: '52px', fontWeight: 'bold', marginBottom: '5px' }}>
            {nextPrayer.time}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
            {nextPrayer.name}
          </div>
          
          {/* GERİ SAYIM */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '15px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>
              Kalan Süre
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 'bold',
              fontFamily: 'monospace',
              letterSpacing: '2px'
            }}>
              {countdown || 'Hesaplanıyor...'}
            </div>
          </div>

          {/* Namaz Vakitleri Sayfasına Git */}
          <button
            onClick={() => onNavigate('prayerTimes')}
            style={{
              marginTop: '20px',
              padding: '12px 30px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            📅 Tüm Vakitleri Gör
          </button>
        </div>
      )}

      {/* Hızlı Erişim Butonları */}
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '20px', 
          color: text,
          margin: '0 0 15px 0'
        }}>
          ⚡ Hızlı Erişim
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '10px'
        }}>
          <QuickButton 
            icon="📖" 
            text="Kuran Oku" 
            darkMode={darkMode}
            onClick={() => onNavigate('quran')}
          />
          <QuickButton 
            icon="✨" 
            text="Esmaül Hüsna" 
            darkMode={darkMode}
            onClick={() => onNavigate('esma')}
          />
          <QuickButton 
            icon="⭐" 
            text="Yer İmleri" 
            darkMode={darkMode}
            onClick={() => onNavigate('bookmarks')}
          />
          <QuickButton 
            icon="🔍" 
            text="Ayet Ara" 
            darkMode={darkMode}
            onClick={() => onNavigate('search')}
          />
          <QuickButton 
            icon="🧭" 
            text="Kıble" 
            darkMode={darkMode}
            onClick={() => onNavigate('qibla')}
          />
          <QuickButton 
            icon="📝" 
            text="Notlarım" 
            darkMode={darkMode}
            onClick={() => onNavigate('notes')}
          />
        </div>
      </div>

      {/* Günün Ayeti */}
      {dailyVerse && (
        <div style={{
          backgroundColor: cardBg,
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #059669'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            color: '#059669',
            margin: '0 0 15px 0'
          }}>
            📜 Günün Ayeti
          </h3>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.8',
            color: text,
            textAlign: 'right',
            direction: 'rtl',
            marginBottom: '15px',
            fontWeight: '600'
          }}>
            {dailyVerse.arabic}
          </p>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: text,
            margin: 0
          }}>
            {dailyVerse.turkish}
          </p>
          <div style={{
            marginTop: '15px',
            fontSize: '13px',
            color: textSec,
            textAlign: 'right'
          }}>
            {dailyVerse.surah}, {dailyVerse.ayah}. Ayet
          </div>
        </div>
      )}

      {/* Günün Hadisi */}
      {dailyHadith && (
        <div style={{
          backgroundColor: cardBg,
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            color: '#f59e0b',
            margin: '0 0 15px 0'
          }}>
            💬 Günün Hadisi
          </h3>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.8',
            color: text,
            fontStyle: 'italic',
            marginBottom: '15px'
          }}>
            "{dailyHadith.text}"
          </p>
          <div style={{
            marginTop: '15px',
            fontSize: '13px',
            color: textSec,
            textAlign: 'right'
          }}>
            {dailyHadith.source}
          </div>
        </div>
      )}
    </div>
  );
};

// Hızlı Erişim Butonu
const QuickButton = ({ icon, text, darkMode, onClick }) => (
  <button 
    onClick={onClick}
    style={{
      padding: '15px',
      backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#059669';
      e.target.style.color = 'white';
      e.target.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = darkMode ? '#4b5563' : '#f3f4f6';
      e.target.style.color = darkMode ? '#f3f4f6' : '#1f2937';
      e.target.style.transform = 'translateY(0)';
    }}
  >
    <span style={{ fontSize: '20px' }}>{icon}</span>
    <span>{text}</span>
  </button>
);

export default HomePage;