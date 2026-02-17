package com.quran.kerim;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Eklentiyi açıkça kaydet
        registerPlugin(AppSettings.class);
    }
}
