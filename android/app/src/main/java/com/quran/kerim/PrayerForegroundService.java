package com.quran.kerim;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import org.json.JSONObject;
import java.util.Calendar;

public class PrayerForegroundService extends Service {
    private static final String CHANNEL_ID = "PrayerServiceChannel";
    private static final String ALARM_CHANNEL_ID = "PrayerAlarmChannel";
    private Handler handler = new Handler(Looper.getMainLooper());
    private Runnable updateRunnable;
    private JSONObject prayerTimes;
    private String lastTriggeredPrayer = "";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        createAlarmChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String prayerTimesStr = intent != null ? intent.getStringExtra("prayerTimes") : null;
        SharedPreferences prefs = getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        
        if (prayerTimesStr != null) {
            prefs.edit().putString("prayer_data", prayerTimesStr).apply();
            try { prayerTimes = new JSONObject(prayerTimesStr); } catch (Exception e) { e.printStackTrace(); }
        } else {
            String savedData = prefs.getString("prayer_data", null);
            if (savedData != null) {
                try { prayerTimes = new JSONObject(savedData); } catch (Exception e) { e.printStackTrace(); }
            }
        }

        startForeground(1, getNotification());

        if (updateRunnable != null) handler.removeCallbacks(updateRunnable);
        updateRunnable = new Runnable() {
            @Override
            public void run() {
                updateNotification();
                checkPrayerTime();
                
                // Widget'ları her dakika zorla güncelle
                PrayerWidgetProvider.updateAllWidgets(getApplicationContext());
                PrayerWidgetSmallProvider.updateAllWidgets(getApplicationContext());
                
                long now = System.currentTimeMillis();
                long delay = 60000 - (now % 60000);
                handler.postDelayed(this, delay);
            }
        };
        handler.post(updateRunnable);

        return START_STICKY;
    }

    private void updateNotification() {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.notify(1, getNotification());
        }
    }

    private Notification getNotification() {
        String title = "Ezan Vakti";
        String contentText = "Vakit bilgisi bekleniyor...";

        if (prayerTimes != null) {
            try {
                Calendar now = Calendar.getInstance();
                int currentTotalSec = now.get(Calendar.HOUR_OF_DAY) * 3600 + now.get(Calendar.MINUTE) * 60 + now.get(Calendar.SECOND);
                
                String[] names = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                String[] trNames = {"İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"};
                
                boolean found = false;
                for (int i = 0; i < names.length; i++) {
                    String timeStr = prayerTimes.optString(names[i]);
                    if (timeStr != null && timeStr.contains(":")) {
                        String[] parts = timeStr.split(":");
                        int pSec = Integer.parseInt(parts[0].trim()) * 3600 + Integer.parseInt(parts[1].trim()) * 60;
                        
                        if (currentTotalSec < pSec) {
                            int diff = pSec - currentTotalSec;
                            int hours = diff / 3600;
                            int minutes = (diff % 3600) / 60;
                            
                            title = "🕌 " + trNames[i] + " - " + timeStr;
                            contentText = "⏳ Kalan: " + (hours > 0 ? hours + " sa " : "") + minutes + " dk";
                            found = true;
                            break;
                        }
                    }
                }
                
                if (!found) {
                    title = "Yatsı vakti geçti";
                    contentText = "Yarın İmsak: " + prayerTimes.optString("Fajr", "--:--");
                }
            } catch (Exception e) { contentText = "Vakit hesaplanamadı."; }
        }

        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(contentText)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pi)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setSilent(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .build();
    }

    private void checkPrayerTime() {
        if (prayerTimes == null) return;
        
        SharedPreferences prefs = getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        // Varsayılan true olsun
        if (!prefs.getBoolean("full_screen_enabled", true)) return;

        Calendar now = Calendar.getInstance();
        String current = String.format("%02d:%02d", now.get(Calendar.HOUR_OF_DAY), now.get(Calendar.MINUTE));
        
        String[] names = {"Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"}; // Sunrise (Güneş) genellikle ezan okunmaz, istersen ekle
        String[] trNames = {"İmsak", "Öğle", "İkindi", "Akşam", "Yatsı"};
        
        for (int i = 0; i < names.length; i++) {
            String pTime = prayerTimes.optString(names[i]);
            if (current.equals(pTime)) {
                String dayKey = Calendar.getInstance().get(Calendar.DAY_OF_YEAR) + "_" + names[i];
                if (!dayKey.equals(lastTriggeredPrayer)) {
                    lastTriggeredPrayer = dayKey;
                    showFullScreenNotification(trNames[i], current);
                }
            }
        }
    }

    private void showFullScreenNotification(String name, String time) {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "ezanvakti:alarm");
            wl.acquire(20000);

            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            intent.putExtra("isAlarm", true);
            intent.putExtra("prayerName", name);
            intent.putExtra("prayerTime", time);

            PendingIntent pi = PendingIntent.getActivity(this, 2000, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            NotificationCompat.Builder b = new NotificationCompat.Builder(this, ALARM_CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle("🕌 " + name + " Vakti")
                .setContentText("Ezan okunuyor: " + time)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setFullScreenIntent(pi, true)
                .setAutoCancel(true)
                .setOngoing(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm != null) nm.notify(2000, b.build());
            
            if (wl.isHeld()) wl.release();
        } catch (Exception e) { Log.e("PrayerService", "Alarm Error", e); }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel c = new NotificationChannel(CHANNEL_ID, "Kalıcı Bildirim", NotificationManager.IMPORTANCE_LOW);
            c.setSound(null, null);
            c.setShowBadge(false);
            getSystemService(NotificationManager.class).createNotificationChannel(c);
        }
    }

    private void createAlarmChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel c = new NotificationChannel(ALARM_CHANNEL_ID, "Ezan Uyarıları", NotificationManager.IMPORTANCE_HIGH);
            c.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            c.enableLights(true);
            c.enableVibration(true);
            getSystemService(NotificationManager.class).createNotificationChannel(c);
        }
    }

    @Override public void onDestroy() { if (updateRunnable != null) handler.removeCallbacks(updateRunnable); super.onDestroy(); }
    @Nullable @Override public IBinder onBind(Intent intent) { return null; }
}
