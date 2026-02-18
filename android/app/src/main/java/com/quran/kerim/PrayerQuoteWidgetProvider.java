package com.quran.kerim;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import java.util.Calendar;
import java.util.Random;

public class PrayerQuoteWidgetProvider extends AppWidgetProvider {

    private static final String ACTION_UPDATE_WIDGET = "com.quran.kerim.UPDATE_QUOTE_WIDGET";

    private static final String[] QUOTES = {
        "Şüphesiz namaz, müminler üzerine vakitleri belirlenmiş bir farzdır. | Nisâ, 103",
        "Kalpler ancak Allah'ı anmakla huzur bulur. | Ra'd, 28",
        "Beni anın ki, ben de sizi anayım. Bana şükredin, nankörlük etmeyin. | Bakara, 152",
        "Muhakkak ki namaz, hayâsızlıktan ve kötülükten alıkoyar. | Ankebût, 45",
        "Kur'an'ı ağır ağır, tane tane oku. | Müzzemmil, 4",
        "Namaz dinin direğidir. | Hadis-i Şerif",
        "Sizin en hayırlınız, Kur'an'ı öğrenen ve öğreteninizdir. | Hadis-i Şerif",
        "Kulun Allah'a en yakın olduğu an, secde anıdır. | Hadis-i Şerif"
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget_quote);
        
        // Rastgele bir söz seç
        int randomIndex = new Random().nextInt(QUOTES.length);
        String[] parts = QUOTES[randomIndex].split("\\|");
        String text = "“" + parts[0].trim() + "”";
        String source = "— " + parts[1].trim();

        views.setTextViewText(R.id.widget_quote_text, text);
        views.setTextViewText(R.id.widget_quote_source, source);

        // Widget'a tıklandığında uygulamayı aç
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_quote_layout, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onEnabled(Context context) {
        // Widget ilk eklendiğinde saatlik güncellemeyi başlat
        setAlarm(context);
    }

    @Override
    public void onDisabled(Context context) {
        // Son widget kaldırıldığında alarmı iptal et
        cancelAlarm(context);
    }
    
    public static void setAlarm(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, PrayerQuoteWidgetProvider.class);
        intent.setAction(ACTION_UPDATE_WIDGET);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);

        // Her saat başı tetiklenecek şekilde ayarla
        long interval = AlarmManager.INTERVAL_HOUR;
        long triggerAtMillis = System.currentTimeMillis() + interval;

        alarmManager.setRepeating(AlarmManager.RTC, triggerAtMillis, interval, pendingIntent);
    }

    public static void cancelAlarm(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, PrayerQuoteWidgetProvider.class);
        intent.setAction(ACTION_UPDATE_WIDGET);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        alarmManager.cancel(pendingIntent);
    }
    
    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_UPDATE_WIDGET.equals(intent.getAction())) {
            // Saatlik alarm tetiklendiğinde tüm widget'ları güncelle
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            int[] ids = manager.getAppWidgetIds(new android.content.ComponentName(context, PrayerQuoteWidgetProvider.class));
            for (int id : ids) {
                updateAppWidget(context, manager, id);
            }
        }
    }
}
