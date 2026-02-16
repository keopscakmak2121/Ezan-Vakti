// src/data/importantDays.js
// İslami önemli gün ve geceler — Hicri takvime göre

export const importantDays = [
  // MUHARREM
  { name: 'Hicri Yılbaşı', hijriMonth: 1, hijriDay: 1, type: 'day', icon: '🌙',
    description: 'Hicri takvimin ilk günü. Hz. Muhammed\'in Mekke\'den Medine\'ye hicretini esas alır.',
    details: 'Muharrem ayının ilk günü, İslam aleminde yeni yılın başlangıcıdır. Hicret, İslam tarihinin dönüm noktalarından biridir.' },
  { name: 'Aşure Günü', hijriMonth: 1, hijriDay: 10, type: 'day', icon: '🤲',
    description: 'Muharrem ayının 10. günü. Birçok önemli olayın gerçekleştiği mübarek gün.',
    details: 'Hz. Nuh\'un gemisinin karaya oturması, Hz. Musa\'nın Kızıldeniz\'i geçmesi gibi olayların yaşandığı kabul edilir. Oruç tutulması sünnettir.' },
  
  // SAFER
  
  // REBİÜLEVVEL
  { name: 'Mevlid Kandili', hijriMonth: 3, hijriDay: 12, type: 'night', icon: '🕌',
    description: 'Hz. Muhammed (s.a.v.)\'in doğum yıl dönümü.',
    details: 'Rebiülevvel ayının 12. gecesi kutlanır. Peygamber Efendimizin dünyayı şereflendirdiği gecedir. Salat ve selam getirilir, Kur\'an okunur.' },
  
  // REBİÜLAHİR
  
  // CEMAZİYELEVVEL
  
  // CEMAZİYELAHİR
  
  // RECEP
  { name: 'Regaip Kandili', hijriMonth: 7, hijriDay: 1, type: 'night', icon: '✨',
    description: 'Recep ayının ilk Cuma gecesi. Üç ayların başlangıcı.',
    details: 'Regaip "rağbet edilen, değer verilen" anlamına gelir. Üç ayların (Recep, Şaban, Ramazan) müjdecisidir. Bu gecede bol ibadet edilmesi tavsiye edilir.' },
  { name: 'Mirac Kandili', hijriMonth: 7, hijriDay: 27, type: 'night', icon: '🌟',
    description: 'Hz. Muhammed\'in göklere yükseldiği mübarek gece.',
    details: 'İsra ve Mirac hadisesinin yaşandığı gecedir. Peygamberimiz Mescid-i Haram\'dan Mescid-i Aksa\'ya, oradan da göklere yükseltilmiştir. Beş vakit namaz bu gecede farz kılınmıştır.' },
  
  // ŞABAN
  { name: 'Berat Kandili', hijriMonth: 8, hijriDay: 15, type: 'night', icon: '📜',
    description: 'Şaban ayının 15. gecesi. Beraat, kurtuluş gecesi.',
    details: 'Bu gecede kulların bir yıllık amelleri değerlendirilir ve gelecek yıla ait takdirat belirlenir. Af ve mağfiret dileme gecesidir. Kur\'an bu gecede Levh-i Mahfuz\'dan dünya semasına indirilmiştir.' },
  
  // RAMAZAN
  { name: 'Ramazan Başlangıcı', hijriMonth: 9, hijriDay: 1, type: 'day', icon: '🌙',
    description: 'Oruç ayının başlangıcı.',
    details: 'Ramazan, Kur\'an\'ın indirilmeye başladığı mübarek aydır. 29 veya 30 gün oruç tutulur. Teravih namazı kılınır, mukabele okunur.' },
  { name: 'Kadir Gecesi', hijriMonth: 9, hijriDay: 27, type: 'night', icon: '💎',
    description: 'Bin aydan hayırlı gece. Kur\'an\'ın indirilmeye başladığı gece.',
    details: '"Kadir gecesi bin aydan hayırlıdır" (Kadr Suresi). Kur\'an-ı Kerim bu gecede indirilmeye başlanmıştır. Ramazan\'ın son on gününde, özellikle 27. gecesinde aranır.' },
  
  // ŞEVVAL
  { name: 'Ramazan Bayramı (1. Gün)', hijriMonth: 10, hijriDay: 1, type: 'day', icon: '🎉',
    description: 'Ramazan bayramının ilk günü.',
    details: 'Ramazan orucunun bitimini müjdeleyen bayram. Üç gün sürer. Bayram namazı kılınır, fitre verilir, akraba ve komşular ziyaret edilir.' },
  { name: 'Ramazan Bayramı (2. Gün)', hijriMonth: 10, hijriDay: 2, type: 'day', icon: '🎉',
    description: 'Ramazan bayramının ikinci günü.' },
  { name: 'Ramazan Bayramı (3. Gün)', hijriMonth: 10, hijriDay: 3, type: 'day', icon: '🎉',
    description: 'Ramazan bayramının üçüncü günü.' },
  
  // ZİLKADE
  
  // ZİLHİCCE
  { name: 'Arefe Günü', hijriMonth: 12, hijriDay: 9, type: 'day', icon: '🤲',
    description: 'Zilhicce ayının 9. günü. Kurban bayramı arefesi.',
    details: 'Arefe günü oruç tutmak müstehaptır. Hacılar Arafat\'ta vakfe yapar. Teşrik tekbirleri bu günün sabah namazından itibaren başlar.' },
  { name: 'Kurban Bayramı (1. Gün)', hijriMonth: 12, hijriDay: 10, type: 'day', icon: '🐑',
    description: 'Kurban bayramının ilk günü.',
    details: 'Dört gün süren bayramın ilk günü. Bayram namazı kılınır ve kurban kesilir. Hz. İbrahim\'in oğlu İsmail\'i kurban etme hadisesinin anısına kutlanır.' },
  { name: 'Kurban Bayramı (2. Gün)', hijriMonth: 12, hijriDay: 11, type: 'day', icon: '🐑',
    description: 'Kurban bayramının ikinci günü. Kurban kesilebilir.' },
  { name: 'Kurban Bayramı (3. Gün)', hijriMonth: 12, hijriDay: 12, type: 'day', icon: '🐑',
    description: 'Kurban bayramının üçüncü günü. Kurban kesilebilir.' },
  { name: 'Kurban Bayramı (4. Gün)', hijriMonth: 12, hijriDay: 13, type: 'day', icon: '🐑',
    description: 'Kurban bayramının dördüncü ve son günü.' },
];

