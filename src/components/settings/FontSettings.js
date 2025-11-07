// src/components/settings/FontSettings.js
import React from 'react';
import { arabicFonts } from '../../utils/settingsStorage';

const FontSettings = ({ settings, darkMode, onChange }) => {
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  return (
    <div style={{
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
      borderRadius: '10px'
    }}>
      <h3 style={{ fontSize: '18px', color: text, marginBottom: '20px' }}>
        🔤 Arapça Yazı Tipi
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {arabicFonts.map(font => (
          <div
            key={font.id}
            onClick={() => onChange('arabicFont', font.id)}
            style={{
              padding: '15px',
              backgroundColor: settings.arabicFont === font.id 
                ? '#059669' 
                : (darkMode ? '#374151' : 'white'),
              color: settings.arabicFont === font.id ? 'white' : text,
              borderRadius: '8px',
              cursor: 'pointer',
              border: `2px solid ${settings.arabicFont === font.id ? '#059669' : (darkMode ? '#4b5563' : '#e5e7eb')}`,
              transition: 'all 0.2s'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  marginBottom: '3px'
                }}>
                  {font.name}
                </div>
                <div style={{ 
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  {font.description}
                </div>
              </div>
              {settings.arabicFont === font.id && (
                <span style={{ fontSize: '20px' }}>✔</span>
              )}
            </div>
            
            <div style={{
              fontSize: '20px',
              fontFamily: font.family,
              textAlign: 'right',
              direction: 'rtl',
              padding: '10px',
              backgroundColor: settings.arabicFont === font.id 
                ? 'rgba(255,255,255,0.1)' 
                : (darkMode ? '#1f2937' : '#f9fafb'),
              borderRadius: '6px',
              lineHeight: '1.8'
            }}>
              {font.preview}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FontSettings;