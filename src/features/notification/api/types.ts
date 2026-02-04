/** 알림 유형 */
export type NotificationType =
  | "FILE_ISSUE_DETECTED"
  | "DB_ISSUE_DETECTED"
  | "FILE_SCAN_COMPLETED"
  | "DB_SCAN_COMPLETED"
  | "MASKING_COMPLETED";

/** 엔티티 타입 */
export type EntityType =
  | "DB_PII_ISSUE"
  | "FILE_PII_ISSUE"
  | "DB_SCAN_HISTORY"
  | "FILE_SCAN_HISTORY"
  | "MASKING_LOG";

/** 단일 알림 항목 */
export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  entityType: EntityType | null;
  entityId: number | null;
  isRead: boolean;
  issuedAt: string;
  readAt: string | null;
}

/** 알림 목록 응답 (Slice 페이지네이션) */
export interface NotificationListResponse {
  content: NotificationItem[];
  pageable: { pageNumber: number; pageSize: number };
  first: boolean;
  last: boolean;
  hasNext: boolean;
  numberOfElements: number;
}

/** 읽지 않은 개수 통계 */
export interface NotificationStatsResponse {
  unreadCount: number;
}

/** API 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  result: T | null;
  timestamp: string;
}
