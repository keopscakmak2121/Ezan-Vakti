// src/components/home/prayerImages.js

// Her vakit için birden fazla resim seçeneği sunar.
const prayerImageSets = {
  imsak: ['/images/imsak1.jpg', '/images/imsak2.jpg'],
  gunes: ['/images/gunes1.jpg', '/images/gunes2.jpg'],
  ogle: ['/images/ogle1.jpg', '/images/ogle2.jpg'],
  ikindi: ['/images/ikindi1.jpg', '/images/ikindi2.jpg'],
  aksam: ['/images/aksam1.jpg', '/images/aksam2.jpg'],
  yatsi: ['/images/yatsi1.jpg', '/images/yatsi2.jpg'],
};

// Görünen namaz adlarını `prayerImageSets` içindeki anahtarlara eşler.
const nameToKeyMap = {
  'İmsak': 'imsak',
  'Güneş': 'gunes',
  'Öğle': 'ogle',
  'İkindi': 'ikindi',
  'Akşam': 'aksam',
  'Yatsı': 'yatsi',
};

// Mevcut tarihe göre her bir vakit için tutarlı bir resim seçer.
const getImageForPrayer = (prayerName, date = new Date()) => {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  const key = nameToKeyMap[prayerName];
  const imageSet = key ? prayerImageSets[key] : ['/images/default.jpg'];

  const imageIndex = dayOfYear % imageSet.length;
  return imageSet[imageIndex];
};

export default getImageForPrayer;
