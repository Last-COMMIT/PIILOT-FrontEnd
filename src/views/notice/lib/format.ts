/**
 * API ISO 날짜 문자열을 화면 표시용으로 포맷
 * "2026-02-02T10:54:40.740038" → "2026.02.02 10:54"
 * 참고: 타임존 없이 오면 new Date()는 로컬 시간으로 해석합니다.
 * 백엔드가 UTC(Z) 또는 ±HH:MM을 보내는지, KST로 변환해 보내는지 API 계약 확인 후 필요 시 변환/주석 보완.
 */
export function formatNoticeDate(isoString: string): string {
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

/** 목록용 짧은 포맷 (날짜만) "2026.02.02" */
export function formatNoticeDateShort(isoString: string): string {
  if (!isoString || typeof isoString !== "string") return "";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  } catch {
    return isoString;
  }
}
