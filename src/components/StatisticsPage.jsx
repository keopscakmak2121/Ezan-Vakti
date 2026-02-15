// src/components/StatisticsPage.jsx - İstatistikler Sayfası

import React, { useState, useEffect } from 'react';
import { getReadingStats } from '../utils/readingProgressStorage';
import { getNotesStats } from '../utils/ayahNotesStorage';

const StatisticsPage = ({ darkMode }) => {
  const [readingStats, setReadingStats] = useState(null);
  const [notesStats, setNotesStats] = useState(null);

  const cardBg = darkMode ? '#1f2937' : '#ffffff';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    setReadingStats(getReadingStats());
    setNotesStats(getNotesStats());
  }, []);

  const StatCard = ({ icon, title, value, subtitle, color = '#059669' }) => (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '16px',
      padding: '20px',
      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      borderLeft: `6px solid ${color}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{ fontSize: '32px' }}>{icon}</div>
      <div style={{
        fontSize: '14px',
        color: textSec,
        fontWeight: '600',
        textTransform: 'uppercase'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: color
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{
          fontSize: '13px',
          color: textSec
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      backgroundColor: darkMode ? '#111827' : '#f9fafb',
      minHeight: '100vh',
      padding: '15px',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{
          margin: '0 0 10px 0',
          fontSize: '24px',
          color: '#059669',
          borderBottom: '3px solid #059669',
          paddingBottom: '10px'
        }}>
          📊 İstatistiklerim
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: textSec }}>
          Okuma ve not alma istatistiklerin
        </p>
      </div>

      {/* Okuma İstatistikleri */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{
          fontSize: '18px',
          color: text,
          marginBottom: '15px',
          paddingLeft: '5px'
        }}>
          📖 Kur'an Okuma
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <StatCard
            icon="📖"
            title="İlerleme"
            value={`${readingStats?.overallProgress || 0}%`}
            subtitle="Kur'an tamamlama"
            color="#059669"
          />
          <StatCard
            icon="📚"
            title="Sure"
            value={readingStats?.totalSurahsStarted || 0}
            subtitle="Başlanan sure"
            color="#3b82f6"
          />
          <StatCard
            icon="📜"
            title="Ayet"
            value={readingStats?.totalAyahsRead || 0}
            subtitle="Okunan ayet"
            color="#f59e0b"
          />
          <StatCard
            icon="🔥"
            title="Seri"
            value={`${readingStats?.readingStreak || 0} gün`}
            subtitle="Günlük okuma serisi"
            color="#ef4444"
          />
        </div>

        {readingStats?.lastReadDate && (
          <div style={{
            backgroundColor: cardBg,
            borderRadius: '12px',
            padding: '16px',
            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: textSec, marginBottom: '6px' }}>
              Son Okuma
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
              {new Date(readingStats.lastReadDate).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )}
      </div>

      {/* Not İstatistikleri */}
      <div>
        <h3 style={{
          fontSize: '18px',
          color: text,
          marginBottom: '15px',
          paddingLeft: '5px'
        }}>
          📝 Notlarım
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <StatCard
            icon="📝"
            title="Toplam Not"
            value={notesStats?.totalNotes || 0}
            subtitle="Eklenen not"
            color="#059669"
          />
          <StatCard
            icon="📚"
            title="Sure"
            value={notesStats?.uniqueSurahs || 0}
            subtitle="Not alınan sure"
            color="#3b82f6"
          />
          <StatCard
            icon="🏷️"
            title="Etiket"
            value={notesStats?.totalTags || 0}
            subtitle="Farklı etiket"
            color="#f59e0b"
          />
          <StatCard
            icon="📖"
            title="Kişisel"
            value={notesStats?.categoryCounts?.personal || 0}
            subtitle="Kişisel notlar"
            color="#059669"
          />
        </div>

        {/* Kategori Dağılımı */}
        {notesStats && notesStats.categoryCounts && (
          <div style={{
            backgroundColor: cardBg,
            borderRadius: '12px',
            padding: '16px',
            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: text,
              marginBottom: '12px'
            }}>
              Kategori Dağılımı
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(notesStats.categoryCounts).map(([category, count]) => {
                const categoryInfo = {
                  personal: { name: 'Kişisel', color: '#059669' },
                  tafsir: { name: 'Tefsir', color: '#3b82f6' },
                  reminder: { name: 'Hatırlatma', color: '#f59e0b' },
                  question: { name: 'Soru', color: '#ef4444' }
                };
                const info = categoryInfo[category] || { name: category, color: '#6b7280' };
                
                return (
                  <div key={category} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: darkMode ? '#374151' : '#f9fafb',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${info.color}`
                  }}>
                    <span style={{ fontSize: '14px', color: text }}>{info.name}</span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: info.color
                    }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* En Çok Kullanılan Etiketler */}
        {notesStats && notesStats.mostUsedTags && notesStats.mostUsedTags.length > 0 && (
          <div style={{
            backgroundColor: cardBg,
            borderRadius: '12px',
            padding: '16px',
            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            marginTop: '12px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: text,
              marginBottom: '12px'
            }}>
              En Çok Kullanılan Etiketler
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {notesStats.mostUsedTags.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '12px',
                    backgroundColor: '#05966920',
                    border: '2px solid #059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>
                    #{item.tag}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: '#059669',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px'
                  }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Motivasyon Mesajı */}
      {readingStats && (
        <div style={{
          marginTop: '30px',
          background: darkMode
            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>
            {readingStats.readingStreak > 7 ? '🏆' : readingStats.readingStreak > 3 ? '🌟' : '💪'}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>
            {readingStats.readingStreak > 7
              ? 'Harika gidiyorsun! Okumaya devam et!'
              : readingStats.readingStreak > 3
              ? 'Çok iyi! Serini korumaya devam et!'
              : 'Her gün biraz okuyarak alışkanlık oluştur!'}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
