
package com.quran.kerim;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Kayıt edilecek eklentiler:
        registerPlugin(AppSettings.class);
        registerPlugin(PrayerPlugin.class);
        
        super.onCreate(savedInstanceState);

        // Kilit ekranında göster + ekranı aç
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            );
        }

        // Fullscreen bildirimden açıldıysa, JS tarafına bildir
        handleAlarmIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleAlarmIntent(intent);
    }

    private void handleAlarmIntent(Intent intent) {
        if (intent == null) return;
        boolean isAlarm = intent.getBooleanExtra("isAlarm", false);
        if (isAlarm) {
            String prayerName = intent.getStringExtra("prayerName");
            String prayerTime = intent.getStringExtra("prayerTime");
            Log.d(TAG, "Alarm intent alındı: " + prayerName + " - " + prayerTime);

            // WebView yüklendikten sonra JS event gönder
            getBridge().getWebView().post(() -> {
                // Kısa bir gecikme ile WebView'in hazır olmasını bekle
                getBridge().getWebView().postDelayed(() -> {
                    String js = "window.dispatchEvent(new CustomEvent('nativePrayerAlarm', { detail: { prayerName: '"
                        + (prayerName != null ? prayerName : "") + "', prayerTime: '"
                        + (prayerTime != null ? prayerTime : "") + "' }}));";
                    getBridge().getWebView().evaluateJavascript(js, null);
                    Log.d(TAG, "JS event gönderildi: nativePrayerAlarm");
                }, 1500);
            });

            // Intent'i temizle (tekrar tetiklenmemesi için)
            intent.removeExtra("isAlarm");
        }
    }
}
