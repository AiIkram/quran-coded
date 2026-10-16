export function toArabicDigits(n: number | string): string {
  const map: Record<string, string> = {
    "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
    "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩",
  };
  return String(n).replace(/[0-9]/g, (d) => map[d]);
}

export function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "٠:٠٠";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${toArabicDigits(m)}:${toArabicDigits(String(s).padStart(2, "0"))}`;
}
