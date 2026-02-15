// src/components/settings/Settings.jsx - GÜNCELLENMİŞ VERSİYON

import React, { useState } from 'react';
import { getNotificationSettings, saveNotificationSettings, SOUND_OPTIONS } from '../../utils/notificationStorage';

const Settings = ({ darkMode, toggleDarkMode }) => {
  const [notifSettings, setNotifSettings] = useState(getNotificationSettings());

  const handleToggleNotif = () => {
    const newSettings = { ...notifSettings, enabled: !notifSettings.enabled };
    setNotifSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleSoundChange = (type, value) => {
    const newSettings = { ...notifSettings, [type]: value };
    setNotifSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const styles = {
    page: { padding: '20px', color: darkMode ? '#f9fafb' : '#111827' },
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' },
    section: { marginBottom: '30px' },
    sectionTitle: { fontSize: '16px', color: '#888', marginBottom: '10px', textTransform: 'uppercase' },
    item: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '15px', backgroundColor: darkMode ? '#1f2937' : '#fff',
      borderRadius: '12px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    select: {
      padding: '8px', borderRadius: '8px', border: '1px solid #ccc',
      backgroundColor: darkMode ? '#374151' : '#fff', color: darkMode ? '#fff' : '#000'
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Ayarlar</h1>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Uygulama Görünümü</h2>
        <div style={styles.item}>
          <span>Karanlık Mod</span>
          <button onClick={toggleDarkMode} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: darkMode ? '#10b981' : '#ccc' }}>
            {darkMode ? 'Açık' : 'Kapalı'}
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Bildirim Ayarları</h2>
        <div style={styles.item}>
          <span>Ezan Bildirimleri</span>
          <button onClick={handleToggleNotif} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: notifSettings.enabled ? '#10b981' : '#ccc' }}>
            {notifSettings.enabled ? 'Aktif' : 'Pasif'}
          </button>
        </div>

        <div style={styles.item}>
          <span>Ezan Sesi</span>
          <select
            value={notifSettings.selectedAdhan}
            onChange={(e) => handleSoundChange('selectedAdhan', e.target.value)}
            style={styles.select}
          >
            {SOUND_OPTIONS.adhan.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div style={styles.item}>
          <span>Vakit Öncesi Hatırlatıcı</span>
          <select
            value={notifSettings.selectedNotification}
            onChange={(e) => handleSoundChange('selectedNotification', e.target.value)}
            style={styles.select}
          >
            {SOUND_OPTIONS.notification.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Veri ve Konum</h2>
        <button
          onClick={() => { localStorage.removeItem('prayer_times_cache'); window.location.reload(); }}
          style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 'bold' }}
        >
          Konum ve Vakitleri Sıfırla
        </button>
      </div>
    </div>
  );
};

export default Settings;
