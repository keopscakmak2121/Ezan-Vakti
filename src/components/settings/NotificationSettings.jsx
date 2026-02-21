// src/components/settings/NotificationSettings.jsx - SES İNDİRME + ONLİNE DİNLEME

import React, { useState, useRef, useEffect } from 'react';
import { SOUND_OPTIONS, isSoundDownloaded, downloadAdhanSound, getPlayableUrl, deleteDownloadedSound } from '../../utils/notificationStorage.js';
import { sendTestNotification } from '../../utils/notificationService.js';

const NotificationSettings = ({ 
  notificationSettings, 
  notificationPermission,
  darkMode,
  onNotificationChange,
  onPrayerNotificationChange,
  onPermissionUpdate
}) => {
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';
  const cardBg = darkMode ? '#4b5563' : '#f9fafb';

  const [playingSound, setPlayingSound] = useState(null);
  const [downloadingSound, setDownloadingSound] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedList, setDownloadedList] = useState([]);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // İndirilmiş ses listesini yükle
    const dl = JSON.parse(localStorage.getItem('downloaded_sounds') || '[]');
    setDownloadedList(dl);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stopCurrentSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      try { audioRef.current.load(); } catch(e) {}
      audioRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPlayingSound(null);
  };

  // Ses dinleme - local, indirilmiş veya online
  const handlePreviewSound = async (sound, soundType) => {
    if (playingSound === sound.id) {
      stopCurrentSound();
      return;
    }
    stopCurrentSound();

    try {
      // Çalınabilir URL al
      const url = await getPlayableUrl(sound.id, soundType);
      if (!url) {
        alert('Bu ses çalınamıyor. Lütfen önce indirin.');
        return;
      }

      setPlayingSound(sound.id);
      const audio = new Audio(url);
      audioRef.current = audio;

      const maxDuration = 20;

      audio.play().then(() => {
        console.log('✅ Ses çalmaya başladı:', sound.name);
      }).catch(err => {
        console.error('❌ Ses çalma hatası:', err);
        setPlayingSound(null);
        audioRef.current = null;
      });

      intervalRef.current = setInterval(() => {
        if (audio.currentTime >= maxDuration) {
          stopCurrentSound();
        }
      }, 100);

      audio.onended = () => stopCurrentSound();
      audio.onerror = () => stopCurrentSound();
    } catch (e) {
      console.error('Ses önizleme hatası:', e);
      stopCurrentSound();
    }
  };

  // Ses indirme
  const handleDownload = async (sound, soundType) => {
    setDownloadingSound(sound.id);
    setDownloadProgress(0);
    const success = await downloadAdhanSound(sound.id, soundType, (p) => setDownloadProgress(p));
    if (success) {
      const dl = JSON.parse(localStorage.getItem('downloaded_sounds') || '[]');
      setDownloadedList(dl);
    } else {
      alert('İndirme başarısız oldu. İnternet bağlantınızı kontrol edin.');
    }
    setDownloadingSound(null);
    setDownloadProgress(0);
  };

  // Ses silme
  const handleDeleteSound = async (sound) => {
    await deleteDownloadedSound(sound.id);
    const dl = JSON.parse(localStorage.getItem('downloaded_sounds') || '[]');
    setDownloadedList(dl);
  };

  const handleRequestPermission = async () => {
    try {
      if (window.Notification) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          onPermissionUpdate(permission);
          alert('✅ Bildirim izni verildi!');
          setTimeout(() => sendTestNotification(), 1000);
        } else {
          alert('❌ Bildirim izni reddedildi.\n\nTelefon Ayarları → Uygulamalar → Ezan Vakti → Bildirimler → Açık');
        }
      }
    } catch (error) {
      console.error('İzin hatası:', error);
    }
  };

  const handleToggleNotifications = (enabled) => {
    if (enabled && notificationPermission !== 'granted') {
      handleRequestPermission();
    } else {
      onNotificationChange('enabled', enabled);
    }
  };

  const prayerNames = {
    Fajr: { name: 'İmsak', icon: '🌙' },
    Sunrise: { name: 'Güneş', icon: '🌅' },
    Dhuhr: { name: 'Öğle', icon: '☀️' },
    Asr: { name: 'İkindi', icon: '🌤️' },
    Maghrib: { name: 'Akşam', icon: '🌆' },
    Isha: { name: 'Yatsı', icon: '🌙' }
  };

  // ═══════════════════════════════════════════════════
  // SES KARTLARI - Local ve İndirilebilir ayrı
  // ═══════════════════════════════════════════════════
  const renderSoundCard = (sound, soundType) => {
    const isLocal = sound.local;
    const isDownloaded = downloadedList.includes(sound.id);
    const isDefault = sound.id === 'default';
    const isPlaying = playingSound === sound.id;
    const isDownloading = downloadingSound === sound.id;
    const isSelected = soundType === 'adhan' 
      ? notificationSettings.selectedAdhan === sound.id
      : notificationSettings.selectedNotification === sound.id;

    return (
      <div 
        key={sound.id}
        style={{
          padding: '12px',
          backgroundColor: darkMode ? '#374151' : '#f3f4f6',
          borderRadius: '8px',
          border: isSelected ? '2px solid #059669' : `2px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => {
          if (soundType === 'adhan') onNotificationChange('selectedAdhan', sound.id);
          else onNotificationChange('selectedNotification', sound.id);
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          {/* Sol: Radio + İsim + Durum */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, minWidth: 0 }}>
            <input
              type="radio"
              name={soundType}
              value={sound.id}
              checked={isSelected}
              onChange={() => {
                if (soundType === 'adhan') onNotificationChange('selectedAdhan', sound.id);
                else onNotificationChange('selectedNotification', sound.id);
              }}
              style={{ cursor: 'pointer', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ 
                color: text, 
                fontSize: '13px', 
                fontWeight: isSelected ? 'bold' : 'normal',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {isLocal ? '📦 ' : (isDownloaded ? '✅ ' : '☁️ ')}{sound.name}
              </div>
              {!isLocal && !isDefault && (
                <div style={{ fontSize: '11px', color: textSec, marginTop: '2px' }}>
                  {isDownloaded ? 'İndirildi' : 'İndirilebilir'}
                </div>
              )}
            </div>
          </label>

          {/* Sağ: Butonlar */}
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            {/* İndir / Sil butonu (sadece remote sesler) */}
            {!isLocal && !isDefault && (
              isDownloaded ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteSound(sound); }}
                  title="Sil"
                  style={{
                    padding: '5px 8px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(sound, soundType); }}
                  disabled={isDownloading}
                  style={{
                    padding: '5px 8px',
                    backgroundColor: isDownloading ? '#6b7280' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    minWidth: '40px'
                  }}
                >
                  {isDownloading ? `${downloadProgress}%` : '📥'}
                </button>
              )
            )}

            {/* Dinle butonu (her ses için) */}
            {!isDefault && (
              <button
                onClick={(e) => { e.stopPropagation(); handlePreviewSound(sound, soundType); }}
                style={{
                  padding: '5px 10px',
                  backgroundColor: isPlaying ? '#dc2626' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {isPlaying ? '⏹' : '▶'}
              </button>
            )}
          </div>
        </div>

        {/* İndirme progress bar */}
        {isDownloading && (
          <div style={{ marginTop: '8px', backgroundColor: darkMode ? '#1f2937' : '#e5e7eb', borderRadius: '4px', overflow: 'hidden', height: '4px' }}>
            <div style={{ height: '100%', backgroundColor: '#3b82f6', width: `${downloadProgress}%`, transition: 'width 0.3s' }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h3 style={{ fontSize: '20px', marginBottom: '20px', color: text, display: 'flex', alignItems: 'center', gap: '10px' }}>
        🔔 Bildirim Ayarları
      </h3>

      {notificationPermission === 'prompt' && (
        <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', marginBottom: '20px', border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#92400e', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ Bildirim İzni Gerekli
          </div>
          <div style={{ fontSize: '14px', color: '#78350f', marginBottom: '15px', lineHeight: '1.5' }}>
            Namaz vakti bildirimlerini alabilmek için uygulama izni vermeniz gerekiyor.
          </div>
          <button onClick={handleRequestPermission} style={{ padding: '10px 20px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
            📱 İzin Ver
          </button>
        </div>
      )}

      {notificationPermission === 'denied' && (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px', marginBottom: '20px', border: '2px solid #ef4444' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#991b1b', marginBottom: '10px' }}>❌ Bildirim İzni Reddedildi</div>
          <div style={{ fontSize: '13px', color: '#7f1d1d', lineHeight: '1.5' }}>
            Bildirimleri açmak için:<br/><strong>Telefon Ayarları → Uygulamalar → Ezan Vakti → Bildirimler → Açık</strong>
          </div>
        </div>
      )}

      {/* Ana Aç/Kapat */}
      <div style={{ padding: '20px', backgroundColor: cardBg, borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: text, marginBottom: '5px' }}>🕌 Namaz Vakti Bildirimleri</div>
            <div style={{ fontSize: '13px', color: textSec }}>Tüm bildirimleri aç/kapat</div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
            <input type="checkbox" checked={notificationSettings.enabled} onChange={(e) => handleToggleNotifications(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: notificationSettings.enabled ? '#059669' : '#d1d5db', transition: '0.4s', borderRadius: '34px' }}>
              <span style={{ position: 'absolute', height: '26px', width: '26px', left: notificationSettings.enabled ? '30px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '0.4s', borderRadius: '50%' }}></span>
            </span>
          </label>
        </div>
      </div>

      {notificationSettings.enabled && (
        <>
          {/* ═══════════ SES AYARLARI ═══════════ */}
          <div style={{ padding: '20px', backgroundColor: cardBg, borderRadius: '8px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: text, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎵 Ses Ayarları
            </h4>

            {/* Ses Aç/Kapat */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '15px', borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
              <div>
                <div style={{ fontSize: '14px', color: text }}>Bildirim Sesi</div>
                <div style={{ fontSize: '12px', color: textSec }}>Ses çalma aç/kapat</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                <input type="checkbox" checked={notificationSettings.sound} onChange={(e) => onNotificationChange('sound', e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: notificationSettings.sound ? '#059669' : '#d1d5db', transition: '0.4s', borderRadius: '28px' }}>
                  <span style={{ position: 'absolute', height: '22px', width: '22px', left: notificationSettings.sound ? '25px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '0.4s', borderRadius: '50%' }}></span>
                </span>
              </label>
            </div>

            {notificationSettings.sound && (
              <>
                {/* Ses Tipi Seçimi */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '14px', color: text, marginBottom: '8px', display: 'block' }}>Ses Tipi</label>
                  <select
                    value={notificationSettings.soundType}
                    onChange={(e) => onNotificationChange('soundType', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, backgroundColor: darkMode ? '#1f2937' : 'white', color: text, fontSize: '14px' }}
                  >
                    <option value="adhan">🕌 Ezan Sesi</option>
                    <option value="notification">🔔 Bildirim Sesi</option>
                  </select>
                </div>

                {/* Ezan Sesleri */}
                {notificationSettings.soundType === 'adhan' && (
                  <div>
                    {/* Yerel Ezanlar */}
                    <div style={{ fontSize: '13px', color: '#059669', fontWeight: 'bold', marginBottom: '8px', marginTop: '10px' }}>
                      📦 Yerel Sesler (Yüklü)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '15px' }}>
                      {SOUND_OPTIONS.adhan.filter(s => s.local).map(sound => renderSoundCard(sound, 'adhan'))}
                    </div>

                    {/* İndirilebilir Ezanlar */}
                    <div style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 'bold', marginBottom: '8px' }}>
                      ☁️ İndirilebilir Sesler ({SOUND_OPTIONS.adhan.filter(s => !s.local).length} ezan)
                    </div>
                    <div style={{ fontSize: '11px', color: textSec, marginBottom: '8px' }}>
                      ▶ ile online dinleyin, 📥 ile indirin. İndirilen sesler çevrimdışı çalışır.
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {SOUND_OPTIONS.adhan.filter(s => !s.local).map(sound => renderSoundCard(sound, 'adhan'))}
                    </div>
                  </div>
                )}

                {/* Bildirim Sesleri */}
                {notificationSettings.soundType === 'notification' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {SOUND_OPTIONS.notification.map(sound => renderSoundCard(sound, 'notification'))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ═══════════ TİTREŞİM ═══════════ */}
          <div style={{ padding: '20px', backgroundColor: cardBg, borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: text, marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>📳 Titreşim</div>
                <div style={{ fontSize: '13px', color: textSec }}>Bildirim geldiğinde titreşim</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                <input type="checkbox" checked={notificationSettings.vibration} onChange={(e) => onNotificationChange('vibration', e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: notificationSettings.vibration ? '#059669' : '#d1d5db', transition: '0.4s', borderRadius: '28px' }}>
                  <span style={{ position: 'absolute', height: '22px', width: '22px', left: notificationSettings.vibration ? '25px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '0.4s', borderRadius: '50%' }}></span>
                </span>
              </label>
            </div>
          </div>

          {/* ═══════════ KALICI BİLDİRİM ═══════════ */}
          <div style={{ padding: '20px', backgroundColor: cardBg, borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: text, marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>📌 Kalıcı Bildirim</div>
                <div style={{ fontSize: '13px', color: textSec }}>Sonraki namaz vakti sürekli gösterimde</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                <input type="checkbox" checked={notificationSettings.persistentNotification || false} onChange={(e) => onNotificationChange('persistentNotification', e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: notificationSettings.persistentNotification ? '#059669' : '#d1d5db', transition: '0.4s', borderRadius: '28px' }}>
                  <span style={{ position: 'absolute', height: '22px', width: '22px', left: notificationSettings.persistentNotification ? '25px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '0.4s', borderRadius: '50%' }}></span>
                </span>
              </label>
            </div>
          </div>

          {/* ═══════════ TEST BİLDİRİMİ ═══════════ */}
          <div style={{ padding: '20px', backgroundColor: cardBg, borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
            <button
              onClick={() => sendTestNotification()}
              style={{ padding: '12px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
            >
              🔔 Test Bildirimi Gönder
            </button>
            <div style={{ fontSize: '12px', color: textSec, marginTop: '10px' }}>Seçili ayarlarla test bildirimi gönderilir</div>
          </div>

          {/* ═══════════ NAMAZ VAKİTLERİ ═══════════ */}
          <div style={{ padding: '20px', backgroundColor: cardBg, borderRadius: '8px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: text, marginBottom: '15px' }}>🕌 Namaz Vakitleri</h4>

            {Object.keys(prayerNames).map(prayer => (
              <div key={prayer} style={{ padding: '12px 0', borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{prayerNames[prayer].icon}</span>
                    <span style={{ color: text, fontSize: '14px' }}>{prayerNames[prayer].name}</span>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                    <input type="checkbox" checked={notificationSettings.prayerNotifications[prayer]?.enabled} onChange={(e) => onPrayerNotificationChange(prayer, 'enabled', e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: notificationSettings.prayerNotifications[prayer]?.enabled ? '#059669' : '#d1d5db', transition: '0.4s', borderRadius: '28px' }}>
                      <span style={{ position: 'absolute', height: '22px', width: '22px', left: notificationSettings.prayerNotifications[prayer]?.enabled ? '25px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '0.4s', borderRadius: '50%' }}></span>
                    </span>
                  </label>
                </div>
                
                {notificationSettings.prayerNotifications[prayer]?.enabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', padding: '10px', backgroundColor: darkMode ? '#1f2937' : '#e5e7eb', borderRadius: '6px' }}>
                    <label style={{ color: text, fontSize: '12px', whiteSpace: 'nowrap' }}>Vakitten</label>
                    <select
                      value={notificationSettings.prayerNotifications[prayer]?.adjustment || 0}
                      onChange={(e) => onPrayerNotificationChange(prayer, 'adjustment', parseInt(e.target.value))}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #9ca3af', backgroundColor: darkMode ? '#374151' : 'white', color: text, fontSize: '12px', flex: 1 }}
                    >
                      <option value={-10}>10 dk ÖNCE</option>
                      <option value={-5}>5 dk ÖNCE</option>
                      <option value={0}>TAM VAKTİNDE</option>
                      <option value={5}>5 dk SONRA</option>
                      <option value={10}>10 dk SONRA</option>
                    </select>
                    <label style={{ color: text, fontSize: '12px', whiteSpace: 'nowrap' }}>Ayarlı</label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationSettings;
