"use client";

import { Modal } from "@/shared/ui";

interface ReferenceDocument {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
  qrCodeUrl?: string;
  lawInfo?: {
    effectiveDate: string;
    lawNumber: string;
    amendmentDate: string;
  };
  content: string;
}

interface DocumentModalProps {
  open: boolean;
  onClose: () => void;
  document: ReferenceDocument;
}

export default function DocumentModal({
  open,
  onClose,
  document,
}: DocumentModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={document.title}
      size="wide"
      className="max-w-6xl !max-h-[98vh] [&>div:nth-child(2)]:!p-0"
    >
      <div className="bg-white rounded-b-lg min-h-[600px] shadow-lg overflow-y-auto h-full">
        <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans leading-relaxed p-6">
          {document.content}
        </pre>
      </div>
    </Modal>
  );
}
