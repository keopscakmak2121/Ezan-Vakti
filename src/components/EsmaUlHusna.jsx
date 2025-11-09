// src/components/EsmaUlHusna.js
import React, { useState } from 'react';
import { esmaUlHusna } from '../data/esmaUlHusna';

const EsmaUlHusna = ({ darkMode }) => {
  const [selectedEsma, setSelectedEsma] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  // Arama filtresi
  const filteredEsma = esmaUlHusna.filter(esma => 
    esma.turkish.toLowerCase().includes(searchTerm.toLowerCase()) ||
    esma.arabic.includes(searchTerm) ||
    esma.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Başlık */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h2 style={{ 
          fontSize: '28px', 
          margin: '0 0 10px 0', 
          color: '#059669',
          borderBottom: '3px solid #059669',
          paddingBottom: '15px'
        }}>
          ✨ Esmaül Hüsna (99 İsim)
        </h2>
        <p style={{
          fontSize: '15px',
          color: textSec,
          margin: '10px 0 0 0'
        }}>
          Allah'ın güzel isimleri
        </p>
      </div>

      {/* Arama */}
      <input
        type="text"
        placeholder="İsim veya anlam ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '15px',
          marginBottom: '25px',
          border: `2px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
          borderRadius: '10px',
          fontSize: '16px',
          backgroundColor: darkMode ? '#4b5563' : 'white',
          color: text,
          boxSizing: 'border-box'
        }}
      />

      {/* İstatistik */}
      <div style={{
        padding: '15px',
        backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '14px',
        color: text
      }}>
        <strong>{filteredEsma.length}</strong> isim {searchTerm && 'bulundu'}
      </div>

      {/* Esma Listesi */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '70vh',
        overflowY: 'auto',
        paddingRight: '10px'
      }}>
        {filteredEsma.map((esma, index) => (
          <div 
            key={index}
            onClick={() => setSelectedEsma(selectedEsma === index ? null : index)}
            style={{
              padding: '20px',
              backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: selectedEsma === index ? '3px solid #059669' : '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              if (selectedEsma !== index) {
                e.currentTarget.style.borderColor = '#059669';
                e.currentTarget.style.transform = 'translateX(5px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedEsma !== index) {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: selectedEsma === index ? '20px' : '0'
            }}>
              <div style={{ flex: 1 }}>
                {/* Arapça İsim */}
                <div style={{ 
                  fontSize: '28px', 
                  color: '#059669', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  textAlign: 'right',
                  direction: 'rtl'
                }}>
                  {esma.arabic}
                </div>
                
                {/* Türkçe İsim */}
                <div style={{ 
                  fontSize: '20px', 
                  color: text, 
                  fontWeight: '600',
                  marginBottom: '5px'
                }}>
                  {esma.turkish}
                </div>

                {/* Kısa Anlam */}
                {selectedEsma !== index && (
                  <div style={{ 
                    fontSize: '14px', 
                    color: textSec,
                    fontStyle: 'italic'
                  }}>
                    {esma.meaning}
                  </div>
                )}
              </div>

              {/* Numara */}
              <div style={{ 
                width: '45px', 
                height: '45px', 
                backgroundColor: '#059669', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                flexShrink: 0,
                marginLeft: '15px'
              }}>
                {esmaUlHusna.findIndex(e => e.arabic === esma.arabic) + 1}
              </div>
            </div>

            {/* Detaylı Bilgi (Açıldığında) */}
            {selectedEsma === index && (
              <div style={{ 
                marginTop: '20px', 
                paddingTop: '20px', 
                borderTop: `2px solid ${darkMode ? '#6b7280' : '#d1d5db'}` 
              }}>
                {/* Anlam */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: '#059669',
                    marginBottom: '8px'
                  }}>
                    📖 Anlamı:
                  </div>
                  <p style={{ 
                    color: text, 
                    margin: 0,
                    fontSize: '15px',
                    lineHeight: '1.6'
                  }}>
                    {esma.meaning}
                  </p>
                </div>

                {/* Geçtiği Ayetler */}
                <div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: '#059669',
                    marginBottom: '10px'
                  }}>
                    📜 Geçtiği Ayetler:
                  </div>
                  {esma.verses.map((verse, i) => (
                    <div key={i} style={{ 
                      marginTop: '12px',
                      padding: '15px',
                      backgroundColor: darkMode ? '#374151' : '#e5e7eb',
                      borderRadius: '8px',
                      borderLeft: '4px solid #059669'
                    }}>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#059669', 
                        fontWeight: 'bold', 
                        marginBottom: '8px' 
                      }}>
                        {verse.reference}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: text, 
                        lineHeight: '1.6' 
                      }}>
                        "{verse.text}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sonuç Bulunamadı */}
      {filteredEsma.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: textSec
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            Sonuç bulunamadı
          </div>
          <div style={{ fontSize: '14px' }}>
            "{searchTerm}" için eşleşen isim bulunamadı
          </div>
        </div>
      )}
    </div>
  );
};

export default EsmaUlHusna;