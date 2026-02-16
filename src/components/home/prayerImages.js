// src/components/home/prayerImages.js

const prayerImageSets = {
  imsak: ['/images/imsak1.jpg'],
  gunes: ['/images/gunes1.jpg'],
  ogle: ['/images/ogle1.jpg'],
  ikindi: ['/images/ikindi1.jpg'],
  aksam: ['/images/aksam1.jpg'],
  yatsi: ['/images/yatsi1.jpg'],
};

const nameToKeyMap = {
  'İmsak': 'imsak',
  'Güneş': 'gunes',
  'Öğle': 'ogle',
  'İkindi': 'ikindi',
  'Akşam': 'aksam',
  'Yatsı': 'yatsi',
};

const getImageForPrayer = (prayerName) => {
  const key = nameToKeyMap[prayerName];
  const imageSet = key ? prayerImageSets[key] : ['/images/default1.jpg'];
  return imageSet[0];
};

export default getImageForPrayer;
