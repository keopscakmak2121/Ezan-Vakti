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
  const totalSteps = 7; // Bildirim ve Konum ayrıldığı için adım sayısı arttı

  const nextStep = () => { setStatusMsg(''); setStep(prev => prev + 1); };
  const showStatus = (msg, autoHide = true) => {
    setStatusMsg(msg);
    if (autoHide) setTimeout(() => setStatusMsg(''), 4000);
  };

  // Uygulama ön plana geldiğinde (ayarlardan dönünce) izin durumlarını otomatik kontrol et
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const checkOnResume = App.addListener('appStateChange', async ({ isActive }) => {
      if (!isActive) return;

      try {
        if (step === 2) { // Bildirim Kontrolü
          const status = await LocalNotifications.checkPermissions();
          if (status.display === 'granted') {
            showStatus('✅ Bildirim izni algılandı');
            setTimeout(nextStep, 1000);
          }
        } else if (step === 3) { // Konum Kontrolü
          const status = await Geolocation.checkPermissions();
          if (status.location === 'granted' || status.location === 'coarse') {
            showStatus('✅ Konum izni algılandı');
            setTimeout(nextStep, 1000);
          }
        } else if (step === 4) { // Pil Optimizasyonu (Check metodu olmadığı için sadece ayarı açıyoruz ama resume'da uyarı verebiliriz)
             // Pil için kesin bir check API'si her cihazda yok, bu yüzden manuel geçişe izin veriyoruz
        }
      } catch (e) { console.error("Kontrol hatası:", e); }
    });
    return () => { checkOnResume.then(h => h.remove()); };
  }, [step]);

  // Adım 2: Bildirim İzni İsteme
  const requestNotifPermission = async () => {
    setLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const res = await LocalNotifications.requestPermissions();
        if (res.display === 'granted') {
          showStatus('✅ Bildirim izni verildi');
          setTimeout(nextStep, 1000);
        } else {
          showStatus('⚠️ Bildirim izni reddedildi. Ayarlardan açmalısınız.');
        }
      } else {
        nextStep();
      }
    } catch (e) { showStatus('⚠️ Bir hata oluştu'); }
    setLoading(false);
  };

  // Adım 3: Konum İzni İsteme
  const requestLocPermission = async () => {
    setLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const res = await Geolocation.requestPermissions();
        if (res.location === 'granted' || res.location === 'coarse') {
          showStatus('✅ Konum izni verildi');
          setTimeout(nextStep, 1000);
        } else {
          showStatus('⚠️ Konum izni reddedildi. Ayarlardan açmalısınız.');
        }
      } else {
        nextStep();
      }
    } catch (e) { showStatus('⚠️ Bir hata oluştu'); }
    setLoading(false);
  };

  // Diğer ayar açma fonksiyonları
  const openBatterySettings = async () => {
    try { await AppSettings.openBatteryOptimizationSettings(); showStatus('✅ Ayarı yaptıktan sonra geri dönün', false); }
    catch (e) { showStatus('⚠️ Ayarlar açılamadı'); }
  };

  const openOverlaySettings = async () => {
    try { await AppSettings.openOverlaySettings(); showStatus('✅ Ayarı yaptıktan sonra geri dönün', false); }
    catch (e) { showStatus('⚠️ Ayarlar açılamadı'); }
  };

  const openAlarmSettings = async () => {
    try { await AppSettings.openExactAlarmSettings(); showStatus('✅ Ayarı yaptıktan sonra geri dönün', false); }
    catch (e) { showStatus('⚠️ Ayarlar açılamadı'); }
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

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>🕌</div>
          <h1 style={s.title}>Ezan Vakti Kurulumu</h1>
          <p style={s.desc}>Uygulamanın düzgün çalışması için birkaç izin gerekiyor. 1 dakikada tamamlanır.</p>
          <button style={s.mainBtn} onClick={nextStep}>Başlayalım</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>🔔</div>
          <h1 style={s.title}>Bildirim İzni</h1>
          <div style={s.guideBox}>
            Ezan vakitlerinde sesli uyarı alabilmeniz için bildirim izni vermeniz gerekmektedir.
          </div>
          <button style={s.mainBtn} onClick={requestNotifPermission} disabled={loading}>
            {loading ? 'İsteniyor...' : 'Bildirim İzni Ver'}
          </button>
          <button style={s.secondBtn} onClick={nextStep}>Atla →</button>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>📍</div>
          <h1 style={s.title}>Konum İzni</h1>
          <div style={s.guideBox}>
            Namaz vakitlerinin bulunduğunuz konuma göre milimetrik hesaplanması için gereklidir.
          </div>
          <button style={s.mainBtn} onClick={requestLocPermission} disabled={loading}>
            {loading ? 'İsteniyor...' : 'Konum İzni Ver'}
          </button>
          <button style={s.secondBtn} onClick={nextStep}>Atla →</button>
        </div>
      )}

      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>🔋</div>
          <h1 style={s.title}>Pil Optimizasyonu</h1>
          <div style={s.guideBox}>
            <b>⚠️ Kritik Adım!</b><br /><br />
            Android'in ezan sesini arka planda kesmemesi için <b>"Kısıtlama Yok"</b> seçeneğini işaretleyin.
          </div>
          <button style={s.mainBtn} onClick={openBatterySettings}>Pil Ayarını Aç</button>
          <button style={s.secondBtn} onClick={nextStep}>İleri →</button>
        </div>
      )}

      {step === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>📱</div>
          <h1 style={s.title}>Üstte Gösterme</h1>
          <div style={s.guideBox}>
            Ezan vaktinde kilit ekranında tam ekran görsel uyarı gösterebilmek için bu izni aktif edin.
          </div>
          <button style={s.mainBtn} onClick={openOverlaySettings}>Ayarı Aç</button>
          <button style={s.secondBtn} onClick={nextStep}>İleri →</button>
        </div>
      )}

      {step === 6 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>⏰</div>
          <h1 style={s.title}>Kesin Alarm İzni</h1>
          <div style={s.guideBox}>
            Bildirimlerin saniyesi saniyesine tam vaktinde gelmesi için bu ayarı aktif edin.
          </div>
          <button style={s.mainBtn} onClick={openAlarmSettings}>Ayarı Aç</button>
          <button style={s.secondBtn} onClick={nextStep}>İleri →</button>
        </div>
      )}

      {step === 7 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.icon}>✅</div>
          <h1 style={s.title}>Her Şey Hazır!</h1>
          <p style={s.desc}>Kurulum tamamlandı. Artık huzurla kullanabilirsiniz.</p>
          <button style={s.mainBtn} onClick={finishSetup}>Uygulamayı Başlat 🕌</button>
        </div>
      )}
    </div>
  );
};

export default SetupWizard;
