import React, { useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

// Yeni oluşturduğumuz Java eklentisini kaydedelim
const AppSettings = registerPlugin('AppSettings');

const SetupWizard = ({ darkMode, onComplete, onThemeChange }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const nextStep = () => setStep(prev => prev + 1);

  // 1. Bildirim İzni
  const requestNotificationPermission = async () => {
    setLoading(true);
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await LocalNotifications.requestPermissions();
        // Eğer izin zaten verilmişse veya kullanıcı onayladıysa bir sonraki adıma geç
        if (result.display === 'granted') nextStep();
        else alert("Ezan sesini duyabilmek için bildirim izni vermeniz gerekmektedir.");
      } catch (e) { nextStep(); }
    } else nextStep();
    setLoading(false);
  };

  // 2. Konum İzni
  const requestLocationPermission = async () => {
    setLoading(true);
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await Geolocation.requestPermissions();
        if (result.location === 'granted') nextStep();
        else alert("Vakitlerin doğruluğu için konum izni gereklidir.");
      } catch (e) { nextStep(); }
    } else nextStep();
    setLoading(false);
  };

  // 3. Pil ve Arka Plan Stabilite Ayarı (Java Metodunu Çağırır)
  const openBatterySettings = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await AppSettings.openBatteryOptimizationSettings();
        // Sayfa açıldıktan sonra kullanıcıyı bir sonraki adıma geçiriyoruz
        nextStep();
      } catch (e) {
        console.error("Pil ayarları açılamadı:", e);
        nextStep();
      }
    } else nextStep();
  };

  // 4. Üstte Gösterme İzni (Java Metodunu Çağırır)
  const openOverlaySettings = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await AppSettings.openOverlaySettings();
        nextStep();
      } catch (e) {
        console.error("Üstte gösterme ayarları açılamadı:", e);
        nextStep();
      }
    } else nextStep();
  };

  const finishSetup = () => {
    localStorage.setItem('setup_completed', 'true');
    onComplete();
  };

  const styles = {
    container: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: darkMode ? '#111827' : '#f9fafb',
      zIndex: 10000, display: 'flex', flexDirection: 'column',
      padding: '40px 25px', textAlign: 'center', color: darkMode ? '#f3f4f6' : '#1f2937',
      overflowY: 'auto'
    },
    title: { fontSize: '24px', fontWeight: '800', marginBottom: '15px', color: '#059669' },
    description: { fontSize: '15px', lineHeight: '1.6', marginBottom: '25px', color: darkMode ? '#9ca3af' : '#6b7280' },
    button: {
      padding: '16px 20px', borderRadius: '14px', border: 'none',
      backgroundColor: '#059669', color: 'white', fontSize: '16px', fontWeight: 'bold',
      cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)', width: '100%', maxWidth: '300px', alignSelf: 'center'
    },
    icon: { fontSize: '60px', marginBottom: '20px' },
    guideBox: {
      backgroundColor: darkMode ? '#1f2937' : '#f0fdf4',
      padding: '15px', borderRadius: '12px', border: `1px solid #059669`,
      textAlign: 'left', marginBottom: '20px', fontSize: '14px'
    },
    stepIndicator: { fontSize: '12px', color: '#059669', fontWeight: 'bold', marginBottom: '10px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.stepIndicator}>ADIM {step} / 6</div>

      {step === 1 && (
        <div style={{animation: 'fadeIn 0.5s'}}>
          <div style={styles.icon}>👋</div>
          <h1 style={styles.title}>Kurulum Sihirbazı</h1>
          <p style={styles.description}>Uygulamanın sorunsuz çalışması için gerekli stabilite ayarlarını birlikte yapalım.</p>
          <button style={styles.button} onClick={nextStep}>Hadi Başlayalım</button>
        </div>
      )}

      {step === 2 && (
        <div style={{animation: 'fadeIn 0.5s'}}>
          <div style={styles.icon}>🔔</div>
          <h1 style={styles.title}>Bildirim ve Ezan Sesleri</h1>
          <div style={styles.guideBox}>
            <b>Neden Gerekli?</b><br/>
            Ezan okunduğunda sesli uyarı alabilmeniz ve kilit ekranında tam ekran bildirimin görünmesi içindir.
          </div>
          <button style={styles.button} onClick={requestNotificationPermission}>İzni Onayla</button>
        </div>
      )}

      {step === 3 && (
        <div style={{animation: 'fadeIn 0.5s'}}>
          <div style={styles.icon}>📍</div>
          <h1 style={styles.title}>Konum ve Vakit Hassasiyeti</h1>
          <div style={styles.guideBox}>
            <b>Neden Gerekli?</b><br/>
            Bulunduğunuz şehre göre namaz vakitlerinin 1 saniye bile şaşmadan hesaplanması içindir.
          </div>
          <button style={styles.button} onClick={requestLocationPermission}>Konumu Etkinleştir</button>
        </div>
      )}

      {step === 4 && (
        <div style={{animation: 'fadeIn 0.5s'}}>
          <div style={styles.icon}>🔋</div>
          <h1 style={styles.title}>Arka Plan Stabilitesi</h1>
          <div style={styles.guideBox}>
            <b>Kritik Adım!</b><br/>
            Android'in uygulamayı uyutmaması için açılacak pencerede uygulamayı bulup <b>"KISITLAMA YOK"</b> veya <b>"OPTİMİZE ETME"</b> moduna alın.
          </div>
          <button style={styles.button} onClick={openBatterySettings}>Ayarlar Sayfasını Aç</button>
        </div>
      )}

      {step === 5 && (
        <div style={{animation: 'fadeIn 0.5s'}}>
          <div style={styles.icon}>📱</div>
          <h1 style={styles.title}>Üstte Gösterme İzni</h1>
          <div style={styles.guideBox}>
            <b>Tam Ekran Bildirim:</b><br/>
            Ezan vaktinde telefon kilitliyken ekranın otomatik uyanması için bu izni <b>AKTİF</b> etmeniz gerekiyor.
          </div>
          <button style={styles.button} onClick={openOverlaySettings}>İzin Sayfasını Aç</button>
        </div>
      )}

      {step === 6 && (
        <div style={{animation: 'fadeIn 0.5s'}}>
          <div style={styles.icon}>✅</div>
          <h1 style={styles.title}>Her Şey Hazır!</h1>
          <p style={styles.description}>Tüm stabilite ayarları yapıldı. Artık uygulama en güvenilir şekilde çalışacaktır.</p>
          <button style={styles.button} onClick={finishSetup}>Uygulamayı Başlat</button>
        </div>
      )}
    </div>
  );
};

export default SetupWizard;
