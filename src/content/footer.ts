/**
 * 푸터 공용 문구 (로그인/회원가입 하단, 사이드바 하단)
 */
export const FOOTER = {
  links: [
    { label: "개인정보 처리방침", href: "/privacy-policy" },
    { label: "이용약관", href: "/terms" },
  ],
  company: {
    representative: "대표자명: (주)피아일럿",
    address: "서울특별시 에이블구 에이블동 에이블로 90 ",
    businessNumber: "사업자등록번호: 123-45-67890",
  },
  contact: "Contact: last_commit03@piilot.ac.kr",
  contactHours: "(상담시간: 09시~18시)",
  copyright: "Copyright@ 2026 PIILOT Corp. All right reserved",
  copyrightLine1: "Copyright@ 2026 PIILOT Corp.",
  copyrightLine2: "All right reserved",
} as const;
