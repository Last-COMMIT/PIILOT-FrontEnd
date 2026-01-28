import type { Meta, StoryObj } from "@storybook/react";
import { FileText } from "lucide-react";
import { TableSection } from "./table-section";
import { Table, type TableColumn } from "./table";

const meta: Meta<typeof TableSection> = {
  component: TableSection,
  title: "shared/TableSection",
  tags: ["autodocs"],
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[var(--color-bg-main)] p-6">
        <div className="max-w-4xl space-y-6">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TableSection>;

export const Default: Story = {
  args: {
    title: "users",
    meta: "운영 DB (PostgreSQL) | 담당자: 홍길동 대리",
    badge: "1개 이슈",
    badgeVariant: "warning",
    children: (
      <div className="p-4 text-sm text-[var(--color-text-light-gray)]">
        테이블 자리 (Table 컴포넌트 또는 임의 영역)
      </div>
    ),
  },
  render: (args) => (
    <TableSection icon={<FileText className="size-6" />} {...args} />
  ),
};

interface SampleRow extends Record<string, unknown> {
  columnName: string;
  piiType: string;
  recordCount: string;
  risk: "낮음" | "중간" | "높음";
}

const sampleColumns: TableColumn<SampleRow>[] = [
  { id: "columnName", label: "컬럼명", width: 1.2 },
  { id: "piiType", label: "개인정보 유형", width: 1.2 },
  { id: "recordCount", label: "레코드 수", width: 1 },
  {
    id: "risk",
    label: "위험도",
    width: 0.8,
    render: (v) => (
      <span
        className={
          v === "높음"
            ? "text-[var(--color-coral-text)]"
            : v === "중간"
              ? "text-[var(--color-yellow-text)]"
              : "text-[var(--color-green-text)]"
        }
      >
        {String(v)}
      </span>
    ),
  },
];

const sampleData: SampleRow[] = [
  { columnName: "email", piiType: "이메일", recordCount: "125,000", risk: "낮음" },
  { columnName: "delivery_address", piiType: "주소", recordCount: "89,000", risk: "높음" },
  { columnName: "phone_number", piiType: "전화번호", recordCount: "89,000", risk: "중간" },
];

export const WithTable: Story = {
  render: () => (
    <TableSection
      icon={<FileText className="size-5" />}
      title="users"
      meta="운영 DB (PostgreSQL) | 담당자: 홍길동 대리"
      badge="1개 이슈"
    >
      <Table<SampleRow>
        columns={sampleColumns}
        data={sampleData}
        scrollable
        maxBodyHeight="min(50vh, 280px)"
        className="!rounded-none !border-0"
      />
    </TableSection>
  ),
};
