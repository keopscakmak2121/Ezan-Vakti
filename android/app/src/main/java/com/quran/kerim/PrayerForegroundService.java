package com.quran.kerim;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import org.json.JSONObject;
import java.io.File;
import java.util.Calendar;

public class PrayerForegroundService extends Service implements SensorEventListener {
    private static final String CHANNEL_ID = "PrayerServiceChannel";
    private static final String ALARM_CHANNEL_ID = "PrayerAlarmChannel";
    private Handler handler = new Handler(Looper.getMainLooper());
    private Runnable updateRunnable;
    private JSONObject prayerTimes;
    private String lastTriggeredPrayer = "";
    private MediaPlayer mediaPlayer;

    private SensorManager sensorManager;
    private Sensor accelerometer;
    private boolean isAdhanPlaying = false;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        createAlarmChannel();
        
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && "STOP_ADHAN".equals(intent.getAction())) {
            stopAdhan();
            return START_STICKY;
        }

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
                // Widget'ı her bildirim güncellemesinde tetikle
                updateWidgets();
                
                checkPrayerTime();
                
                long now = System.currentTimeMillis();
                long delay = 60000 - (now % 60000); // Dakika başında tekrar çalış
                handler.postDelayed(this, delay);
            }
        };
        handler.post(updateRunnable);

        return START_STICKY;
    }

    private void updateWidgets() {
        // Tüm widget türlerini güncelle
        PrayerWidgetProvider.updateAllWidgets(this);
        PrayerWidgetSmallProvider.updateAllWidgets(this);
        PrayerWidgetStripProvider.updateAllWidgets(this);
        PrayerWidgetVerticalProvider.updateAllWidgets(this);
    }

    private void checkPrayerTime() {
        if (prayerTimes == null) return;
        
        SharedPreferences prefs = getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        if (!prefs.getBoolean("full_screen_enabled", true)) return;

        String settingsStr = prefs.getString("notification_settings", null);
        JSONObject settings = null;
        try {
            if (settingsStr != null) settings = new JSONObject(settingsStr);
        } catch (Exception e) { e.printStackTrace(); }

        if (settings != null && !settings.optBoolean("enabled", true)) return;

        Calendar now = Calendar.getInstance();
        String current = String.format("%02d:%02d", now.get(Calendar.HOUR_OF_DAY), now.get(Calendar.MINUTE));
        
        String[] names = {"Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"};
        String[] trNames = {"İmsak", "Öğle", "İkindi", "Akşam", "Yatsı"};
        
        for (int i = 0; i < names.length; i++) {
            String pTime = prayerTimes.optString(names[i]);
            if (current.equals(pTime)) {
                String dayKey = Calendar.getInstance().get(Calendar.DAY_OF_YEAR) + "_" + names[i];
                if (!dayKey.equals(lastTriggeredPrayer)) {
                    boolean prayerEnabled = true;
                    String soundId = "adhan1";
                    
                    if (settings != null) {
                        JSONObject pNotifs = settings.optJSONObject("prayerNotifications");
                        if (pNotifs != null) {
                            JSONObject config = pNotifs.optJSONObject(names[i]);
                            if (config != null) {
                                prayerEnabled = config.optBoolean("enabled", true);
                                soundId = config.optString("soundId", "adhan1");
                            }
                        }
                    }

                    if (prayerEnabled) {
                        lastTriggeredPrayer = dayKey;
                        playAdhan(soundId);
                        showFullScreenNotification(trNames[i], current);
                    }
                }
            }
        }
    }

    private void playAdhan(String soundId) {
        try {
            stopAdhan();
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build());

            int resId = getResources().getIdentifier(soundId, "raw", getPackageName());
            if (resId != 0) {
                mediaPlayer = MediaPlayer.create(this, resId);
            } else {
                File soundFile = new File(getFilesDir(), "sounds/" + soundId + ".mp3");
                if (soundFile.exists()) {
                    mediaPlayer.setDataSource(soundFile.getAbsolutePath());
                    mediaPlayer.prepare();
                } else {
                    int defaultId = getResources().getIdentifier("adhan1", "raw", getPackageName());
                    if (defaultId != 0) mediaPlayer = MediaPlayer.create(this, defaultId);
                }
            }

            if (mediaPlayer != null) {
                mediaPlayer.setLooping(false);
                mediaPlayer.start();
                isAdhanPlaying = true;
                if (sensorManager != null && accelerometer != null) {
                    sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_NORMAL);
                }
                new Handler(Looper.getMainLooper()).postDelayed(() -> stopAdhan(), 300000);
            }
        } catch (Exception e) {
            Log.e("PrayerService", "Adhan Player Error", e);
        }
    }

    private void stopAdhan() {
        isAdhanPlaying = false;
        if (sensorManager != null) sensorManager.unregisterListener(this);
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) mediaPlayer.stop();
                mediaPlayer.release();
                mediaPlayer = null;
            } catch (Exception e) { Log.e("PrayerService", "Error stopping adhan", e); }
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER && isAdhanPlaying) {
            float z = event.values[2];
            if (z < -8.5) {
                stopAdhan();
            }
        }
    }

    @Override public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    private void showFullScreenNotification(String name, String time) {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            PowerManager.WakeLock wl = pm.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
                "ezanvakti:alarm");
            wl.acquire(30000);

            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            intent.putExtra("isAlarm", true);
            intent.putExtra("prayerName", name);
            intent.putExtra("prayerTime", time);

            PendingIntent pi = PendingIntent.getActivity(this, 2000, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            NotificationCompat.Builder b = new NotificationCompat.Builder(this, ALARM_CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle("🕌 " + name + " Vakti Girdi")
                .setContentText("Ezan okunuyor: " + time)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setFullScreenIntent(pi, true)
                .setAutoCancel(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm != null) nm.notify(2000, b.build());
            if (wl.isHeld()) wl.release();
        } catch (Exception e) { Log.e("PrayerService", "Full Screen Notification Error", e); }
    }

    private void updateNotification() {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(1, getNotification());
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
                            title = "🕌 " + trNames[i] + " - " + timeStr;
                            contentText = "⏳ Kalan: " + (diff / 3600 > 0 ? (diff / 3600) + " sa " : "") + ((diff % 3600) / 60) + " dk";
                            found = true;
                            break;
                        }
                    }
                }
                // Yatsıdan sonra: Ertesi gün İmsak vaktine geri sayım göster
                if (!found) {
                    String fajrStr = prayerTimes.optString("Fajr");
                    if (fajrStr != null && fajrStr.contains(":")) {
                        String[] parts = fajrStr.split(":");
                        int fajrSec = Integer.parseInt(parts[0].trim()) * 3600 + Integer.parseInt(parts[1].trim()) * 60;
                        // Ertesi günün İmsak'ına kalan saniye = (86400 - şimdi) + İmsak saniyesi
                        int diff = (86400 - currentTotalSec) + fajrSec;
                        title = "🌙 İmsak (yarın) - " + fajrStr;
                        contentText = "⏳ Kalan: " + (diff / 3600) + " sa " + ((diff % 3600) / 60) + " dk";
                    } else {
                        title = "🌙 Tüm vakitler geçti";
                        contentText = "Yarının vakitleri yakında güncellenecek";
                    }
                }
            } catch (Exception e) {}
        }
        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title).setContentText(contentText).setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pi).setOngoing(true).setOnlyAlertOnce(true).setSilent(true)
                .setPriority(NotificationCompat.PRIORITY_LOW).build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel c = new NotificationChannel(CHANNEL_ID, "Vakit Takibi", NotificationManager.IMPORTANCE_LOW);
            c.setSound(null, null);
            getSystemService(NotificationManager.class).createNotificationChannel(c);
        }
    }

    private void createAlarmChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel c = new NotificationChannel(ALARM_CHANNEL_ID, "Ezan Alarmları", NotificationManager.IMPORTANCE_HIGH);
            c.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            c.setBypassDnd(true);
            getSystemService(NotificationManager.class).createNotificationChannel(c);
        }
    }

    @Override public void onDestroy() { 
        if (updateRunnable != null) handler.removeCallbacks(updateRunnable); 
        stopAdhan();
        super.onDestroy(); 
    }
    @Nullable @Override public IBinder onBind(Intent intent) { return null; }
}
