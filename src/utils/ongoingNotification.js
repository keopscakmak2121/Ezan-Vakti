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
  } catch (error) {}
};

function getNextPrayerWithCountdown(timings) {
  if (!timings) return { current: { name: '-', time: '-' }, remaining: '-' };
  const now = new Date();
  const currentTotal = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: 'İmsak', time: timings.Fajr },
    { name: 'Güneş', time: timings.Sunrise },
    { name: 'Öğle', time: timings.Dhuhr },
    { name: 'İkindi', time: timings.Asr },
    { name: 'Akşam', time: timings.Maghrib },
    { name: 'Yatsı', time: timings.Isha }
  ];

  for (let i = 0; i < prayers.length; i++) {
    if (!prayers[i].time) continue;
    const [h, m] = prayers[i].time.split(':').map(Number);
    const pTotal = h * 60 + m;
    if (currentTotal < pTotal) {
      const diff = pTotal - currentTotal;
      const rh = Math.floor(diff / 60);
      const rm = diff % 60;
      return { current: prayers[i], remaining: rh > 0 ? `${rh}s ${rm}dk` : `${rm}dk` };
    }
  }
  return { current: prayers[0], remaining: 'Yarın' };
}

export const showOngoingNotification = async (prayerTimes) => {
  try {
    await createOngoingChannel();
    if (updateInterval) clearInterval(updateInterval);
    
    const update = async () => {
      const { current, remaining } = getNextPrayerWithCountdown(prayerTimes);
      await LocalNotifications.schedule({
        notifications: [{
          id: ONGOING_NOTIFICATION_ID,
          title: `🕌 ${current.name} - ${current.time}`,
          body: `⏳ ${remaining} kaldı`,
          smallIcon: 'ic_stat_mosque',
          ongoing: true,
          autoCancel: false,
          silent: true,
          channelId: 'ongoing_prayer'
        }]
      });
    };

    await update();
    updateInterval = setInterval(update, 60000);
  } catch (error) {}
};

export const hideOngoingNotification = async () => {
  if (updateInterval) clearInterval(updateInterval);
  await LocalNotifications.cancel({ notifications: [{ id: ONGOING_NOTIFICATION_ID }] });
};

export const updateOngoingNotification = async (prayerTimes) => {
  await showOngoingNotification(prayerTimes);
};
