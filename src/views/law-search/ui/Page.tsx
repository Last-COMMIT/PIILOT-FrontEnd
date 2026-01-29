"use client";

import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import DocumentModal from "./DocumentModal";

interface SearchResult {
  query: string;
  answer: string;
  sections?: Array<{
    title: string;
    items: string[];
  }>;
}

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

const mockSearchResult: SearchResult = {
  query: "개인정보 동의서 보관 주기",
  answer:
    "개인정보 동의서의 보관 주기는 '개인정보 보호법' 및 '정보주체로부터 동의를 받은 기간'에 따라 달라집니다. 일반적으로는 이용 목적 달성 시 즉시 파기하는 것이 원칙이지만, 다른 법령에 따라 별도 보관 기간이 정해져 있거나 특정 사례(예: 통신 가입자 해지 시 6개월 보관)의 경우 예외가 있을 수 있으므로 해당 기관의 개인정보 처리방침을 확인하는 것이 좋습니다.",
  sections: [
    {
      title: "일반 원칙",
      items: [
        "목적 달성 시 파기: 동의를 받은 목적이 달성되면 즉시 파기하는 것이 원칙입니다.",
        "법령상 근거: 전자상거래법 등 다른 법령에 보관 의무가 있는 경우 해당 법령에서 정한 기간(예: 5년) 동안 보관할 수 있습니다.",
        "정보주체 동의 기간: 정보주체와 별도로 보관·이용 기간에 대한 동의를 받은 경우 해당 기간까지 보관합니다.",
      ],
    },
  ],
};

const mockDocuments: ReferenceDocument[] = [
  {
    id: "1",
    title: "개인정보처리방침_내부규정.pdf",
    description: "개인정보 처리방침 및 내부 규정에 관한 문서입니다.",
    pdfUrl: "/documents/personal-info-policy.pdf",
    lawInfo: {
      effectiveDate: "2024. 3. 15.",
      lawNumber: "법률 제19234호",
      amendmentDate: "2023. 3. 14.",
    },
    content: `[시행 2024. 3. 15.] [법률 제19234호, 2023. 3. 14., 일부개정]

제1장 총칙

제1조(목적) 이 법은 개인정보의 처리 및 보호에 관한 사항을 정함으로써 개인의 자유와 권리를 보호하고, 나아가 개인의 존엄과 가치를 구현함을 목적으로 한다. <개정 2014. 3. 24.>

제2조(정의) 이 법에서 사용하는 용어의 뜻은 다음과 같다. <개정 2014. 3. 24., 2020. 2. 4., 2023. 3. 14.>
1. "개인정보"란 살아 있는 개인에 관한 정보로서 다음 각 목의 어느 하나에 해당하는 정보를 말한다.
   가. 성명, 주민등록번호 및 영상 등을 통하여 개인을 알아볼 수 있는 정보
   나. 해당 정보만으로는 특정 개인을 알아볼 수 없더라도 다른 정보와 쉽게 결합하여 알아볼 수 있는 정보...`,
  },
  {
    id: "2",
    title: "개인정보보호_관리지침.pdf",
    description: "개인정보 보호를 위한 관리 지침입니다.",
    pdfUrl: "/documents/privacy-management-guidelines.pdf",
    content: "개인정보보호 관리지침 내용...",
  },
  {
    id: "3",
    title: "개인정보_수집·이용_보관_파기_기준.pdf",
    description: "개인정보 수집, 이용, 보관, 파기 기준에 관한 문서입니다.",
    pdfUrl: "/documents/personal-info-standards.pdf",
    content: "개인정보 수집·이용·보관·파기 기준 내용...",
  },
  {
    id: "4",
    title: "개인정보 보호법.pdf",
    description: "개인정보 보호법 전체 조문입니다.",
    pdfUrl: "/documents/personal-info-protection-act.pdf",
    lawInfo: {
      effectiveDate: "2024. 3. 15.",
      lawNumber: "법률 제19234호",
      amendmentDate: "2023. 3. 14.",
    },
    content: `[시행 2024. 3. 15.] [법률 제19234호, 2023. 3. 14., 일부개정]

제1장 총칙

제1조(목적) 이 법은 개인정보의 처리 및 보호에 관한 사항을 정함으로써 개인의 자유와 권리를 보호하고, 나아가 개인의 존엄과 가치를 구현함을 목적으로 한다. <개정 2014. 3. 24.>

제2조(정의) 이 법에서 사용하는 용어의 뜻은 다음과 같다. <개정 2014. 3. 24., 2020. 2. 4., 2023. 3. 14.>
1. "개인정보"란 살아 있는 개인에 관한 정보로서 다음 각 목의 어느 하나에 해당하는 정보를 말한다.
   가. 성명, 주민등록번호 및 영상 등을 통하여 개인을 알아볼 수 있는 정보
   나. 해당 정보만으로는 특정 개인을 알아볼 수 없더라도 다른 정보와 쉽게 결합하여 알아볼 수 있는 정보...`,
  },
  {
    id: "5",
    title: "개인정보보호위원회 법령 목록(원문).pdf",
    description: "개인정보보호위원회에서 제공하는 법령 목록입니다.",
    pdfUrl: "/documents/pipc-law-list.pdf",
    content: "개인정보보호위원회 법령 목록 내용...",
  },
];

