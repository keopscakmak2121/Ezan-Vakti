import React, { useState, useEffect, useRef, useCallback } from 'react';

const QiblaFinder = ({ darkMode }) => {
  const [location, setLocation] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasCompass, setHasCompass] = useState(true);
  const [calibrationNeeded, setCalibrationNeeded] = useState(false);

  const smoothedHeading = useRef(0);
  const animFrameRef = useRef(null);
  const displayHeading = useRef(0);
  const targetHeading = useRef(0);

  const KAABA = { lat: 21.4225, lng: 39.8262 };

  // Kıble açısı hesapla (Great Circle Bearing)
  const calculateQiblaDirection = (userLat, userLng) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;
    const lat1 = toRad(userLat);
    const lat2 = toRad(KAABA.lat);
    const dLng = toRad(KAABA.lng - userLng);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    let bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360;
  };

  // Konum al
  const getLocation = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Konum servisi desteklenmiyor.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setQiblaDirection(calculateQiblaDirection(latitude, longitude));
        setLoading(false);
      },
      () => {
        setError('Konum alınamadı. Konum iznini kontrol edin.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Açı farkını en kısa yoldan hesapla (-180 ile +180 arası)
  const shortAngleDist = (from, to) => {
    const diff = ((to - from + 180) % 360 + 360) % 360 - 180;
    return diff;
  };

  // Smooth animasyon döngüsü
  const animate = useCallback(() => {
    const diff = shortAngleDist(displayHeading.current, targetHeading.current);
    displayHeading.current += diff * 0.12; // Lerp faktörü
    displayHeading.current = ((displayHeading.current % 360) + 360) % 360;
    setDeviceHeading(displayHeading.current);
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [animate]);

  // Pusula sensörü
  useEffect(() => {
    let orientationHandler = null;
    let compassTimeout = null;

    const handleOrientation = (event) => {
      let heading = 0;
      if (event.webkitCompassHeading !== undefined) {
        heading = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        if (event.absolute) {
          heading = (360 - event.alpha) % 360;
        } else {
          heading = (360 - event.alpha) % 360;
        }
      }

      // Doğruluğu kontrol et
      if (event.webkitCompassAccuracy !== undefined && event.webkitCompassAccuracy < 0) {
        setCalibrationNeeded(true);
      } else {
        setCalibrationNeeded(false);
      }

      targetHeading.current = heading;
      
      if (compassTimeout) clearTimeout(compassTimeout);
      setHasCompass(true);
    };

    orientationHandler = handleOrientation;

    // iOS izin
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', orientationHandler, true);
          }
        })
        .catch(() => setHasCompass(false));
    } else {
      window.addEventListener('deviceorientationabsolute', orientationHandler, true);
      window.addEventListener('deviceorientation', orientationHandler, true);
    }

    // 3 saniye içinde veri gelmezse pusula yok
    compassTimeout = setTimeout(() => {
      // Eğer hala 0 ise pusula çalışmıyor olabilir
    }, 3000);

    return () => {
      window.removeEventListener('deviceorientationabsolute', orientationHandler);
      window.removeEventListener('deviceorientation', orientationHandler);
      if (compassTimeout) clearTimeout(compassTimeout);
    };
  }, []);

  // İlk yüklenmede otomatik konum al
  useEffect(() => {
    getLocation();
  }, []);

  // Kıble oku açısı
  const qiblaRotation = qiblaDirection !== null ? qiblaDirection - deviceHeading : 0;
  // Pusula diski dönüş açısı (kuzey yukarı kalacak şekilde)
  const compassRotation = -deviceHeading;

  // Yön ismi
  const getDirectionName = (deg) => {
    const d = ((deg % 360) + 360) % 360;
    if (d >= 337.5 || d < 22.5) return 'Kuzey';
    if (d >= 22.5 && d < 67.5) return 'Kuzeydoğu';
    if (d >= 67.5 && d < 112.5) return 'Doğu';
    if (d >= 112.5 && d < 157.5) return 'Güneydoğu';
    if (d >= 157.5 && d < 202.5) return 'Güney';
    if (d >= 202.5 && d < 247.5) return 'Güneybatı';
    if (d >= 247.5 && d < 292.5) return 'Batı';
    return 'Kuzeybatı';
  };

  // Kıble doğru yönde mi (±15 derece tolerans)
  const isAligned = qiblaDirection !== null && Math.abs(shortAngleDist(deviceHeading, qiblaDirection)) < 15;

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const text = darkMode ? '#f1f5f9' : '#0f172a';
  const textSec = darkMode ? '#94a3b8' : '#64748b';
  const accent = '#059669';
  const accentLight = '#10b981';

  return (
    <div style={{ padding: '16px', maxWidth: '420px', margin: '0 auto', color: text, minHeight: '100vh', background: bg }}>
      
      {/* Başlık */}
      <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: accent, margin: '0 0 4px 0' }}>
          🕋 Kıble Pusulası
        </h1>
        <p style={{ fontSize: '14px', color: textSec, margin: 0 }}>Kabe yönünü bulun</p>
      </div>

      {/* Hata */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ color: '#dc2626', fontSize: '14px' }}>⚠️ {error}</div>
          <button onClick={getLocation} style={{ marginTop: '10px', padding: '8px 20px', background: accent, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Yükleniyor */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>🔄</div>
          <div style={{ color: textSec, fontSize: '16px' }}>Konum alınıyor...</div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Pusula */}
      {location && qiblaDirection !== null && !loading && (
        <>
          {/* Hizalama Göstergesi */}
          <div style={{
            textAlign: 'center',
            marginBottom: '16px',
            padding: '10px 16px',
            borderRadius: '12px',
            background: isAligned 
              ? (darkMode ? 'rgba(16,185,129,0.15)' : 'rgba(5,150,105,0.08)')
              : (darkMode ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.06)'),
            border: isAligned ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
            transition: 'all 0.5s ease'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: isAligned ? accentLight : textSec }}>
              {isAligned ? '✅ Kıble Yönündesiniz!' : `🧭 Kıble: ${getDirectionName(qiblaDirection)}`}
            </div>
          </div>

          {/* Pusula SVG */}
          <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto 24px' }}>
            {/* Dış halka glow efekti */}
            <div style={{
              position: 'absolute', inset: '-4px', borderRadius: '50%',
              background: isAligned 
                ? 'conic-gradient(from 0deg, rgba(16,185,129,0.4), rgba(16,185,129,0.1), rgba(16,185,129,0.4))'
                : 'none',
              transition: 'all 0.5s ease',
              filter: 'blur(4px)'
            }} />
            
            <svg viewBox="0 0 300 300" width="300" height="300" style={{ position: 'relative', zIndex: 1 }}>
              <defs>
                {/* Pusula arka plan gradyanı */}
                <radialGradient id="compassBg" cx="50%" cy="50%">
                  <stop offset="0%" stopColor={darkMode ? '#1e293b' : '#ffffff'} />
                  <stop offset="85%" stopColor={darkMode ? '#0f172a' : '#f1f5f9'} />
                  <stop offset="100%" stopColor={darkMode ? '#0f172a' : '#e2e8f0'} />
                </radialGradient>
                
                {/* Kıble ok gradyanı */}
                <linearGradient id="qiblaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>

                {/* Kıble glow */}
                <filter id="qiblaGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Pusula çizgi gradyanı */}
                <linearGradient id="northGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>

              {/* Ana daire */}
              <circle cx="150" cy="150" r="145" fill="url(#compassBg)" stroke={darkMode ? '#334155' : '#cbd5e1'} strokeWidth="2" />
              
              {/* İç çizgiler dairesi */}
              <circle cx="150" cy="150" r="130" fill="none" stroke={darkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="1" />
              <circle cx="150" cy="150" r="100" fill="none" stroke={darkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="0.5" strokeDasharray="4 4" />

              {/* Dönen pusula diski */}
              <g transform={`rotate(${compassRotation} 150 150)`} style={{ transition: 'none' }}>
                
                {/* Derece çizgileri */}
                {Array.from({ length: 72 }, (_, i) => {
                  const angle = i * 5;
                  const isMajor = angle % 30 === 0;
                  const isMid = angle % 15 === 0;
                  const r1 = isMajor ? 118 : (isMid ? 123 : 126);
                  const r2 = 130;
                  const rad = (angle - 90) * Math.PI / 180;
                  return (
                    <line
                      key={i}
                      x1={150 + r1 * Math.cos(rad)}
                      y1={150 + r1 * Math.sin(rad)}
                      x2={150 + r2 * Math.cos(rad)}
                      y2={150 + r2 * Math.sin(rad)}
                      stroke={isMajor ? (darkMode ? '#94a3b8' : '#475569') : (darkMode ? '#334155' : '#cbd5e1')}
                      strokeWidth={isMajor ? 2 : (isMid ? 1.5 : 0.8)}
                    />
                  );
                })}

                {/* Yön harfleri */}
                {[
                  { label: 'K', angle: 0, color: '#ef4444', size: '18px', weight: '800' },
                  { label: 'KD', angle: 45, color: darkMode ? '#64748b' : '#94a3b8', size: '11px', weight: '600' },
                  { label: 'D', angle: 90, color: darkMode ? '#94a3b8' : '#64748b', size: '16px', weight: '700' },
                  { label: 'GD', angle: 135, color: darkMode ? '#64748b' : '#94a3b8', size: '11px', weight: '600' },
                  { label: 'G', angle: 180, color: darkMode ? '#94a3b8' : '#64748b', size: '16px', weight: '700' },
                  { label: 'GB', angle: 225, color: darkMode ? '#64748b' : '#94a3b8', size: '11px', weight: '600' },
                  { label: 'B', angle: 270, color: darkMode ? '#94a3b8' : '#64748b', size: '16px', weight: '700' },
                  { label: 'KB', angle: 315, color: darkMode ? '#64748b' : '#94a3b8', size: '11px', weight: '600' },
                ].map(({ label, angle, color, size, weight }) => {
                  const r = label.length > 1 ? 104 : 106;
                  const rad = (angle - 90) * Math.PI / 180;
                  return (
                    <text
                      key={label}
                      x={150 + r * Math.cos(rad)}
                      y={150 + r * Math.sin(rad)}
                      fill={color}
                      fontSize={size}
                      fontWeight={weight}
                      fontFamily="system-ui, -apple-system, sans-serif"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${-compassRotation} ${150 + r * Math.cos(rad)} ${150 + r * Math.sin(rad)})`}
                    >
                      {label}
                    </text>
                  );
                })}

                {/* Kuzey üçgen işareti */}
                <polygon
                  points="150,22 145,35 155,35"
                  fill="#ef4444"
                />
              </g>

              {/* ─── SABİT KISIMLAR (dönmeyen) ─── */}
              
              {/* Üst yön çizgisi (sabit referans) */}
              <line x1="150" y1="5" x2="150" y2="18" stroke={accent} strokeWidth="3" strokeLinecap="round" />

              {/* Kıble oku */}
              <g transform={`rotate(${qiblaRotation} 150 150)`} filter={isAligned ? 'url(#qiblaGlow)' : 'none'}>
                {/* Ok gövdesi */}
                <line x1="150" y1="150" x2="150" y2="45" stroke="url(#qiblaGrad)" strokeWidth="3.5" strokeLinecap="round" />
                
                {/* Ok ucu */}
                <polygon points="150,35 142,55 150,47 158,55" fill="url(#qiblaGrad)" />
                
                {/* Kabe ikonu (ok ucunda) */}
                <g transform="translate(150, 30)">
                  <rect x="-7" y="-7" width="14" height="14" rx="2" fill={isAligned ? '#10b981' : '#059669'} stroke="#fff" strokeWidth="1.5" />
                  <text x="0" y="1" fill="white" fontSize="10" textAnchor="middle" dominantBaseline="central">🕋</text>
                </g>
              </g>

              {/* Merkez nokta */}
              <circle cx="150" cy="150" r="8" fill={darkMode ? '#1e293b' : '#fff'} stroke={accent} strokeWidth="3" />
              <circle cx="150" cy="150" r="3" fill={accent} />

            </svg>
          </div>

          {/* Derece göstergesi */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '40px', fontWeight: '800', color: accent, fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>
              {qiblaDirection.toFixed(1)}°
            </div>
            <div style={{ fontSize: '13px', color: textSec, marginTop: '2px' }}>
              Kıble Açısı • {getDirectionName(qiblaDirection)}
            </div>
          </div>

          {/* Bilgi Kartları */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[
              { icon: '🧭', label: 'Pusula', value: `${deviceHeading.toFixed(0)}°` },
              { icon: '📍', label: 'Enlem', value: `${location.lat.toFixed(4)}°` },
              { icon: '🗺️', label: 'Boylam', value: `${location.lng.toFixed(4)}°` },
              { icon: '📐', label: 'Fark', value: `${Math.abs(shortAngleDist(deviceHeading, qiblaDirection)).toFixed(0)}°` },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                background: cardBg,
                borderRadius: '12px',
                padding: '12px',
                boxShadow: darkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
              }}>
                <div style={{ fontSize: '12px', color: textSec, marginBottom: '4px' }}>{icon} {label}</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: text, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Kalibrasyon uyarısı */}
          {calibrationNeeded && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#92400e' }}>
                ⚠️ Pusula kalibrasyonu gerekiyor. Telefonunuzu 8 şeklinde çevirin.
              </div>
            </div>
          )}

          {/* Yenile Butonu */}
          <button onClick={getLocation} style={{
            width: '100%', padding: '14px', background: accent, color: '#fff',
            border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            🔄 Konumu Yenile
          </button>

          <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '12px', color: textSec, lineHeight: '1.5' }}>
            Yeşil ok Kıble yönünü gösterir. Telefonunuzu düz tutarak okun yönüne dönün.
          </div>
        </>
      )}
    </div>
  );
};

export default QiblaFinder;
