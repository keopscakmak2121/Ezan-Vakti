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

public class PrayerWidgetStripProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget_strip);
        Intent openAppIntent = new Intent(context, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(context, 0, openAppIntent, PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_strip_layout, pi);

        updateWidgetData(context, views);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] ids = appWidgetManager.getAppWidgetIds(new ComponentName(context, PrayerWidgetStripProvider.class));
        for (int id : ids) {
            updateAppWidget(context, appWidgetManager, id);
        }
    }

    private static void updateWidgetData(Context context, RemoteViews views) {
        SharedPreferences prefs = context.getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        String prayerDataStr = prefs.getString("prayer_data", null);
        if (prayerDataStr == null) return;

        try {
            JSONObject timings = new JSONObject(prayerDataStr);
            Calendar now = Calendar.getInstance();
            int currentTotalSec = now.get(Calendar.HOUR_OF_DAY) * 3600 + now.get(Calendar.MINUTE) * 60 + now.get(Calendar.SECOND);

            String[] names = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
            String[] trNames = {"İMSAK", "GÜNEŞ", "ÖĞLE", "İKİNDİ", "AKŞAM", "YATSI"};

            boolean found = false;
            for (int i = 0; i < names.length; i++) {
                String timeStr = timings.optString(names[i]);
                if (timeStr == null || timeStr.isEmpty()) continue;
                String[] parts = timeStr.split(":");
                int pTotalSec = Integer.parseInt(parts[0].trim()) * 3600 + Integer.parseInt(parts[1].trim()) * 60;

                if (currentTotalSec < pTotalSec) {
                    int diff = pTotalSec - currentTotalSec;
                    views.setTextViewText(R.id.widget_strip_prayer_name, trNames[i]);
                    views.setTextViewText(R.id.widget_strip_prayer_time, timeStr);
                    views.setTextViewText(R.id.widget_strip_remaining_time, String.format("%02d:%02d", diff / 3600, (diff % 3600) / 60));
                    found = true;
                    break;
                }
            }

            if (!found) {
                views.setTextViewText(R.id.widget_strip_prayer_name, "YARIN İMSAK");
                views.setTextViewText(R.id.widget_strip_prayer_time, timings.optString("Fajr", "--:--"));
                views.setTextViewText(R.id.widget_strip_remaining_time, "--:--");
            }
        } catch (Exception e) {
            Log.e("StripWidget", "Error", e);
        }
    }
}
