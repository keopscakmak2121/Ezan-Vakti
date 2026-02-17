
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
        if (prayerTimes == null) {
            call.reject("Ezan vakitleri gönderilmedi.");
            return;
        }

        saveToWidgetStorage(prayerTimes.toString());

        Intent serviceIntent = new Intent(getContext(), PrayerForegroundService.class);
        serviceIntent.putExtra("prayerTimes", prayerTimes.toString());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(serviceIntent);
        } else {
            getContext().startService(serviceIntent);
        }
        
        // Widget'ları tetikle
        PrayerWidgetProvider.updateAllWidgets(getContext());
        PrayerWidgetSmallProvider.updateAllWidgets(getContext());
        
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Intent serviceIntent = new Intent(getContext(), PrayerForegroundService.class);
        getContext().stopService(serviceIntent);
        call.resolve();
    }

    private void saveToWidgetStorage(String prayerData) {
        SharedPreferences prefs = getContext().getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("prayer_data", prayerData);
        editor.apply(); // Değişikliği hemen uygula
    }
}
