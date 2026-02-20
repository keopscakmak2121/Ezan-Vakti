import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const NOTIFICATION_SETTINGS_KEY = 'quran_notification_settings';
const DOWNLOADED_SOUNDS_KEY = 'downloaded_sounds';

// ═══════════════════════════════════════════════════
// SES SEÇENEKLERİ - GENİŞ LİSTE
// ═══════════════════════════════════════════════════
export const SOUND_OPTIONS = {
  adhan: [
    // ── Yerel Ezanlar (APK ile birlikte) ──
    { id: 'adhan1', name: 'Mekke Ezanı', file: 'adhan1.mp3', local: true },
    { id: 'adhan2', name: 'Medine Ezanı', file: 'adhan2.mp3', local: true },
    { id: 'adhan3', name: 'İstanbul Ezanı', file: 'adhan3.mp3', local: true },
    { id: 'adhan4', name: 'Mısır Ezanı', file: 'adhan4.mp3', local: true },
    { id: 'adhan5', name: 'Mescid-i Aksa', file: 'adhan5.mp3', local: true },
    { id: 'adhan6', name: 'Abdulbasit', file: 'adhan6.mp3', local: true },
    // ── İndirilebilir Ezanlar (islamcan.com) ──
    { id: 'adhan_dl_1', name: 'Ezan - Klasik', file: 'adhan_dl_1.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
    { id: 'adhan_dl_2', name: 'Ezan - Geleneksel', file: 'adhan_dl_2.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
    { id: 'adhan_dl_3', name: 'Ezan - Duygusal', file: 'adhan_dl_3.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan3.mp3' },
    { id: 'adhan_dl_4', name: 'Ezan - Hüzünlü', file: 'adhan_dl_4.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan4.mp3' },
    { id: 'adhan_dl_5', name: 'Abdurrahman Sudais', file: 'adhan_dl_5.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan5.mp3' },
    { id: 'adhan_dl_6', name: 'Mishari Raşid', file: 'adhan_dl_6.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan6.mp3' },
    { id: 'adhan_dl_7', name: 'Ali Ahmed Molla', file: 'adhan_dl_7.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan7.mp3' },
    { id: 'adhan_dl_8', name: 'Naqshbandi', file: 'adhan_dl_8.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan8.mp3' },
    { id: 'adhan_dl_9', name: 'Nasser Al Qatami', file: 'adhan_dl_9.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan9.mp3' },
    { id: 'adhan_dl_10', name: 'Ezan - Tatlı Ses', file: 'adhan_dl_10.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan10.mp3' },
    { id: 'adhan_dl_11', name: 'Hafız Mustafa', file: 'adhan_dl_11.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan11.mp3' },
    { id: 'adhan_dl_12', name: 'Mansoor Zaahid', file: 'adhan_dl_12.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan12.mp3' },
    { id: 'adhan_dl_13', name: 'Ezan - Yankılı', file: 'adhan_dl_13.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan13.mp3' },
    { id: 'adhan_dl_14', name: 'Sabah Ezanı (Özel)', file: 'adhan_dl_14.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan14.mp3' },
    { id: 'adhan_dl_15', name: 'Ezan - Makam', file: 'adhan_dl_15.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan15.mp3' },
    { id: 'adhan_dl_16', name: 'Ezan - Dokunaklı', file: 'adhan_dl_16.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan16.mp3' },
    { id: 'adhan_dl_17', name: 'Ezan - Endonezya', file: 'adhan_dl_17.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan17.mp3' },
    { id: 'adhan_dl_18', name: 'Ezan - Türk Makamı', file: 'adhan_dl_18.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan18.mp3' },
    { id: 'adhan_dl_19', name: 'Ezan - Hicaz', file: 'adhan_dl_19.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan19.mp3' },
    { id: 'adhan_dl_20', name: 'Ezan - Çocuk Sesi', file: 'adhan_dl_20.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan20.mp3' },
    { id: 'adhan_dl_21', name: 'Ezan - Uzun Makam', file: 'adhan_dl_21.mp3', local: false, remoteUrl: 'https://www.islamcan.com/audio/adhan/azan21.mp3' },
  ],
  notification: [
    // ── Yerel Bildirim Sesleri ──
    { id: 'notification1', name: 'Kısa Uyarı', file: 'notification1.mp3', local: true },
    { id: 'notification2', name: 'Zil Sesi', file: 'notification2.mp3', local: true },
    { id: 'notification3', name: 'Dijital Bip', file: 'notification3.mp3', local: true },
    { id: 'notification4', name: 'Yumuşak Ton', file: 'notification4.mp3', local: true },
    { id: 'default', name: 'Sistem Varsayılanı', file: 'default', local: true }
  ]
};

// ═══════════════════════════════════════════════════
// AYARLAR
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
// SES İNDİRME / KONTROL
// ═══════════════════════════════════════════════════
export const isSoundDownloaded = (soundId) => {
  if (soundId === 'default') return true;
  const allSounds = [...SOUND_OPTIONS.adhan, ...SOUND_OPTIONS.notification];
  const sound = allSounds.find(s => s.id === soundId);
  if (sound && sound.local) return true;
  const downloaded = JSON.parse(localStorage.getItem(DOWNLOADED_SOUNDS_KEY) || '[]');
  return downloaded.includes(soundId);
};

// İndirilen sesın native URI'sini döndür
export const getDownloadedSoundUri = async (soundId, soundType) => {
  try {
    const soundList = SOUND_OPTIONS[soundType] || [];
    const sound = soundList.find(s => s.id === soundId);
    if (!sound) return null;
    const result = await Filesystem.getUri({
      path: `sounds/${sound.file}`,
      directory: Directory.Data
    });
    return Capacitor.convertFileSrc(result.uri);
  } catch (e) {
    return null;
  }
};

// Ses çalma URL'si: local → /sounds/x.mp3, indirilmiş → native URI, online → remoteUrl
export const getPlayableUrl = async (soundId, soundType) => {
  const allSounds = [...SOUND_OPTIONS.adhan, ...SOUND_OPTIONS.notification];
  const sound = allSounds.find(s => s.id === soundId);
  if (!sound || sound.file === 'default') return null;

  // 1) Yerel dosya
  if (sound.local) return `/sounds/${sound.file}`;

  // 2) İndirilmiş dosya
  if (isSoundDownloaded(soundId)) {
    const uri = await getDownloadedSoundUri(soundId, soundType);
    if (uri) return uri;
  }

  // 3) Online URL
  return sound.remoteUrl || null;
};

// CapacitorHttp ile indirme (CORS sorunu yok)
export const downloadAdhanSound = async (soundId, soundType, onProgress) => {
  const soundList = SOUND_OPTIONS[soundType] || [];
  const sound = soundList.find(s => s.id === soundId);
  if (!sound || sound.local || !sound.remoteUrl) return true;

  try {
    // Dizin oluştur
    try {
      await Filesystem.mkdir({ path: 'sounds', directory: Directory.Data, recursive: true });
    } catch (e) { /* zaten var */ }

    if (onProgress) onProgress(10);

    if (Capacitor.isNativePlatform()) {
      // Native: CapacitorHttp ile indir
      console.log('📥 İndiriliyor (CapacitorHttp):', sound.remoteUrl);
      const response = await CapacitorHttp.get({
        url: sound.remoteUrl,
        responseType: 'blob'
      });

      if (onProgress) onProgress(60);

      if (response.status === 200 && response.data) {
        // CapacitorHttp blob responseType base64 string döndürür
        await Filesystem.writeFile({
          path: `sounds/${sound.file}`,
          data: response.data,
          directory: Directory.Data
        });
        if (onProgress) onProgress(90);
      } else {
        throw new Error('Status: ' + response.status);
      }
    } else {
      // Web: Normal fetch
      const response = await fetch(sound.remoteUrl);
      if (!response.ok) throw new Error('Status: ' + response.status);
      if (onProgress) onProgress(50);
      const blob = await response.blob();
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      await Filesystem.writeFile({
        path: `sounds/${sound.file}`,
        data: base64Data,
        directory: Directory.Data
      });
      if (onProgress) onProgress(90);
    }

    // Kayıt listesini güncelle
    const downloaded = JSON.parse(localStorage.getItem(DOWNLOADED_SOUNDS_KEY) || '[]');
    if (!downloaded.includes(soundId)) {
      downloaded.push(soundId);
      localStorage.setItem(DOWNLOADED_SOUNDS_KEY, JSON.stringify(downloaded));
    }
    if (onProgress) onProgress(100);
    console.log('✅ Ses indirildi:', sound.name);
    return true;
  } catch (e) {
    console.error('❌ İndirme hatası:', soundId, e);
    return false;
  }
};

export const deleteDownloadedSound = async (soundId) => {
  const allSounds = [...SOUND_OPTIONS.adhan, ...SOUND_OPTIONS.notification];
  const sound = allSounds.find(s => s.id === soundId);
  if (sound && !sound.local) {
    try {
      await Filesystem.deleteFile({ path: `sounds/${sound.file}`, directory: Directory.Data });
    } catch (e) { /* yok */ }
  }
  const downloaded = JSON.parse(localStorage.getItem(DOWNLOADED_SOUNDS_KEY) || '[]');
  const filtered = downloaded.filter(id => id !== soundId);
  localStorage.setItem(DOWNLOADED_SOUNDS_KEY, JSON.stringify(filtered));
};

// ═══════════════════════════════════════════════════
// BİLDİRİM MESAJLARI
// ═══════════════════════════════════════════════════
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
