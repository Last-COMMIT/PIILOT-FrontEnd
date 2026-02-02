/** API lastScannedAt ISO 문자열 → 스캔일시 표시 (YYYY.MM.DD HH:mm) */
export function formatScanDateTime(isoString: string): string {
  if (!isoString || typeof isoString !== "string") return "";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}.${m}.${d} ${h}:${min}`;
  } catch {
    return isoString;
  }
}
