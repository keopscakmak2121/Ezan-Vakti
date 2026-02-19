// src/components/FullScreenNotification.jsx - ÖZEL TASARIMLI TAM EKRAN BİLDİRİM

import React, { useMemo } from 'react';
import { registerPlugin } from '@capacitor/core';

const PrayerPlugin = registerPlugin('PrayerPlugin');

const FullScreenNotification = ({ prayerName, prayerTime, darkMode, onClose }) => {
  
  // GENİŞLETİLMİŞ Ayet/Hadis Listesi
  const spiritualQuotes = useMemo(() => [
    { text: "Şüphesiz namaz, müminler üzerine vakitleri belirlenmiş bir farzdır.", source: "Nisa 103", type: "ayet" },
    { text: "Namazı dosdoğru kılın, zekâtı verin ve rükû edenlerle beraber rükû edin.", source: "Bakara 43", type: "ayet" },
    { text: "Sabır ve namazla Allah'tan yardım isteyin.", source: "Bakara 45", type: "ayet" },
    { text: "Muhakkak ki namaz, hayâsızlıktan ve kötülükten alıkoyar.", source: "Ankebut 45", type: "ayet" },
    { text: "Kalpler ancak Allah'ı anmakla huzur bulur.", source: "Ra'd 28", type: "ayet" },
    { text: "Namaz dinin direğidir.", source: "Hadis-i Şerif", type: "hadis" },
    { text: "Sizin en hayırlınız, Kur'an'ı öğrenen ve öğreteninizdir.", source: "Buhari", type: "hadis" },
    { text: "Kim sabah namazını kılarsa, Allah'ın himayesine girer.", source: "Müslim", type: "hadis" }
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

  const handleClose = () => {
    // 1) Arka planda çalan ezan sesini durdur (KRİTİK)
    try {
      PrayerPlugin.stopAdhan();
    } catch (e) {
      console.error("Ses durdurulamadı:", e);
    }

    // 2) UI ekranını kapat
    onClose();
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
      padding: '30px', textAlign: 'center'
    },
    mosqueIcon: { fontSize: '90px', marginBottom: '20px' },
    title: {
      fontSize: '36px', fontWeight: 'bold',
      background: darkMode 
        ? 'linear-gradient(90deg, #10b981, #34d399)'
        : 'linear-gradient(90deg, #059669, #10b981)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px'
    },
    time: { fontSize: '22px', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '35px', fontWeight: '500' },
    quoteContainer: {
      background: darkMode ? '#1e293b' : '#ffffff',
      padding: '30px', borderRadius: '24px', maxWidth: '520px',
      border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
    },
    typeBadge: {
      display: 'inline-block', padding: '6px 16px', borderRadius: '20px', fontSize: '13px',
      fontWeight: '600', marginBottom: '20px',
      backgroundColor: darkMode ? '#10b981' : '#059669', color: '#fff'
    },
    quoteText: { fontSize: '20px', fontStyle: 'italic', lineHeight: '1.7', color: darkMode ? '#f1f5f9' : '#1e293b' },
    quoteSource: { fontSize: '15px', fontWeight: '700', color: darkMode ? '#10b981' : '#059669', display: 'block', marginTop: '10px' },
    closeButton: {
      marginTop: '45px', padding: '16px 50px', borderRadius: '30px', border: 'none',
      background: '#059669', color: '#fff', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
    }
  };

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

      <button style={styles.closeButton} onClick={handleClose}>
        ✓ Anladım
      </button>
    </div>
  );
};

export default FullScreenNotification;
