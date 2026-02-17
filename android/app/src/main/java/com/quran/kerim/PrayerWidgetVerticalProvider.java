package com.quran.kerim;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.util.Log;
import android.widget.RemoteViews;
import org.json.JSONObject;
import java.util.Calendar;
import java.text.SimpleDateFormat;
import java.util.Locale;

public class PrayerWidgetVerticalProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget_vertical);
        Intent openAppIntent = new Intent(context, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(context, 0, openAppIntent, PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_vertical_layout, pi);

        updateWidgetData(context, views);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] ids = appWidgetManager.getAppWidgetIds(new ComponentName(context, PrayerWidgetVerticalProvider.class));
        for (int id : ids) {
            updateAppWidget(context, appWidgetManager, id);
        }
    }

    private static void updateWidgetData(Context context, RemoteViews views) {
        SharedPreferences prefs = context.getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        String prayerDataStr = prefs.getString("prayer_data", null);
        String locationName = prefs.getString("location_name", "Konum");
        
        SimpleDateFormat sdf = new SimpleDateFormat("dd MMMM yyyy", new Locale("tr"));
        views.setTextViewText(R.id.widget_vertical_date, sdf.format(Calendar.getInstance().getTime()));
        views.setTextViewText(R.id.widget_vertical_city, locationName);

        if (prayerDataStr == null) return;

        try {
            JSONObject timings = new JSONObject(prayerDataStr);
            Calendar now = Calendar.getInstance();
            int currentTotalSec = now.get(Calendar.HOUR_OF_DAY) * 3600 + now.get(Calendar.MINUTE) * 60 + now.get(Calendar.SECOND);

            String[] names = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};
            int[] timeResIds = {R.id.time_fajr_vertical, R.id.time_sunrise_vertical, R.id.time_dhuhr_vertical, R.id.time_asr_vertical, R.id.time_maghrib_vertical, R.id.time_isha_vertical};
            int[] labelResIds = {R.id.label_fajr, R.id.label_sunrise, R.id.label_dhuhr, R.id.label_asr, R.id.label_maghrib, R.id.label_isha};

            for (int i = 0; i < names.length; i++) {
                views.setTextViewText(timeResIds[i], timings.optString(names[i], "--:--"));
                views.setTextColor(labelResIds[i], Color.WHITE);
                views.setTextColor(timeResIds[i], Color.WHITE);
            }

            for (int i = 0; i < names.length; i++) {
                String timeStr = timings.optString(names[i]);
                if (timeStr == null || timeStr.isEmpty()) continue;
                String[] parts = timeStr.split(":");
                int pTotalSec = Integer.parseInt(parts[0].trim()) * 3600 + Integer.parseInt(parts[1].trim()) * 60;

                if (currentTotalSec < pTotalSec) {
                    views.setTextColor(labelResIds[i], Color.parseColor("#FBBF24"));
                    views.setTextColor(timeResIds[i], Color.parseColor("#FBBF24"));
                    break;
                }
            }
        } catch (Exception e) {
            Log.e("VerticalWidget", "Error", e);
        }
    }
}
