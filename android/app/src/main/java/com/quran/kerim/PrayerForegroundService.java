
package com.quran.kerim;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import org.json.JSONObject;
import java.util.Calendar;

public class PrayerForegroundService extends Service {
    private static final String CHANNEL_ID = "PrayerServiceChannel";
    private Handler handler = new Handler(Looper.getMainLooper());
    private Runnable updateRunnable;
    private JSONObject prayerTimes;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String prayerTimesStr = intent.getStringExtra("prayerTimes");
        try {
            if (prayerTimesStr != null) {
                prayerTimes = new JSONObject(prayerTimesStr);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        startForeground(1, getNotification());

        if (updateRunnable != null) {
            handler.removeCallbacks(updateRunnable);
        }

        updateRunnable = new Runnable() {
            @Override
            public void run() {
                updateNotification();
                // Her iki widget'ı da güncelle
                PrayerWidgetProvider.updateAllWidgets(getApplicationContext());
                PrayerWidgetSmallProvider.updateAllWidgets(getApplicationContext());
                
                handler.postDelayed(this, 1000); 
            }
        };
        handler.post(updateRunnable);

        return START_STICKY;
    }

    private void updateNotification() {
        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        notificationManager.notify(1, getNotification());
    }

    private Notification getNotification() {
        String contentText = "Vakitler hesaplanıyor...";
        String title = "Ezan Vakti";

        if (prayerTimes != null) {
            try {
                Calendar now = Calendar.getInstance();
                int currentMinutes = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE);

                String[] names = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                String[] trNames = {"İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"};

                for (int i = 0; i < names.length; i++) {
                    String timeStr = prayerTimes.optString(names[i]);
                    if (timeStr != null && !timeStr.isEmpty()) {
                        String[] parts = timeStr.split(":");
                        int pMinutes = Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);

                        if (currentMinutes < pMinutes) {
                            int diff = pMinutes - currentMinutes;
                            int h = diff / 60;
                            int m = diff % 60;
                            title = "🕌 " + trNames[i] + " - " + timeStr;
                            contentText = "⏳ Kalan: " + (h > 0 ? h + "s " : "") + m + "dk";
                            break;
                        }
                    }
                }
            } catch (Exception e) {
                contentText = "Hata oluştu.";
            }
        }

        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(contentText)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setSilent(true)
                .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Ezan Vakti Servisi",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }

    @Override
    public void onDestroy() {
        if (updateRunnable != null) {
            handler.removeCallbacks(updateRunnable);
        }
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
