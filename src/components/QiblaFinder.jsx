import React, { useState, useEffect, useRef } from 'react';

const QiblaFinder = ({ darkMode }) => {
  const [location, setLocation] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  
  // Yumuşatma için
  const headingHistory = useRef([]);
  const lastUpdate = useRef(Date.now());

  // Kabe'nin koordinatları
  const KAABA = { lat: 21.4225, lng: 39.8262 };

  // Derece cinsinden açıyı hesapla
  const calculateQiblaDirection = (userLat, userLng) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;

    const lat1 = toRad(userLat);
    const lat2 = toRad(KAABA.lat);
    const dLng = toRad(KAABA.lng - userLng);

    const y = Math.sin(dLng);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng);
    
    let bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360;
  };

  // Konum al
  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Tarayıcınız konum servisini desteklemiyor.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        const direction = calculateQiblaDirection(latitude, longitude);
        setQiblaDirection(direction);
        setLoading(false);
        setPermissionStatus('granted');
      },
      (err) => {
        setError('Konum alınamadı. Lütfen konum iznini kontrol edin.');
        setLoading(false);
        setPermissionStatus('denied');
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Yumuşatılmış ortalama hesapla
  const smoothHeading = (newHeading) => {
    headingHistory.current.push(newHeading);
    
    // Son 5 değeri tut
    if (headingHistory.current.length > 5) {
      headingHistory.current.shift();
    }
    
    // Ortalama al
    const sum = headingHistory.current.reduce((a, b) => a + b, 0);
    return sum / headingHistory.current.length;
  };

  // Pusula yönünü dinle
  useEffect(() => {
    const handleOrientation = (event) => {
      // Throttle: 100ms'de bir güncelle
      const now = Date.now();
      if (now - lastUpdate.current < 100) return;
      lastUpdate.current = now;

      let heading = event.alpha || 0;
      
      // iOS için webkitCompassHeading kullan
      if (event.webkitCompassHeading !== undefined) {
        heading = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android için alpha'yı kullan (ters çevir)
        heading = 360 - event.alpha;
      }
      
      // Yumuşatılmış değeri kullan
      const smoothed = smoothHeading(heading);
      setDeviceHeading(smoothed);
    };

    // iOS için izin iste
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Kıble okunu hesapla
  const calculateArrowRotation = () => {
    if (qiblaDirection === null) return 0;
    return qiblaDirection - deviceHeading;
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto',
      color: darkMode ? '#fff' : '#000',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: darkMode ? '#10b981' : '#059669',
    },
    subtitle: {
      fontSize: '16px',
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
    compassContainer: {
      position: 'relative',
      width: '300px',
      height: '300px',
      margin: '30px auto',
      backgroundColor: darkMode ? '#1f2937' : '#f3f4f6',
      borderRadius: '50%',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    compass: {
      width: '280px',
      height: '280px',
      borderRadius: '50%',
      border: `4px solid ${darkMode ? '#374151' : '#d1d5db'}`,
      position: 'relative',
      backgroundColor: darkMode ? '#111827' : '#ffffff',
    },
    compassCenter: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '20px',
      height: '20px',
      backgroundColor: '#059669',
      borderRadius: '50%',
      zIndex: 10,
    },
    arrow: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '0',
      height: '0',
      borderLeft: '20px solid transparent',
      borderRight: '20px solid transparent',
      borderBottom: '120px solid #10b981',
      transformOrigin: '50% 100%',
      transform: `translate(-50%, -100%) rotate(${calculateArrowRotation()}deg)`,
      transition: 'transform 0.5s ease-out',
      zIndex: 5,
    },
    cardinalPoints: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      fontSize: '18px',
      fontWeight: 'bold',
      color: darkMode ? '#9ca3af' : '#4b5563',
    },
    north: {
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      color: '#ef4444',
    },
    east: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    south: {
      position: 'absolute',
      bottom: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    west: {
      position: 'absolute',
      left: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    infoCard: {
      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
      padding: '20px',
      borderRadius: '12px',
      marginTop: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    },
    infoLabel: {
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
    infoValue: {
      fontWeight: 'bold',
      color: darkMode ? '#10b981' : '#059669',
    },
    button: {
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      padding: '15px 30px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      width: '100%',
      marginTop: '20px',
      transition: 'background-color 0.3s',
    },
    error: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      padding: '15px',
      borderRadius: '8px',
      marginTop: '20px',
      textAlign: 'center',
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '18px',
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🧭 Kıble Yönü</h1>
        <p style={styles.subtitle}>Namaz kılarken yönünüzü Kabe'ye çevirin</p>
      </div>

      {!location && !loading && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '20px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
            Kıble yönünü bulmak için konumunuza erişmemiz gerekiyor.
          </p>
          <button 
            style={styles.button}
            onClick={getLocation}
            onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
          >
            📍 Konumu Al ve Kıble Yönünü Bul
          </button>
        </div>
      )}

      {loading && (
        <div style={styles.loading}>
          <div>🔄 Konum alınıyor...</div>
        </div>
      )}

      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      {location && qiblaDirection !== null && (
        <>
          <div style={styles.compassContainer}>
            <div style={styles.compass}>
              <div style={styles.cardinalPoints}>
                <div style={styles.north}>K</div>
                <div style={styles.east}>D</div>
                <div style={styles.south}>G</div>
                <div style={styles.west}>B</div>
              </div>
              <div style={styles.arrow}></div>
              <div style={styles.compassCenter}></div>
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Kıble Açısı:</span>
              <span style={styles.infoValue}>{qiblaDirection.toFixed(1)}°</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Enlem:</span>
              <span style={styles.infoValue}>{location.lat.toFixed(4)}°</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Boylam:</span>
              <span style={styles.infoValue}>{location.lng.toFixed(4)}°</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Mevcut Yön:</span>
              <span style={styles.infoValue}>{deviceHeading.toFixed(0)}°</span>
            </div>
          </div>

          <button 
            style={styles.button}
            onClick={getLocation}
            onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
          >
            🔄 Konumu Yenile
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
            💡 Yeşil ok Kıble yönünü gösterir. Cihazınızı çevirerek oku takip edin.
          </div>
        </>
      )}
    </div>
  );
};

export default QiblaFinder;