/** API detectedAt ISO 문자열 → 탐지 시각 표시 (YYYY-MM-DD HH:mm:ss) */
export function formatDetectedAt(isoString: string): string {
  if (!isoString || typeof isoString !== "string") return "";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  } catch {
    return isoString;
  }
}

/** yearMonth (yyyy-MM) → 월 라벨 (N월) */
export function formatYearMonthToLabel(yearMonth: string): string {
  try {
    const parts = yearMonth.split("-");
    if (parts.length !== 2) return yearMonth;
    const month = parseInt(parts[1], 10);
    if (Number.isNaN(month) || month < 1 || month > 12) return yearMonth;
    return `${month}월`;
  } catch {
    return yearMonth;
  }
}
