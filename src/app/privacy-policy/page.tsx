import { PRIVACY_POLICY_TEXT } from "@/content/privacy-policy";

export default function PrivacyPolicyPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="mb-6 text-xl font-bold text-white">개인정보 처리방침</h1>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-light-gray)]">
        {PRIVACY_POLICY_TEXT.trim()}
      </div>
    </div>
  );
}
