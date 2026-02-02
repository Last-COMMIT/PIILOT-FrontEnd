import { API_BASE_URL, getApiErrorMessage } from "@/shared/lib/api";
import { fetchWithAuth } from "@/features/auth/model/api-client";
import type {
  DbPiiConnection,
  DbPiiTable,
  DbPiiColumnsResult,
  GetDbPiiColumnsParams,
  DbPiiIssuesResult,
  DbPiiIssueDetail,
  DbPiiIssueStatusRequest,
  DbPiiIssueStatusResult,
  ApiResponse,
} from "./types";

const BASE = `${API_BASE_URL}/api/db-pii`;

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

/** 5-1. DB PII 커넥션 목록 조회 (필터용) */
export async function getDbPiiConnections(): Promise<
  ApiResponse<DbPiiConnection[]>
> {
  try {
    const res = await fetchWithAuth(`${BASE}/connections`);
    const raw = await res.text().catch(() => "");
    const data = parseJsonResponse<DbPiiConnection[]>(raw || null);
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
    const raw = await res.text().catch(() => "");
    const data = parseJsonResponse<DbPiiTable[]>(raw || null);
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
    const raw = await res.text().catch(() => "");
    const data = parseJsonResponse<DbPiiColumnsResult>(raw || null);
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

/** 6-1. DB PII 이슈 목록·통계 조회 (백엔드 미구현 시 plain text "No static resource ..." 반환 가능) */
export async function getDbPiiIssues(params?: {
  page?: number;
  size?: number;
}): Promise<ApiResponse<DbPiiIssuesResult>> {
  try {
    const search = new URLSearchParams();
    if (params?.page != null) search.set("page", String(params.page));
    if (params?.size != null) search.set("size", String(params.size));
    const qs = search.toString();
    const url = qs ? `${BASE}/issues?${qs}` : `${BASE}/issues`;
    const res = await fetchWithAuth(url);
    const rawText = await res.text();
    const data = parseJsonResponse<DbPiiIssuesResult>(rawText || null);
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
    return toErrorResponse<DbPiiIssuesResult>(e);
  }
}

/** 6-2. DB PII 이슈 상세 조회 */
export async function getDbPiiIssueDetail(
  issueId: number,
): Promise<ApiResponse<DbPiiIssueDetail>> {
  try {
    const res = await fetchWithAuth(`${BASE}/issues/${issueId}`);
    const raw = await res.text().catch(() => "");
    const data = parseJsonResponse<DbPiiIssueDetail>(raw || null);
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
    return toErrorResponse<DbPiiIssueDetail>(e);
  }
}

/** 6-3. DB PII 이슈 작업 상태 변경 */
export async function patchDbPiiIssueStatus(
  issueId: number,
  body: DbPiiIssueStatusRequest,
): Promise<ApiResponse<DbPiiIssueStatusResult>> {
  try {
    const res = await fetchWithAuth(`${BASE}/issues/${issueId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const raw = await res.text().catch(() => "");
    const data = parseJsonResponse<DbPiiIssueStatusResult>(raw || null);
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
    return toErrorResponse<DbPiiIssueStatusResult>(e);
  }
}
