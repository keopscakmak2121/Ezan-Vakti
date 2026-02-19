import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const NOTIFICATION_SETTINGS_KEY = 'quran_notification_settings';
const DOWNLOADED_SOUNDS_KEY = 'downloaded_sounds';

export const SOUND_OPTIONS = {
  adhan: [
    { id: 'adhan1', name: 'Mekke Ezanı', file: 'adhan1.mp3', local: true },
    { id: 'adhan2', name: 'Medine Ezanı', file: 'adhan2.mp3', local: true },
    { id: 'adhan3', name: 'İstanbul Ezanı', file: 'adhan3.mp3', local: true },
    { id: 'adhan4', name: 'Mısır Ezanı', file: 'adhan4.mp3', local: true },
    { id: 'adhan5', name: 'Mescid-i Aksa', file: 'adhan5.mp3', local: true },
    { id: 'adhan6', name: 'Abdulbasit', file: 'adhan6.mp3', local: true },
    { id: 'adhan_sudais', name: 'Abdurrahman Sudais', file: 'adhan_sudais.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan5.mp3' },
    { id: 'adhan_mishary', name: 'Mishari Raşid', file: 'adhan_mishary.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan6.mp3' },
    { id: 'adhan_ali_ahmed', name: 'Ali Ahmed Molla', file: 'adhan_ali_ahmed.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan7.mp3' },
    { id: 'adhan_naqshbandi', name: 'Naqshbandi', file: 'adhan_naqshbandi.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan8.mp3' },
    { id: 'adhan_qatami', name: 'Nasser Al Qatami', file: 'adhan_qatami.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan9.mp3' },
    { id: 'adhan_sharif', name: 'Hafız Mustafa', file: 'adhan_sharif.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan11.mp3' },
    { id: 'adhan_mansoor', name: 'Mansoor Zaahid', file: 'adhan_mansoor.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan12.mp3' },
    { id: 'adhan_fajr', name: 'Sabah Ezanı (Özel)', file: 'adhan_fajr.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan14.mp3' },
  ],
  notification: [
    { id: 'notification1', name: 'Kısa Uyarı', file: 'notification1.mp3', local: true },
    { id: 'notification2', name: 'Zil Sesi', file: 'notification2.mp3', local: true },
    { id: 'notification3', name: 'Dijital Bip', file: 'notification3.mp3', local: true },
    { id: 'notification4', name: 'Yumuşak Ton', file: 'notification4.mp3', local: true },
    // Kesin çalışan Pixabay linkleri
    { id: 'notif_beep1', name: 'Kısa Bip', file: 'notif_beep1.mp3', local: false, remoteUrl: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a7315b.mp3' },
    { id: 'notif_chime', name: 'Modern Uyarı', file: 'notif_chime.mp3', local: false, remoteUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_7302484f98.mp3' },
    { id: 'notif_soft', name: 'Yumuşak Melodi', file: 'notif_soft.mp3', local: false, remoteUrl: 'https://cdn.pixabay.com/audio/2021/08/04/audio_03d98a2879.mp3' },
    { id: 'notif_bird', name: 'Kuş Sesi', file: 'notif_bird.mp3', local: false, remoteUrl: 'https://cdn.pixabay.com/audio/2021/11/25/audio_91b32e01fa.mp3' },
    { id: 'default', name: 'Sistem Varsayılanı', file: 'default', local: true }
  ]
};

export const getDefaultNotificationSettings = () => ({
  enabled: true,
  sound: true,
  vibration: true,
  ongoingEnabled: false,
  fullScreenEnabled: true,
  prayerNotifications: {
    Fajr: { enabled: true, minutesBefore: 0, soundId: 'adhan1', soundType: 'adhan', vibration: true },
    Sunrise: { enabled: true, minutesBefore: 0, soundId: 'notification1', soundType: 'notification', vibration: false },
    Dhuhr: { enabled: true, minutesBefore: 0, soundId: 'adhan3', soundType: 'adhan', vibration: true },
    Asr: { enabled: true, minutesBefore: 0, soundId: 'adhan4', soundType: 'adhan', vibration: true },
    Maghrib: { enabled: true, minutesBefore: 0, soundId: 'adhan5', soundType: 'adhan', vibration: true },
    Isha: { enabled: true, minutesBefore: 0, soundId: 'adhan2', soundType: 'adhan', vibration: true }
  }
});

export const getNotificationSettings = () => {
  try {
    const settings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!settings) return getDefaultNotificationSettings();
    const parsed = JSON.parse(settings);
    const defaults = getDefaultNotificationSettings();
    if (!parsed.prayerNotifications || !parsed.prayerNotifications.Fajr) return defaults;
    if (parsed.vibration === undefined) parsed.vibration = true;
    if (parsed.ongoingEnabled === undefined) parsed.ongoingEnabled = false;
    if (parsed.fullScreenEnabled === undefined) parsed.fullScreenEnabled = true;
    return parsed;
  } catch (error) {
    return getDefaultNotificationSettings();
  }
};

export const saveNotificationSettings = (settings) => {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  return true;
};

export const isSoundDownloaded = (soundId) => {
  if (soundId === 'default') return true;
  const allSounds = [...SOUND_OPTIONS.adhan, ...SOUND_OPTIONS.notification];
  const sound = allSounds.find(s => s.id === soundId);
  if (sound && sound.local) return true;
  const downloaded = JSON.parse(localStorage.getItem(DOWNLOADED_SOUNDS_KEY) || '[]');
  return downloaded.includes(soundId);
};

export const downloadAdhanSound = async (soundId, soundType) => {
  const soundList = SOUND_OPTIONS[soundType] || [];
  const sound = soundList.find(s => s.id === soundId);
  if (!sound || sound.local || !sound.remoteUrl) return true;

  try {
    if (Capacitor.isNativePlatform()) {
      // 1) Dizin oluştur
      try {
        await Filesystem.mkdir({
          path: 'sounds',
          directory: Directory.Data,
          recursive: true
        });
      } catch (e) {
        // Zaten varsa hata verebilir, yoksayıyoruz
      }

      // 2) İndirme (Daha önce çalışan kararlı yöntem)
      await Filesystem.downloadFile({
        url: sound.remoteUrl,
        path: `sounds/${sound.file}`,
        directory: Directory.Data
      });
    }

    // 3) Kayıt listesini güncelle
    const downloaded = JSON.parse(localStorage.getItem(DOWNLOADED_SOUNDS_KEY) || '[]');
    if (!downloaded.includes(soundId)) {
      downloaded.push(soundId);
      localStorage.setItem(DOWNLOADED_SOUNDS_KEY, JSON.stringify(downloaded));
    }
    return true;
  } catch (e) {
    console.error('İndirme hatası:', e);
    return false;
  }
};

export const deleteDownloadedSound = (soundId) => {
  const downloaded = JSON.parse(localStorage.getItem(DOWNLOADED_SOUNDS_KEY) || '[]');
  const filtered = downloaded.filter(id => id !== soundId);
  localStorage.setItem(DOWNLOADED_SOUNDS_KEY, JSON.stringify(filtered));
};

export const createNotificationMessage = (prayerName, adjustment = 0) => {
  const prayerNames = { Fajr: 'İmsak', Sunrise: 'Güneş', Dhuhr: 'Öğle', Asr: 'İkindi', Maghrib: 'Akşam', Isha: 'Yatsı' };
  const name = prayerNames[prayerName] || prayerName;
  if (adjustment === 0) return `${name} namazı vakti girdi! 🕌`;
  return `${name} namazına ${Math.abs(adjustment)} dakika kaldı.`;
};

export const resetNotificationSettings = () => {
  localStorage.removeItem(NOTIFICATION_SETTINGS_KEY);
  return getDefaultNotificationSettings();
};
