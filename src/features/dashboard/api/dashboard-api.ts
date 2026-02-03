import { API_BASE_URL, getApiErrorMessage } from "@/shared/lib/api";
import { fetchWithAuth } from "@/features/auth/model/api-client";
import type {
  DashboardSummary,
  DashboardTrends,
  ApiResponse,
} from "./types";

const BASE = `${API_BASE_URL}/api/dashboard`;

const EMPTY_API_RESPONSE: ApiResponse<never> = {
  success: false,
  code: "",
  message: "응답이 비어있습니다.",
  result: null,
  timestamp: "",
};

function errorMessage(
  data: { message?: string } | null,
  status: number,
): string {
  return data?.message ?? `요청 실패 (${status})`;
}

function toErrorResponse<T>(error: unknown): ApiResponse<T> {
  return {
    ...EMPTY_API_RESPONSE,
    message: getApiErrorMessage(error),
  };
}

function parseJsonResponse<T>(raw: string | null): ApiResponse<T> {
  if (!raw?.trim()) return { ...EMPTY_API_RESPONSE } as ApiResponse<T>;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object"
      ? ({ ...EMPTY_API_RESPONSE, ...parsed } as ApiResponse<T>)
      : ({ ...EMPTY_API_RESPONSE } as ApiResponse<T>);
  } catch {
    return {
      ...EMPTY_API_RESPONSE,
      message: raw || EMPTY_API_RESPONSE.message,
    } as ApiResponse<T>;
  }
}

/** 11-1. 대시보드 요약 조회 */
export async function getDashboardSummary(): Promise<
  ApiResponse<DashboardSummary> & { httpStatus?: number }
> {
  try {
    const res = await fetchWithAuth(`${BASE}/summary`);
    const raw = await res.text().catch(() => "");
    const data = parseJsonResponse<DashboardSummary>(raw || null);
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: errorMessage(data, res.status),
        result: null,
        httpStatus: res.status,
      };
    }
    return { ...data, httpStatus: res.status };
  } catch (e) {
    return { ...toErrorResponse<DashboardSummary>(e), httpStatus: undefined };
  }
}

/** 11-2. 대시보드 추세 조회 */
export async function getDashboardTrends(): Promise<
  ApiResponse<DashboardTrends> & { httpStatus?: number }
> {
  try {
    const res = await fetchWithAuth(`${BASE}/trends`);
    const raw = await res.text().catch(() => "");
    const data = parseJsonResponse<DashboardTrends>(raw || null);
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: errorMessage(data, res.status),
        result: null,
        httpStatus: res.status,
      };
    }
    return { ...data, httpStatus: res.status };
  } catch (e) {
    return { ...toErrorResponse<DashboardTrends>(e), httpStatus: undefined };
  }
}
