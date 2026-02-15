import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';

const NOTIFICATION_SETTINGS_KEY = 'quran_notification_settings';

// 🎵 ZENGİNLEŞTİRİLMİŞ SES ARŞİVİ
export const SOUND_OPTIONS = {
  adhan: [
    { id: 'adhan_makkah', name: 'Mekke Ezanı', file: 'adhan_makkah.mp3', remoteUrl: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
    { id: 'adhan_madinah', name: 'Medine Ezanı', file: 'adhan_madinah.mp3', remoteUrl: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
    { id: 'adhan_istanbul_saba', name: 'İstanbul (Saba)', file: 'adhan_istanbul_saba.mp3', remoteUrl: 'https://www.islamcan.com/audio/adhan/azan20.mp3' },
    { id: 'adhan_istanbul_rast', name: 'İstanbul (Rast)', file: 'adhan_istanbul_rast.mp3', remoteUrl: 'https://www.islamcan.com/audio/adhan/azan19.mp3' },
    { id: 'adhan_egypt', name: 'Mısır Ezanı', file: 'adhan_egypt.mp3', remoteUrl: 'https://www.islamcan.com/audio/adhan/azan3.mp3' },
    { id: 'adhan_alaqsa', name: 'Mescid-i Aksa', file: 'adhan_alaqsa.mp3', remoteUrl: 'https://www.islamcan.com/audio/adhan/azan4.mp3' },
    { id: 'adhan_abdussamed', name: 'Abdulbasit Abdussamed', file: 'adhan_abdussamed.mp3', remoteUrl: 'https://www.islamcan.com/audio/adhan/azan10.mp3' },
    { id: 'adhan_dua', name: 'Ezan Duası', file: 'adhan_dua.mp3', remoteUrl: 'https://www.islamcan.com/audio/adhan/azan15.mp3' }
  ],
  notification: [
    { id: 'notif_short', name: 'Kısa Uyarı', file: 'notif_short.mp3', remoteUrl: 'https://www.soundjay.com/buttons/beep-07a.mp3' },
    { id: 'notif_bell', name: 'Zil Sesi', file: 'notif_bell.mp3', remoteUrl: 'https://www.soundjay.com/buttons/beep-01a.mp3' },
    { id: 'notif_digital', name: 'Dijital Bip', file: 'notif_digital.mp3', remoteUrl: 'https://www.soundjay.com/buttons/beep-08b.mp3' },
    { id: 'notif_nature', name: 'Kuş Sesi', file: 'notif_nature.mp3', remoteUrl: 'https://www.soundjay.com/nature/bird-chirp-1.mp3' },
    { id: 'notif_water', name: 'Su Damlası', file: 'notif_water.mp3', remoteUrl: 'https://www.soundjay.com/misc/water-droplet-1.mp3' },
    { id: 'default', name: 'Sistem Varsayılanı', file: 'default' }
  ]
};

export const getDefaultNotificationSettings = () => ({
  enabled: true,
  sound: true,
  vibration: true, // Genel titreşim
  prayerNotifications: {
    Fajr: { enabled: true, minutesBefore: 0, soundId: 'adhan_makkah', soundType: 'adhan', vibration: true },
    Sunrise: { enabled: true, minutesBefore: 0, soundId: 'notif_short', soundType: 'notification', vibration: false },
    Dhuhr: { enabled: true, minutesBefore: 0, soundId: 'adhan_istanbul_saba', soundType: 'adhan', vibration: true },
    Asr: { enabled: true, minutesBefore: 0, soundId: 'adhan_istanbul_rast', soundType: 'adhan', vibration: true },
    Maghrib: { enabled: true, minutesBefore: 0, soundId: 'adhan_egypt', soundType: 'adhan', vibration: true },
    Isha: { enabled: true, minutesBefore: 0, soundId: 'adhan_madinah', soundType: 'adhan', vibration: true }
  }
});

export const getNotificationSettings = () => {
  try {
    const settings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!settings) return getDefaultNotificationSettings();
    const parsed = JSON.parse(settings);
    // Veri yapısı kontrolü ve eksikleri tamamlama
    const defaults = getDefaultNotificationSettings();
    if (!parsed.prayerNotifications || !parsed.prayerNotifications.Fajr) return defaults;

    // Titreşim ayarı globalde yoksa ekle
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

export const downloadAdhanSound = async (soundId, soundType) => {
  const soundList = SOUND_OPTIONS[soundType] || [];
  const sound = soundList.find(s => s.id === soundId);
  if (!sound || !sound.remoteUrl) return false;

  try {
    const response = await fetch(sound.remoteUrl);
    const blob = await response.blob();
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });

    await Filesystem.writeFile({
      path: `sounds/${sound.file}`,
      data: base64Data,
      directory: Directory.Data,
      recursive: true
    });

    const downloaded = JSON.parse(localStorage.getItem('downloaded_sounds') || '[]');
    if (!downloaded.includes(soundId)) {
      downloaded.push(soundId);
      localStorage.setItem('downloaded_sounds', JSON.stringify(downloaded));
    }
    return true;
  } catch (e) {
    console.error('İndirme hatası:', e);
    return false;
  }
};

export const isSoundDownloaded = (soundId) => {
  if (soundId === 'default') return true;
  const downloaded = JSON.parse(localStorage.getItem('downloaded_sounds') || '[]');
  return downloaded.includes(soundId);
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
