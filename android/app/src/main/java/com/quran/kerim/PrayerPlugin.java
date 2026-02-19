
package com.quran.kerim;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PrayerPlugin")
public class PrayerPlugin extends Plugin {

    @PluginMethod
    public void start(PluginCall call) {
        JSObject prayerTimes = call.getObject("prayerTimes");
        String locationName = call.getString("locationName", "Konum");
        JSObject settings = call.getObject("settings"); // JS tarafındaki tüm ayarları alıyoruz
        
        if (prayerTimes == null) {
            call.reject("Ezan vakitleri gönderilmedi.");
            return;
        }

        saveToWidgetStorage(prayerTimes.toString(), locationName, settings != null ? settings.toString() : null);

        Intent serviceIntent = new Intent(getContext(), PrayerForegroundService.class);
        serviceIntent.putExtra("prayerTimes", prayerTimes.toString());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(serviceIntent);
        } else {
            getContext().startService(serviceIntent);
        }
        
        updateAllWidgets();
        call.resolve();
    }

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        JSObject prayerTimes = call.getObject("prayerTimes");
        String locationName = call.getString("locationName", "Konum");

        if (prayerTimes == null) {
            call.reject("Ezan vakitleri gönderilmedi.");
            return;
        }

        SharedPreferences prefs = getContext().getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("prayer_data", prayerTimes.toString());
        editor.putString("location_name", locationName);
        editor.apply();

        updateAllWidgets();
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Intent serviceIntent = new Intent(getContext(), PrayerForegroundService.class);
        getContext().stopService(serviceIntent);
        call.resolve();
    }

    @PluginMethod
    public void stopAdhan(PluginCall call) {
        Intent stopIntent = new Intent(getContext(), PrayerForegroundService.class);
        stopIntent.setAction("STOP_ADHAN");
        getContext().startService(stopIntent);
        call.resolve();
    }

    @PluginMethod
    public void setFullScreenEnabled(PluginCall call) {
        Boolean enabled = call.getBoolean("enabled", true);
        SharedPreferences prefs = getContext().getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        prefs.edit().putBoolean("full_screen_enabled", enabled).apply();
        call.resolve();
    }

    private void updateAllWidgets() {
        Context context = getContext();
        PrayerWidgetProvider.updateAllWidgets(context);
        PrayerWidgetSmallProvider.updateAllWidgets(context);
        PrayerWidgetStripProvider.updateAllWidgets(context);
        PrayerWidgetVerticalProvider.updateAllWidgets(context);
    }

    private void saveToWidgetStorage(String prayerData, String locationName, String settingsJson) {
        SharedPreferences prefs = getContext().getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("prayer_data", prayerData);
        editor.putString("location_name", locationName);
        if (settingsJson != null) {
            editor.putString("notification_settings", settingsJson);
        }
        editor.apply();
    }
}
