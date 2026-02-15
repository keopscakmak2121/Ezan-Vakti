package com.quran.kerim;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView.setWebContentsDebuggingEnabled(true);

        // Kenardan kenara ekran (Edge-to-edge)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // Sistem çubuğu renk ayarları
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (insetsController != null) {
            insetsController.setAppearanceLightStatusBars(false);
            insetsController.setAppearanceLightNavigationBars(false);
        }
    }
    
    // onBackPressed BURADAN KALDIRILDI. 
    // Geri tuşu kontrolünü tamamen JavaScript (React) tarafına devrettik.
}
