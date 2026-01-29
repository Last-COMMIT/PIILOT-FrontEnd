"use client";

import { useMemo } from "react";
import { Modal } from "@/shared/ui";

export type ModalKind = "terms" | "privacy";

function getModalTitle(kind: ModalKind): string {
  return kind === "terms" ? "PIILOT 서비스 이용약관" : "개인정보 처리방침";
}

function getModalBody(kind: ModalKind): string {
  if (kind === "terms") {
    return `제 1 조 (목적)
본 약관은 PIILOT 서비스 이용에 관한 조건 및 절차, 회원과 회사의 권리/의무를 규정합니다.

제 2 조 (정의)
- “서비스”란 회사가 제공하는 개인정보 보호/탐지 관련 기능 일체를 의미합니다.
- “회원”이란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.

제 3 조 (이용계약의 성립)
회원가입 시 본 약관에 동의함으로써 이용계약이 성립합니다.

제 4 조 (기타)
세부 조항은 추후 정책에 따라 변경될 수 있습니다.

(임시 약관 텍스트입니다. 실제 문구로 교체 예정)`;
  }

  return `개인정보 처리방침(요약)
1. 수집 항목: 이름, 이메일, 비밀번호 등 서비스 제공에 필요한 최소 정보
2. 이용 목적: 회원 식별, 서비스 제공, 보안/운영 관리
3. 보관 기간: 회원 탈퇴 시 또는 법령에서 정한 기간
4. 권리: 열람/정정/삭제 요청 가능

(임시 처리방침 텍스트입니다. 실제 문구로 교체 예정)`;
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
