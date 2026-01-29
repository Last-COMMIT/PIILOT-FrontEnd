import { TERMS_OF_SERVICE_TEXT } from "@/content/terms-of-service";

export default function TermsPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="mb-6 text-xl font-bold text-white">
        PIILOT 서비스 이용약관
      </h1>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-light-gray)]">
        {TERMS_OF_SERVICE_TEXT.trim()}
      </div>
    </div>
  );
}
