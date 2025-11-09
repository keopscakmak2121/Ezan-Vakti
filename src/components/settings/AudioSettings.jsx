import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, reciters } from '../../utils/settingsStorage.js';

const AudioSettings = ({ darkMode }) => {
  const [settings, setSettings] = useState(getSettings());

  const handleReciterChange = (reciterId) => {
    const newSettings = { ...settings, reciter: reciterId };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handlePlaybackSpeedChange = (speed) => {
    const newSettings = { ...settings, playbackSpeed: parseFloat(speed) };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div style={{
      padding: '20px',
      color: darkMode ? '#e5e7eb' : '#1f2937'
    }}>
      <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
        Ses Ayarları
      </h2>

      <div style={{ marginBottom: '25px' }}>
        <label style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          Okuyucu Seçimi
        </label>
        <select
          value={settings.reciter}
          onChange={(e) => handleReciterChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
            backgroundColor: darkMode ? '#374151' : '#ffffff',
            color: darkMode ? '#e5e7eb' : '#1f2937',
            fontSize: '14px'
          }}
        >
          {reciters.map((reciter) => (
            <option key={reciter.id} value={reciter.id}>
              {reciter.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <label style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          Oynatma Hızı: {settings.playbackSpeed}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.25"
          value={settings.playbackSpeed}
          onChange={(e) => handlePlaybackSpeedChange(e.target.value)}
          style={{ width: '100%' }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '5px',
          fontSize: '12px',
          color: darkMode ? '#9ca3af' : '#6b7280'
        }}>
          <span>0.5x</span>
          <span>1x</span>
          <span>1.5x</span>
          <span>2x</span>
        </div>
      </div>
    </div>
  );
};

export default AudioSettings;