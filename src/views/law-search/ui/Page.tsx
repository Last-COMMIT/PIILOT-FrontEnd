"use client";

import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button, Input, LoadingIndicator } from "@/shared/ui";
import DocumentModal from "./DocumentModal";
import { postLawSearch } from "@/features/law-search";
import type { LawSearchResult, LawSearchReference } from "@/features/law-search";

export default function LawSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<LawSearchResult | null>(null);
  const [queryUsed, setQueryUsed] = useState("");
  const [selectedReference, setSelectedReference] =
    useState<LawSearchReference | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      alert("검색어를 입력해주세요.");
      return;
    }
    if (trimmed.length > 500) {
      alert("검색어는 500자를 초과할 수 없습니다.");
      return;
    }

    if (isSearching) return;
    setIsSearching(true);
    setError(null);
    setSelectedReference(null);
    try {
      const res = await postLawSearch(trimmed);
      if (res.success && res.result) {
        setSearchResult(res.result);
        setQueryUsed(trimmed);
      } else {
        setSearchResult(null);
        setError(res.message || "검색에 실패했습니다.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDocumentClick = (ref: LawSearchReference) => {
    setSelectedReference(ref);
  };

  const handleCloseModal = () => {
    setSelectedReference(null);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSearchResult(null);
    setQueryUsed("");
    setSelectedReference(null);
    setError(null);
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
            onKeyDown={handleKeyDown}
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
          {isSearching ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <LoadingIndicator message="검색 중..." size="lg" />
            </div>
          ) : error && !searchResult ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-[var(--color-coral-text)] text-sm">{error}</p>
            </div>
          ) : !searchResult ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-[var(--color-text-light-gray)] text-sm">
                검색 기록이 없습니다.
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:auto] p-6">
              <div className="mb-6">
                <h2 className="text-base font-semibold text-white">
                  {queryUsed}
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

                {/* 참고 문서 */}
                {searchResult.references?.length > 0 && (
                  <div className="pt-4 border-t border-[var(--color-content-border)]">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-white">
                        참고 문서 ({searchResult.totalReferences ?? searchResult.references.length}건)
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {searchResult.references.map((ref, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDocumentClick(ref)}
                          className="group text-left p-4 rounded-lg border-2 border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] hover:border-[var(--color-main-bg)] hover:bg-[var(--color-main-bg)]/10 transition-all cursor-pointer"
                        >
                          <p className="text-sm font-medium text-white mb-1 group-hover:text-[var(--color-main-text)] transition-colors">
                            {ref.lawName}
                          </p>
                          {ref.article && (
                            <p className="text-xs text-[var(--color-mint-text)] mb-1">
                              {ref.article}
                              {ref.page ? ` (p.${ref.page})` : ""}
                            </p>
                          )}
                          <p className="text-xs text-[var(--color-text-light-gray)] line-clamp-2">
                            {ref.content}
                          </p>
                          {typeof ref.similarity === "number" && (
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                              유사도 {(ref.similarity * 100).toFixed(0)}%
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 문서 모달 */}
      {selectedReference && (
        <DocumentModal
          open={!!selectedReference}
          onClose={handleCloseModal}
          reference={selectedReference}
        />
      )}
    </div>
  );
}
