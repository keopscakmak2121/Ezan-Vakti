import React, { useState, useEffect } from 'react';
import { getUpcomingImportantDays, hijriMonthNames, gregorianToHijri } from '../data/importantDays';

const ImportantDays = ({ darkMode }) => {
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  const bg = darkMode ? '#374151' : '#ffffff';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    const upcoming = getUpcomingImportantDays();
    setDays(upcoming);
  }, []);

  // Bugünün Hicri tarihi
  const hijriToday = gregorianToHijri(new Date());

  // Filtrele
  const filteredDays = days.filter(d => {
    if (filter === 'upcoming') return d.daysLeft >= 0;
    if (filter === 'past') return d.daysLeft < 0;
    return true;
  });

  // En yakın gün
  const nextDay = days.find(d => d.daysLeft >= 0);

  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  };

  const getDaysLeftText = (daysLeft) => {
    if (daysLeft < 0) return `${Math.abs(daysLeft)} gün önce`;
    if (daysLeft === 0) return 'BUGÜN';
    if (daysLeft === 1) return 'YARIN';
    return `${daysLeft} gün kaldı`;
  };

  const getDaysLeftColor = (daysLeft) => {
    if (daysLeft < 0) return '#6b7280';
    if (daysLeft === 0) return '#ef4444';
    if (daysLeft <= 3) return '#f59e0b';
    if (daysLeft <= 7) return '#3b82f6';
    return '#059669';
  };

  return (
    <div style={{ padding: '15px', color: text, paddingBottom: '100px' }}>

      {/* Başlık */}
      <div style={{
        textAlign: 'center',
        padding: '20px 15px',
        background: darkMode ? 'linear-gradient(135deg, #1e3a5f, #0d2137)' : 'linear-gradient(135deg, #059669, #047857)',
        borderRadius: '16px',
        marginBottom: '20px',
        color: '#fff'
      }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🕌</div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700' }}>Önemli Gün ve Geceler</h2>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          📅 Bugün: {hijriToday.day} {hijriMonthNames[hijriToday.month]} {hijriToday.year} H.
        </div>
      </div>

      {/* Yaklaşan Gün Highlight */}
      {nextDay && (
        <div style={{
          padding: '18px',
          borderRadius: '14px',
          background: darkMode ? 'linear-gradient(135deg, #1e3a5f, #1a2e4a)' : 'linear-gradient(135deg, #fef3c7, #fde68a)',
          border: `2px solid ${darkMode ? '#f59e0b' : '#f59e0b'}`,
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Yaklaşan
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: darkMode ? '#fef3c7' : '#92400e', marginBottom: '4px' }}>
            {nextDay.icon} {nextDay.name}
          </div>
          <div style={{ fontSize: '14px', color: darkMode ? '#d1d5db' : '#78350f', marginBottom: '8px' }}>
            {formatDate(nextDay.gregorianDate)}
          </div>
          <div style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '20px',
            backgroundColor: getDaysLeftColor(nextDay.daysLeft),
            color: '#fff',
            fontSize: '13px',
            fontWeight: '700'
          }}>
            {getDaysLeftText(nextDay.daysLeft)}
          </div>
        </div>
      )}

      {/* Filtre */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'upcoming', label: 'Yaklaşan' },
          { key: 'past', label: 'Geçen' }
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
            backgroundColor: filter === f.key ? '#059669' : (darkMode ? '#1f2937' : '#f3f4f6'),
            color: filter === f.key ? '#fff' : text,
            fontSize: '13px', fontWeight: '600', cursor: 'pointer'
          }}>
            {f.label} ({days.filter(d => f.key === 'all' ? true : f.key === 'upcoming' ? d.daysLeft >= 0 : d.daysLeft < 0).length})
          </button>
        ))}
      </div>

      {/* Gün Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredDays.map((day, idx) => (
          <div key={`${day.name}-${idx}`} onClick={() => setSelectedDay(selectedDay === idx ? null : idx)} style={{
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: bg,
            border: selectedDay === idx ? '2px solid #059669' : `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
            cursor: 'pointer',
            opacity: day.daysLeft < 0 ? 0.6 : 1,
            transition: 'all 0.2s'
          }}>
            {/* Üst Satır */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '22px' }}>{day.icon}</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: text }}>{day.name}</span>
                </div>
                <div style={{ fontSize: '12px', color: textSec }}>
                  {formatDate(day.gregorianDate)}
                </div>
                <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px' }}>
                  {day.hijriDateStr}
                </div>
              </div>
              <div style={{
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: getDaysLeftColor(day.daysLeft) + '20',
                color: getDaysLeftColor(day.daysLeft),
                fontSize: '12px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}>
                {getDaysLeftText(day.daysLeft)}
              </div>
            </div>

            {/* Kısa Açıklama */}
            <div style={{ fontSize: '13px', color: textSec, marginTop: '8px', lineHeight: '1.5' }}>
              {day.description}
            </div>

            {/* Tür Badge */}
            <div style={{ marginTop: '8px' }}>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: day.type === 'night' ? (darkMode ? '#312e81' : '#eef2ff') : (darkMode ? '#064e3b' : '#ecfdf5'),
                color: day.type === 'night' ? '#6366f1' : '#059669'
              }}>
                {day.type === 'night' ? '🌙 Kandil / Gece' : '☀️ Gün'}
              </span>
            </div>

            {/* Detay */}
            {selectedDay === idx && day.details && (
              <div style={{
                marginTop: '14px',
                paddingTop: '14px',
                borderTop: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                fontSize: '14px',
                lineHeight: '1.7',
                color: text
              }}>
                <div style={{ fontWeight: '700', color: '#059669', marginBottom: '6px', fontSize: '13px' }}>
                  📖 Detaylı Bilgi
                </div>
                {day.details}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredDays.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: textSec }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
          Bu kategoride gün bulunamadı.
        </div>
      )}
    </div>
  );
};

export default ImportantDays;
