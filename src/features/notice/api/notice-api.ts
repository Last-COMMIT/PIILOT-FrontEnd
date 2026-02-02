import { API_BASE_URL, getApiErrorMessage } from "@/shared/lib/api";
import { fetchWithAuth } from "@/features/auth/model/api-client";
import type {
  NoticeListResponse,
  NoticeDetailItem,
  NoticeCreateResult,
  CreateNoticeRequest,
  ApiResponse,
} from "./types";

const BASE = `${API_BASE_URL}/api/notices`;
const ADMIN_BASE = `${API_BASE_URL}/api/admin/notices`;

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

/** 공지사항 목록 조회 */
export async function getNoticeList(params?: {
  page?: number;
  size?: number;
}): Promise<ApiResponse<NoticeListResponse>> {
  try {
    const search = new URLSearchParams();
    if (params?.page != null) search.set("page", String(params.page));
    if (params?.size != null) search.set("size", String(params.size));
    const qs = search.toString();
    const url = qs ? `${BASE}?${qs}` : BASE;
    const res = await fetchWithAuth(url);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<NoticeListResponse>;
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: errorMessage(data, res.status),
        result: null,
      };
    }
    return data;
  } catch (e) {
    return toErrorResponse<NoticeListResponse>(e);
  }
}

/** 공지사항 상세 조회 */
export async function getNoticeDetail(
  noticeId: number,
): Promise<ApiResponse<NoticeDetailItem>> {
  try {
    const res = await fetchWithAuth(`${BASE}/${noticeId}`);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<NoticeDetailItem>;
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: errorMessage(data, res.status),
        result: null,
      };
    }
    return data;
  } catch (e) {
    return toErrorResponse<NoticeDetailItem>(e);
  }
}

/** 공지사항 생성 (관리자) */
export async function createNotice(
  body: CreateNoticeRequest,
): Promise<ApiResponse<NoticeCreateResult>> {
  try {
    const res = await fetchWithAuth(ADMIN_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(body.title ?? ""),
        content: String(body.content ?? ""),
      }),
    });
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<NoticeCreateResult>;
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: errorMessage(data, res.status),
        result: null,
      };
    }
    return data;
  } catch (e) {
    return toErrorResponse<NoticeCreateResult>(e);
  }
}

/** 공지사항 삭제 (관리자) */
export async function deleteNotice(
  noticeId: number,
): Promise<ApiResponse<null>> {
  try {
    const res = await fetchWithAuth(`${ADMIN_BASE}/${noticeId}`, {
      method: "DELETE",
    });
    const data = (await res.json().catch(() => ({}))) as ApiResponse<null>;
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: errorMessage(data, res.status),
        result: null,
      };
    }
    return data;
  } catch (e) {
    return toErrorResponse<null>(e);
  }
}
