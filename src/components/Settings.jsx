import React, { useState, useRef } from 'react';
import {
  getNotificationSettings,
  saveNotificationSettings,
  SOUND_OPTIONS,
  resetNotificationSettings,
  downloadAdhanSound,
  isSoundDownloaded
} from '../utils/notificationStorage';
import { getStoredPrayerTimes } from '../utils/storage';
import { scheduleNotifications } from '../utils/notificationService';
import { homeThemes, getHomeTheme, saveHomeTheme } from '../utils/settingsStorage';
import { showOngoingNotification, hideOngoingNotification } from '../utils/ongoingNotification';
import { registerPlugin } from '@capacitor/core';
import {
  Bell, Moon, Volume2, Activity, RotateCcw,
  ChevronDown, ChevronUp, Play, Square, Download, Check, Smartphone, Palette, Clock, Monitor
} from 'lucide-react';

const PrayerPlugin = registerPlugin('PrayerPlugin');

const Settings = ({ darkMode, toggleDarkMode, onThemeChange }) => {
  const [settings, setSettings] = useState(getNotificationSettings());
  const [expandedPrayer, setExpandedPrayer] = useState(null);
  const [playingSound, setPlayingSound] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(getHomeTheme().id);
  const audioRef = useRef(new Audio());

  const prayerNames = {
    Fajr: 'İmsak',
    Sunrise: 'Güneş',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Maghrib: 'Akşam',
    Isha: 'Yatsı'
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);

    // Eğer kalıcı bildirim ayarı değiştiyse aksiyon al
    if (key === 'ongoingEnabled') {
      if (value) {
        const stored = getStoredPrayerTimes();
        if (stored) showOngoingNotification(stored.timings);
      } else {
        hideOngoingNotification();
      }
    }

    // Tam ekran bildirim ayarı değiştiyse Native tarafa bildir
    if (key === 'fullScreenEnabled') {
      PrayerPlugin.setFullScreenEnabled({ enabled: value });
    }

    refreshNotifications();
  };

  const handlePrayerSettingChange = (prayer, key, value) => {
    const newSettings = {
      ...settings,
      prayerNotifications: {
        ...settings.prayerNotifications,
        [prayer]: {
          ...settings.prayerNotifications[prayer],
          [key]: value
        }
      }
    };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
    refreshNotifications();
  };

  const refreshNotifications = () => {
    const stored = getStoredPrayerTimes();
    if (stored) scheduleNotifications(stored.timings);
  };

  const handlePreviewSound = (soundId, soundType) => {
    if (playingSound === soundId) {
      audioRef.current.pause();
      setPlayingSound(null);
      return;
    }
    const type = soundType || 'adhan';
    const soundList = SOUND_OPTIONS[type] || [];
    const sound = soundList.find(s => s.id === soundId);
    if (sound) {
      audioRef.current.src = sound.remoteUrl || `sounds/${sound.file}`;
      audioRef.current.play();
      setPlayingSound(soundId);
      audioRef.current.onended = () => setPlayingSound(null);
    }
  };

  const handleDownload = async (soundId, soundType) => {
    setDownloadingId(soundId);
    const success = await downloadAdhanSound(soundId, soundType);
    setDownloadingId(null);
    if (success) {
      alert('✅ Ses başarıyla indirildi!');
      setSettings({ ...getNotificationSettings() });
    } else {
      alert('❌ İndirme başarısız. İnternet bağlantınızı kontrol edin.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Ayarlar sıfırlansın mı?')) {
      const defaults = resetNotificationSettings();
      setSettings(defaults);
      hideOngoingNotification();
      PrayerPlugin.setFullScreenEnabled({ enabled: true });
      refreshNotifications();
    }
  };

  const styles = {
    container: { padding: '20px', color: darkMode ? '#f3f4f6' : '#1f2937', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' },
    section: { backgroundColor: darkMode ? '#1f2937' : '#fff', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    sectionTitle: { fontSize: '14px', fontWeight: '600', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '12px', textTransform: 'uppercase' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}` },
    labelContainer: { display: 'flex', alignItems: 'center', gap: '12px' },
    label: { fontSize: '16px', fontWeight: '500' },
    select: { padding: '8px', borderRadius: '8px', border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, backgroundColor: darkMode ? '#374151' : '#fff', color: darkMode ? '#fff' : '#000', fontSize: '14px' },
    toggle: { position: 'relative', display: 'inline-block', width: '44px', height: '24px' },
    toggleInput: { opacity: 0, width: 0, height: 0 },
    slider: (checked) => ({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: checked ? '#10b981' : (darkMode ? '#4b5563' : '#ccc'), transition: '.3s', borderRadius: '24px' }),
    knob: (checked) => ({ position: 'absolute', height: '18px', width: '18px', left: checked ? '22px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.3s', borderRadius: '50%' }),
    prayerCard: { border: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`, borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' },
    prayerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', cursor: 'pointer', backgroundColor: darkMode ? '#262f3f' : '#f9fafb' },
    prayerContent: { padding: '12px', backgroundColor: darkMode ? '#1f2937' : '#fff', borderTop: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}` }
  };

  const Toggle = ({ checked, onChange }) => (
    <label style={styles.toggle}>
      <input type="checkbox" checked={checked} onChange={onChange} style={styles.toggleInput} />
      <span style={styles.slider(checked)}><span style={styles.knob(checked)}></span></span>
    </label>
  );

  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>Ayarlar</h2>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Görünüm & Genel</div>
        <div style={styles.row}>
          <div style={styles.labelContainer}><Moon size={20} /><span style={styles.label}>Karanlık Mod</span></div>
          <Toggle checked={darkMode} onChange={toggleDarkMode} />
        </div>

        <div style={{ padding: '12px 0', borderBottom: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}` }}>
          <div style={{ ...styles.labelContainer, marginBottom: '12px' }}>
            <Palette size={20} />
            <span style={styles.label}>Ana Sayfa Teması</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {homeThemes.map(theme => {
              const colors = darkMode ? theme.dark : theme.light;
              const isSelected = selectedTheme === theme.id;
              return (
                <div key={theme.id} onClick={() => {
                  setSelectedTheme(theme.id);
                  saveHomeTheme(theme.id);
                  if (onThemeChange) onThemeChange(theme.id);
                }} style={{
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: isSelected ? `2px solid ${colors.accent}` : `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  backgroundColor: colors.cardBg,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>{theme.preview}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: colors.text }}>{theme.name}</div>
                  {isSelected && <div style={{ fontSize: '10px', color: colors.accent, marginTop: '2px', fontWeight: '700' }}>✓ Aktif</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Kalıcı Bildirim Ayarı */}
        <div style={styles.row}>
          <div style={styles.labelContainer}>
            <Clock size={20} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={styles.label}>Kalıcı Bildirim</span>
              <span style={{ fontSize: '11px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Bildirim panelinde vakitleri gösterir</span>
            </div>
          </div>
          <Toggle checked={settings.ongoingEnabled} onChange={(e) => handleSettingChange('ongoingEnabled', e.target.checked)} />
        </div>

        {/* Tam Ekran Bildirim Ayarı */}
        <div style={styles.row}>
          <div style={styles.labelContainer}>
            <Monitor size={20} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={styles.label}>Tam Ekran Bildirim</span>
              <span style={{ fontSize: '11px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Ezan vaktinde ekranı açar (Kilit ekranı)</span>
            </div>
          </div>
          <Toggle checked={settings.fullScreenEnabled} onChange={(e) => handleSettingChange('fullScreenEnabled', e.target.checked)} />
        </div>

        <div style={styles.row}>
          <div style={styles.labelContainer}><Smartphone size={20} /><span style={styles.label}>Genel Titreşim</span></div>
          <Toggle checked={settings.vibration} onChange={(e) => handleSettingChange('vibration', e.target.checked)} />
        </div>
        <div style={{...styles.row, borderBottom: 'none'}}>
          <div style={styles.labelContainer}><Bell size={20} /><span style={styles.label}>Tüm Bildirimler</span></div>
          <Toggle checked={settings.enabled} onChange={(e) => handleSettingChange('enabled', e.target.checked)} />
        </div>
      </div>

      {settings.enabled && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Vakit Detayları</div>
          {Object.keys(prayerNames).map((key) => {
            const config = settings.prayerNotifications?.[key] || {};
            const soundType = config.soundType || 'adhan';
            const soundId = config.soundId || 'default';
            const isDownloaded = isSoundDownloaded(soundId);

            return (
              <div key={key} style={styles.prayerCard}>
                <div style={styles.prayerHeader} onClick={() => setExpandedPrayer(expandedPrayer === key ? null : key)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600' }}>{prayerNames[key]}</span>
                    {!config.enabled && <span style={{ fontSize: '10px', backgroundColor: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '10px' }}>Kapalı</span>}
                  </div>
                  {expandedPrayer === key ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {expandedPrayer === key && (
                  <div style={styles.prayerContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <span style={{ fontSize: '14px' }}>Bildirim</span>
                      <Toggle checked={config.enabled} onChange={(e) => handlePrayerSettingChange(key, 'enabled', e.target.checked)} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <span style={{ fontSize: '14px' }}>Vakitte Titreşim</span>
                      <Toggle checked={config.vibration !== false} onChange={(e) => handlePrayerSettingChange(key, 'vibration', e.target.checked)} />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <span style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Ses Türü</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {['adhan', 'notification'].map(t => (
                          <button key={t} onClick={() => handlePrayerSettingChange(key, 'soundType', t)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: soundType === t ? '#059669' : (darkMode ? '#374151' : '#f3f4f6'), color: soundType === t ? 'white' : (darkMode ? '#f3f4f6' : '#1f2937'), fontSize: '13px' }}>{t === 'adhan' ? 'Ezan' : 'Bildirim'}</button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <span style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Ses Seçimi</span>
                      <select style={{...styles.select, width: '100%', marginBottom: '10px', boxSizing: 'border-box'}} value={soundId} onChange={(e) => {
                        const newSoundId = e.target.value;
                        const allSounds = [...SOUND_OPTIONS.adhan, ...SOUND_OPTIONS.notification];
                        const selectedSound = allSounds.find(s => s.id === newSoundId);
                        if (selectedSound && !selectedSound.local && !isSoundDownloaded(newSoundId) && newSoundId !== 'default') {
                          handlePrayerSettingChange(key, 'soundId', newSoundId);
                          alert('Bu ses henüz indirilmedi. Aşağıdaki İndir butonuna basarak sesi indirin.');
                        } else {
                          handlePrayerSettingChange(key, 'soundId', newSoundId);
                        }
                      }}>
                        <optgroup label="📱 Yüklü Sesler">
                          {(SOUND_OPTIONS[soundType] || []).filter(s => s.local).map(s => (
                            <option key={s.id} value={s.id}>✅ {s.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="☁️ İndirilebilir Sesler">
                          {(SOUND_OPTIONS[soundType] || []).filter(s => !s.local && s.id !== 'default').map(s => (
                            <option key={s.id} value={s.id}>{isSoundDownloaded(s.id) ? '✅' : '⬇️'} {s.name}</option>
                          ))}
                        </optgroup>
                      </select>

                      <button onClick={() => handlePreviewSound(soundId, soundType)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: playingSound === soundId ? '#dc2626' : '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '8px', boxSizing: 'border-box', cursor: 'pointer' }}>
                        {playingSound === soundId ? <><Square size={16} fill="white" /> Durdur</> : <><Play size={16} fill="white" /> Dinle</>}
                      </button>

                      {!isDownloaded && soundId !== 'default' && (
                        <button onClick={() => handleDownload(soundId, soundType)} disabled={downloadingId === soundId} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: downloadingId === soundId ? '#6b7280' : '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box', cursor: downloadingId === soundId ? 'wait' : 'pointer' }}>
                          {downloadingId === soundId ? '⏳ İndiriliyor...' : <><Download size={16} /> İndir</>}
                        </button>
                      )}

                      {isDownloaded && soundId !== 'default' && (() => {
                        const allSounds = [...SOUND_OPTIONS.adhan, ...SOUND_OPTIONS.notification];
                        const s = allSounds.find(x => x.id === soundId);
                        return s && !s.local;
                      })() && (
                        <div style={{ textAlign: 'center', padding: '10px', color: '#f59e0b', fontSize: '12px', backgroundColor: darkMode ? '#1f2937' : '#fefce8', borderRadius: '8px', marginTop: '6px', lineHeight: '1.5' }}>
                          ✅ İndirildi — Dinle ile önizleyebilirsiniz.<br/>
                          ⚠️ Bildirimde varsayılan ezan/bildirim sesi çalar.<br/>
                          <span style={{ fontSize: '11px', opacity: 0.7 }}>(Gelecek güncellemede bildirimde de bu ses çalacak)</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px' }}>Kaç Dakika Önce?</span>
                        <span style={{ fontSize: '11px', opacity: 0.6 }}>(0 = Tam vaktinde)</span>
                      </div>
                      <input type="number" style={{ width: '60px', padding: '6px', borderRadius: '6px', border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, backgroundColor: darkMode ? '#374151' : '#fff', color: darkMode ? '#fff' : '#000', textAlign: 'center' }} value={config.minutesBefore || 0} onChange={(e) => handlePrayerSettingChange(key, 'minutesBefore', parseInt(e.target.value) || 0)} min="0" max="60" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button onClick={() => {
        localStorage.removeItem('setup_completed');
        window.location.reload();
      }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', backgroundColor: darkMode ? '#065f46' : '#ecfdf5', border: `1px solid #059669`, borderRadius: '12px', color: '#059669', fontWeight: '600', marginBottom: '12px', fontSize: '15px' }}>
        🛠️ Kurulum Sihirbazını Tekrar Çalıştır
      </button>

      <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', backgroundColor: 'transparent', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, borderRadius: '12px', color: '#ef4444', fontWeight: '500', marginBottom: '30px' }}>
        <RotateCcw size={18} /> Ayarları Sıfırla
      </button>
    </div>
  );
};

export default Settings;
