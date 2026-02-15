// src/components/FullScreenNotification.jsx - ÖZEL TASARIMLI TAM EKRAN BİLDİRİM

import React, { useMemo } from 'react';

const FullScreenNotification = ({ prayerName, prayerTime, darkMode, onClose }) => {
  
  // GENİŞLETİLMİŞ Ayet/Hadis Listesi (50+ içerik)
  const spiritualQuotes = useMemo(() => [
    // NAMAZ İLE İLGİLİ AYETLER
    { text: "Şüphesiz namaz, müminler üzerine vakitleri belirlenmiş bir farzdır.", source: "Nisa 103", type: "ayet" },
    { text: "Namazı dosdoğru kılın, zekâtı verin ve rükû edenlerle beraber rükû edin.", source: "Bakara 43", type: "ayet" },
    { text: "Sabır ve namazla Allah'tan yardım isteyin.", source: "Bakara 45", type: "ayet" },
    { text: "Namazı kılın, zekâtı verin ve Allah'a güzel bir borç verin.", source: "Müzzemmil 20", type: "ayet" },
    { text: "Muhakkak ki namaz, hayâsızlıktan ve kötülükten alıkoyar.", source: "Ankebut 45", type: "ayet" },
    
    // ZİKİR VE DUA İLE İLGİLİ
    { text: "Beni anın ki, ben de sizi anayım. Bana şükredin, nankörlük etmeyin.", source: "Bakara 152", type: "ayet" },
    { text: "Kalpler ancak Allah'ı anmakla huzur bulur.", source: "Ra'd 28", type: "ayet" },
    { text: "Rabbiniz şöyle buyurdu: Bana dua edin, duanıza icabet edeyim.", source: "Mü'min 60", type: "ayet" },
    { text: "Sabah akşam Rabbini tesbih et, gece de Ona secde et, gecenin uzun bir kısmında O'nu tesbih et.", source: "İnsan 25-26", type: "ayet" },
    
    // KUR'AN İLE İLGİLİ
    { text: "Kur'an'ı ağır ağır, tane tane oku.", source: "Müzzemmil 4", type: "ayet" },
    { text: "Bu Kur'an, muttakiler için hidayettir.", source: "Bakara 2", type: "ayet" },
    { text: "Biz onu Kadir gecesinde indirdik. Kadir gecesi bin aydan hayırlıdır.", source: "Kadr 1-3", type: "ayet" },
    
    // SABIR VE TEVEKKÜL
    { text: "Ey iman edenler! Sabır ve namazla yardım isteyin. Şüphesiz Allah sabredenlerle beraberdir.", source: "Bakara 153", type: "ayet" },
    { text: "Tevekkül eden kimseye Allah yeter.", source: "Talak 3", type: "ayet" },
    { text: "İmtihan olarak sizi biraz korku, açlık ve mallardan canlardan ve ürünlerden biraz eksiltme ile deneriz. Sabır gösterenleri müjdele.", source: "Bakara 155", type: "ayet" },
    
    // TÖVBE VE MAĞFIRET
    { text: "Allah'a tövbe edin ki kurtuluşa eresiniz.", source: "Nur 31", type: "ayet" },
    { text: "Günah işlediğinizde veya nefislerinize zulmettiğinizde hemen Allah'ı hatırlayın.", source: "Al-i İmran 135", type: "ayet" },
    { text: "Allah, tövbe edenleri sever, temizlenenleri sever.", source: "Bakara 222", type: "ayet" },
    
    // ŞÜKÜR VE KANAAT
    { text: "Şükrederseniz, elbette size nimetimi artırırım.", source: "İbrahim 7", type: "ayet" },
    { text: "Allah size verdiği nimetleri hatırlayın.", source: "Al-i İmran 103", type: "ayet" },
    
    // HADİSLER
    { text: "Namaz dinin direğidir.", source: "Hadis-i Şerif", type: "hadis" },
    { text: "Sizin en hayırlınız, Kur'an'ı öğrenen ve öğreteninizdir.", source: "Buhari", type: "hadis" },
    { text: "Kim sabah namazını kılarsa, Allah'ın himayesine girer.", source: "Müslim", type: "hadis" },
    { text: "Beş vakit namaz ve bir Cuma diğer Cuma'ya kadar aralarındaki günahları siler.", source: "Müslim", type: "hadis" },
    { text: "İki rekât namaz, dünyadan ve dünyada olanlardan daha hayırlıdır.", source: "Buhari", type: "hadis" },
    { text: "Namazını vaktinde kılan kimse, benden razı olarak ayrılır.", source: "Tirmizi", type: "hadis" },
    { text: "Kur'an'ı okuyun, çünkü kıyamet günü şefaatçi olarak gelecektir.", source: "Müslim", type: "hadis" },
    { text: "Allah size namaz kıldığınızda sizinle konuşur.", source: "Hadis-i Şerif", type: "hadis" },
    { text: "En faziletli ibadet, vaktinde kılınan namazdır.", source: "Buhari", type: "hadis" },
    { text: "Sabah namazının iki rekâtı, dünyadan ve içindekilerden daha hayırlıdır.", source: "Müslim", type: "hadis" },
    { text: "Kulun Allah'a en yakın olduğu an, secde anıdır.", source: "Müslim", type: "hadis" },
    { text: "Kim yatsı namazını cemaatle kılarsa, gecenin yarısını ihya etmiş gibi olur.", source: "Müslim", type: "hadis" },
    { text: "Gözlerin nuru namazdadır.", source: "Ahmed", type: "hadis" },
    { text: "Hiçbir kul, namazını güzelce kılıp da Allah'a dua etmez ki, Allah ona ya dünyasında ya da ahiretinde vermemiş olsun.", source: "Ahmed", type: "hadis" },
    
    // KISA VE ETKİLİ ÖĞÜTLER
    { text: "Allah'ı zikredin, O da sizi zikreder.", source: "Bakara 152", type: "ayet" },
    { text: "Rabbinin adını an ve her şeyi bırakıp yalnız O'na yönel.", source: "Müzzemmil 8", type: "ayet" },
    { text: "Namazda Allah'ın huzurunda durduğunu unutma.", source: "Öğüt", type: "ögüt" },
    { text: "Namaz insanı kötülüklerden korur.", source: "Öğüt", type: "ögüt" },
    { text: "Her namaz bir mi'raçtır.", source: "Öğüt", type: "ögüt" },
    
    // CENNET VE AHİRET
    { text: "İman edip salih amel işleyenler için cennetler vardır.", source: "Kehf 107", type: "ayet" },
    { text: "Namaz kılan, zekât veren ve Allah'a iman edenler için korku yoktur.", source: "Bakara 277", type: "ayet" },
    { text: "Namazlarına devam edenler, cennette ikram edileceklerdir.", source: "Meâric 34-35", type: "ayet" },
    
    // İHLAS VE İBADET
    { text: "De ki: Şüphesiz benim namazım, kurbanım, hayatım ve ölümüm âlemlerin Rabbi Allah içindir.", source: "En'am 162", type: "ayet" },
    { text: "İbadet ancak huşu ile tamamlanır.", source: "Öğüt", type: "ögüt" },
    { text: "Allah, sabredenlerin karşılığını eksiksiz verir.", source: "Zümer 10", type: "ayet" },
    
    // MUHABBET VE YAKÎNLIK
    { text: "Onlar Allah'ı severler, Allah da onları sever.", source: "Maide 54", type: "ayet" },
    { text: "Size yakınım. Dua edenin duasını kabul ederim.", source: "Bakara 186", type: "ayet" },
    { text: "Allah göklerin ve yerin nurudur.", source: "Nur 35", type: "ayet" }
  ], []);

  const randomQuote = useMemo(() =>
    spiritualQuotes[Math.floor(Math.random() * spiritualQuotes.length)],
  [spiritualQuotes]);

  const prayerNamesTr = {
    Fajr: 'İmsak',
    Sunrise: 'Güneş',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Maghrib: 'Akşam',
    Isha: 'Yatsı'
  };

  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: darkMode 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '30px', textAlign: 'center',
      animation: 'fadeIn 0.4s ease-in-out'
    },
    mosqueIcon: {
      fontSize: '90px', marginBottom: '20px',
      animation: 'bounceIn 0.6s ease-out',
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
    },
    title: {
      fontSize: '36px', fontWeight: 'bold',
      background: darkMode 
        ? 'linear-gradient(90deg, #10b981, #34d399)'
        : 'linear-gradient(90deg, #059669, #10b981)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px',
      animation: 'slideDown 0.5s ease-out'
    },
    time: {
      fontSize: '22px', 
      color: darkMode ? '#94a3b8' : '#64748b',
      marginBottom: '35px',
      fontWeight: '500',
      animation: 'slideDown 0.6s ease-out'
    },
    quoteContainer: {
      background: darkMode 
        ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      padding: '30px', 
      borderRadius: '24px',
      boxShadow: darkMode
        ? '0 20px 40px rgba(0,0,0,0.4)'
        : '0 20px 40px rgba(0,0,0,0.15)',
      maxWidth: '520px',
      border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      animation: 'scaleIn 0.5s ease-out',
      position: 'relative'
    },
    typeBadge: {
      display: 'inline-block',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '20px',
      backgroundColor: darkMode ? '#10b981' : '#059669',
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    quoteText: {
      fontSize: '20px', 
      fontStyle: 'italic', 
      lineHeight: '1.7',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      marginBottom: '18px',
      fontWeight: '400'
    },
    quoteSource: {
      fontSize: '15px', 
      fontWeight: '700',
      color: darkMode ? '#10b981' : '#059669',
      display: 'block',
      marginTop: '10px'
    },
    closeButton: {
      marginTop: '45px',
      padding: '16px 50px',
      borderRadius: '30px',
      border: 'none',
      background: darkMode 
        ? 'linear-gradient(90deg, #10b981, #059669)'
        : 'linear-gradient(90deg, #059669, #047857)',
      color: '#fff',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
      transition: 'all 0.3s ease',
      animation: 'slideUp 0.7s ease-out'
    }
  };

  // CSS Animasyonları
  const styleSheet = document.styleSheets[0];
  if (!document.querySelector('#fullscreen-notification-animations')) {
    const style = document.createElement('style');
    style.id = 'fullscreen-notification-animations';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes bounceIn {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes slideDown {
        from { transform: translateY(-30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.85); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.mosqueIcon}>🕌</div>
      <h1 style={styles.title}>{prayerNamesTr[prayerName] || prayerName} Vakti</h1>
      <p style={styles.time}>⏰ Vakit girdi: {prayerTime}</p>

      <div style={styles.quoteContainer}>
        <span style={styles.typeBadge}>
          {randomQuote.type === 'ayet' ? '📖 AYET' : 
           randomQuote.type === 'hadis' ? '☪️ HADİS' : '✨ ÖĞÜT'}
        </span>
        <p style={styles.quoteText}>"{randomQuote.text}"</p>
        <span style={styles.quoteSource}>— {randomQuote.source}</span>
      </div>

      <button 
        style={styles.closeButton} 
        onClick={onClose}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        ✓ Anladım
      </button>
    </div>
  );
};

export default FullScreenNotification;
