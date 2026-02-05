"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Database, FileText, TriangleAlert, Columns } from "lucide-react";
import {
  StatCard,
  IssueCard,
  LineChart,
  DoughnutChart,
  LoadingIndicator,
} from "@/shared/ui";
import type {
  LineChartData,
  DoughnutChartData,
  IssueCardRiskLevel,
} from "@/shared/ui";
import { getDashboardSummary, getDashboardTrends } from "@/features/dashboard";
import type {
  DashboardSummary,
  DashboardTrends,
  RecentDbIssue,
  RecentFileIssue,
} from "@/features/dashboard";
import { formatDetectedAt, formatYearMonthToLabel } from "../lib/format";

const CHART_CARD_H = 280;
const LINE_CHART_H = 230;

// 개인정보 유형별 색상 매핑 (도넛 차트용)
const PII_TYPE_COLORS: Record<string, string> = {
  이름: "rgb(59, 130, 246)",
  전화번호: "rgb(249, 115, 22)",
  이메일: "rgb(234, 179, 8)",
  주소: "rgb(74, 222, 128)",
  계좌번호: "rgb(34, 211, 238)",
  주민등록번호: "rgb(236, 72, 153)",
  IP주소: "rgb(167, 139, 250)",
  여권번호: "rgb(239, 68, 68)",
  얼굴: "rgb(180, 83, 9)",
  주민번호: "rgb(236, 72, 153)",
};

const riskLevelToIssueCardRisk: Record<string, IssueCardRiskLevel> = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

function dbIssueToIssueData(issue: RecentDbIssue) {
  return {
    id: String(issue.issueId),
    timestamp: formatDetectedAt(issue.detectedAt),
    title: `${issue.tableName} (${issue.columnName})`,
    subtitle: issue.piiTypes.join(", ") || "개인정보 암호화 필요",
    detectedCount: issue.piiCount,
    riskLevel: riskLevelToIssueCardRisk[issue.riskLevel] ?? "medium",
  };
}

function fileIssueToIssueData(issue: RecentFileIssue) {
  return {
    id: String(issue.issueId),
    timestamp: formatDetectedAt(issue.detectedAt),
    title: `${issue.fileName} (${issue.connectionName})`,
    subtitle: issue.piiTypes.join(", ") || "개인정보 마스킹 필요",
    detectedCount: issue.piiCount,
    riskLevel: riskLevelToIssueCardRisk[issue.riskLevel] ?? "medium",
  };
}

