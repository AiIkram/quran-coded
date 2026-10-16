
export interface AyahVoice {
  id: string;
  label: string;
  subfolder: string; // EveryAyah data subfolder
}

export const AYAH_VOICES: AyahVoice[] = [
  { id: "yassin", label: "ياسين الجزائري — ورش", subfolder: "warsh/warsh_yassin_al_jazaery_64kbps" },
  { id: "dosary", label: "إبراهيم الدوسري — ورش", subfolder: "warsh/warsh_ibrahim_aldosary_128kbps" },
  { id: "basit", label: "عبد الباسط عبد الصمد — ورش", subfolder: "warsh/warsh_Abdul_Basit_128kbps" },
];

export function ayahFileName(surah: number, ayah: number): string {
  return `${String(surah).padStart(3, "0")}${String(ayah).padStart(3, "0")}.mp3`;
}

export function ayahAudioUrl(subfolder: string, surah: number, ayah: number): string {
  return `https://everyayah.com/data/${subfolder}/${ayahFileName(surah, ayah)}`;
}

export interface UnifiedReciter {
  id: string;
  arabicName: string;
  country: string;
  style: string;
  azraq: boolean;
  featured?: boolean;
  server: string;
  total: number;
  ayahVoices: string[];
}

export const RECITERS: UnifiedReciter[] = [
  {
    id: "yassen",
    arabicName: "القارئ ياسين الجزائري",
    country: "الجزائر",
    style: "مرتل — المصحف المغربي",
    azraq: true,
    featured: true,
    server: "https://cdn.mp3quran.net/audio/yassen-jazairi/r1/",
    total: 114,
    ayahVoices: ["yassin", "dosary", "basit"],
  },
  {
    id: "dosari",
    arabicName: "إبراهيم الدوسري — ورش",
    country: "الخليج",
    style: "مرتل",
    azraq: false,
    featured: true,
    server: "https://cdn.mp3quran.net/audio/ibrahim-dosari/r1/",
    total: 114,
    ayahVoices: ["dosary", "yassin", "basit"],
  },
  {
    id: "abdelsamad",
    arabicName: "عبد الباسط عبد الصمد — ورش",
    country: "مصر",
    style: "مرتل — الصوت الذهبي",
    azraq: false,
    featured: true,
    server: "https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r2/",
    total: 114,
    ayahVoices: ["basit", "yassin", "dosary"],
  },
  {
    id: "husary",
    arabicName: "محمود خليل الحصري — ورش",
    country: "مصر",
    style: "مرتل — مدرسة الإتقان",
    azraq: false,
    server: "https://cdn.mp3quran.net/audio/mahmoud-husary/r3/",
    total: 114,
    ayahVoices: ["dosary", "yassin", "basit"],
  },
  {
    id: "iraoui",
    arabicName: "محمد الأيراوي — طريق الأزرق",
    country: "المغرب",
    style: "مرتل — طريق الأزرق",
    azraq: true,
    featured: true,
    server: "https://cdn.mp3quran.net/audio/muhammad-iraoui/r1/",
    total: 111,
    ayahVoices: ["yassin", "dosary", "basit"],
  },
  {
    id: "deeban",
    arabicName: "أحمد ديبان — طريق الأزرق",
    country: "اليمن",
    style: "مرتل — طريق الأزرق",
    azraq: true,
    server: "https://cdn.mp3quran.net/audio/ahmad-deeban/r7/",
    total: 114,
    ayahVoices: ["dosary", "yassin", "basit"],
  },
  {
    id: "kouchi",
    arabicName: "العيون الكوشي — ورش",
    country: "المغرب",
    style: "مرتل — صوت مغاربي",
    azraq: false,
    server: "https://cdn.mp3quran.net/audio/laayoun-kouchi/r1/",
    total: 114,
    ayahVoices: ["yassin", "dosary", "basit"],
  },
  {
    id: "kazabri",
    arabicName: "عمر القزابري — ورش",
    country: "المغرب",
    style: "مرتل",
    azraq: false,
    server: "https://cdn.mp3quran.net/audio/omar-kazabri/r1/",
    total: 114,
    ayahVoices: ["yassin", "dosary", "basit"],
  },
];

export function getReciter(id: string): UnifiedReciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS[0];
}

export function surahAudioUrl(reciter: UnifiedReciter, surah: number): string {
  return `${reciter.server}${String(surah).padStart(3, "0")}.mp3`;
}

export function voiceById(id: string): AyahVoice {
  return AYAH_VOICES.find((v) => v.id === id) ?? AYAH_VOICES[0];
}
