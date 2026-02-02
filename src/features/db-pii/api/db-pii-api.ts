import { API_BASE_URL, getApiErrorMessage } from "@/shared/lib/api";
import { fetchWithAuth } from "@/features/auth/model/api-client";
import type {
  DbPiiConnection,
  DbPiiTable,
  DbPiiColumnsResult,
  GetDbPiiColumnsParams,
  ApiResponse,
} from "./types";

const BASE = `${API_BASE_URL}/api/db-pii`;

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

/** 5-1. DB PII 커넥션 목록 조회 (필터용) */
export async function getDbPiiConnections(): Promise<
  ApiResponse<DbPiiConnection[]>
> {
  try {
    const res = await fetchWithAuth(`${BASE}/connections`);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<DbPiiConnection[]>;
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
    return toErrorResponse<DbPiiConnection[]>(e);
  }
}

/** 5-2. DB PII 테이블 목록 조회 */
export async function getDbPiiTables(
  connectionId: number,
): Promise<ApiResponse<DbPiiTable[]>> {
  try {
    const res = await fetchWithAuth(
      `${BASE}/connections/${connectionId}/tables`,
    );
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<DbPiiTable[]>;
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
    return toErrorResponse<DbPiiTable[]>(e);
  }
}

/** 5-3. DB PII 컬럼 목록·통계 조회 */
export async function getDbPiiColumns(
  params?: GetDbPiiColumnsParams,
): Promise<ApiResponse<DbPiiColumnsResult>> {
  try {
    const search = new URLSearchParams();
    if (params?.connectionId != null)
      search.set("connectionId", String(params.connectionId));
    if (params?.tableId != null) search.set("tableId", String(params.tableId));
    if (params?.piiType != null) search.set("piiType", params.piiType);
    if (params?.encrypted != null)
      search.set("encrypted", String(params.encrypted));
    if (params?.riskLevel != null) search.set("riskLevel", params.riskLevel);
    if (params?.keyword != null) search.set("keyword", params.keyword);
    if (params?.page != null) search.set("page", String(params.page));
    if (params?.size != null) search.set("size", String(params.size));
    const qs = search.toString();
    const url = qs ? `${BASE}/columns?${qs}` : `${BASE}/columns`;
    const res = await fetchWithAuth(url);
    const data = (await res
      .json()
      .catch(() => ({}))) as ApiResponse<DbPiiColumnsResult>;
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
    return toErrorResponse<DbPiiColumnsResult>(e);
  }
}
