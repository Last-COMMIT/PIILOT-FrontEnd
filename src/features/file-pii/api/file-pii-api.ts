import { API_BASE_URL, getApiErrorMessage } from "@/shared/lib/api";
import { fetchWithAuth } from "@/features/auth/model/api-client";
import type {
  FilePiiConnection,
  FilePiiFilesResult,
  GetFilePiiFilesParams,
  ApiResponse,
} from "./types";

const BASE = `${API_BASE_URL}/api/file-pii`;

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

/** 9-1. 파일 PII 커넥션 목록 조회 (필터용) */
export async function getFilePiiConnections(): Promise<
  ApiResponse<FilePiiConnection[]>
> {
  try {
    const res = await fetchWithAuth(`${BASE}/connections`);
    const raw = await res.text().catch(() => "");
    const data = parseJsonResponse<FilePiiConnection[]>(raw || null);
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
    return toErrorResponse<FilePiiConnection[]>(e);
  }
}

/** 9-2. 파일 PII 목록·통계 조회 */
export async function getFilePiiFiles(
  params?: GetFilePiiFilesParams,
): Promise<ApiResponse<FilePiiFilesResult>> {
  try {
    const search = new URLSearchParams();
    if (params?.connectionId != null)
      search.set("connectionId", String(params.connectionId));
    if (params?.category != null) search.set("category", params.category);
    if (params?.masked != null) search.set("masked", String(params.masked));
    if (params?.riskLevel != null) search.set("riskLevel", params.riskLevel);
    if (params?.keyword != null) search.set("keyword", params.keyword);
    if (params?.page != null) search.set("page", String(params.page));
    if (params?.size != null) search.set("size", String(params.size));
    const qs = search.toString();
    const url = qs ? `${BASE}/files?${qs}` : `${BASE}/files`;
    const res = await fetchWithAuth(url);
    const raw = await res.text().catch(() => "");
    const data = parseJsonResponse<FilePiiFilesResult>(raw || null);
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
    return toErrorResponse<FilePiiFilesResult>(e);
  }
}
