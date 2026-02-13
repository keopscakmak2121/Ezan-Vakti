// src/utils/ongoingNotification.js
// TÜM KOD KAPATILDI. Artık JS tarafı bildirim üretmez.

/*
import { LocalNotifications } from '@capacitor/local-notifications';

const ONGOING_NOTIFICATION_ID = 999999;
let updateInterval = null;

const createOngoingChannel = async () => {
  try {
    await LocalNotifications.createChannel({
      id: 'ongoing_prayer',
      name: 'Kalıcı Namaz Vakti',
      description: 'Sonraki namaz vaktini gösterir',
      importance: 2,
      visibility: 1,
      sound: undefined,
      vibration: false
    });
    console.log('✅ Ongoing kanal oluşturuldu');
  } catch (error) {
    console.error('❌ Kanal oluşturma hatası:', error);
  }
};

export const showOngoingNotification = async (prayerTimes) => {
  try {
    console.log('🔔 showOngoingNotification çağrıldı:', prayerTimes);
    
    await createOngoingChannel();
    
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    
    await updateNotificationContent(prayerTimes);
    
    updateInterval = setInterval(async () => {
      await updateNotificationContent(prayerTimes);
    }, 60000);
    
    console.log('✅ Kalıcı bildirim gösteriliyor');
  } catch (error) {
    console.error('❌ Kalıcı bildirim hatası:', error);
  }
};

const updateNotificationContent = async (prayerTimes) => {
  try {
    const { current, remaining } = getNextPrayerWithCountdown(prayerTimes);
    
    console.log('📝 Bildirim içeriği:', current.name, current.time, remaining);
    
    await LocalNotifications.schedule({
      notifications: [
        {
          id: ONGOING_NOTIFICATION_ID,
          title: `🕌 ${current.name} - ${current.time}`,
          body: `⏳ ${remaining}`,
          smallIcon: 'ic_stat_mosque',
          ongoing: true,
          autoCancel: false,
          silent: true,
          channelId: 'ongoing_prayer'
        }
      ]
    });
    
    console.log('✅ Bildirim güncellendi');
  } catch (error) {
    console.error('❌ Bildirim güncelleme hatası:', error);
  }
};

export const hideOngoingNotification = async () => {
  try {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    
    await LocalNotifications.cancel({
      notifications: [{ id: ONGOING_NOTIFICATION_ID }]
    });
    console.log('✅ Kalıcı bildirim gizlendi');
  } catch (error) {
    console.error('❌ Kalıcı bildirim iptal hatası:', error);
  }
};

export const updateOngoingNotification = async (prayerTimes) => {
  await showOngoingNotification(prayerTimes);
};

function getNextPrayerWithCountdown(timings) {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  
  const prayers = [
    { name: 'İmsak', time: timings.Fajr || timings.Imsak },
    { name: 'Güneş', time: timings.Sunrise },
    { name: 'Öğle', time: timings.Dhuhr },
    { name: 'İkindi', time: timings.Asr },
    { name: 'Akşam', time: timings.Maghrib },
    { name: 'Yatsı', time: timings.Isha }
  ];
  
  for (let i = 0; i < prayers.length; i++) {
    const [prayerHours, prayerMinutes] = prayers[i].time.split(':').map(Number);
    const prayerTotalMinutes = prayerHours * 60 + prayerMinutes;
    
    if (currentTotalMinutes < prayerTotalMinutes) {
      const diffMinutes = prayerTotalMinutes - currentTotalMinutes;
      const remainingHours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
      
      const remaining = remainingHours > 0 
        ? `${remainingHours}s ${remainingMinutes}dk kaldı`
        : `${remainingMinutes}dk kaldı`;
      
      return { current: prayers[i], remaining };
    }
  }
  
  return { current: prayers[0], remaining: 'Yarın' };
}
*/