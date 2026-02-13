import React from 'react';
import { arabicFonts, reciters, translations } from '../../utils/settingsStorage.js'; // Import translations

// A reusable row component for settings
const SettingRow = ({ label, children, darkMode }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
  }}>
    <span style={{ fontSize: '18px' }}>{label}</span>
    <div>{children}</div>
  </div>
);

// A reusable toggle switch component
const ToggleSwitch = ({ checked, onChange }) => {
    return (
        <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
            <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: checked ? '#059669' : '#6b7280', transition: '.4s', borderRadius: '28px' }}>
                <span style={{ position: 'absolute', content: '\'\'', height: '20px', width: '20px', left: '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: checked ? 'translateX(22px)' : 'translateX(0)' }}></span>
            </span>
        </label>
    );
};


const QuranSettings = ({ darkMode, onBack, settings, onSettingsChange }) => {

  const handleSettingChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const selectStyle = {
    padding: '8px 12px', 
    borderRadius: '8px', 
    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
    backgroundColor: darkMode ? '#374151' : '#ffffff',
    color: darkMode ? '#f3f4f6' : '#1f2937',
    fontSize: '16px'
  };

  return (
    <div style={{ padding: '10px', color: darkMode ? '#f3f4f6' : '#1f2937' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '0 10px' }}>
        <button onClick={onBack} style={{ padding: '10px', margin: '-10px', border: 'none', background: 'transparent', color: darkMode ? '#f3f4f6' : '#1f2937', fontSize: '24px' }}>←</button>
        <h2 style={{ flex: 1, textAlign: 'center', fontSize: '22px' }}>Okuma Ayarları</h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px' }}>
        
        {/* MEAL SELECTION */}
        <SettingRow label="Meal Seçimi" darkMode={darkMode}>
            <select 
                value={settings.translation}
                onChange={(e) => handleSettingChange('translation', e.target.value)}
                style={selectStyle}
            >
                {translations.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
        </SettingRow>

        {/* FONT SIZE */}
        <SettingRow label="Yazı Tipi Boyutu" darkMode={darkMode}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => handleSettingChange('fontSize', Math.max(14, settings.fontSize - 1))} style={{padding: '8px 12px', borderRadius:'6px'}}>-</button>
            <span>{settings.fontSize}px</span>
            <button onClick={() => handleSettingChange('fontSize', Math.min(40, settings.fontSize + 1))} style={{padding: '8px 12px', borderRadius:'6px'}}>+</button>
          </div>
        </SettingRow>

        {/* SHOW TRANSLATION */}
        <SettingRow label="Meal Göster" darkMode={darkMode}>
          <ToggleSwitch 
            checked={settings.showTranslation}
            onChange={(e) => handleSettingChange('showTranslation', e.target.checked)}
          />
        </SettingRow>

        {/* ARABIC FONT */}
        <SettingRow label="Arapça Yazı Tipi" darkMode={darkMode}>
            <select 
                value={settings.arabicFont}
                onChange={(e) => handleSettingChange('arabicFont', e.target.value)}
                style={selectStyle}
            >
                {arabicFonts.map(font => (<option key={font.id} value={font.id}>{font.name}</option>))}
            </select>
        </SettingRow>

        {/* REUITER (KARI) SELECTION */}
        <SettingRow label="Hafız (Kari)" darkMode={darkMode}>
            <select 
                value={settings.reciter}
                onChange={(e) => handleSettingChange('reciter', e.target.value)}
                style={selectStyle}
            >
                {reciters.map(reciter => (<option key={reciter.id} value={reciter.id}>{reciter.name}</option>))}
            </select>
        </SettingRow>

      </div>
    </div>
  );
};

export default QuranSettings;
