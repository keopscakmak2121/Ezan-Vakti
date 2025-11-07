import { Geolocation } from '@capacitor/geolocation';

export async function requestLocation() {
  try {
    const permission = await Geolocation.requestPermissions();
    if (permission.location === 'granted') {
      const position = await Geolocation.getCurrentPosition();
      return {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };
    } else {
      console.log("Konum izni verilmedi");
      return null;
    }
  } catch (error) {
    console.error("Konum alınamadı:", error);
    return null;
  }
}
