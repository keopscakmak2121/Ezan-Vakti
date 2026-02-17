package com.quran.kerim;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;
import android.widget.RemoteViews;
import org.json.JSONObject;
import java.util.Calendar;

public class PrayerWidgetSmallProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget_small);
        
        Intent openAppIntent = new Intent(context, MainActivity.class);
        PendingIntent openAppPendingIntent = PendingIntent.getActivity(context, 0, openAppIntent, PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_small_layout, openAppPendingIntent);

        updateWidgetData(context, views);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] ids = appWidgetManager.getAppWidgetIds(new ComponentName(context, PrayerWidgetSmallProvider.class));
        for (int id : ids) {
            updateAppWidget(context, appWidgetManager, id);
        }
    }

    private static void updateWidgetData(Context context, RemoteViews views) {
        SharedPreferences prefs = context.getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        String prayerDataStr = prefs.getString("prayer_data", null);

        if (prayerDataStr != null) {
            try {
                JSONObject timings = new JSONObject(prayerDataStr);
                Calendar now = Calendar.getInstance();
                // Saniye hassasiyetiyle şu anki toplam saniyeyi hesapla
                int currentTotalSeconds = now.get(Calendar.HOUR_OF_DAY) * 3600 + now.get(Calendar.MINUTE) * 60 + now.get(Calendar.SECOND);

                String[] names = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
                String[] trNames = {"İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"};

                boolean found = false;
                for (int i = 0; i < names.length; i++) {
                    String timeStr = timings.optString(names[i]);
                    if (timeStr == null || timeStr.isEmpty()) continue;

                    String[] parts = timeStr.split(":");
                    int pTotalSeconds = Integer.parseInt(parts[0]) * 3600 + Integer.parseInt(parts[1]) * 60;

                    if (currentTotalSeconds < pTotalSeconds) {
                        int diffSeconds = pTotalSeconds - currentTotalSeconds;
                        int h = diffSeconds / 3600;
                        int m = (diffSeconds % 3600) / 60;
                        int s = diffSeconds % 60;

                        views.setTextViewText(R.id.widget_small_prayer_name, trNames[i]);
                        views.setTextViewText(R.id.widget_small_prayer_time, timeStr);
                        views.setTextViewText(R.id.widget_small_remaining_time, String.format("%02d:%02d:%02d", h, m, s));
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    views.setTextViewText(R.id.widget_small_prayer_name, "Yarın İmsak");
                    views.setTextViewText(R.id.widget_small_remaining_time, "--:--:--");
                }
            } catch (Exception e) {
                Log.e("PrayerWidgetSmall", "Hata", e);
            }
        }
    }
}
