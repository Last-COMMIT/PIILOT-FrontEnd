import { API_BASE_URL, getApiErrorMessage } from "@/shared/lib/api";
import { fetchWithAuth } from "@/features/auth/model/api-client";
import type {
  CreateFileConnectionRequest,
  UpdateFileConnectionRequest,
  FileConnectionItem,
  FileConnectionDetailItem,
  FileConnectionListResponse,
  FileConnectionStatsResponse,
  ApiResponse,
} from "./types";

const BASE = `${API_BASE_URL}/api/file-connections`;

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

/** 요청 body 숫자 필드 정규화 (백엔드 Argument Validation 방지) */
function normalizeCreateBody(
  body: CreateFileConnectionRequest,
): Record<string, unknown> {
  return {
    serverTypeId: Number(body.serverTypeId),
    connectionName: String(body.connectionName ?? ""),
    host: String(body.host ?? ""),
    port: Number(body.port) || 0,
    defaultPath: String(body.defaultPath ?? ""),
    username: String(body.username ?? ""),
    password: String(body.password ?? ""),
    managerName: String(body.managerName ?? ""),
    managerEmail: String(body.managerEmail ?? ""),
    retentionPeriodMonths: Math.max(
      1,
      Math.floor(Number(body.retentionPeriodMonths) || 1),
    ),
  };
}

function normalizeUpdateBody(
  body: UpdateFileConnectionRequest,
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    serverTypeId: Number(body.serverTypeId),
    connectionName: String(body.connectionName ?? ""),
    host: String(body.host ?? ""),
    port: Number(body.port) || 0,
    defaultPath: String(body.defaultPath ?? ""),
    username: String(body.username ?? ""),
    managerName: String(body.managerName ?? ""),
    managerEmail: String(body.managerEmail ?? ""),
    retentionPeriodMonths: Math.max(
      1,
      Math.floor(Number(body.retentionPeriodMonths) || 1),
    ),
  };
  base.password = body.password !== undefined ? String(body.password) : "";
  return base;
}

/** 파일 서버 연결 생성 */
export async function createFileConnection(
  body: CreateFileConnectionRequest,
): Promise<ApiResponse<FileConnectionItem>> {
  try {
    const payload = normalizeCreateBody(body);
    const res = await fetchWithAuth(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<FileConnectionItem>;
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
    return toErrorResponse<FileConnectionItem>(e);
  }
}

/** 파일 서버 연결 수정 */
export async function updateFileConnection(
  connectionId: number,
  body: UpdateFileConnectionRequest,
): Promise<ApiResponse<FileConnectionItem>> {
  try {
    const payload = normalizeUpdateBody(body);
    const res = await fetchWithAuth(`${BASE}/${connectionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<FileConnectionItem>;
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
    return toErrorResponse<FileConnectionItem>(e);
  }
}

/** 파일 서버 연결 삭제 */
export async function deleteFileConnection(
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

/** 파일 서버 연결 상세 조회 */
export async function getFileConnectionDetail(
  connectionId: number,
): Promise<ApiResponse<FileConnectionDetailItem>> {
  try {
    const res = await fetchWithAuth(`${BASE}/${connectionId}`);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<FileConnectionDetailItem>;
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
    return toErrorResponse<FileConnectionDetailItem>(e);
  }
}

/** 파일 서버 연결 목록 조회 */
export async function getFileConnectionList(params?: {
  page?: number;
  size?: number;
}): Promise<ApiResponse<FileConnectionListResponse>> {
  try {
    const search = new URLSearchParams();
    if (params?.page != null) search.set("page", String(params.page));
    if (params?.size != null) search.set("size", String(params.size));
    const qs = search.toString();
    const url = qs ? `${BASE}?${qs}` : BASE;
    const res = await fetchWithAuth(url);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<FileConnectionListResponse>;
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
    return toErrorResponse<FileConnectionListResponse>(e);
  }
}

/** 파일 서버 연결 통계 조회 */
export async function getFileConnectionStats(): Promise<
  ApiResponse<FileConnectionStatsResponse>
> {
  try {
    const res = await fetchWithAuth(`${BASE}/stats`);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<FileConnectionStatsResponse>;
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
    return toErrorResponse<FileConnectionStatsResponse>(e);
  }
}
