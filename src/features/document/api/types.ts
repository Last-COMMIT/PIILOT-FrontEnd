// 문서 타입
export type DocumentType = "REGULATION" | "DB_DICTIONARY";

// Presigned URL 요청
export interface PresignedUrlRequest {
  fileName: string;
  documentType: DocumentType;
  contentType: "application/pdf";
}

// Presigned URL 응답
export interface PresignedUrlResult {
  presignedUrl: string;
  s3Key: string;
  s3Url: string;
  expirationMinutes: number;
}

// 문서 저장 요청
export interface DocumentSaveRequest {
  title: string;
  documentType: DocumentType;
  s3Url: string;
}

// 문서 저장 응답
export interface DocumentSaveResult {
  documentId: number;
  title: string;
  documentType: DocumentType;
  s3Url: string;
  embeddingSuccess: boolean;
  createdAt: string;
}

// 문서 목록 조회 응답
export interface DocumentListItem {
  documentId: number;
  title: string;
  documentType: DocumentType;
  createdAt: string;
}
