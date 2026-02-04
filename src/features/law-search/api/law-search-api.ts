import { API_BASE_URL, getApiErrorMessage } from "@/shared/lib/api";
import { fetchWithAuth } from "@/features/auth/model/api-client";
import type { LawSearchResult, ApiResponse } from "./types";

const BASE = `${API_BASE_URL}/api/law-search`;

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

const QUERY_MAX_LENGTH = 500;

/** 11-1. 법령/내규 검색 */
export async function postLawSearch(
  query: string,
): Promise<ApiResponse<LawSearchResult>> {
  try {
    const trimmed = query?.trim() ?? "";
    if (!trimmed) {
      return {
        ...EMPTY_API_RESPONSE,
        message: "검색어는 필수입니다.",
      };
    }
    if (trimmed.length > QUERY_MAX_LENGTH) {
      return {
        ...EMPTY_API_RESPONSE,
        message: "검색어는 500자를 초과할 수 없습니다.",
      };
    }

    const res = await fetchWithAuth(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: trimmed }),
    });
    const raw = await res.text().catch(() => "");
    const data = parseJsonResponse<LawSearchResult>(raw || null);
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
    return toErrorResponse<LawSearchResult>(e);
  }
}
