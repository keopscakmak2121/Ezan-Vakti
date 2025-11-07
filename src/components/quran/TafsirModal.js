// src/components/quran/TafsirModal.js
import React, { useState, useEffect } from 'react';
import { fetchTafsir, tafsirs } from '../../utils/tafsirStorage';

const TafsirModal = ({ 
  darkMode, 
  ayah, 
  surahName,
  surahNumber,
  onClose 
}) => {
  const [tafsirText, setTafsirText] = useState('');
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [selectedTafsir, setSelectedTafsir] = useState('tr.muyassar');

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadTafsir();
  }, [selectedTafsir]);

  const loadTafsir = async () => {
    if (!ayah) return;
    
    setTafsirLoading(true);
    setTafsirText('');

    try {
      const tafsir = await fetchTafsir(surahNumber, ayah.number, selectedTafsir);
      setTafsirText(tafsir || 'Tefsir bulunamadı.');
    } catch (error) {
      setTafsirText('Tefsir yüklenirken bir hata oluştu.');
    } finally {
      setTafsirLoading(false);
    }
  };

  // HTML tag'lerini temizle ve formatla
  const cleanTafsirText = (text) => {
    if (!text) return '';
    
    return text
      // Tajweed tag'lerini kaldır
      .replace(/<tajweed[^>]*>/g, '')
      .replace(/<\/tajweed>/g, '')
      // Class tag'lerini kaldır
      .replace(/<class=[^>]*>/g, '')
      .replace(/<\/class>/g, '')
      // Span tag'lerini kaldır
      .replace(/<span[^>]*>/g, '')
      .replace(/<\/span>/g, '')
      // Diğer HTML tag'lerini kaldır
      .replace(/<[^>]+>/g, '')
      // Çoklu boşlukları tek boşluğa çevir
      .replace(/\s+/g, ' ')
      // Başındaki/sonundaki boşlukları temizle
      .trim();
  };

  if (!ayah) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ color: text, margin: 0, fontSize: '20px' }}>
            📖 Tefsir
          </h3>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: text
            }}
          >
            ✕
          </button>
        </div>

        {/* Ayet Bilgisi */}
        <div style={{
          backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '16px',
            color: text,
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            {surahName} Suresi - {ayah.number}. Ayet
          </div>
          <div style={{
            fontSize: '18px',
            color: text,
            textAlign: 'right',
            direction: 'rtl',
            lineHeight: '1.8',
            marginBottom: '10px'
          }}>
            {ayah.arabic}
          </div>
          <div style={{
            fontSize: '14px',
            color: textSec,
            lineHeight: '1.6'
          }}>
            {ayah.turkish}
          </div>
        </div>

        {/* Tefsir Seçimi */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: text,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Tefsir Seçimi:
          </label>
          <select
            value={selectedTafsir}
            onChange={(e) => setSelectedTafsir(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '6px',
              backgroundColor: darkMode ? '#4b5563' : 'white',
              color: text,
              fontSize: '14px'
            }}
          >
            {tafsirs.map((tafsir) => (
              <option key={tafsir.id} value={tafsir.id}>
                {tafsir.name} - {tafsir.author}
              </option>
            ))}
          </select>
        </div>

        {/* Tefsir İçeriği */}
        <div style={{
          backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          minHeight: '200px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {tafsirLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: textSec }}>
              Tefsir yükleniyor...
            </div>
          ) : (
            <div style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: text,
              whiteSpace: 'pre-wrap'
            }}>
              {cleanTafsirText(tafsirText)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TafsirModal;