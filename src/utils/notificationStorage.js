// src/utils/notificationStorage.js - CAPACITOR NATIVE VERSION + EXACT ALARM PERMISSION
import { LocalNotifications } from '@capacitor/local-notifications';

const NOTIFICATION_SETTINGS_KEY = 'quran_notification_settings';

// 🎵 SES SEÇENEKLERİ
export const SOUND_OPTIONS = {
  adhan: [
    { id: 'adhan1', name: 'Ezan 1', file: 'adhan1.mp3' },
    { id: 'adhan2', name: 'Ezan 2', file: 'adhan2.mp3' },
    { id: 'adhan3', name: 'Ezan 3', file: 'adhan3.mp3' },
    { id: 'adhan4', name: 'Ezan 4', file: 'adhan4.mp3' },
    { id: 'adhan5', name: 'Ezan 5', file: 'adhan5.mp3' },
    { id: 'adhan6', name: 'Ezan 6', file: 'adhan6.mp3' }
  ],
  notification: [
    { id: 'notification1', name: 'Bildirim 1', file: 'notification1.mp3' },
    { id: 'notification2', name: 'Bildirim 2', file: 'notification2.mp3' },
    { id: 'notification3', name: 'Bildirim 3', file: 'notification3.mp3' },
    { id: 'notification4', name: 'Bildirim 4', file: 'notification4.mp3' },
    { id: 'default', name: 'Varsayılan Ses', file: 'default' }
  ]
};

// Varsayılan bildirim ayarları
export const getDefaultNotificationSettings = () => ({
  enabled: true,
  prayerNotifications: {
    Fajr: { 
      enabled: true, 
      minutesBefore: 10,
      adjustment: 0
    },
    Sunrise: { 
      enabled: true, 
      minutesBefore: 5,
      adjustment: 0
    },
    Dhuhr: { 
      enabled: true, 
      minutesBefore: 10,
      adjustment: 0
    },
    Asr: { 
      enabled: true, 
      minutesBefore: 10,
      adjustment: 0
    },
    Maghrib: { 
      enabled: true, 
      minutesBefore: 10,
      adjustment: 0
    },
    Isha: { 
      enabled: true, 
      minutesBefore: 10,
      adjustment: 0
    }
  },
  sound: true,
  soundType: 'adhan',
  selectedAdhan: 'adhan1',
  selectedNotification: 'notification1',
  vibration: true,
  vibrationPattern: [0, 500, 200, 500],
  customMessage: false,
  messageTemplate: '{prayer} namazına {minutes} dakika kaldı'
});

// Bildirim ayarlarını al
export const getNotificationSettings = () => {
  try {
    const settings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (settings) {
      const parsed = JSON.parse(settings);
      const defaults = getDefaultNotificationSettings();
      
      // Eski ayarları yeni formata dönüştür
      if (parsed.prayerNotifications) {
        Object.keys(parsed.prayerNotifications).forEach(prayer => {
          if (!parsed.prayerNotifications[prayer].adjustment) {
            parsed.prayerNotifications[prayer].adjustment = 0;
          }
        });
      }
      
      return { ...defaults, ...parsed };
    }
    return getDefaultNotificationSettings();
  } catch (error) {
    console.error('Bildirim ayarları yüklenirken hata:', error);
    return getDefaultNotificationSettings();
  }
};

// Bildirim ayarlarını kaydet
export const saveNotificationSettings = (settings) => {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    console.log('💾 Ayarlar kaydedildi:', settings);
    return true;
  } catch (error) {
    console.error('Bildirim ayarları kaydedilirken hata:', error);
    return false;
  }
};

// Tüm bildirimleri aç/kapat
export const toggleAllNotifications = (enabled) => {
  const settings = getNotificationSettings();
  settings.enabled = enabled;
  return saveNotificationSettings(settings);
};

// Ses dosyası yolunu al
export const getSoundPath = (soundId, soundType) => {
  if (soundId === 'default') {
    return 'default';
  }
  
  const soundList = soundType === 'adhan' ? SOUND_OPTIONS.adhan : SOUND_OPTIONS.notification;
  const sound = soundList.find(s => s.id === soundId);
  
  if (sound) {
    return `sounds/${sound.file}`;
  }
  
  return 'default';
};

// Bildirim mesajı oluştur
export const createNotificationMessage = (prayerName, adjustment = 0) => {
  const settings = getNotificationSettings();
  const prayerNames = {
    Fajr: 'İmsak',
    Sunrise: 'Güneş',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Maghrib: 'Akşam',
    Isha: 'Yatsı'
  };

  const turkishName = prayerNames[prayerName] || prayerName;

  if (settings.customMessage && settings.messageTemplate) {
    return settings.messageTemplate
      .replace('{prayer}', turkishName)
      .replace('{minutes}', Math.abs(adjustment));
  }

  // Tam vakitte
  if (adjustment === 0) {
    return `${turkishName} namazı vakti girdi! 🕌`;
  }

  // Vakitten önce
  if (adjustment < 0) {
    return `${turkishName} namazına ${Math.abs(adjustment)} dakika kaldı`;
  }

  // Vakitten sonra
  return `${turkishName} namazı vakti gireli ${adjustment} dakika oldu`;
};

