// src/components/quran/AyahCard.js
import React from 'react';
import { getArabicFontFamily } from '../../utils/settingsStorage';
import AyahControls from './AyahControls';

const AyahCard = ({
  ayah,
  surahName,
  fontSize,
  arabicFont,
  showTajweed,
  darkMode,
  currentAyah,
  copiedAyah,
  isBookmarked,
  note,
  highlightWord = '',
  onPlay,
  onCopy,
  onToggleBookmark,
  onOpenNote
}) => {
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const isActive = currentAyah === ayah.number;
  const cardPaddingLeft = isActive ? '30px' : '12px';

  // Kelime vurgulama fonksiyonu
  const highlightText = (text, query) => {
    if (!query || !query.trim()) return text;

    // HTML etiketlerini korumak için özel işlem (tajweed için)
    const hasHTML = /<[^>]*>/g.test(text);
    
    if (hasHTML) {
      // HTML varsa, sadece text node'ları vurgula
      return text;
    }

    // Normal metin için vurgulama
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        `<mark style="background-color: #fbbf24; color: #000; font-weight: bold; padding: 2px 4px; border-radius: 3px;">${part}</mark>`
      ) : (
        part
      )
    ).join('');
  };

  // Türkçe metin için vurgulama
  const getTurkishWithHighlight = () => {
    if (!highlightWord) return ayah.turkish;
    return highlightText(ayah.turkish, highlightWord);
  };

  return (
    <div
      style={{
        position: 'relative',
        padding: '12px',
        paddingLeft: cardPaddingLeft,
        backgroundColor: (darkMode ? '#4b5563' : '#f9fafb'),
        borderRadius: '10px',
        border: isActive ? '1px solid #059669' : '1px solid transparent', 
        boxShadow: 'none',
        transition: 'all 0.3s, padding-left 0.3s'
      }}
    >
      
      {isActive && (
        <div 
          style={{
            position: 'absolute',
            left: '3px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#059669',
            fontSize: '24px', 
            lineHeight: '1',
            fontWeight: 'bold',
            zIndex: 10,
          }}
        >
          ▶
        </div>
      )}

      {/* Arapça Metin */}
      <div style={{
        padding: '8px', 
        borderRadius: '6px',
        backgroundColor: isActive 
          ? (darkMode ? '#3e4a57' : '#e0f2f1') 
          : 'transparent',
        transition: 'background-color 0.3s',
        fontSize: fontSize + 4,
        textAlign: 'right',
        lineHeight: '2',
        color: text,
        fontWeight: '600',
        marginBottom: '10px',
        direction: 'rtl',
        fontFamily: getArabicFontFamily(arabicFont),
        letterSpacing: '0.5px',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
      }}>
        <span 
          className={showTajweed ? 'tajweed-text' : ''}
          dangerouslySetInnerHTML={{ __html: ayah.arabic }}
        />
        <span> ﴿{ayah.number}﴾</span>
      </div>

      {/* Türkçe Çeviri - Vurgulamalı */}
      <div 
        style={{
          fontSize: fontSize - 2,
          lineHeight: '1.8',
          color: text,
          marginBottom: '10px'
        }}
        dangerouslySetInnerHTML={{ 
          __html: getTurkishWithHighlight()
        }}
      />

      {note && (
        <div style={{
          backgroundColor: darkMode ? '#374151' : '#fef3c7',
          padding: '8px',
          borderRadius: '8px',
          marginBottom: '10px',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#f59e0b',
            fontWeight: 'bold',
            marginBottom: '5px'
          }}>
            📝 Notunuz:
          </div>
          <div style={{
            fontSize: '14px',
            color: text,
            lineHeight: '1.6'
          }}>
            {note}
          </div>
        </div>
      )}

      <AyahControls
        ayah={ayah}
        currentAyah={currentAyah}
        copiedAyah={copiedAyah}
        isBookmarked={isBookmarked}
        hasNote={!!note}
        darkMode={darkMode}
        onPlay={onPlay}
        onCopy={onCopy}
        onToggleBookmark={onToggleBookmark}
        onOpenNote={onOpenNote}
      />
    </div>
  );
};

export default AyahCard;