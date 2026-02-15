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
import {
  Bell, Moon, Volume2, Activity, RotateCcw,
  ChevronDown, ChevronUp, Play, Square, Download, Check, Smartphone
} from 'lucide-react';

const Settings = ({ darkMode, toggleDarkMode }) => {
  const [settings, setSettings] = useState(getNotificationSettings());
  const [expandedPrayer, setExpandedPrayer] = useState(null);
  const [playingSound, setPlayingSound] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
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
      setSettings(getNotificationSettings());
    }
  };

  const handleReset = () => {
    if (window.confirm('Ayarlar sıfırlansın mı?')) {
      const defaults = resetNotificationSettings();
      setSettings(defaults);
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
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select style={{...styles.select, flex: 1}} value={soundId} onChange={(e) => handlePrayerSettingChange(key, 'soundId', e.target.value)}>
                          {(SOUND_OPTIONS[soundType] || []).map(s => (
                            <option key={s.id} value={s.id}>{s.name} {!isSoundDownloaded(s.id) && s.id !== 'default' ? '(Bulut)' : ''}</option>
                          ))}
                        </select>
                        <button onClick={() => handlePreviewSound(soundId, soundType)} style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: 'white' }}>
                          {playingSound === soundId ? <Square size={16} fill="white" /> : <Play size={16} fill="white" />}
                        </button>
                        {!isDownloaded && soundId !== 'default' && (
                          <button onClick={() => handleDownload(soundId, soundType)} style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white' }}>
                            {downloadingId === soundId ? '...' : <Download size={16} />}
                          </button>
                        )}
                      </div>
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

      <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', backgroundColor: 'transparent', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, borderRadius: '12px', color: '#ef4444', fontWeight: '500', marginBottom: '30px' }}>
        <RotateCcw size={18} /> Ayarları Sıfırla
      </button>
    </div>
  );
};

export default Settings;
