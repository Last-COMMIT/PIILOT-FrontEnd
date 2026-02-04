"use client";

import { Modal } from "@/shared/ui";
import type { LawSearchReference } from "@/features/law-search";

interface DocumentModalProps {
  open: boolean;
  onClose: () => void;
  reference: LawSearchReference;
}

/** S3 PDF URL + page 파라미터로 해당 페이지로 이동 (#page=N) */
function buildPdfUrl(documentTitle: string, page: string): string {
  const url = documentTitle?.trim() ?? "";
  if (!url) return "";
  const pageNum = page?.trim();
  if (!pageNum) return url;
  return `${url}#page=${encodeURIComponent(pageNum)}`;
}

export default function DocumentModal({
  open,
  onClose,
  reference,
}: DocumentModalProps) {
  const pdfUrl = buildPdfUrl(reference.documentTitle, reference.page);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={reference.lawName}
      size="wide"
      className="max-w-6xl !max-h-[98vh] !h-[90vh] [&>div:nth-child(2)]:!p-0"
    >
      <div className="bg-white rounded-b-lg min-h-[85vh] h-full flex flex-col overflow-hidden">
        {pdfUrl ? (
          <iframe
            title={reference.lawName}
            src={pdfUrl}
            className="w-full flex-1 min-h-0 border-0"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-gray-500 text-sm">
            PDF를 불러올 수 없습니다.
          </div>
        )}
      </div>
    </Modal>
  );
}
