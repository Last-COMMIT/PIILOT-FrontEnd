import { API_BASE_URL, getApiErrorMessage } from "@/shared/lib/api";
import { fetchWithAuth } from "@/features/auth/model/api-client";
import type {
  FileMaskingConnectionsResponse,
  FileMaskingFilesResponse,
  FilePreviewApiResponse,
  FileMaskingApiResponse,
  SaveMaskingApiResponse,
  SaveMaskingRequest,
} from "./types";

const BASE = `${API_BASE_URL}/api/file-masking`;

function errorMessage(
  data: { message?: string } | null,
  status: number,
): string {
  return data?.message ?? `요청 실패 (${status})`;
}

function toErrorResponse<T>(error: unknown): T {
  return {
    success: false,
    code: "",
    message: getApiErrorMessage(error),
    result: null,
    timestamp: "",
  } as T;
}

/** 파일 마스킹 커넥션 목록 조회 */
export async function getFileMaskingConnections(): Promise<FileMaskingConnectionsResponse> {
  try {
    const res = await fetchWithAuth(`${BASE}/connections`);
    const data = (await res
      .json()
      .catch(() => ({}))) as FileMaskingConnectionsResponse;
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
    return toErrorResponse<FileMaskingConnectionsResponse>(e);
  }
}

/** 파일 마스킹 파일 목록 조회 */
export async function getFileMaskingFiles(params?: {
  connectionId?: number;
  fileCategory?: string;
  riskLevel?: string;
  fileName?: string;
}): Promise<FileMaskingFilesResponse> {
  try {
    const search = new URLSearchParams();
    if (params?.connectionId != null)
      search.set("connectionId", String(params.connectionId));
    if (params?.fileCategory) search.set("fileCategory", params.fileCategory);
    if (params?.riskLevel) search.set("riskLevel", params.riskLevel);
    if (params?.fileName) search.set("fileName", params.fileName);
    const qs = search.toString();
    const url = qs ? `${BASE}/files?${qs}` : `${BASE}/files`;
    const res = await fetchWithAuth(url);
    const data = (await res
      .json()
      .catch(() => ({}))) as FileMaskingFilesResponse;
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
    return toErrorResponse<FileMaskingFilesResponse>(e);
  }
}

/** 파일 미리보기 조회 */
export async function getFilePreview(
  fileId: number,
): Promise<FilePreviewApiResponse> {
  try {
    const res = await fetchWithAuth(`${BASE}/files/${fileId}/preview`);
    const data = (await res
      .json()
      .catch(() => ({}))) as FilePreviewApiResponse;
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
    return toErrorResponse<FilePreviewApiResponse>(e);
  }
}

/** 파일 마스킹 변환 */
export async function maskFile(
  fileId: number,
): Promise<FileMaskingApiResponse> {
  try {
    const res = await fetchWithAuth(`${BASE}/files/${fileId}/mask`, {
      method: "POST",
    });
    const data = (await res
      .json()
      .catch(() => ({}))) as FileMaskingApiResponse;
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
    return toErrorResponse<FileMaskingApiResponse>(e);
  }
}

/** 마스킹 결과 저장 */
export async function saveMaskingResult(
  fileId: number,
  body: SaveMaskingRequest,
): Promise<SaveMaskingApiResponse> {
  try {
    const res = await fetchWithAuth(`${BASE}/files/${fileId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        encryptionPassword: String(body.encryptionPassword ?? ""),
      }),
    });
    const data = (await res
      .json()
      .catch(() => ({}))) as SaveMaskingApiResponse;
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
    return toErrorResponse<SaveMaskingApiResponse>(e);
  }
}
