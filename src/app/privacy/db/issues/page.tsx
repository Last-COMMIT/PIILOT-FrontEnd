import { Suspense } from "react";
import DbPrivacyIssuesPage from "@/views/db-privacy-issues";

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <DbPrivacyIssuesPage />
    </Suspense>
  );
}
