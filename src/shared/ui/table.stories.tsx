import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Table, type TableColumn } from "./table";

const meta: Meta<typeof Table> = {
  component: Table,
  title: "shared/Table",
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
        <div className="max-w-4xl">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Table>;

interface SampleRow extends Record<string, unknown> {
  columnName: string;
  piiType: string;
  recordCount: string;
  risk: "낮음" | "중간" | "높음";
}

const sampleColumns: TableColumn<SampleRow>[] = [
  { id: "columnName", label: "칼럼명", width: 1.2 },
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

export const Default: Story = {
  render: () => (
    <Table<SampleRow>
      columns={sampleColumns}
      data={sampleData}
      scrollable
      maxBodyHeight="min(50vh, 280px)"
    />
  ),
};

export const SelectableRow: Story = {
  render: function SelectableRowStory() {
    const [selected, setSelected] = useState(0);
    return (
      <Table<SampleRow>
        columns={sampleColumns}
        data={sampleData}
        scrollable
        maxBodyHeight="min(50vh, 280px)"
        selectedRowIndex={selected}
        onRowClick={(_, i) => setSelected(i)}
      />
    );
  },
};

const scrollData: SampleRow[] = Array.from({ length: 15 }, (_, i) => {
  const items: SampleRow[] = [
    { columnName: "email", piiType: "이메일", recordCount: "125,000", risk: "낮음" },
    { columnName: "delivery_address", piiType: "주소", recordCount: "89,000", risk: "높음" },
    { columnName: "phone_number", piiType: "전화번호", recordCount: "89,000", risk: "중간" },
  ];
  const row = items[i % items.length];
  return { ...row, columnName: `${row.columnName}_${i + 1}` };
});

export const ScrollableBody: Story = {
  render: () => (
    <Table<SampleRow>
      columns={sampleColumns}
      data={scrollData}
      scrollable
      maxBodyHeight="240px"
    />
  ),
};
