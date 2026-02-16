import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const NOTIFICATION_SETTINGS_KEY = 'quran_notification_settings';
const DOWNLOADED_SOUNDS_KEY = 'downloaded_sounds';

// 🎵 SES SEÇENEKLERİ
// local: true → res/raw/ klasöründe, her zaman mevcut
// local: false → indirilebilir, remoteUrl'den indirilir
export const SOUND_OPTIONS = {
  adhan: [
    // Lokal (APK içinde)
    { id: 'adhan1', name: 'Mekke Ezanı', file: 'adhan1.mp3', local: true },
    { id: 'adhan2', name: 'Medine Ezanı', file: 'adhan2.mp3', local: true },
    { id: 'adhan3', name: 'İstanbul Ezanı', file: 'adhan3.mp3', local: true },
    { id: 'adhan4', name: 'Mısır Ezanı', file: 'adhan4.mp3', local: true },
    { id: 'adhan5', name: 'Mescid-i Aksa', file: 'adhan5.mp3', local: true },
    { id: 'adhan6', name: 'Abdulbasit', file: 'adhan6.mp3', local: true },
    // İndirilebilir
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
    // Lokal
    { id: 'notification1', name: 'Kısa Uyarı', file: 'notification1.mp3', local: true },
    { id: 'notification2', name: 'Zil Sesi', file: 'notification2.mp3', local: true },
    { id: 'notification3', name: 'Dijital Bip', file: 'notification3.mp3', local: true },
    { id: 'notification4', name: 'Yumuşak Ton', file: 'notification4.mp3', local: true },
    // İndirilebilir
    { id: 'notif_beep1', name: 'Çift Bip', file: 'notif_beep1.mp3', local: false, remoteUrl: 'https://www.soundjay.com/buttons/beep-07a.mp3' },
    { id: 'notif_chime', name: 'Çan Sesi', file: 'notif_chime.mp3', local: false, remoteUrl: 'https://www.soundjay.com/buttons/beep-01a.mp3' },
    { id: 'notif_soft', name: 'Hafif Melodi', file: 'notif_soft.mp3', local: false, remoteUrl: 'https://www.soundjay.com/buttons/beep-08b.mp3' },
    { id: 'notif_bird', name: 'Kuş Sesi', file: 'notif_bird.mp3', local: false, remoteUrl: 'https://www.soundjay.com/nature/bird-chirp-1.mp3' },
    // Varsayılan
    { id: 'default', name: 'Sistem Varsayılanı', file: 'default', local: true }
  ]
};

export const getDefaultNotificationSettings = () => ({
  enabled: true,
  sound: true,
  vibration: true,
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
    return parsed;
  } catch (error) {
    return getDefaultNotificationSettings();
  }
};

export const saveNotificationSettings = (settings) => {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  return true;
};

// Ses indirme durumunu kontrol et
export const isSoundDownloaded = (soundId) => {
  if (soundId === 'default') return true;

  // Tüm ses listelerinde bul
  const allSounds = [...SOUND_OPTIONS.adhan, ...SOUND_OPTIONS.notification];
  const sound = allSounds.find(s => s.id === soundId);

  // Lokal ses → her zaman mevcut
  if (sound && sound.local) return true;

  // İndirilebilir ses → downloaded listesinden kontrol
  const downloaded = JSON.parse(localStorage.getItem(DOWNLOADED_SOUNDS_KEY) || '[]');
  return downloaded.includes(soundId);
};

// Ses dosyasını indir (sadece indirilebilir sesler için)
export const downloadAdhanSound = async (soundId, soundType) => {
  const soundList = SOUND_OPTIONS[soundType] || [];
  const sound = soundList.find(s => s.id === soundId);

  // Lokal ses veya remoteUrl yoksa
  if (!sound || sound.local || !sound.remoteUrl) return true;

  try {
    const response = await fetch(sound.remoteUrl);
    if (!response.ok) throw new Error('İndirme başarısız: ' + response.status);

    const blob = await response.blob();
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      reader.readAsDataURL(blob);
    });

    // Native platformda dosyayı kaydet
    if (Capacitor.isNativePlatform()) {
      await Filesystem.writeFile({
        path: `sounds/${sound.file}`,
        data: base64Data,
        directory: Directory.Data,
        recursive: true
      });
    }

    // İndirilenler listesine ekle
    const downloaded = JSON.parse(localStorage.getItem(DOWNLOADED_SOUNDS_KEY) || '[]');
    if (!downloaded.includes(soundId)) {
      downloaded.push(soundId);
      localStorage.setItem(DOWNLOADED_SOUNDS_KEY, JSON.stringify(downloaded));
    }
    return true;
  } catch (e) {
    console.error('Ses indirme hatası:', e);
    return false;
  }
};

// İndirilen sesi sil
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
