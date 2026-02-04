import { API_BASE_URL, getApiErrorMessage } from "@/shared/lib/api";
import { fetchWithAuth } from "@/features/auth/model/api-client";
import type { ApiResponse } from "@/shared/api/types";
import type {
  PresignedUrlRequest,
  PresignedUrlResult,
  DocumentSaveRequest,
  DocumentSaveResult,
  DocumentListItem,
} from "./types";

const BASE = `${API_BASE_URL}/api/documents`;

function toErrorResponse<T>(error: unknown): ApiResponse<T> {
  return {
    success: false,
    code: "",
    message: getApiErrorMessage(error),
    result: null,
    timestamp: "",
  };
}

/**
 * 1. Presigned URL 발급 요청
 */
export async function getPresignedUrl(
  request: PresignedUrlRequest
): Promise<ApiResponse<PresignedUrlResult>> {
  try {
    const res = await fetchWithAuth(`${BASE}/presigned-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const data = (await res.json().catch(() => ({}))) as ApiResponse<PresignedUrlResult>;
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: data?.message ?? `요청 실패 (${res.status})`,
        result: null,
      };
    }
    return data;
  } catch (e) {
    return toErrorResponse<PresignedUrlResult>(e);
  }
}

/**
 * 2. S3에 파일 직접 업로드 (인증 불필요)
 */
export async function uploadToS3(
  presignedUrl: string,
  file: File
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/pdf",
      },
      body: file,
    });
    if (!res.ok) {
      // 403이면 URL 만료
      if (res.status === 403) {
        return { success: false, message: "업로드 URL이 만료되었습니다. 다시 시도해주세요." };
      }
      return { success: false, message: `S3 업로드 실패 (${res.status})` };
    }
    return { success: true, message: "" };
  } catch (e) {
    return { success: false, message: getApiErrorMessage(e) };
  }
}

/**
 * 3. 문서 저장 요청 (DB 저장 + AI 임베딩)
 */
export async function saveDocument(
  request: DocumentSaveRequest
): Promise<ApiResponse<DocumentSaveResult>> {
  try {
    const res = await fetchWithAuth(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const data = (await res.json().catch(() => ({}))) as ApiResponse<DocumentSaveResult>;
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: data?.message ?? `요청 실패 (${res.status})`,
        result: null,
      };
    }
    return data;
  } catch (e) {
    return toErrorResponse<DocumentSaveResult>(e);
  }
}

/**
 * 문서 목록 조회
 */
export async function getDocuments(): Promise<ApiResponse<DocumentListItem[]>> {
  try {
    const res = await fetchWithAuth(BASE, {
      method: "GET",
    });
    const data = (await res.json().catch(() => ({}))) as ApiResponse<DocumentListItem[]>;
    if (!res.ok) {
      return {
        ...data,
        success: false,
        message: data?.message ?? `요청 실패 (${res.status})`,
        result: null,
      };
    }
    return data;
  } catch (e) {
    return toErrorResponse<DocumentListItem[]>(e);
  }
}

/**
 * 전체 업로드 흐름 (1→2→3 순차 실행)
 */
export async function uploadDocument(
  file: File,
  title: string,
  documentType: "REGULATION" | "DB_DICTIONARY",
  onProgress?: (step: "presigned" | "s3" | "save", status: "loading" | "done" | "error") => void
): Promise<{ success: boolean; message: string; result?: DocumentSaveResult }> {
  // Step 1: Presigned URL 발급
  onProgress?.("presigned", "loading");
  const presignedRes = await getPresignedUrl({
    fileName: file.name,
    documentType,
    contentType: "application/pdf",
  });

  if (!presignedRes.success || !presignedRes.result) {
    onProgress?.("presigned", "error");
    return { success: false, message: presignedRes.message || "Presigned URL 발급 실패" };
  }
  onProgress?.("presigned", "done");

  const { presignedUrl, s3Url } = presignedRes.result;

  // Step 2: S3 업로드
  onProgress?.("s3", "loading");
  const s3Res = await uploadToS3(presignedUrl, file);

  if (!s3Res.success) {
    onProgress?.("s3", "error");
    return { success: false, message: s3Res.message };
  }
  onProgress?.("s3", "done");

  // Step 3: 문서 저장
  onProgress?.("save", "loading");
  const saveRes = await saveDocument({
    title,
    documentType,
    s3Url,
  });

  if (!saveRes.success || !saveRes.result) {
    onProgress?.("save", "error");
    return { success: false, message: saveRes.message || "문서 저장 실패" };
  }
  onProgress?.("save", "done");

  return {
    success: true,
    message: saveRes.result.embeddingSuccess
      ? "문서가 성공적으로 업로드되었습니다."
      : "문서가 저장되었습니다. (AI 임베딩은 나중에 처리됩니다)",
    result: saveRes.result,
  };
}
