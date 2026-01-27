import { Database, FileText, TriangleAlert, Columns } from "lucide-react";
import { StatCard, IssueCard, LineChart, DoughnutChart } from "@/shared/ui";
import type { LineChartData, DoughnutChartData, IssueCardRiskLevel } from "@/shared/ui";

interface IssueData {
  id: string;
  timestamp: string;
  title: string;
  subtitle: string;
  detectedCount: number;
  riskLevel: IssueCardRiskLevel;
}

export default function HomePage() {
  const CHART_CARD_H = 280;
  const LINE_CHART_H = 230;

  const dbServerData: LineChartData = {
    labels: [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ],
    datasets: [
      {
        label: "DB 서버 암호화",
        data: [65, 20, 35, 28, 40, 22, 55, 33, 48, 44, 78, 45],
        borderColor: "rgb(74, 222, 128)",
        backgroundColor: "rgba(74, 222, 128, 0.10)",
        fill: true,
      },
    ],
  };

  const fileServerData: LineChartData = {
    labels: [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ],
    datasets: [
      {
        label: "파일 서버 암호화",
        data: [68, 55, 62, 18, 30, 25, 35, 28, 72, 20, 55, 48],
        borderColor: "rgb(248, 113, 113)",
        backgroundColor: "rgba(248, 113, 113, 0.10)",
        fill: true,
      },
    ],
  };

  const personalInfoLegend = [
    { label: "이름", color: "rgb(59, 130, 246)" },
    { label: "전화번호", color: "rgb(249, 115, 22)" },
    { label: "이메일", color: "rgb(234, 179, 8)" },
    { label: "주소", color: "rgb(74, 222, 128)" },
    { label: "계좌번호", color: "rgb(34, 211, 238)" },
    { label: "주민등록번호", color: "rgb(236, 72, 153)" },
    { label: "IP주소", color: "rgb(167, 139, 250)" },
    { label: "여권번호", color: "rgb(239, 68, 68)" },
    { label: "얼굴", color: "rgb(180, 83, 9)" },
  ] as const;

  const personalInfoData: DoughnutChartData = {
    labels: personalInfoLegend.map((l) => l.label),
    datasets: [
      {
        label: "개인정보 유형별 분포",
        data: [18, 14, 12, 10, 9, 8, 7, 6, 5],
        backgroundColor: personalInfoLegend.map((l) => l.color),
        borderColor: personalInfoLegend.map((l) => l.color),
        borderWidth: 1,
      },
    ],
  };

  const dbServerIssues: IssueData[] = [
    {
      id: "db-1",
      timestamp: "2025-01-07 16:13:11",
      title: "orders (delivery_address)",
      subtitle: "주소 정보 암호화 필요",
      detectedCount: 100,
      riskLevel: "high",
    },
    {
      id: "db-2",
      timestamp: "2025-01-07 15:30:22",
      title: "users (email)",
      subtitle: "이메일 정보 암호화 필요",
      detectedCount: 50,
      riskLevel: "low",
    },
    {
      id: "db-3",
      timestamp: "2025-01-07 14:20:15",
      title: "orders (phone_number)",
      subtitle: "전화번호 정보 암호화 필요",
      detectedCount: 75,
      riskLevel: "medium",
    },
    {
      id: "db-4",
      timestamp: "2025-01-07 12:05:03",
      title: "customers (resident_id)",
      subtitle: "주민등록번호 정보 암호화 필요",
      detectedCount: 18,
      riskLevel: "medium",
    },
  ];

  const fileServerIssues: IssueData[] = [
    {
      id: "file-1",
      timestamp: "2025-01-07 16:13:11",
      title: "data.jpg (S3 Storage)",
      subtitle: "이름, 주소, 주민등록번호, IP주소, 전화번호, 계좌번호, 이메일",
      detectedCount: 100,
      riskLevel: "high",
    },
    {
      id: "file-2",
      timestamp: "2025-01-07 16:13:11",
      title: "resume.pdf (S3 Storage)",
      subtitle: "주소 정보 암호화 필요",
      detectedCount: 100,
      riskLevel: "medium",
    },
    {
      id: "file-3",
      timestamp: "2025-01-07 16:13:11",
      title: "data.jpg (S3 Storage)",
      subtitle: "이름, 주소, 주민등록번호",
      detectedCount: 100,
      riskLevel: "low",
    },
    {
      id: "file-4",
      timestamp: "2025-01-07 11:22:40",
      title: "passport.png (S3 Storage)",
      subtitle: "여권번호 포함 이미지",
      detectedCount: 6,
      riskLevel: "medium",
    },
  ];

  return (
    <div className="h-full flex flex-col p-6 gap-5 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
        <StatCard
          title="총 서버 연결"
          value="6"
          detail="DB: 3 | 파일: 3"
          trend="up"
          icon={<Database className="size-5" />}
          colorScheme="mint"
        />
        <StatCard
          title="개인정보 포함 칼럼 수"
          value="625,500"
          detail="암호화 91%"
          trend="up"
          icon={<Columns className="size-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="개인정보 포함 파일 수"
          value="250"
          detail="암호화 60%"
          trend="up"
          icon={<FileText className="size-5" />}
          colorScheme="green"
        />
        <StatCard
          title="총 이슈 개수"
          value="4"
          detail="DB: 3 | 파일: 1"
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
            DB 서버 암호화 추세
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
            파일 서버 암호화 추세
          </h3>
          <div className="flex-1 min-h-0">
            <LineChart data={fileServerData} height={LINE_CHART_H} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 flex-1 min-h-0 lg:[grid-template-columns:0.85fr_1.075fr_1.075fr]">
        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-card-bg)] p-3 flex flex-col min-h-0">
          <h3 className="text-sm font-semibold text-white mb-3 shrink-0">
            개인정보 유형별 분포
          </h3>
          <div className="flex-1 gap-4 min-h-0 flex flex-col items-center justify-center">
            <div className="w-full max-w-[240px] mb-4">
              <DoughnutChart
                data={personalInfoData}
                height={200}
                showLegend={false}
              />
            </div>
            <div className="w-full grid grid-cols-3 gap-x-3 gap-y-2 text-sm text-[var(--color-text-muted)] shrink-0">
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
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-card-bg)] p-3 flex flex-col h-full min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h3 className="text-sm font-semibold text-white">
              DB 서버 개인정보 이슈
            </h3>
            <button className="text-xs text-[var(--color-mint-text)] hover:underline">
              전체보기
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-[0.575rem]">
            {dbServerIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                timestamp={issue.timestamp}
                title={issue.title}
                subtitle={issue.subtitle}
                detectedCount={issue.detectedCount}
                riskLevel={issue.riskLevel}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-card-bg)] p-3 flex flex-col h-full min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h3 className="text-sm font-semibold text-white">
              파일 서버 개인정보 이슈
            </h3>
            <button className="text-xs text-[var(--color-mint-text)] hover:underline">
              전체보기
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-[0.575rem]">
            {fileServerIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                timestamp={issue.timestamp}
                title={issue.title}
                subtitle={issue.subtitle}
                detectedCount={issue.detectedCount}
                riskLevel={issue.riskLevel}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
