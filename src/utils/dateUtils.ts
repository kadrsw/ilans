export function formatDate(timestamp: number | string | null | undefined): string {
  // Handle invalid or missing timestamps
  if (!timestamp) {
    return new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  let numericTimestamp: number;

  // Convert to number if it's a string
  if (typeof timestamp === 'string') {
    numericTimestamp = parseInt(timestamp, 10);
  } else {
    numericTimestamp = timestamp;
  }

  // Validate the timestamp
  if (isNaN(numericTimestamp) || !isFinite(numericTimestamp) || numericTimestamp <= 0) {
    return new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Check for unreasonable dates
  if (numericTimestamp > Date.now() + (365 * 24 * 60 * 60 * 1000)) {
    // More than 1 year in the future
    return new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  if (numericTimestamp < new Date('2020-01-01').getTime()) {
    // Before 2020
    return new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Create date and validate it
  const date = new Date(numericTimestamp);
  if (isNaN(date.getTime())) {
    return new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatDateTime(timestamp: number | string | null | undefined): string {
  // Handle invalid or missing timestamps
  if (!timestamp) {
    return new Date().toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  let numericTimestamp: number;

  // Convert to number if it's a string
  if (typeof timestamp === 'string') {
    numericTimestamp = parseInt(timestamp, 10);
  } else {
    numericTimestamp = timestamp;
  }

  // Validate the timestamp
  if (isNaN(numericTimestamp) || !isFinite(numericTimestamp) || numericTimestamp <= 0) {
    return new Date().toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Check for unreasonable dates
  if (numericTimestamp > Date.now() + (365 * 24 * 60 * 60 * 1000)) {
    // More than 1 year in the future
    return new Date().toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (numericTimestamp < new Date('2020-01-01').getTime()) {
    // Before 2020
    return new Date().toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Create date and validate it
  const date = new Date(numericTimestamp);
  if (isNaN(date.getTime())) {
    return new Date().toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return date.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getTimeAgo(timestamp: number | string | null | undefined): string {
  if (!timestamp) {
    return 'Bilinmiyor';
  }

  let numericTimestamp: number;

  if (typeof timestamp === 'string') {
    numericTimestamp = parseInt(timestamp, 10);
  } else {
    numericTimestamp = timestamp;
  }

  if (isNaN(numericTimestamp) || !isFinite(numericTimestamp) || numericTimestamp <= 0) {
    return 'Bilinmiyor';
  }

  const now = Date.now();
  const diff = now - numericTimestamp;
  
  // Negatif fark kontrolü (gelecek tarih)
  if (diff < 0) {
    return 'Az önce';
  }
  
  // Saniye
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) {
    return 'Az önce';
  }
  
  // Dakika
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} dakika önce`;
  }
  
  // Saat
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} saat önce`;
  }
  
  // Gün
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} gün önce`;
  }
  
  // Hafta
  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} hafta önce`;
  }
  
  // Ay
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} ay önce`;
  }
  
  // Yıl
  const years = Math.floor(days / 365);
  return `${years} yıl önce`;
}

// YENİ FONKSİYON: Bugün mü kontrolü - SADECE createdAt TARİHİNE GÖRE
export function isToday(timestamp: number): boolean {
  if (!timestamp || isNaN(timestamp) || timestamp <= 0) return false;

  // Debug için
  console.log(`isToday kontrol: ${new Date(timestamp).toLocaleString('tr-TR')}`);
  
  const now = new Date();
  const jobDate = new Date(timestamp);
  
  // Bugünün başlangıcı (00:00:00)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  // Bugünün sonu (23:59:59)
  const todayEnd = todayStart + (24 * 60 * 60 * 1000) - 1;
  
  const isToday = timestamp >= todayStart && timestamp <= todayEnd;
  
  // Debug için
  if (isToday) {
    console.log('🔥 BUGÜN paylaşılan ilan:', {
      createdAt: new Date(timestamp).toLocaleString('tr-TR'),
      timestamp: timestamp,
      todayStart: new Date(todayStart).toLocaleString('tr-TR'),
      todayEnd: new Date(todayEnd).toLocaleString('tr-TR')
    });
  }
  
  return isToday;
}

// YENİ FONKSİYON: Dün mü kontrolü - SADECE createdAt TARİHİNE GÖRE
export function isYesterday(timestamp: number): boolean {
  if (!timestamp || isNaN(timestamp) || timestamp <= 0) return false;

  // Debug için
  console.log(`isYesterday kontrol: ${new Date(timestamp).toLocaleString('tr-TR')}`);
  
  const now = new Date();
  const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  
  // Dünün başlangıcı ve sonu
  const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();
  const yesterdayEnd = yesterdayStart + (24 * 60 * 60 * 1000) - 1;
  
  const isYesterday = timestamp >= yesterdayStart && timestamp <= yesterdayEnd;
  
  // Debug için
  if (isYesterday) {
    console.log('🔶 DÜN paylaşılan ilan:', {
      createdAt: new Date(timestamp).toLocaleString('tr-TR'),
      timestamp: timestamp,
      yesterdayStart: new Date(yesterdayStart).toLocaleString('tr-TR'),
      yesterdayEnd: new Date(yesterdayEnd).toLocaleString('tr-TR')
    });
  }
  
  return isYesterday;
}

// YENİ FONKSİYON: Bu hafta mı kontrolü - SADECE createdAt TARİHİNE GÖRE
export function isThisWeek(timestamp: number): boolean {
  if (!timestamp || isNaN(timestamp) || timestamp <= 0) return false;

  // Debug için
  console.log(`isThisWeek kontrol: ${new Date(timestamp).toLocaleString('tr-TR')}`);
  
  const now = new Date();
  const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  // Bir hafta öncesinin başlangıcı (00:00:00)
  const weekAgoStart = new Date(
    weekAgo.getFullYear(), 
    weekAgo.getMonth(), 
    weekAgo.getDate()
  ).getTime();
  
  const isThisWeek = timestamp >= weekAgoStart;
  
  // Debug için
  if (isThisWeek && !isToday(timestamp) && !isYesterday(timestamp)) {
    console.log('🟢 BU HAFTA paylaşılan ilan:', {
      createdAt: new Date(timestamp).toLocaleString('tr-TR'),
      timestamp: timestamp,
      weekAgoStart: new Date(weekAgoStart).toLocaleString('tr-TR'),
      fark: Math.floor((now.getTime() - timestamp) / (24 * 60 * 60 * 1000)) + ' gün önce'
    });
  }
  
  return isThisWeek;
}

// Tarih kontrolü için yardımcı fonksiyon
export function checkJobDates(jobs: any[]): void {
  console.log('📅 İlan tarih kontrolü:');
  
  if (!jobs || jobs.length === 0) {
    console.log('Kontrol edilecek ilan yok');
    return;
  }
  
  // En yeni ve en eski ilanı bul
  const sortedJobs = [...jobs].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const newestJob = sortedJobs[0];
  const oldestJob = sortedJobs[sortedJobs.length - 1];
  
  console.log(`Toplam ${jobs.length} ilan kontrol edildi`);
  console.log('En yeni ilan:', {
    title: newestJob.title,
    createdAt: new Date(newestJob.createdAt).toLocaleString('tr-TR'),
    timestamp: newestJob.createdAt
  });
  
  console.log('En eski ilan:', {
    title: oldestJob.title,
    createdAt: new Date(oldestJob.createdAt).toLocaleString('tr-TR'),
    timestamp: oldestJob.createdAt,
    günFarkı: Math.floor((Date.now() - oldestJob.createdAt) / (24 * 60 * 60 * 1000))
  });
  
  // Bugün paylaşılan ilanları kontrol et
  const todayJobs = jobs.filter(job => isToday(job.createdAt));
  console.log(`Bugün paylaşılan ilan sayısı: ${todayJobs.length}`);
  
  // Dün paylaşılan ilanları kontrol et
  const yesterdayJobs = jobs.filter(job => isYesterday(job.createdAt));
  console.log(`Dün paylaşılan ilan sayısı: ${yesterdayJobs.length}`);
  
  // Bu hafta paylaşılan ilanları kontrol et
  const thisWeekJobs = jobs.filter(job => isThisWeek(job.createdAt));
  console.log(`Bu hafta paylaşılan ilan sayısı: ${thisWeekJobs.length}`);
  
  // Şüpheli tarihli ilanları kontrol et
  const suspiciousJobs = jobs.filter(job => {
    const now = Date.now();
    const jobDate = job.createdAt || 0;
    
    // Gelecek tarihli ilanlar
    if (jobDate > now) {
      console.log(`⚠️ GELECEK TARİHLİ ilan: ${job.title}, tarih: ${new Date(jobDate).toLocaleString('tr-TR')}`);
      return true;
    }
    
    // Çok eski ilanlar (1 yıldan eski)
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
    if (jobDate < oneYearAgo) {
      console.log(`⚠️ ÇOK ESKİ ilan: ${job.title}, tarih: ${new Date(jobDate).toLocaleString('tr-TR')}`);
      return true;
    }
    
    return false;
  });
  
  console.log(`Şüpheli tarihli ilan sayısı: ${suspiciousJobs.length}`);
}