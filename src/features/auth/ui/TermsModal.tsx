"use client";

import { useMemo } from "react";
import { Modal } from "@/shared/ui";
import { TERMS_OF_SERVICE_TEXT } from "@/content/terms-of-service";
import { PRIVACY_POLICY_TEXT } from "@/content/privacy-policy";

export type ModalKind = "terms" | "privacy";

function getModalTitle(kind: ModalKind): string {
  return kind === "terms" ? "PIILOT 서비스 이용약관" : "개인정보 처리방침";
}

function getModalBody(kind: ModalKind): string {
  return kind === "terms" ? TERMS_OF_SERVICE_TEXT : PRIVACY_POLICY_TEXT;
}

export function TermsModal({
  kind,
  onClose,
}: {
  kind: ModalKind | null;
  onClose: () => void;
}) {
  const title = useMemo(() => (kind ? getModalTitle(kind) : ""), [kind]);
  const body = useMemo(() => (kind ? getModalBody(kind) : ""), [kind]);

  return (
    <Modal open={kind != null} onClose={onClose} title={title} size="wide">
      <div className="whitespace-pre-wrap text-sm text-[var(--color-text-light-gray)] leading-relaxed">
        {body}
      </div>
    </Modal>
  );
}