export default function LawSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<ReferenceDocument | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    setIsSearching(true);
    // TODO: 실제 API 호출
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSearchResult(mockSearchResult);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDocumentClick = (document: ReferenceDocument) => {
    setSelectedDocument(document);
  };

  const handleCloseModal = () => {
    setSelectedDocument(null);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSearchResult(null);
    setSelectedDocument(null);
  };

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6 gap-6">
      {/* 검색 영역 */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[var(--color-text-light-gray)] z-10" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="AI 검색으로 필요한 정보를 빠르게 찾아보세요."
            colorScheme="main"
            className="pl-11 bg-[var(--color-sidebar-bg)] border-2"
          />
        </div>
        <Button
          colorScheme="main"
          appearance="solid"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? "검색 중..." : "검색"}
        </Button>
        <Button
          colorScheme="neutral"
          appearance="outline"
          onClick={handleReset}
          disabled={isSearching}
        >
          <RotateCcw className="size-4" />
          초기화
        </Button>
      </div>

      {/* 검색 결과 영역 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-card-bg)] h-full min-h-0 flex flex-col overflow-hidden">
          {!searchResult ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-[var(--color-text-light-gray)] text-sm">
                검색 기록이 없습니다.
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:auto] p-6">
              <div className="mb-6">
                <h2 className="text-base font-semibold text-white">
                  {searchResult.query}
                </h2>
              </div>

              <div className="space-y-6">
                {/* 검색 결과 */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">
                    검색 결과
                  </h3>
                  <p className="text-sm text-[var(--color-text-light-gray)] leading-relaxed whitespace-pre-line">
                    {searchResult.answer}
                  </p>
                </div>

                {searchResult.sections?.map((section, index) => (
                  <div key={index}>
                    <h4 className="text-sm font-semibold text-white mb-2">
                      {section.title}
                    </h4>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="text-sm text-[var(--color-text-light-gray)] flex items-start gap-2"
                        >
                          <span className="text-[var(--color-main-bg)] shrink-0 mt-1">
                            •
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* 참고 문서 */}
                <div className="pt-4 border-t border-[var(--color-content-border)]">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white">
                      참고 문서
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mockDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleDocumentClick(doc)}
                        className="group text-left p-4 rounded-lg border-2 border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] hover:border-[var(--color-main-bg)] hover:bg-[var(--color-main-bg)]/10 transition-all cursor-pointer"
                      >
                        <p className="text-sm font-medium text-white mb-1 group-hover:text-[var(--color-main-text)] transition-colors">
                          {doc.title}
                        </p>
                        <p className="text-xs text-[var(--color-text-light-gray)] line-clamp-2">
                          {doc.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 문서 모달 */}
      {selectedDocument && (
        <DocumentModal
          open={!!selectedDocument}
          onClose={handleCloseModal}
          document={selectedDocument}
        />
      )}
    </div>
  );
}
