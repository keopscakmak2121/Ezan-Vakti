// src/components/FullScreenNotification.jsx - ÖZEL TASARIMLI TAM EKRAN BİLDİRİM

import React, { useMemo } from 'react';

const FullScreenNotification = ({ prayerName, prayerTime, darkMode, onClose }) => {
  
  // Rastgele Ayet/Hadis Listesi
  const spiritualQuotes = useMemo(() => [
    { text: "Şüphesiz namaz, müminler üzerine vakitleri belirlenmiş bir farzdır.", source: "Nisa Suresi, 103" },
    { text: "Sizin en hayırlınız, Kur'an'ı öğrenen ve öğreteninizdir.", source: "Hadis-i Şerif" },
    { text: "Beni anın ki, ben de sizi anayım.", source: "Bakara Suresi, 152" },
    { text: "Namaz dinin direğidir.", source: "Hadis-i Şerif" },
    { text: "Rabbiniz şöyle buyurdu: Bana dua edin, duanıza icabet edeyim.", source: "Mü'min Suresi, 60" },
    { text: "Kalpler ancak Allah'ı anmakla huzur bulur.", source: "Ra'd Suresi, 28" }
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
      backgroundColor: darkMode ? '#0f172a' : '#f0fdf4',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '30px', textAlign: 'center'
    },
    mosqueIcon: {
      fontSize: '80px', marginBottom: '20px'
    },
    title: {
      fontSize: '32px', fontWeight: 'bold',
      color: darkMode ? '#10b981' : '#059669',
      marginBottom: '5px'
    },
    time: {
      fontSize: '20px', color: darkMode ? '#94a3b8' : '#64748b',
      marginBottom: '40px'
    },
    quoteContainer: {
      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
      padding: '25px', borderRadius: '20px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      maxWidth: '500px'
    },
    quoteText: {
      fontSize: '22px', fontStyle: 'italic', lineHeight: '1.5',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      marginBottom: '15px'
    },
    quoteSource: {
      fontSize: '16px', fontWeight: '600',
      color: darkMode ? '#10b981' : '#059669'
    },
    closeButton: {
      marginTop: '50px',
      padding: '15px 40px',
      borderRadius: '30px',
      border: 'none',
      backgroundColor: darkMode ? '#10b981' : '#059669',
      color: '#fff',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.mosqueIcon}>🕌</div>
      <h1 style={styles.title}>{prayerNamesTr[prayerName] || prayerName} Vakti</h1>
      <p style={styles.time}>Vakit girdi: {prayerTime}</p>

      <div style={styles.quoteContainer}>
        <p style={styles.quoteText}>"{randomQuote.text}"</p>
        <span style={styles.quoteSource}>— {randomQuote.source}</span>
      </div>

      <button style={styles.closeButton} onClick={onClose}>
        Anladım
      </button>
    </div>
  );
};

export default FullScreenNotification;
