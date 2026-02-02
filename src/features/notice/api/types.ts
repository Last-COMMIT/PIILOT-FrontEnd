/** 목록 한 건 (API 응답) */
export interface NoticeListItem {
  id: number;
  title: string;
  authorName: string;
  createdAt: string;
}

/** 상세 조회 응답 */
export interface NoticeDetailItem {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

/** 목록 조회 응답 (Slice 페이지네이션) */
export interface NoticeListResponse {
  content: NoticeListItem[];
  pageable: { pageNumber: number; pageSize: number };
  first: boolean;
  last: boolean;
  hasNext: boolean;
  numberOfElements: number;
}

/** 생성 요청 */
export interface CreateNoticeRequest {
  title: string;
  content: string;
}

/** 생성 응답 */
export interface NoticeCreateResult {
  id: number;
  title: string;
  authorName: string;
  createdAt: string;
}

/** API 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  result: T | null;
  timestamp: string;
}
