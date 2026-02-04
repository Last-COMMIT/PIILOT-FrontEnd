"use client";

import { Modal } from "@/shared/ui";
import type { LawSearchReference } from "@/features/law-search";

interface DocumentModalProps {
  open: boolean;
  onClose: () => void;
  reference: LawSearchReference;
}

export default function DocumentModal({
  open,
  onClose,
  reference,
}: DocumentModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={reference.documentTitle}
      size="wide"
      className="max-w-6xl !max-h-[98vh] [&>div:nth-child(2)]:!p-0"
    >
      <div className="bg-white rounded-b-lg min-h-[600px] shadow-lg overflow-y-auto h-full">
        <div className="p-6 space-y-4">
          {reference.article && (
            <div>
              <p className="text-xs font-medium text-gray-500">조항</p>
              <p className="text-sm font-semibold text-gray-900">
                {reference.article}
                {reference.page ? ` (p.${reference.page})` : ""}
              </p>
            </div>
          )}
          {typeof reference.similarity === "number" && (
            <p className="text-xs text-gray-500">
              유사도 {(reference.similarity * 100).toFixed(0)}%
            </p>
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">관련 내용</p>
            <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans leading-relaxed">
              {reference.content}
            </pre>
          </div>
        </div>
      </div>
    </Modal>
  );
}
