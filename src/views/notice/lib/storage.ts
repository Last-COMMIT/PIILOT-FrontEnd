export type NoticeItem = Record<string, unknown> & {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string; // YYYY.MM.DD
  attachmentName?: string;
};

export type NoticeCreateInput = {
  title: string;
  content: string;
  author: string;
  createdAt: string; // YYYY.MM.DD
  attachmentName?: string;
};

const STORAGE_KEY = "piilot_notice_items_v1";

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getSeedData(): NoticeItem[] {
  return [
    {
      id: "15",
      title: "[공지] PIILOT 시스템 정식 오픈 안내 및 초기 사용자 가이드 배포",
      author: "플랫폼운영팀",
      createdAt: "2024.12.09",
      attachmentName: "PIILOT_사용자_매뉴얼.pdf",
      content: `안녕하십니까, PIILOT 시스템 관리자입니다.

약 3개월간의 베타 테스트를 성공적으로 마치고, 사내 개인정보 보호·보안 관리 플랫폼 ‘PIILOT’을 정식 오픈합니다.

본 시스템은 DB 및 파일서버 내 개인정보를 자동으로 탐지하고, 암호화·마스킹 적용 여부를 진단하여 보안 위험을 체계적으로 관리하기 위해 도입되었습니다.

1. 시스템 오픈 개요
일시: 2024년 12월 11일(수) 오전 09:00
접속: 내부망 접속
대상: 데이터분석팀, 보안팀 및 개인정보 취급 업무 담당자

2. 주요 기능
- 암호화/마스킹 진단: 파일 저장 여부 분석 및 미조치 항목 이슈 등록
- 위험도 기반 이슈 관리: 개인정보 유형 가중치 기반 위험도 산정 및 조치 추적
- 법령/내규 검색: 자연어 질의로 관련 규정/문서 검색

3. 이용 가이드
원활한 사용을 위해 첨부된 PIILOT 사용자 매뉴얼(PDF)을 반드시 확인해 주시기 바랍니다.

4. 문의처
오류 신고 및 권한 문의: piilot_admin@company.com
사내 메신저: 'PIILOT 운영지원팀' 채널

임직원 여러분의 많은 관심과 활용 부탁드립니다. 감사합니다.`,
    },
    {
      id: "14",
      title: "[공지] 개인정보보호법/GDPR 규제 업데이트 반영 안내",
      author: "보안운영팀",
      createdAt: "2024.12.09",
      content:
        "개인정보보호법 및 GDPR 관련 규제 업데이트 사항을 반영했습니다. 관련 기준 및 점검 항목은 내부 가이드를 참고해 주세요.",
    },
    {
      id: "13",
      title: "[공지] 개인정보 보안 오탐 신고 및 예외 처리 절차",
      author: "플랫폼운영팀",
      createdAt: "2024.12.09",
      content:
        "오탐 신고 및 예외 처리 절차가 업데이트되었습니다. 이슈 상세 화면의 신고 메뉴를 통해 접수해 주세요.",
    },
    {
      id: "12",
      title: "[긴급] 미암호화 개인정보 대량 탐지 대응 안내",
      author: "개인정보보호책임자",
      createdAt: "2024.12.09",
      content:
        "대량 탐지 발생 시 즉시 보안운영팀에 연락 후, 해당 파일/DB 접근 권한을 점검해 주세요.",
    },
  ];
}

export function getNotices(): NoticeItem[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? safeJsonParse<NoticeItem[]>(stored) : null;
  // parsed가 null이거나 빈 배열이면 seed data 사용
  const items = parsed && parsed.length > 0 ? parsed : getSeedData();
  // id가 number로 들어온 경우를 대비해 문자열로 정규화
  const normalized = items.map((n) => ({
    ...n,
    id: String((n as Record<string, unknown>).id ?? ""),
  })) as NoticeItem[];
  // 최신순(번호 큰 것 우선)으로 정렬
  return [...normalized].sort((a, b) => Number(b.id) - Number(a.id));
}

export function saveNotices(items: NoticeItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getNoticeById(id: string): NoticeItem | null {
  if (typeof window === "undefined") return null;
  const items = getNotices();
  const target = String(id);
  return items.find((n) => String(n.id) === target) ?? null;
}

export function createNotice(input: NoticeCreateInput): NoticeItem {
  const items = getNotices();
  const nextId = String(
    Math.max(
      0,
      ...items.map((n) => Number(n.id)).filter((x) => Number.isFinite(x)),
    ) + 1,
  );
  const created: NoticeItem = {
    id: nextId,
    title: input.title,
    content: input.content,
    author: input.author,
    createdAt: input.createdAt,
    ...(input.attachmentName ? { attachmentName: input.attachmentName } : {}),
  };
  saveNotices([created, ...items]);
  return created;
}

export function deleteNotice(id: string) {
  const items = getNotices();
  const target = String(id);
  saveNotices(items.filter((n) => String(n.id) !== target));
}
