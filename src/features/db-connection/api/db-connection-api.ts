import { API_BASE_URL, getApiErrorMessage } from "@/shared/lib/api";
import { fetchWithAuth } from "@/features/auth/model/api-client";
import type {
  CreateDbConnectionRequest,
  UpdateDbConnectionRequest,
  DbConnectionItem,
  DbConnectionDetailItem,
  DbConnectionListResponse,
  DbConnectionStatsResponse,
  ApiResponse,
} from "./types";

const BASE = `${API_BASE_URL}/api/db-connections`;

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

/** DB 연결 생성 */
export async function createDbConnection(
  body: CreateDbConnectionRequest,
): Promise<ApiResponse<DbConnectionItem>> {
  try {
    const res = await fetchWithAuth(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<DbConnectionItem>;
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
    return toErrorResponse<DbConnectionItem>(e);
  }
}

/** DB 연결 수정 */
export async function updateDbConnection(
  connectionId: number,
  body: UpdateDbConnectionRequest,
): Promise<ApiResponse<DbConnectionItem>> {
  try {
    const res = await fetchWithAuth(`${BASE}/${connectionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<DbConnectionItem>;
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
    return toErrorResponse<DbConnectionItem>(e);
  }
}

/** DB 연결 삭제 */
export async function deleteDbConnection(
  connectionId: number,
): Promise<ApiResponse<null>> {
  try {
    const res = await fetchWithAuth(`${BASE}/${connectionId}`, {
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

/** DB 연결 상세 조회 */
export async function getDbConnectionDetail(
  connectionId: number,
): Promise<ApiResponse<DbConnectionDetailItem>> {
  try {
    const res = await fetchWithAuth(`${BASE}/${connectionId}`);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<DbConnectionDetailItem>;
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
    return toErrorResponse<DbConnectionDetailItem>(e);
  }
}

/** DB 연결 목록 조회 */
export async function getDbConnectionList(params?: {
  page?: number;
  size?: number;
}): Promise<ApiResponse<DbConnectionListResponse>> {
  try {
    const search = new URLSearchParams();
    if (params?.page != null) search.set("page", String(params.page));
    if (params?.size != null) search.set("size", String(params.size));
    const qs = search.toString();
    const url = qs ? `${BASE}?${qs}` : BASE;
    const res = await fetchWithAuth(url);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<DbConnectionListResponse>;
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
    return toErrorResponse<DbConnectionListResponse>(e);
  }
}

/** DB 연결 통계 조회 */
export async function getDbConnectionStats(): Promise<
  ApiResponse<DbConnectionStatsResponse>
> {
  try {
    const res = await fetchWithAuth(`${BASE}/stats`);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<DbConnectionStatsResponse>;
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
    return toErrorResponse<DbConnectionStatsResponse>(e);
  }
}
