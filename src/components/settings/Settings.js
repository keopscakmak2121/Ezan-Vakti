// src/components/settings/Settings.js - KALICI BİLDİRİM EKLENDİ

import React, { useState, useEffect } from 'react';
import { 
  getSettings, 
  saveSettings, 
  resetSettings
} from '../../utils/settingsStorage';
import { 
  getNotificationSettings,
  saveNotificationSettings,
  checkNotificationPermission
} from '../../utils/notificationStorage';
import { 
  scheduleNotifications 
} from '../../utils/notificationService';
import { 
  getPrayerTimesByCoordinates, 
  getUserLocation 
} from '../../utils/prayerTimesApi';

// Import sub-components
import NotificationSettings from './NotificationSettings';
import FontSettings from './FontSettings';
import AudioSettings from './AudioSettings';
import ReadingSettings from './ReadingSettings';

const Settings = ({ darkMode, onDarkModeToggle }) => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadSettings();
    loadNotificationSettings();
    checkPermission();
  }, []);

  const loadSettings = () => {
    const currentSettings = getSettings();
    setSettings(currentSettings);
  };

  const loadNotificationSettings = () => {
    const notifSettings = getNotificationSettings();
    setNotificationSettings(notifSettings);
  };

  const checkPermission = async () => {
    const permission = await checkNotificationPermission();
    setNotificationPermission(permission);
  };

  const rescheduleNotifications = async () => {
    try {
      console.log('🔄 Bildirimler yeniden zamanlanıyor...');
      
      const coords = await getUserLocation();
      const result = await getPrayerTimesByCoordinates(
        coords.latitude,
        coords.longitude
      );

      if (result.success) {
        console.log('✅ Namaz vakitleri alındı:', result.timings);
        await scheduleNotifications(result.timings);
        console.log('✅ Bildirimler güncellendi');
      } else {
        console.error('❌ Namaz vakitleri alınamadı');
      }
    } catch (error) {
      console.error('❌ Bildirim zamanlama hatası:', error);
    }
  };

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const handleNotificationChange = async (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
    
    // ✅ KALICI BİLDİRİM KONTROLÜ - YENİ
    if (key === 'persistentNotification') {
      const { showOngoingNotification, hideOngoingNotification } = await import('../../utils/ongoingNotification');
      
      if (value) {
        // Açıldı - kalıcı bildirimi göster
        const coords = await getUserLocation();
        const result = await getPrayerTimesByCoordinates(coords.latitude, coords.longitude);
        if (result.success) {
          await showOngoingNotification(result.timings);
        }
      } else {
        // Kapatıldı - kalıcı bildirimi gizle
        await hideOngoingNotification();
      }
    }
    
    // ✅ Bildirim ayarları değiştiğinde yeniden zamanla
    await rescheduleNotifications();
    
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const handlePrayerNotificationChange = async (prayerName, key, value) => {
    const newSettings = { ...notificationSettings };
    newSettings.prayerNotifications[prayerName][key] = value;
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
    
    await rescheduleNotifications();
    
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const handlePermissionUpdate = (permission) => {
    setNotificationPermission(permission);
  };

  const handleReset = () => {
    if (window.confirm('Tüm ayarları varsayılana döndürmek istediğinize emin misiniz?')) {
      const defaultSettings = resetSettings();
      setSettings(defaultSettings);
      alert('Ayarlar sıfırlandı!');
    }
  };

  const clearCache = () => {
    if (window.confirm('Önbelleği temizlemek istediğinize emin misiniz? Bu işlem indirilen sesleri silmeyecek.')) {
      sessionStorage.clear();
      alert('Önbellek temizlendi!');
    }
  };

  if (!settings || !notificationSettings) {
    return (
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        color: text
      }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          margin: '0 0 10px 0', 
          color: text,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          ⚙️ Ayarlar
          {saving && (
            <span style={{
              fontSize: '14px',
              color: '#10b981',
              fontWeight: 'normal'
            }}>
              ✓ Kaydedildi
            </span>
          )}
        </h2>
      </div>

      {/* BİLDİRİM AYARLARI - COMPONENT */}
      <NotificationSettings
        notificationSettings={notificationSettings}
        notificationPermission={notificationPermission}
        darkMode={darkMode}
        onNotificationChange={handleNotificationChange}
        onPrayerNotificationChange={handlePrayerNotificationChange}
        onPermissionUpdate={handlePermissionUpdate}
      />

      {/* ARAPÇA FONT AYARLARI - COMPONENT */}
      <FontSettings
        settings={settings}
        darkMode={darkMode}
        onChange={handleChange}
      />

      {/* SES AYARLARI - COMPONENT */}
      <AudioSettings
        settings={settings}
        darkMode={darkMode}
        onChange={handleChange}
      />

      {/* OKUMA AYARLARI - COMPONENT */}
      <ReadingSettings
        settings={settings}
        darkMode={darkMode}
        onChange={handleChange}
      />

      {/* GENEL AYARLAR */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
        borderRadius: '10px'
      }}>
        <h3 style={{ fontSize: '18px', color: text, marginBottom: '20px' }}>
          🔧 Genel Ayarlar
        </h3>

        {/* Karanlık Mod */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div>
            <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
              Karanlık Mod
            </div>
            <div style={{ fontSize: '12px', color: textSec }}>
              Koyu tema kullan
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => {
                onDarkModeToggle();
                handleChange('darkMode', !darkMode);
              }}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: darkMode ? '#059669' : '#ccc',
              transition: '0.4s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: darkMode ? '28px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.4s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>
      </div>

      {/* BUTONLAR */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={clearCache}
          style={{
            flex: '1',
            minWidth: '150px',
            padding: '12px 20px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🗑️ Önbelleği Temizle
        </button>

        <button
          onClick={handleReset}
          style={{
            flex: '1',
            minWidth: '150px',
            padding: '12px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🔄 Ayarları Sıfırla
        </button>
      </div>
    </div>
  );
};

export default Settings;