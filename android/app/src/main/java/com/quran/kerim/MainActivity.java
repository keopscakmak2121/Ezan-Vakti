package com.quran.kerim;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private boolean doubleBackToExitPressedOnce = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView.setWebContentsDebuggingEnabled(true);

        // Enable edge-to-edge display
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // Use the modern API to handle system bar icon colors
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (insetsController != null) {
            // Set to 'false' for light-colored icons suitable for a dark background
            insetsController.setAppearanceLightStatusBars(false);
            insetsController.setAppearanceLightNavigationBars(false);
        }
    }

    @Override
    public void onBackPressed() {
        // WebView'da geri gidilebilecek sayfa varsa, geri gidin
        if (getBridge().getWebView().canGoBack()) {
            getBridge().getWebView().goBack();
        } else {
            // Aksi takdirde, çıkmak için çift tıklama özelliğini uygulayın
            if (doubleBackToExitPressedOnce) {
                finish(); // Uygulamadan çık
                return;
            }

            this.doubleBackToExitPressedOnce = true;
            Toast.makeText(this, "Çıkış yapmak için tekrar basın", Toast.LENGTH_SHORT).show();

            new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                @Override
                public void run() {
                    doubleBackToExitPressedOnce = false;
                }
            }, 2000); // 2 saniye sonra bayrağı sıfırla
        }
    }
}
