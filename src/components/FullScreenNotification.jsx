// src/components/FullScreenNotification.js - GERÇEK AYET/DUALARLA GÜNCELLENDİ

import React from 'react';

const FullScreenNotification = ({ prayerName, prayerTime, darkMode, onClose }) => {
  
  // Her namaz için özel içerik - GERÇEK AYET VE DUALAR
  const prayerContent = {
    Fajr: {
      name: 'İmsak',
      icon: '🌙',
      color: '#1e3a8a',
      verse: 'Sabah namazını kıl, çünkü sabah namazı şahitlidir.',
      verseRef: '(İsra 78)',
      dua: 'Allahümme inne fî halki\'s-semâvâti ve\'l-ardi ve\'htilâfi\'l-leyli ve\'n-nehâri le-âyâtin li-ûli\'l-elbâb.'
    },
    Sunrise: {
      name: 'Güneş',
      icon: '🌅',
      color: '#f59e0b',
      verse: 'Güneşi aydınlık, ayı ışık yapan O\'dur.',
      verseRef: '(Yunus 5)',
      dua: 'Allahümme yâ mukallibal-kulûbi sebbit kalbî alâ dînik ve tâ\'atik.'
    },
    Dhuhr: {
      name: 'Öğle',
      icon: '☀️',
      color: '#dc2626',
      verse: 'Namazı gün ortasından gece karanlığına kadar kıl.',
      verseRef: '(İsra 78)',
      dua: 'Allahümme innî es\'elüke \'ilmen nâfi\'an ve rizkan tayyiben ve \'amelen mütekkabbelâ.'
    },
    Asr: {
      name: 'İkindi',
      icon: '🌤️',
      color: '#ea580c',
      verse: 'Orta namazı ve namazları koruyun, Allah için huşu içinde durun.',
      verseRef: '(Bakara 238)',
      dua: 'Allahümme innî a\'ûzü bike minel-\'aczi vel-keseli vel-cübni vel-bühli vel-heremi ve \'azâbil-kabr.'
    },
    Maghrib: {
      name: 'Akşam',
      icon: '🌆',
      color: '#7c3aed',
      verse: 'Sabah akşam Rabbini tesbih et ve gecenin bir kısmında da O\'na secde et.',
      verseRef: '(Taha 130)',
      dua: 'Emsaynâ ve emsal-mülkü lillâhi vel-hamdü lillâhi lâ ilâhe illallâhü vahdehü lâ şerîke leh.'
    },
    Isha: {
      name: 'Yatsı',
      icon: '🌙',
      color: '#1e293b',
      verse: 'Gece Kuran oku, çünkü gece ibadetleri daha tesirli ve sözleri daha doğrudur.',
      verseRef: '(Müzzemmil 6)',
      dua: 'Allahümme bika amsaynâ ve bika asbahna ve bika nahyâ ve bika nemûtü ve ileyke\'n-nüşûr.'
    }
  };

  const content = prayerContent[prayerName] || prayerContent.Fajr;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: content.color,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      color: 'white',
      padding: '20px',
      textAlign: 'center'
    }}>
      
      {/* Icon */}
      <div style={{
        fontSize: '80px',
        marginBottom: '20px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '50%',
        width: '160px',
        height: '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {content.icon}
      </div>

      {/* Namaz Adı */}
      <h1 style={{
        fontSize: '48px',
        margin: '0 0 10px 0',
        fontWeight: 'bold'
      }}>
        {content.name}
      </h1>

      {/* Vakti */}
      <div style={{
        fontSize: '20px',
        marginBottom: '40px',
        opacity: 0.9
      }}>
        VAKTİ
      </div>

      {/* Saat */}
      <div style={{
        fontSize: '72px',
        fontWeight: 'bold',
        marginBottom: '60px',
        letterSpacing: '5px'
      }}>
        {prayerTime}
      </div>

      {/* Ayet/Hadis Box */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '40px',
        maxWidth: '600px',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{
          fontSize: '16px',
          lineHeight: '1.8',
          margin: '0 0 10px 0'
        }}>
          {content.verse}
        </p>
        <p style={{
          fontSize: '14px',
          opacity: 0.8,
          margin: 0
        }}>
          {content.verseRef}
        </p>
      </div>

      {/* Dua */}
      <div style={{
        fontSize: '18px',
        fontStyle: 'italic',
        marginBottom: '60px',
        opacity: 0.9,
        maxWidth: '500px'
      }}>
        {content.dua}
      </div>

      {/* Tamam Butonu - MOBİL UYUMLU */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔘 TAMAM butonuna basıldı');
          onClose();
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          color: content.color,
          border: 'none',
          borderRadius: '50px',
          padding: '18px 60px',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          userSelect: 'none'
        }}
      >
        TAMAM
      </button>
    </div>
  );
};

export default FullScreenNotification;