// Hicri ay isimleri
export const hijriMonthNames = [
  '', // 0 index boş
  'Muharrem',
  'Safer',
  'Rebiülevvel',
  'Rebiülahir',
  'Cemaziyelevvel',
  'Cemaziyelahir',
  'Recep',
  'Şaban',
  'Ramazan',
  'Şevval',
  'Zilkade',
  'Zilhicce'
];

// Miladi tarihi Hicri tarihe çevir (yaklaşık hesaplama)
export const gregorianToHijri = (date) => {
  const d = new Date(date);
  const jd = Math.floor((d.getTime() / 86400000) + 2440587.5);
  
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  
  return { year, month, day };
};

// Hicri tarihi Miladi tarihe çevir (yaklaşık)
export const hijriToGregorian = (hYear, hMonth, hDay) => {
  const jd = Math.floor((11 * hYear + 3) / 30) + 354 * hYear + 30 * hMonth - Math.floor((hMonth - 1) / 2) + hDay + 1948440 - 385;
  
  const l = jd + 68569;
  const n = Math.floor((4 * l) / 146097);
  const l2 = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l2 + 1)) / 1461001);
  const l3 = l2 - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l3) / 2447);
  const day = l3 - Math.floor((2447 * j) / 80);
  const l4 = Math.floor(j / 11);
  const month = j + 2 - 12 * l4;
  const year = 100 * (n - 49) + i + l4;
  
  return new Date(year, month - 1, day);
};

// Bu yıl ve gelecek yılın önemli günlerini miladi tarihlere çevir
export const getUpcomingImportantDays = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hijriToday = gregorianToHijri(today);
  
  const results = [];
  
  // Bu yıl ve gelecek yıl için hesapla
  for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
    const hYear = hijriToday.year + yearOffset;
    
    for (const day of importantDays) {
      const gregDate = hijriToGregorian(hYear, day.hijriMonth, day.hijriDay);
      gregDate.setHours(0, 0, 0, 0);
      
      const diffTime = gregDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= -1 && diffDays <= 365) {
        results.push({
          ...day,
          gregorianDate: gregDate,
          daysLeft: diffDays,
          hijriYear: hYear,
          hijriDateStr: `${day.hijriDay} ${hijriMonthNames[day.hijriMonth]} ${hYear}`
        });
      }
    }
  }
  
  // Tarihe göre sırala
  results.sort((a, b) => a.gregorianDate - b.gregorianDate);
  
  // Duplicate kaldır (aynı gün farklı yıldan gelebilir)
  const seen = new Set();
  return results.filter(r => {
    const key = `${r.name}-${r.gregorianDate.toISOString().split('T')[0]}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
