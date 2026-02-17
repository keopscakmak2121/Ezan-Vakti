import React, { useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import AppSettings from '../utils/appSettingsPlugin.js';

const SetupWizard = ({ darkMode, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const totalSteps = 7;

  const nextStep = () => { setStatusMsg(''); setStep(prev => prev + 1); };

  const showStatus = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 3000); };

  // 2. Bildirim İzni
  const requestNotificationPermission = async () => {
    setLoading(true);
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await LocalNotifications.requestPermissions();
        if (result.display === 'granted') {
          showStatus('✅ Bildirim izni verildi');
          setTimeout(nextStep, 800);
        } else {
          showStatus('⚠️ Bildirim izni verilmedi — Ayarlardan verebilirsiniz');
        }
      } catch (e) { nextStep(); }
    } else nextStep();
    setLoading(false);
  };

  // 3. Konum İzni
  const requestLocationPermission = async () => {
    setLoading(true);
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await Geolocation.requestPermissions();
        if (result.location === 'granted') {
          showStatus('✅ Konum izni verildi');
          setTimeout(nextStep, 800);
        } else {
          showStatus('⚠️ Konum izni verilmedi');
        }
      } catch (e) { nextStep(); }
    } else nextStep();
    setLoading(false);
  };

  // 4. Pil Optimizasyonu
  const openBatterySettings = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        console.log('Pil ayarları açılıyor...');
        await AppSettings.openBatteryOptimizationSettings();
        showStatus('✅ Ayarlar açıldı — "Kısıtlama Yok" seçin');
      } catch (e) {
        console.error('Pil ayarları hatası:', e);
        showStatus('⚠️ Pil ayarları açılamadı: ' + (e.message || e));
      }
    } else {
      showStatus('Bu özellik sadece telefonda çalışır');
    }
  };

  // 5. Üstte Gösterme İzni
  const openOverlaySettings = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        console.log('Overlay ayarları açılıyor...');
        await AppSettings.openOverlaySettings();
        showStatus('✅ Ayarlar açıldı — İzni aktif edin');
      } catch (e) {
        console.error('Overlay hatası:', e);
        showStatus('⚠️ Ayarlar açılamadı: ' + (e.message || e));
      }
    } else {
      showStatus('Bu özellik sadece telefonda çalışır');
    }
  };

  // 6. Kesin Alarm İzni
  const openAlarmSettings = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        console.log('Alarm ayarları açılıyor...');
        await AppSettings.openExactAlarmSettings();
        showStatus('✅ Ayarlar açıldı — İzni aktif edin');
      } catch (e) {
        console.error('Alarm hatası:', e);
        showStatus('⚠️ Alarm ayarları açılamadı: ' + (e.message || e));
      }
    } else {
      showStatus('Bu özellik sadece telefonda çalışır');
    }
  };

  // Bildirim ayarları aç
  const openNotificationSettings = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await AppSettings.openNotificationSettings();
        showStatus('✅ Bildirim ayarları açıldı');
      } catch (e) {
        showStatus('⚠️ Açılamadı: ' + (e.message || e));
      }
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
      padding: '30px 20px', textAlign: 'center', color: darkMode ? '#f3f4f6' : '#1f2937',
      overflowY: 'auto'
    },
    stepBar: {
      display: 'flex', gap: '4px', marginBottom: '20px', justifyContent: 'center'
    },
    stepDot: (active) => ({
      width: active ? '24px' : '8px', height: '8px', borderRadius: '4px',
      backgroundColor: active ? '#059669' : (darkMode ? '#374151' : '#d1d5db'),
      transition: 'all 0.3s'
    }),
    icon: { fontSize: '50px', marginBottom: '15px' },
    title: { fontSize: '22px', fontWeight: '800', marginBottom: '10px', color: '#059669' },
    desc: { fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', color: darkMode ? '#9ca3af' : '#6b7280' },
    guideBox: {
      backgroundColor: darkMode ? '#1f2937' : '#f0fdf4',
      padding: '14px', borderRadius: '12px', border: '1px solid #059669',
      textAlign: 'left', marginBottom: '16px', fontSize: '13px', lineHeight: '1.6',
      color: darkMode ? '#d1d5db' : '#374151'
    },
    mainBtn: {
      padding: '14px 20px', borderRadius: '14px', border: 'none',
      backgroundColor: '#059669', color: 'white', fontSize: '15px', fontWeight: 'bold',
      cursor: 'pointer', width: '100%', maxWidth: '300px', alignSelf: 'center',
      boxShadow: '0 4px 12px rgba(5,150,105,0.3)', marginBottom: '10px'
    },
    skipBtn: {
      padding: '10px 20px', borderRadius: '10px', border: 'none',
      backgroundColor: 'transparent', color: darkMode ? '#6b7280' : '#9ca3af',
      fontSize: '13px', cursor: 'pointer', marginTop: '6px'
    },
    status: {
      padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
      backgroundColor: darkMode ? '#1f2937' : '#f0fdf4', color: '#059669',
      marginBottom: '10px', minHeight: '34px'
    }
  };

  return (
    <div style={s.container}>
      {/* Progress Bar */}
      <div style={s.stepBar}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} style={s.stepDot(i + 1 === step)} />
        ))}
      </div>

      {statusMsg && <div style={s.status}>{statusMsg}</div>}

      {/* ADIM 1 — Hoşgeldin */}
      {step === 1 && (
        <div>
          <div style={s.icon}>🕌</div>
          <h1 style={s.title}>Ezan Vakti Kurulumu</h1>
          <p style={s.desc}>Uygulamanın stabil çalışması için gerekli izinleri birlikte ayarlayalım. Bu izinler olmadan bildirimler ve ezan sesleri düzgün çalışmaz.</p>
          <button style={s.mainBtn} onClick={nextStep}>Başlayalım</button>
        </div>
      )}

      {/* ADIM 2 — Bildirim */}
      {step === 2 && (
        <div>
          <div style={s.icon}>🔔</div>
          <h1 style={s.title}>Bildirim İzni</h1>
          <div style={s.guideBox}>
            <b>Neden gerekli?</b><br />
            Ezan vakti geldiğinde sesli bildirim alabilmeniz ve kilit ekranında görebilmeniz için.
          </div>
          <button style={s.mainBtn} onClick={requestNotificationPermission} disabled={loading}>
            {loading ? 'İzin isteniyor...' : 'Bildirim İznini Ver'}
          </button>
          <button style={s.skipBtn} onClick={nextStep}>Şimdilik atla →</button>
        </div>
      )}

      {/* ADIM 3 — Konum */}
      {step === 3 && (
        <div>
          <div style={s.icon}>📍</div>
          <h1 style={s.title}>Konum İzni</h1>
          <div style={s.guideBox}>
            <b>Neden gerekli?</b><br />
            Bulunduğunuz şehre göre namaz vakitlerinin doğru hesaplanması için konum bilgisi gereklidir.
          </div>
          <button style={s.mainBtn} onClick={requestLocationPermission} disabled={loading}>
            {loading ? 'İzin isteniyor...' : 'Konum İznini Ver'}
          </button>
          <button style={s.skipBtn} onClick={nextStep}>Şimdilik atla →</button>
        </div>
      )}

      {/* ADIM 4 — Pil Optimizasyonu */}
      {step === 4 && (
        <div>
          <div style={s.icon}>🔋</div>
          <h1 style={s.title}>Pil Optimizasyonu</h1>
          <div style={s.guideBox}>
            <b>⚠️ Kritik Adım!</b><br />
            Android, arka planda çalışan uygulamaları kapatabilir. Açılacak pencerede:<br /><br />
            <b>→ "Kısıtlama Yok"</b> veya <b>"Optimize Etme"</b> seçeneğini seçin.<br /><br />
            Bu ayar olmadan ezan bildirimleri gelmeyebilir.
          </div>
          <button style={s.mainBtn} onClick={openBatterySettings}>Pil Ayarlarını Aç</button>
          <button style={s.skipBtn} onClick={nextStep}>İleri →</button>
        </div>
      )}

      {/* ADIM 5 — Üstte Gösterme */}
      {step === 5 && (
        <div>
          <div style={s.icon}>📱</div>
          <h1 style={s.title}>Üstte Gösterme İzni</h1>
          <div style={s.guideBox}>
            <b>Neden gerekli?</b><br />
            Ezan vaktinde kilit ekranında tam ekran bildirim gösterebilmek için bu izin gereklidir.<br /><br />
            <b>→ Açılacak sayfada izni AKTİF edin.</b>
          </div>
          <button style={s.mainBtn} onClick={openOverlaySettings}>Üstte Gösterme Ayarını Aç</button>
          <button style={s.skipBtn} onClick={nextStep}>İleri →</button>
        </div>
      )}

      {/* ADIM 6 — Kesin Alarm */}
      {step === 6 && (
        <div>
          <div style={s.icon}>⏰</div>
          <h1 style={s.title}>Kesin Alarm İzni</h1>
          <div style={s.guideBox}>
            <b>Neden gerekli?</b><br />
            Ezan bildirimlerinin tam vaktinde gelmesi için kesin zamanlı alarm izni gereklidir.<br /><br />
            <b>→ Açılacak sayfada "Alarm ve hatırlatıcılar" iznini AKTİF edin.</b>
          </div>
          <button style={s.mainBtn} onClick={openAlarmSettings}>Alarm Ayarlarını Aç</button>
          <button style={s.skipBtn} onClick={nextStep}>İleri →</button>
        </div>
      )}

      {/* ADIM 7 — Tamamlandı */}
      {step === 7 && (
        <div>
          <div style={s.icon}>✅</div>
          <h1 style={s.title}>Kurulum Tamamlandı!</h1>
          <p style={s.desc}>Tüm izinler ayarlandı. Artık ezan bildirimleri doğru çalışacaktır.</p>
          <div style={{
            ...s.guideBox,
            backgroundColor: darkMode ? '#1c1917' : '#fef3c7',
            border: '1px solid #f59e0b'
          }}>
            <b>💡 Sorun yaşarsanız:</b><br />
            Ayarlar → Kurulum Sihirbazı'ndan izinleri tekrar kontrol edebilirsiniz.
          </div>
          <button style={s.mainBtn} onClick={finishSetup}>Uygulamayı Başlat 🕌</button>
        </div>
      )}
    </div>
  );
};

export default SetupWizard;
