// src/components/settings/ReadingSettings.js
import React from 'react';
import { translations } from '../../utils/settingsStorage';

const ReadingSettings = ({ settings, darkMode, onChange }) => {
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  return (
    <div style={{
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
      borderRadius: '10px'
    }}>
      <h3 style={{ fontSize: '18px', color: text, marginBottom: '20px' }}>
        📖 Okuma Ayarları
      </h3>

      {/* Meal Seçimi */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '10px', 
          color: text,
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          Meal Seçimi
        </label>
        <select
          value={settings.translation}
          onChange={(e) => onChange('translation', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: `2px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
            backgroundColor: darkMode ? '#374151' : 'white',
            color: text,
            fontSize: '15px',
            cursor: 'pointer'
          }}
        >
          {translations.map(translation => (
            <option key={translation.id} value={translation.id}>
              {translation.name} - {translation.author}
            </option>
          ))}
        </select>
      </div>

      {/* Font Boyutu */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '10px', 
          color: text,
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          Varsayılan Font Boyutu: {settings.fontSize}px
        </label>
        <input
          type="range"
          min="14"
          max="32"
          step="2"
          value={settings.fontSize}
          onChange={(e) => onChange('fontSize', parseInt(e.target.value))}
          style={{
            width: '100%',
            cursor: 'pointer'
          }}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '12px',
          color: textSec,
          marginTop: '5px'
        }}>
          <span>Küçük (14px)</span>
          <span>Orta (20px)</span>
          <span>Büyük (32px)</span>
        </div>
      </div>

      {/* Arapça Göster */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <div>
          <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
            Arapça Metni Göster
          </div>
          <div style={{ fontSize: '12px', color: textSec }}>
            Ayetlerin arapça metnini göster
          </div>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
          <input
            type="checkbox"
            checked={settings.showArabic}
            onChange={(e) => onChange('showArabic', e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: settings.showArabic ? '#059669' : '#ccc',
            transition: '0.4s',
            borderRadius: '24px'
          }}>
            <span style={{
              position: 'absolute',
              height: '18px',
              width: '18px',
              left: settings.showArabic ? '28px' : '3px',
              bottom: '3px',
              backgroundColor: 'white',
              transition: '0.4s',
              borderRadius: '50%'
            }} />
          </span>
        </label>
      </div>

      {/* Tecvid Göster */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <div>
          <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
            🎨 Tecvid Göster (Renkli)
          </div>
          <div style={{ fontSize: '12px', color: textSec }}>
            Tecvid kurallarına göre renkli göster
          </div>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
          <input
            type="checkbox"
            checked={settings.showTajweed}
            onChange={(e) => onChange('showTajweed', e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: settings.showTajweed ? '#059669' : '#ccc',
            transition: '0.4s',
            borderRadius: '24px'
          }}>
            <span style={{
              position: 'absolute',
              height: '18px',
              width: '18px',
              left: settings.showTajweed ? '28px' : '3px',
              bottom: '3px',
              backgroundColor: 'white',
              transition: '0.4s',
              borderRadius: '50%'
            }} />
          </span>
        </label>
      </div>

      {/* Meal Göster */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <div>
          <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
            Meali Göster
          </div>
          <div style={{ fontSize: '12px', color: textSec }}>
            Türkçe meal metnini göster
          </div>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
          <input
            type="checkbox"
            checked={settings.showTranslation}
            onChange={(e) => onChange('showTranslation', e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: settings.showTranslation ? '#059669' : '#ccc',
            transition: '0.4s',
            borderRadius: '24px'
          }}>
            <span style={{
              position: 'absolute',
              height: '18px',
              width: '18px',
              left: settings.showTranslation ? '28px' : '3px',
              bottom: '3px',
              backgroundColor: 'white',
              transition: '0.4s',
              borderRadius: '50%'
            }} />
          </span>
        </label>
      </div>
    </div>
  );
};

export default ReadingSettings;