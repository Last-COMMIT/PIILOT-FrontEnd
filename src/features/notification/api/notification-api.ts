import { API_BASE_URL, getApiErrorMessage } from "@/shared/lib/api";
import { fetchWithAuth } from "@/features/auth/model/api-client";
import type {
  NotificationListResponse,
  NotificationItem,
  NotificationStatsResponse,
  ApiResponse,
} from "./types";

const BASE = `${API_BASE_URL}/api/notifications`;

function errorMessage(
  data: { message?: string } | null,
  status: number,
): string {
  return data?.message ?? `요청 실패 (${status})`;
}

function toErrorResponse<T>(error: unknown): ApiResponse<T> {
  return {
    success: false,
    code: "",
    message: getApiErrorMessage(error),
    result: null,
    timestamp: "",
  };
}

/** 응답 정규화: 빈 바디(204) 등에서 최소 필드 보장 */
function normalizeApiResponse<T>(
  data: Partial<ApiResponse<T>>,
  defaultResult: T | null = null,
): ApiResponse<T> {
  return {
    success: data.success ?? true,
    code: data.code ?? "COMMON200",
    message: data.message ?? "요청이 성공했습니다.",
    result: data.result !== undefined ? data.result : defaultResult,
    timestamp: data.timestamp ?? new Date().toISOString(),
  };
}

/** 알림 목록 조회 (페이지네이션) */
export async function getNotificationList(params?: {
  page?: number;
  size?: number;
}): Promise<ApiResponse<NotificationListResponse>> {
  try {
    const search = new URLSearchParams();
    if (params?.page != null) search.set("page", String(params.page));
    if (params?.size != null) search.set("size", String(params.size));
    const qs = search.toString();
    const url = qs ? `${BASE}?${qs}` : BASE;
    const res = await fetchWithAuth(url);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<NotificationListResponse>;
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: errorMessage(data, res.status),
        result: null,
      };
    }
    return normalizeApiResponse(data, null);
  } catch (e) {
    return toErrorResponse<NotificationListResponse>(e);
  }
}

/** 최근 읽지 않은 알림 조회 (헤더 드롭다운용) */
export async function getRecentUnreadNotifications(): Promise<
  ApiResponse<NotificationItem[]>
> {
  try {
    const res = await fetchWithAuth(`${BASE}/recent-unread`);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<NotificationItem[]>;
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: errorMessage(data, res.status),
        result: null,
      };
    }
    return normalizeApiResponse(data, []);
  } catch (e) {
    return toErrorResponse<NotificationItem[]>(e);
  }
}

/** 읽지 않은 알림 개수 조회 */
export async function getUnreadCount(): Promise<
  ApiResponse<NotificationStatsResponse>
> {
  try {
    const res = await fetchWithAuth(`${BASE}/unread-count`);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<NotificationStatsResponse>;
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: errorMessage(data, res.status),
        result: null,
      };
    }
    return normalizeApiResponse(data, { unreadCount: 0 });
  } catch (e) {
    return toErrorResponse<NotificationStatsResponse>(e);
  }
}

/** 알림 읽음 처리 */
export async function markNotificationAsRead(
  notificationId: number,
): Promise<ApiResponse<NotificationItem>> {
  try {
    const res = await fetchWithAuth(`${BASE}/${notificationId}/read`, {
      method: "PATCH",
    });
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<NotificationItem>;
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: errorMessage(data, res.status),
        result: null,
      };
    }
    return normalizeApiResponse(data, null);
  } catch (e) {
    return toErrorResponse<NotificationItem>(e);
  }
}
