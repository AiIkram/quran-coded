export interface WarshAyah {
  chapter: number;
  verse: number;
  text: string;
  globalNumber?: number;
}

let warshCache: WarshAyah[] | null = null;
let warshFetchPromise: Promise<WarshAyah[]> | null = null;

export async function getWarshText(): Promise<WarshAyah[]> {
  if (warshCache) return warshCache;
  if (warshFetchPromise) return warshFetchPromise;
  warshFetchPromise = (async () => {
    const urls = [
      "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranwarsh.min.json",
      "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranwarsh.json",
    ];
    for (const u of urls) {
      try {
        const r = await fetch(u, { next: { revalidate: 86400 } });
        if (!r.ok) continue;
        const j = await r.json();
        const arr = (j.quran ?? j) as WarshAyah[];
        if (Array.isArray(arr) && arr.length > 6000) {
          warshCache = arr;
          return arr;
        }
      } catch {
        continue;
      }
    }
    throw new Error("warsh-text-unavailable");
  })();
  return warshFetchPromise;
}

export async function getSurahWarsh(surah: number): Promise<WarshAyah[]> {
  const all = await getWarshText();
  return all.filter((a) => a.chapter === surah).sort((x, y) => x.verse - y.verse);
}

const ayahOffsets: number[] = [
  0, 7, 293, 493, 669, 789, 954, 1160, 1235, 1364, 1473, 1596, 1707, 1750, 1802, 1901, 2029, 2140, 2250, 2348,
  2483, 2595, 2673, 2791, 2855, 2932, 3159, 3252, 3340, 3409, 3469, 3503, 3533, 3606, 3660, 3705, 3788, 3970, 4058, 4133,
  4218, 4272, 4325, 4414, 4473, 4510, 4545, 4583, 4612, 4630, 4675, 4735, 4784, 4846, 4901, 4979, 5075, 5104, 5128, 5141,
  5155, 5169, 5180, 5198, 5210, 5222, 5252, 5304, 5356, 5400, 5428, 5456, 5476, 5532, 5572, 5603, 5653, 5693, 5739, 5781,
  5810, 5829, 5865, 5890, 5912, 5929, 5948, 5974, 6004, 6024, 6039, 6054, 6065, 6073, 6081, 6100, 6105, 6113, 6121, 6132,
  6143, 6151, 6154, 6163, 6168, 6172, 6179, 6182, 6188, 6191, 6196, 6200, 6206,
];

export function globalAyahNumber(surah: number, ayah: number): number {
  const base = ayahOffsets[surah - 1] ?? 0;
  return base + ayah;
}

export function toArabicDigits(n: number | string): string {
  const map: Record<string, string> = {
    "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
    "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩",
  };
  return String(n).replace(/[0-9]/g, (d) => map[d]);
}
