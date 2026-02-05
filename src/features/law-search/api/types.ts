// --- 11. 법령/내규 검색 API ---

/** 참고 문서 한 건 */
export interface LawSearchReference {
  documentTitle: string;
  lawName: string;
  content: string;
  article: string;
  page: string;
  similarity: number;
}

/** 검색 결과 */
export interface LawSearchResult {
  answer: string;
  references: LawSearchReference[];
  totalReferences: number;
  /** 백엔드 추가 데이터 (예: S3 URL 등) */
  law_data?: unknown;
}

/** API 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  result: T | null;
  timestamp: string;
}
