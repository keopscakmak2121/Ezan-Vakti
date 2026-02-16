import React, { useState, useEffect } from 'react';
import { verses } from '../../data/verses.js';
import { hadiths } from '../../data/hadiths.js';
import { esmas } from '../../data/esmas.js';

const PrayerAlertOverlay = ({ prayerName, prayerTime, onDismiss, darkMode }) => {
  const [currentTab, setCurrentTab] = useState(0); // 0=ayet, 1=hadis, 2=esma

  // Günlük rastgele içerik
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const dailyVerse = verses[dayOfYear % verses.length];
  const dailyHadith = hadiths[dayOfYear % hadiths.length];
  const dailyEsma = esmas[dayOfYear % esmas.length];

  const prayerEmojis = {
    'İmsak': '🌙', 'Güneş': '🌅', 'Öğle': '☀️',
    'İkindi': '🌇', 'Akşam': '🌆', 'Yatsı': '🌃'
  };

  const tabs = [
    { label: 'Ayet', icon: '📖' },
    { label: 'Hadis', icon: '📜' },
    { label: 'Esma', icon: '✨' }
  ];

  // Otomatik tab geçişi
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTab(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #064e3b 0%, #065f46 30%, #047857 60%, #059669 100%)',
      color: 'white',
      padding: '30px 20px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Üst — Vakit Bilgisi */}
      <div style={{ textAlign: 'center', marginBottom: '30px', animation: 'slideUp 0.6s ease-out' }}>
        <div style={{ fontSize: '60px', animation: 'pulse 2s ease-in-out infinite', marginBottom: '10px' }}>
          {prayerEmojis[prayerName] || '🕌'}
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          {prayerName} Vakti
        </div>
        <div style={{ fontSize: '48px', fontWeight: '800', margin: '8px 0', letterSpacing: '3px' }}>
          {prayerTime}
        </div>
        <div style={{ fontSize: '15px', opacity: 0.8 }}>
          🕌 Namaz vakti girdi
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {tabs.map((tab, idx) => (
          <button key={idx} onClick={() => setCurrentTab(idx)} style={{
            padding: '8px 18px',
            borderRadius: '20px',
            border: '2px solid rgba(255,255,255,0.3)',
            backgroundColor: currentTab === idx ? 'rgba(255,255,255,0.25)' : 'transparent',
            color: 'white',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* İçerik Kartı */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: '20px',
        padding: '24px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        minHeight: '160px',
        animation: 'slideUp 0.5s ease-out'
      }}>
        {currentTab === 0 && dailyVerse && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '12px', fontWeight: '600' }}>📖 Günün Ayeti</div>
            {dailyVerse.arabic && (
              <div style={{ fontSize: '22px', fontFamily: "'Amiri', serif", marginBottom: '14px', lineHeight: '1.8', direction: 'rtl' }}>
                {dailyVerse.arabic}
              </div>
            )}
            <div style={{ fontSize: '15px', lineHeight: '1.7', fontStyle: 'italic', opacity: 0.95 }}>
              "{dailyVerse.turkish}"
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '10px' }}>
              — {dailyVerse.surah}, {dailyVerse.ayah}. Ayet
            </div>
          </div>
        )}

        {currentTab === 1 && dailyHadith && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '12px', fontWeight: '600' }}>📜 Günün Hadisi</div>
            <div style={{ fontSize: '15px', lineHeight: '1.7', fontStyle: 'italic', opacity: 0.95 }}>
              "{dailyHadith.text}"
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '10px' }}>
              — {dailyHadith.source}
            </div>
          </div>
        )}

        {currentTab === 2 && dailyEsma && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '12px', fontWeight: '600' }}>✨ Günün Esması</div>
            <div style={{ fontSize: '36px', fontFamily: "'Amiri', serif", marginBottom: '10px' }}>
              {dailyEsma.arabic}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>
              {dailyEsma.turkish}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              {dailyEsma.meaning}
            </div>
          </div>
        )}
      </div>

      {/* Noktalar */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: currentTab === i ? '#fff' : 'rgba(255,255,255,0.3)',
            transition: 'all 0.3s'
          }} />
        ))}
      </div>

      {/* Kapat Butonu */}
      <button onClick={onDismiss} style={{
        marginTop: '30px',
        padding: '14px 50px',
        borderRadius: '30px',
        border: '2px solid rgba(255,255,255,0.4)',
        backgroundColor: 'rgba(255,255,255,0.15)',
        color: 'white',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        backdropFilter: 'blur(5px)'
      }}>
        Tamam
      </button>
    </div>
  );
};

export default PrayerAlertOverlay;