export default function HomePage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiNotReady, setApiNotReady] = useState(false);

  /** 백엔드에 대시보드 API 미구현 시 반환하는 메시지 패턴 */
  const NOT_IMPLEMENTED_PATTERN = /no static resource|api\/dashboard/i;

  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(true);
      setError(null);
      setApiNotReady(false);
      Promise.all([getDashboardSummary(), getDashboardTrends()])
        .then(([summaryRes, trendsRes]) => {
          let hasSummary = false;
          let hasTrends = false;
          let hasError = false;
          let errorMsg = "";
          let summaryNotReady = false;
          let trendsNotReady = false;

          // Summary 처리
          if (summaryRes.success && summaryRes.result) {
            setSummary(summaryRes.result);
            hasSummary = true;
          } else {
            const msg = summaryRes.message ?? "";
            const isNotReady =
              summaryRes.httpStatus === 403 ||
              NOT_IMPLEMENTED_PATTERN.test(msg);
            if (isNotReady) {
              summaryNotReady = true;
            } else {
              hasError = true;
              errorMsg = msg || "대시보드 요약 데이터를 불러오지 못했습니다.";
            }
          }

          // Trends 처리
          if (trendsRes.success && trendsRes.result) {
            setTrends(trendsRes.result);
            hasTrends = true;
          } else {
            const msg = trendsRes.message ?? "";
            const isNotReady =
              trendsRes.httpStatus === 403 || NOT_IMPLEMENTED_PATTERN.test(msg);
            if (isNotReady) {
              trendsNotReady = true;
            } else if (!hasError) {
              hasError = true;
              errorMsg = msg || "대시보드 추세 데이터를 불러오지 못했습니다.";
            }
          }

          if (summaryNotReady && trendsNotReady) {
            setApiNotReady(true);
            return;
          }
          setApiNotReady(false);
          if (!hasSummary && !hasTrends) {
            if (hasError) setError(errorMsg);
            else setApiNotReady(true);
          }
        })
        .catch((e) => {
          setError("대시보드 데이터를 불러오는 중 오류가 발생했습니다.");
          console.error(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const dbServerData: LineChartData = useMemo(() => {
    if (!trends?.dbTrend) {
      return {
        labels: [],
        datasets: [
          {
            label: "DB 서버 암호화",
            data: [],
            borderColor: "rgb(74, 222, 128)",
            backgroundColor: "rgba(74, 222, 128, 0.10)",
            fill: true,
          },
        ],
      };
    }
    return {
      labels: trends.dbTrend.map((t) => formatYearMonthToLabel(t.yearMonth)),
      datasets: [
        {
          label: "DB 서버 암호화",
          data: trends.dbTrend.map((t) => t.issueCount),
          borderColor: "rgb(74, 222, 128)",
          backgroundColor: "rgba(74, 222, 128, 0.10)",
          fill: true,
        },
      ],
    };
  }, [trends]);

  const fileServerData: LineChartData = useMemo(() => {
    if (!trends?.fileTrend) {
      return {
        labels: [],
        datasets: [
          {
            label: "파일 서버 암호화",
            data: [],
            borderColor: "rgb(248, 113, 113)",
            backgroundColor: "rgba(248, 113, 113, 0.10)",
            fill: true,
          },
        ],
      };
    }
    return {
      labels: trends.fileTrend.map((t) => formatYearMonthToLabel(t.yearMonth)),
      datasets: [
        {
          label: "파일 서버 암호화",
          data: trends.fileTrend.map((t) => t.issueCount),
          borderColor: "rgb(248, 113, 113)",
          backgroundColor: "rgba(248, 113, 113, 0.10)",
          fill: true,
        },
      ],
    };
  }, [trends]);

  const piiDistributionForChart = useMemo(
    () => summary?.piiDistribution ?? [],
    [summary]
  );

  const personalInfoData: DoughnutChartData = useMemo(() => {
    if (piiDistributionForChart.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "개인정보 유형별 분포",
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          },
        ],
      };
    }
    const dist = piiDistributionForChart;
    return {
      labels: dist.map((d) => d.piiTypeName),
      datasets: [
        {
          label: "개인정보 유형별 분포",
          data: dist.map((d) => d.count),
          backgroundColor: dist.map(
            (d) => PII_TYPE_COLORS[d.piiTypeName] ?? "rgb(156, 163, 175)"
          ),
          borderColor: dist.map(
            (d) => PII_TYPE_COLORS[d.piiTypeName] ?? "rgb(156, 163, 175)"
          ),
          borderWidth: 1,
        },
      ],
    };
  }, [piiDistributionForChart]);

  const personalInfoLegend = useMemo(
    () =>
      piiDistributionForChart.map((d) => ({
        label: d.piiTypeName,
        color: PII_TYPE_COLORS[d.piiTypeName] ?? "rgb(156, 163, 175)",
      })),
    [piiDistributionForChart]
  );

  const dbServerIssues = useMemo(() => {
    return summary?.recentDbIssues?.map(dbIssueToIssueData) ?? [];
  }, [summary]);

  const fileServerIssues = useMemo(() => {
    return summary?.recentFileIssues?.map(fileIssueToIssueData) ?? [];
  }, [summary]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingIndicator size="lg" aria-label="로딩 중" />
      </div>
    );
  }

  if (apiNotReady) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[var(--color-text-light-gray)]">
          대시보드 API가 준비되면 데이터가 표시됩니다.
        </p>
      </div>
    );
  }

  if (error && !summary && !trends) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[var(--color-text-light-gray)]">{error}</p>
      </div>
    );
  }

  const stats = summary?.stats;

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto p-6 gap-5 flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
        <StatCard
          title="총 서버 연결"
          value={String(stats?.totalConnections ?? 0)}
          detail={`DB: ${stats?.dbConnectionCount ?? 0} | 파일: ${
            stats?.fileConnectionCount ?? 0
          }`}
          trend="up"
          icon={<Database className="size-5" />}
          colorScheme="mint"
        />
        <StatCard
          title="개인정보 포함 컬럼 수"
          value={(stats?.piiColumnCount ?? 0).toLocaleString()}
          detail={`암호화 ${(stats?.columnEncryptionRate ?? 0).toFixed(0)}%`}
          trend="up"
          icon={<Columns className="size-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="개인정보 포함 파일 수"
          value={(stats?.piiFileCount ?? 0).toLocaleString()}
          detail={`암호화 ${(stats?.fileEncryptionRate ?? 0).toFixed(0)}%`}
          trend="up"
          icon={<FileText className="size-5" />}
          colorScheme="green"
        />
        <StatCard
          title="총 이슈 개수"
          value={String(stats?.totalIssueCount ?? 0)}
          detail={`DB: ${stats?.dbIssueCount ?? 0} | 파일: ${
            stats?.fileIssueCount ?? 0
          }`}
          trend="up"
          icon={<TriangleAlert className="size-5" />}
          colorScheme="coral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 shrink-0">
        <div
          className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-card-bg)] p-3 flex flex-col"
          style={{ height: CHART_CARD_H }}
        >
          <h3 className="text-sm font-semibold text-white mb-3 shrink-0">
            DB 서버 이슈 발생 추세
          </h3>
          <div className="flex-1 min-h-0">
            <LineChart data={dbServerData} height={LINE_CHART_H} />
          </div>
        </div>
        <div
          className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-card-bg)] p-3 flex flex-col"
          style={{ height: CHART_CARD_H }}
        >
          <h3 className="text-sm font-semibold text-white mb-3 shrink-0">
            파일 서버 이슈 발생 추세
          </h3>
          <div className="flex-1 min-h-0">
            <LineChart data={fileServerData} height={LINE_CHART_H} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 shrink-0 min-h-[320px] overflow-hidden lg:grid-rows-[1fr] lg:[grid-template-columns:0.85fr_1.075fr_1.075fr] lg:flex-1 lg:min-h-0">
        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-card-bg)] p-3 flex flex-col min-h-[200px] min-w-0 overflow-hidden lg:min-h-0 lg:h-full">
          <h3 className="text-sm font-semibold text-white mb-3 shrink-0">
            개인정보 유형별 분포
          </h3>
          <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-2 overflow-hidden">
            {personalInfoData.labels.length > 0 ? (
              <>
                <div className="flex-1 min-h-[160px] min-w-0 overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full max-h-[200px] max-w-[240px] min-w-0 mx-auto">
                    <DoughnutChart
                      data={personalInfoData}
                      height="100%"
                      showLegend={false}
                      className="w-full h-full min-h-0 min-w-0"
                    />
                  </div>
                </div>
                <div className="w-full grid grid-cols-3 gap-x-3 gap-y-2 text-sm text-[var(--color-text-muted)] shrink-0 overflow-hidden">
                  {personalInfoLegend.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 min-w-0"
                    >
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[var(--color-text-light-gray)] text-sm">
                데이터가 없습니다.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-card-bg)] p-3 flex flex-col min-h-[200px] min-w-0 overflow-hidden lg:min-h-0 lg:h-full">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h3 className="text-sm font-semibold text-white">
              DB 서버 개인정보 이슈
            </h3>
            <button
              className="text-xs text-[var(--color-mint-text)] hover:underline cursor-pointer"
              onClick={() => router.push("/privacy/db/issues")}
            >
              전체보기
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-[0.575rem]">
            {dbServerIssues.length > 0 ? (
              dbServerIssues.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  className="cursor-pointer text-left"
                  onClick={() =>
                    router.push(`/privacy/db/issues?issueId=${issue.id}`)
                  }
                >
                  <IssueCard
                    timestamp={issue.timestamp}
                    title={issue.title}
                    subtitle={issue.subtitle}
                    detectedCount={issue.detectedCount}
                    riskLevel={issue.riskLevel}
                  />
                </button>
              ))
            ) : (
              <p className="text-[var(--color-text-light-gray)] text-sm text-center py-4">
                이슈가 없습니다.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-card-bg)] p-3 flex flex-col min-h-[200px] min-w-0 overflow-hidden lg:min-h-0 lg:h-full">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h3 className="text-sm font-semibold text-white">
              파일 서버 개인정보 이슈
            </h3>
            <button
              className="text-xs text-[var(--color-mint-text)] hover:underline cursor-pointer"
              onClick={() => router.push("/privacy/file/issues")}
            >
              전체보기
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-[0.575rem]">
            {fileServerIssues.length > 0 ? (
              fileServerIssues.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  className="cursor-pointer text-left"
                  onClick={() =>
                    router.push(`/privacy/file/issues?issueId=${issue.id}`)
                  }
                >
                  <IssueCard
                    timestamp={issue.timestamp}
                    title={issue.title}
                    subtitle={issue.subtitle}
                    detectedCount={issue.detectedCount}
                    riskLevel={issue.riskLevel}
                  />
                </button>
              ))
            ) : (
              <p className="text-[var(--color-text-light-gray)] text-sm text-center py-4">
                이슈가 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
