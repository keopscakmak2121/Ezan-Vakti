// src/components/settings/AudioSettings.js
import React from 'react';
import { reciters } from '../../utils/settingsStorage';

const AudioSettings = ({ settings, darkMode, onChange }) => {
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
        🎙️ Ses Ayarları
      </h3>

      {/* Kari Seçimi */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '10px', 
          color: text,
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          Kari Seçimi
        </label>
        <select
          value={settings.reciter}
          onChange={(e) => onChange('reciter', e.target.value)}
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
          {reciters.map(reciter => (
            <option key={reciter.id} value={reciter.id}>
              {reciter.name} ({reciter.country})
            </option>
          ))}
        </select>
      </div>

      {/* Ses Hızı */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '10px', 
          color: text,
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          Ses Hızı: {settings.audioSpeed}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.25"
          value={settings.audioSpeed}
          onChange={(e) => onChange('audioSpeed', parseFloat(e.target.value))}
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
          <span>Yavaş (0.5x)</span>
          <span>Normal (1x)</span>
          <span>Hızlı (2x)</span>
        </div>
      </div>

      {/* Otomatik Tekrar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <div>
          <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
            Otomatik Tekrar
          </div>
          <div style={{ fontSize: '12px', color: textSec }}>
            Ayet bitince tekrar başa dön
          </div>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
          <input
            type="checkbox"
            checked={settings.autoRepeat}
            onChange={(e) => onChange('autoRepeat', e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: settings.autoRepeat ? '#059669' : '#ccc',
            transition: '0.4s',
            borderRadius: '24px'
          }}>
            <span style={{
              position: 'absolute',
              height: '18px',
              width: '18px',
              left: settings.autoRepeat ? '28px' : '3px',
              bottom: '3px',
              backgroundColor: 'white',
              transition: '0.4s',
              borderRadius: '50%'
            }} />
          </span>
        </label>
      </div>

      {/* Otomatik Çalma */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <div>
          <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
            Otomatik Çalma
          </div>
          <div style={{ fontSize: '12px', color: textSec }}>
            Ayet bitince sonrakini otomatik çal
          </div>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
          <input
            type="checkbox"
            checked={settings.autoPlay}
            onChange={(e) => onChange('autoPlay', e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: settings.autoPlay ? '#059669' : '#ccc',
            transition: '0.4s',
            borderRadius: '24px'
          }}>
            <span style={{
              position: 'absolute',
              height: '18px',
              width: '18px',
              left: settings.autoPlay ? '28px' : '3px',
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

export default AudioSettings;