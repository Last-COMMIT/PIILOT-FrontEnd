import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionCard } from "./connection-card";

const meta: Meta<typeof ConnectionCard> = {
  component: ConnectionCard,
  title: "shared/ConnectionCard",
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
      <div className="p-6 bg-[var(--color-bg-main)] max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ConnectionCard>;

export const Default: Story = {
  args: {
    dbType: "oracle",
    title: "Legacy Project Connection",
    subtitle: "Oracle",
    status: "연결됨",
    statusVariant: "success",
    details: [
      { label: "호스트", value: "169.123.169.1:1521" },
      { label: "데이터베이스명", value: "PIIOLOTDB" },
      { label: "테이블 수", value: "792개" },
      { label: "컬럼 수", value: "34개", highlight: true },
    ],
    actions: [
      { label: "상세보기", variant: "detail" },
      { label: "스캔", variant: "scan" },
      { label: "삭제", variant: "delete" },
    ],
  },
};
