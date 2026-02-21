import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

let CapgoCompass = null;
let CompassAccuracy = null;

const loadCompassPlugin = async () => {
  if (CapgoCompass) return true;
  try {
    const mod = await import('@capgo/capacitor-compass');
    CapgoCompass = mod.CapgoCompass;
    CompassAccuracy = mod.CompassAccuracy;
    return true;
  } catch (e) {
    console.warn('Native compass plugin yüklenemedi', e);
    return false;
  }
};

const QiblaFinder = ({ darkMode }) => {
  const [phase, setPhase] = useState('loading');
  const [location, setLocation] = useState(null);
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState(-1);
  const [errorMsg, setErrorMsg] = useState('');
  const [calibProgress, setCalibProgress] = useState(0);
  const [useNative, setUseNative] = useState(false);

  const displayAngle = useRef(0);
  const targetAngle = useRef(0);
  const rafRef = useRef(null);
  const listenerRef = useRef(null);
  const accuracyListenerRef = useRef(null);
  const calibTimerRef = useRef(null);
  const headingSamples = useRef([]);

  const KAABA = { lat: 21.4225, lng: 39.8262 };

  const toRad = (d) => d * Math.PI / 180;
  const toDeg = (r) => r * 180 / Math.PI;

  const calcQibla = (lat, lng) => {
    const lat1 = toRad(lat);
    const lat2 = toRad(KAABA.lat);
    const dLng = toRad(KAABA.lng - lng);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return ((toDeg(Math.atan2(y, x)) % 360) + 360) % 360;
  };

  const angleDiff = (from, to) => ((to - from + 540) % 360) - 180;

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject('Konum servisi desteklenmiyor'); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => reject('Konum alınamadı. Konum iznini kontrol edin.'),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  };

  // Circular mean
  const circularMean = (samples) => {
    if (!samples.length) return 0;
    let sinSum = 0, cosSum = 0;
    for (const s of samples) {
      sinSum += Math.sin(toRad(s));
      cosSum += Math.cos(toRad(s));
    }
    return ((toDeg(Math.atan2(sinSum, cosSum)) % 360) + 360) % 360;
  };

  // Animasyon
  const animate = useCallback(() => {
    const diff = angleDiff(displayAngle.current, targetAngle.current);
    if (Math.abs(diff) > 0.1) {
      const factor = Math.min(0.12, Math.max(0.03, Math.abs(diff) / 600));
      displayAngle.current += diff * factor;
    }
    displayAngle.current = ((displayAngle.current % 360) + 360) % 360;
    setHeading(displayAngle.current);
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  // Sensör verisi işle
  const processHeading = useCallback((h) => {
    headingSamples.current.push(h);
    if (headingSamples.current.length > 10) headingSamples.current.shift();
    targetAngle.current = circularMean(headingSamples.current);
  }, []);

  // Native compass
  const startNativeCompass = async () => {
    try {
      accuracyListenerRef.current = await CapgoCompass.addListener('accuracyChange', (evt) => {
        setAccuracy(evt.accuracy);
      });
      listenerRef.current = await CapgoCompass.addListener('headingChange', (evt) => {
        processHeading(evt.value);
      });
      await CapgoCompass.watchAccuracy();
      await CapgoCompass.startListening({ minInterval: 100, minHeadingChange: 0.5 });
      return true;
    } catch (e) {
      console.error('Native compass hata:', e);
      return false;
    }
  };

  // Web fallback
  const startWebCompass = () => {
    const handler = (event) => {
      let h = 0;
      if (event.webkitCompassHeading !== undefined) {
        h = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        h = event.absolute ? (360 - event.alpha) % 360 : (360 - event.alpha) % 360;
      }
      processHeading(h);
    };

    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(r => {
        if (r === 'granted') window.addEventListener('deviceorientation', handler, true);
      });
    } else {
      window.addEventListener('deviceorientationabsolute', handler, true);
      window.addEventListener('deviceorientation', handler, true);
    }
    listenerRef.current = {
      remove: () => {
        window.removeEventListener('deviceorientationabsolute', handler);
        window.removeEventListener('deviceorientation', handler);
      }
    };
  };

  // Kalibrasyon
  const startCalibration = useCallback(() => {
    setPhase('calibration');
    setCalibProgress(0);
    headingSamples.current = [];
    let progress = 0;
    let stableCount = 0;
    let lastAvg = null;

    calibTimerRef.current = setInterval(() => {
      progress += 2;
      setCalibProgress(Math.min(progress, 100));

      if (headingSamples.current.length >= 4) {
        const avg = circularMean(headingSamples.current);
        if (lastAvg !== null && Math.abs(angleDiff(lastAvg, avg)) < 5) {
          stableCount++;
        } else {
          stableCount = Math.max(0, stableCount - 1);
        }
        lastAvg = avg;
      }

      if (progress >= 100 || stableCount >= 10) {
        clearInterval(calibTimerRef.current);
        setPhase('compass');
      }
    }, 100);
  }, []);

  // Init
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const loc = await getLocation();
        if (cancelled) return;
        setLocation(loc);
        setQiblaAngle(calcQibla(loc.lat, loc.lng));

        const hasNative = await loadCompassPlugin();
        let nativeOk = false;
        if (hasNative && Capacitor.isNativePlatform()) {
          nativeOk = await startNativeCompass();
          setUseNative(nativeOk);
        }
        if (!nativeOk) startWebCompass();
        if (!cancelled) startCalibration();
      } catch (err) {
        if (!cancelled) { setErrorMsg(typeof err === 'string' ? err : 'Bir hata oluştu'); setPhase('error'); }
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    init();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (calibTimerRef.current) clearInterval(calibTimerRef.current);
      if (listenerRef.current?.remove) listenerRef.current.remove();
      if (accuracyListenerRef.current?.remove) accuracyListenerRef.current.remove();
      if (CapgoCompass) {
        CapgoCompass.stopListening().catch(() => {});
        CapgoCompass.unwatchAccuracy().catch(() => {});
        CapgoCompass.removeAllListeners().catch(() => {});
      }
    };
  }, [animate, startCalibration]);

  // Hesaplar
  const qiblaRot = qiblaAngle !== null ? qiblaAngle - heading : 0;
  const compassRot = -heading;
  const diff = qiblaAngle !== null ? angleDiff(heading, qiblaAngle) : 180;
  const isAligned = Math.abs(diff) < 10;

  const getDir = (deg) => {
    const d = ((deg % 360) + 360) % 360;
    return ['Kuzey','Kuzeydoğu','Doğu','Güneydoğu','Güney','Güneybatı','Batı','Kuzeybatı'][Math.round(d / 45) % 8];
  };

  const accText = () => {
    switch (accuracy) {
      case 3: return { t: 'Yüksek', c: '#10b981' };
      case 2: return { t: 'Orta', c: '#f59e0b' };
      case 1: return { t: 'Düşük', c: '#f97316' };
      case 0: return { t: 'Güvenilmez', c: '#ef4444' };
      default: return { t: '—', c: '#94a3b8' };
    }
  };

  const bg = darkMode ? '#0f172a' : '#f0f4f0';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const tx = darkMode ? '#f1f5f9' : '#1e293b';
  const txs = darkMode ? '#94a3b8' : '#64748b';
  const gr = '#059669';
  const grl = '#10b981';

  // ═══ LOADING ═══
  if (phase === 'loading') return (
    <div style={{ padding: '20px', textAlign: 'center', color: tx, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🕋</div>
      <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Kıble Pusulası</div>
      <div style={{ fontSize: '14px', color: txs }}>Konum alınıyor...</div>
    </div>
  );

  // ═══ ERROR ═══
  if (phase === 'error') return (
    <div style={{ padding: '20px', textAlign: 'center', color: tx, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#ef4444' }}>{errorMsg}</div>
      <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '12px 32px', background: gr, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600' }}>Tekrar Dene</button>
    </div>
  );

  // ═══ KALİBRASYON ═══
  if (phase === 'calibration') return (
    <div style={{ padding: '20px', textAlign: 'center', color: tx, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg }}>
      <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'r8 2s ease-in-out infinite' }}>📱</div>
      <style>{`@keyframes r8 { 0%,100%{transform:rotate(-30deg)} 25%{transform:rotate(30deg) translateY(-10px)} 50%{transform:rotate(-30deg) translateY(10px)} 75%{transform:rotate(30deg)} }`}</style>
      <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: gr }}>Pusula Kalibrasyonu</div>
      <div style={{ fontSize: '14px', color: txs, marginBottom: '24px', maxWidth: '280px', lineHeight: '1.5' }}>
        Telefonunuzu elinize alın ve havada <strong>8</strong> şeklinde birkaç kez çevirin
      </div>
      <div style={{ width: '240px', height: '8px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
        <div style={{ width: `${calibProgress}%`, height: '100%', background: `linear-gradient(90deg, ${gr}, ${grl})`, borderRadius: '4px', transition: 'width 0.1s linear' }} />
      </div>
      <div style={{ fontSize: '14px', color: txs }}>%{calibProgress}</div>
      <button onClick={() => { clearInterval(calibTimerRef.current); setPhase('compass'); }}
        style={{ marginTop: '32px', padding: '10px 24px', background: 'transparent', color: txs, border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`, borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
        Atla →
      </button>
    </div>
  );

  // ═══ PUSULA ═══
  const ac = accText();
  const S = 280, C = S / 2;

  return (
    <div style={{ padding: '16px', maxWidth: '420px', margin: '0 auto', color: tx, minHeight: '100vh', background: bg }}>
      <div style={{ textAlign: 'center', marginBottom: '16px', paddingTop: '4px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: gr, margin: '0 0 2px 0' }}>🕋 Kıble Pusulası</h1>
      </div>

      {/* Hizalama */}
      <div style={{
        textAlign: 'center', marginBottom: '14px', padding: '10px 16px', borderRadius: '12px',
        background: isAligned ? (darkMode ? 'rgba(16,185,129,0.15)' : 'rgba(5,150,105,0.1)') : (darkMode ? 'rgba(148,163,184,0.08)' : 'rgba(100,116,139,0.05)'),
        border: isAligned ? `1.5px solid ${grl}` : '1.5px solid transparent', transition: 'all 0.4s ease'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: isAligned ? grl : txs }}>
          {isAligned ? '✅ Kıble Yönündesiniz!' : `🧭 ${Math.abs(diff).toFixed(0)}° ${diff > 0 ? 'sağa' : 'sola'} dönün`}
        </div>
      </div>

      {/* SVG */}
      <div style={{ position: 'relative', width: S, height: S, margin: '0 auto 20px' }}>
        {isAligned && <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)', animation: 'pg 2s ease-in-out infinite' }} />}
        <style>{`@keyframes pg { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>

        <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S} style={{ position: 'relative', zIndex: 1 }}>
          <defs>
            <radialGradient id="bg2" cx="50%" cy="50%"><stop offset="0%" stopColor={darkMode ? '#1e293b' : '#ffffff'} /><stop offset="90%" stopColor={darkMode ? '#0f172a' : '#f1f5f9'} /></radialGradient>
            <linearGradient id="qg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#047857" /></linearGradient>
            <filter id="gl"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          <circle cx={C} cy={C} r={C - 2} fill="url(#bg2)" stroke={darkMode ? '#334155' : '#cbd5e1'} strokeWidth="2" />

          {/* Dönen disk */}
          <g transform={`rotate(${compassRot} ${C} ${C})`}>
            {Array.from({ length: 72 }, (_, i) => {
              const a = i * 5, major = a % 30 === 0, mid = a % 15 === 0;
              const r1 = major ? C - 28 : mid ? C - 20 : C - 16, r2 = C - 10;
              const rad = (a - 90) * Math.PI / 180;
              return <line key={i} x1={C + r1 * Math.cos(rad)} y1={C + r1 * Math.sin(rad)} x2={C + r2 * Math.cos(rad)} y2={C + r2 * Math.sin(rad)}
                stroke={major ? (darkMode ? '#94a3b8' : '#475569') : (darkMode ? '#334155' : '#d1d5db')} strokeWidth={major ? 2 : mid ? 1.2 : 0.6} />;
            })}
            {[
              { l: 'K', a: 0, c: '#ef4444', s: 17 },
              { l: 'D', a: 90, c: darkMode ? '#94a3b8' : '#64748b', s: 15 },
              { l: 'G', a: 180, c: darkMode ? '#94a3b8' : '#64748b', s: 15 },
              { l: 'B', a: 270, c: darkMode ? '#94a3b8' : '#64748b', s: 15 },
            ].map(({ l, a, c, s }) => {
              const r = C - 44, rad = (a - 90) * Math.PI / 180, x = C + r * Math.cos(rad), y = C + r * Math.sin(rad);
              return <text key={l} x={x} y={y} fill={c} fontSize={s} fontWeight="700" fontFamily="system-ui,sans-serif"
                textAnchor="middle" dominantBaseline="central" transform={`rotate(${-compassRot} ${x} ${y})`}>{l}</text>;
            })}
            <polygon points={`${C},14 ${C - 6},28 ${C + 6},28`} fill="#ef4444" />
          </g>

          {/* Üst referans */}
          <line x1={C} y1={2} x2={C} y2={16} stroke={gr} strokeWidth="3" strokeLinecap="round" />

          {/* Kıble oku */}
          <g transform={`rotate(${qiblaRot} ${C} ${C})`} filter={isAligned ? 'url(#gl)' : ''}>
            <line x1={C} y1={C} x2={C} y2={42} stroke="url(#qg)" strokeWidth="3.5" strokeLinecap="round" />
            <polygon points={`${C},30 ${C - 8},50 ${C},44 ${C + 8},50`} fill="url(#qg)" />
            <circle cx={C} cy={26} r={10} fill={isAligned ? grl : gr} />
            <text x={C} y={27} fill="white" fontSize="12" textAnchor="middle" dominantBaseline="central">🕋</text>
          </g>

          {/* Merkez */}
          <circle cx={C} cy={C} r={7} fill={darkMode ? '#1e293b' : '#fff'} stroke={gr} strokeWidth="2.5" />
          <circle cx={C} cy={C} r={2.5} fill={gr} />
        </svg>
      </div>

      {/* Derece */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '36px', fontWeight: '800', color: gr, fontVariantNumeric: 'tabular-nums' }}>{qiblaAngle?.toFixed(1)}°</div>
        <div style={{ fontSize: '13px', color: txs }}>Kıble Açısı • {getDir(qiblaAngle)}</div>
      </div>

      {/* Kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        {[
          { icon: '🧭', label: 'Pusula', value: `${heading.toFixed(0)}°` },
          { icon: '📐', label: 'Fark', value: `${Math.abs(diff).toFixed(0)}°` },
          { icon: '📡', label: 'Doğruluk', value: ac.t, color: ac.c },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={{ background: cardBg, borderRadius: '10px', padding: '10px', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: txs, marginBottom: '3px' }}>{icon} {label}</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: color || tx, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Düşük doğruluk uyarısı */}
      {(accuracy === 0 || accuracy === 1) && (
        <div style={{ background: darkMode ? '#422006' : '#fffbeb', border: '1px solid #fbbf24', borderRadius: '10px', padding: '12px', marginBottom: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: darkMode ? '#fbbf24' : '#92400e' }}>⚠️ Pusula doğruluğu düşük. Telefonunuzu 8 çizerek çevirin.</div>
        </div>
      )}

      {/* Tekrar kalibre */}
      <button onClick={() => { headingSamples.current = []; startCalibration(); }} style={{
        width: '100%', padding: '12px', background: cardBg, color: tx,
        border: `1px solid ${darkMode ? '#475569' : '#d1d5db'}`, borderRadius: '10px',
        fontSize: '14px', fontWeight: '500', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
      }}>🔄 Tekrar Kalibre Et</button>

      <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: txs }}>
        {useNative ? '📱 Native sensör' : '🌐 Web sensör'} • Yeşil ok → Kıble
      </div>
    </div>
  );
};

export default QiblaFinder;
