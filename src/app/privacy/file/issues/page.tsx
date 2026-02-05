import { Suspense } from "react";
import FilePrivacyIssuesPage from "@/views/file-privacy-issues";

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <FilePrivacyIssuesPage />
    </Suspense>
  );
}