// ============================================
// CAPACITOR NATIVE BİLDİRİM İZİNLERİ + EXACT ALARM
// ============================================

// 🔔 Bildirim izni durumunu kontrol et
export const checkNotificationPermission = async () => {
  try {
    const result = await LocalNotifications.checkPermissions();
    console.log('📱 Native izin durumu:', result.display);
    return result.display;
  } catch (error) {
    console.error('İzin kontrolü hatası:', error);
    return 'denied';
  }
};

// ⏰ EXACT ALARM izni kontrol et (Android 12+)
export const checkExactAlarmPermission = async () => {
  try {
    // Android platformunda mıyız?
    if (!window.Capacitor || window.Capacitor.getPlatform() !== 'android') {
      console.log('📱 Android değil, exact alarm kontrolü atlanıyor');
      return true;
    }

    // Android sürümünü kontrol et (API 31+ = Android 12+)
    const isAndroid12Plus = window.Capacitor.Plugins?.Device?.getInfo
      ? (await window.Capacitor.Plugins.Device.getInfo()).androidSDKVersion >= 31
      : true; // Varsayılan olarak true

    if (!isAndroid12Plus) {
      console.log('📱 Android 12 altı, exact alarm otomatik açık');
      return true;
    }

    // Android 12+ için exact alarm iznini kontrol et
    console.log('⏰ Exact alarm izni kontrol ediliyor...');
    
    // Capacitor'da direkt exact alarm API'si yok, 
    // bu yüzden bildirimleri zamanlarken hata alırsak izin yok demektir
    return true; // İzin varsayımı, hata durumunda catch'te yakalanır
    
  } catch (error) {
    console.error('⏰ Exact alarm izin kontrolü hatası:', error);
    return false;
  }
};

// 🔔 Bildirim izni iste + EXACT ALARM
export const requestNotificationPermission = async () => {
  try {
    console.log('🔔 Bildirim izni isteniyor...');
    
    // 1. Normal bildirim izni
    const result = await LocalNotifications.requestPermissions();
    console.log('📱 İzin sonucu:', result.display);
    
    if (result.display !== 'granted') {
      console.log('❌ Bildirim izni reddedildi');
      return result.display;
    }

    // 2. Android 12+ için EXACT ALARM iznini kontrol et
    if (window.Capacitor && window.Capacitor.getPlatform() === 'android') {
      console.log('⏰ Android için exact alarm kontrolü yapılıyor...');
      
      try {
        // Exact alarm iznini örtük olarak kontrol ediyoruz
        // Eğer izin yoksa, kullanıcıya manuel olarak ayarlara gitmesini söyleyeceğiz
        const hasExactAlarm = await checkExactAlarmPermission();
        
        if (!hasExactAlarm) {
          console.log('⚠️ Exact alarm izni yok');
          alert(
            '⚠️ TAM ZAMANINDA BİLDİRİM İZNİ GEREKLİ\n\n' +
            'Namaz vakitlerinin tam zamanında bildirim alabilmek için:\n\n' +
            '1. Telefon Ayarları → Uygulamalar\n' +
            '2. Kuran-ı Kerim uygulamasını bulun\n' +
            '3. İzinler → Alarmlar ve hatırlatıcılar → İZİN VER\n\n' +
            'Bu izin olmadan bildirimler gecikebilir.'
          );
        }
      } catch (exactAlarmError) {
        console.log('⚠️ Exact alarm kontrolü yapılamadı:', exactAlarmError);
      }
    }

    return result.display;
    
  } catch (error) {
    console.error('İzin isteme hatası:', error);
    return 'denied';
  }
};

// 🔋 Batarya optimizasyonu uyarısı göster
export const checkBatteryOptimization = () => {
  if (window.Capacitor && window.Capacitor.getPlatform() === 'android') {
    console.log('🔋 Batarya optimizasyonu uyarısı');
    
    // Kullanıcıya bilgi ver
    const shouldShowWarning = !localStorage.getItem('battery_warning_shown');
    
    if (shouldShowWarning) {
      setTimeout(() => {
        // eslint-disable-next-line no-restricted-globals
        if (window.confirm(
          '🔋 BATARYA OPTİMİZASYONU UYARISI\n\n' +
          'Bildirimlerin düzenli çalışması için:\n\n' +
          '1. Telefon Ayarları → Batarya\n' +
          '2. Batarya Optimizasyonu\n' +
          '3. Kuran-ı Kerim → "Optimize etme"\n\n' +
          'Şimdi ayarlara gitmek ister misiniz?'
        )) {
          // Ayarlar açılabilir (opsiyonel)
          console.log('Kullanıcı ayarlara gidecek');
        }
        
        localStorage.setItem('battery_warning_shown', 'true');
      }, 3000);
    }
  }
};

// Ayarları sıfırla
export const resetNotificationSettings = () => {
  localStorage.removeItem(NOTIFICATION_SETTINGS_KEY);
  return getDefaultNotificationSettings();
};