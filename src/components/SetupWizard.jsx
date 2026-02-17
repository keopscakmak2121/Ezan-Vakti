import React, { useState, useEffect, useCallback } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import AppSettings from '../utils/appSettingsPlugin.js';

const SetupWizard = ({ darkMode, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const totalSteps = 6;

  const nextStep = () => { setStatusMsg(''); setStep(prev => prev + 1); };
  const showStatus = (msg, autoHide = true) => {
    setStatusMsg(msg);
    if (autoHide) setTimeout(() => setStatusMsg(''), 4000);
  };

  // Uygulama ön plana geldiğinde (ayarlardan dönünce) izin durumunu kontrol et
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const checkOnResume = App.addListener('appStateChange', async ({ isActive }) => {
      if (!isActive) return;
      // Pil adımındaysa
      if (step === 3) {
        try {
          // Pil izni kontrol — zaten verilmişse otomatik geç
          await AppSettings.openBatteryOptimizationSettings().catch(() => {});
          // Eğer popup gelmeden resolve olduysa izin zaten var
        } catch (e) {}
      }
    });
    return () => { checkOnResume.then(h => h.remove()); };
  }, [step]);

  // 1. Bildirim + Konum birlikte (hızlı adım)
  const requestPermissions = async () => {
    setLoading(true);
    let notifOk = false, locOk = false;

    if (Capacitor.isNativePlatform()) {
      try {
        const notif = await LocalNotifications.requestPermissions();
        notifOk = notif.display === 'granted';
      } catch (e) { notifOk = true; }

      try {
        const loc = await Geolocation.requestPermissions();
        locOk = loc.location === 'granted';
      } catch (e) { locOk = true; }
    } else {
      notifOk = true; locOk = true;
    }

    if (notifOk && locOk) showStatus('✅ Bildirim ve konum izni verildi');
    else if (notifOk) showStatus('✅ Bildirim izni verildi, ⚠️ Konum izni verilmedi');
    else if (locOk) showStatus('⚠️ Bildirim izni verilmedi, ✅ Konum izni verildi');
    else showStatus('⚠️ İzinler verilmedi — Ayarlardan verebilirsiniz');

    setLoading(false);
    setTimeout(nextStep, 1200);
  };

  // 3. Pil Optimizasyonu
  const openBatterySettings = async () => {
    try {
      await AppSettings.openBatteryOptimizationSettings();
      showStatus('✅ Pil ayarı açıldı — İzin verdikten sonra geri dönün', false);
    } catch (e) {
      showStatus('⚠️ ' + (e.message || 'Pil ayarları açılamadı'));
    }
  };

  // 4. Üstte Gösterme
  const openOverlaySettings = async () => {
    try {
      await AppSettings.openOverlaySettings();
      showStatus('✅ Ayar açıldı — İzni aktif edip geri dönün', false);
    } catch (e) {
      showStatus('⚠️ ' + (e.message || 'Ayarlar açılamadı'));
    }
  };

  // 5. Kesin Alarm
  const openAlarmSettings = async () => {
    try {
      await AppSettings.openExactAlarmSettings();
      showStatus('✅ Ayar açıldı — İzni aktif edip geri dönün', false);
    } catch (e) {
      showStatus('⚠️ ' + (e.message || 'Alarm ayarları açılamadı'));
    }
  };

  const finishSetup = () => {
    localStorage.setItem('setup_completed', 'true');
    onComplete();
  };

  const s = {
    container: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: darkMode ? '#111827' : '#f9fafb',
      zIndex: 10000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '30px 20px', textAlign: 'center', color: darkMode ? '#f3f4f6' : '#1f2937',
      overflowY: 'auto'
    },
    stepBar: { display: 'flex', gap: '4px', marginBottom: '25px', justifyContent: 'center' },
    stepDot: (active, done) => ({
      width: active ? '24px' : '8px', height: '8px', borderRadius: '4px',
      backgroundColor: done ? '#059669' : active ? '#10b981' : (darkMode ? '#374151' : '#d1d5db'),
      transition: 'all 0.3s'
    }),
    icon: { fontSize: '50px', marginBottom: '15px' },
    title: { fontSize: '22px', fontWeight: '800', marginBottom: '10px', color: '#059669' },
    desc: { fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', color: darkMode ? '#9ca3af' : '#6b7280', maxWidth: '340px' },
    guideBox: {
      backgroundColor: darkMode ? '#1f2937' : '#f0fdf4',
      padding: '14px', borderRadius: '12px', border: '1px solid #059669',
      textAlign: 'left', marginBottom: '16px', fontSize: '13px', lineHeight: '1.7',
      color: darkMode ? '#d1d5db' : '#374151', maxWidth: '340px', width: '100%'
    },
    mainBtn: {
      padding: '14px 20px', borderRadius: '14px', border: 'none',
      backgroundColor: '#059669', color: 'white', fontSize: '15px', fontWeight: 'bold',
      cursor: 'pointer', width: '100%', maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(5,150,105,0.3)', marginBottom: '8px'
    },
    secondBtn: {
      padding: '12px 20px', borderRadius: '12px', border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
      backgroundColor: 'transparent', color: darkMode ? '#9ca3af' : '#6b7280',
      fontSize: '14px', cursor: 'pointer', width: '100%', maxWidth: '300px', marginBottom: '8px'
    },
    status: {
      padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
      backgroundColor: darkMode ? '#064e3b' : '#d1fae5', color: darkMode ? '#a7f3d0' : '#065f46',
      marginBottom: '12px', maxWidth: '340px', width: '100%'
    }
  };

  return (
    <div style={s.container}>
      {/* Progress */}
      <div style={s.stepBar}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} style={s.stepDot(i + 1 === step, i + 1 < step)} />
        ))}
      </div>

      {statusMsg && <div style={s.status}>{statusMsg}</div>}

      {/* ADIM 1 — Hoşgeldin */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>🕌</div>
          <h1 style={s.title}>Ezan Vakti Kurulumu</h1>
          <p style={s.desc}>Uygulamanın düzgün çalışması için birkaç izin gerekiyor. 1 dakikada tamamlanır.</p>
          <button style={s.mainBtn} onClick={nextStep}>Başlayalım</button>
        </div>
      )}

      {/* ADIM 2 — Bildirim + Konum (birleştirildi) */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>🔔📍</div>
          <h1 style={s.title}>Bildirim ve Konum İzni</h1>
          <div style={s.guideBox}>
            <b>🔔 Bildirim:</b> Ezan sesli uyarıları için<br />
            <b>📍 Konum:</b> Doğru namaz vakitleri için
          </div>
          <button style={s.mainBtn} onClick={requestPermissions} disabled={loading}>
            {loading ? 'İzinler isteniyor...' : 'İzinleri Ver'}
          </button>
          <button style={s.secondBtn} onClick={nextStep}>Atla →</button>
        </div>
      )}

      {/* ADIM 3 — Pil Optimizasyonu */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>🔋</div>
          <h1 style={s.title}>Pil Optimizasyonu</h1>
          <div style={s.guideBox}>
            <b>⚠️ En Önemli Adım!</b><br /><br />
            Android uygulamayı arka planda kapatabilir. Açılacak pencerede:<br /><br />
            <b>→ "Kısıtlama Yok"</b> veya <b>"Optimize Etme"</b> seçin.<br /><br />
            <span style={{ fontSize: '12px', opacity: 0.7 }}>Bu ayar olmadan bildirimler gelmeyebilir.</span>
          </div>
          <button style={s.mainBtn} onClick={openBatterySettings}>Pil Ayarını Aç</button>
          <button style={s.secondBtn} onClick={nextStep}>İleri →</button>
        </div>
      )}

      {/* ADIM 4 — Üstte Gösterme */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>📱</div>
          <h1 style={s.title}>Üstte Gösterme İzni</h1>
          <div style={s.guideBox}>
            <b>Neden gerekli?</b><br />
            Ezan vaktinde kilit ekranında tam ekran bildirim gösterebilmek için.<br /><br />
            <b>→ Açılacak sayfada izni AKTİF edin.</b>
          </div>
          <button style={s.mainBtn} onClick={openOverlaySettings}>Ayarı Aç</button>
          <button style={s.secondBtn} onClick={nextStep}>İleri →</button>
        </div>
      )}

      {/* ADIM 5 — Kesin Alarm */}
      {step === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>⏰</div>
          <h1 style={s.title}>Kesin Alarm İzni</h1>
          <div style={s.guideBox}>
            <b>Neden gerekli?</b><br />
            Bildirimlerin tam vaktinde gelmesi için.<br /><br />
            <b>→ "Alarm ve hatırlatıcılar" iznini AKTİF edin.</b>
          </div>
          <button style={s.mainBtn} onClick={openAlarmSettings}>Ayarı Aç</button>
          <button style={s.secondBtn} onClick={nextStep}>İleri →</button>
        </div>
      )}

      {/* ADIM 6 — Tamamlandı */}
      {step === 6 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>✅</div>
          <h1 style={s.title}>Her Şey Hazır!</h1>
          <p style={s.desc}>Tüm izinler ayarlandı. Ezan bildirimleri artık doğru çalışacaktır.</p>
          <button style={s.mainBtn} onClick={finishSetup}>Uygulamayı Başlat 🕌</button>
        </div>
      )}
    </div>
  );
};

export default SetupWizard;
