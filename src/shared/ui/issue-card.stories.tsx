import type { Meta, StoryObj } from "@storybook/react";
import { IssueCard } from "./issue-card";

const meta: Meta<typeof IssueCard> = {
  component: IssueCard,
  title: "shared/IssueCard",
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
      <div className="p-6 bg-[var(--color-bg-main)] max-w-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof IssueCard>;

export const HighRisk: Story = {
  args: {
    timestamp: "2025-01-07 16:13:11",
    title: "orders (delivery_address)",
    subtitle: "주소 정보 암호화 필요",
    detectedCount: 100,
    riskLevel: "high",
  },
};

export const MediumRisk: Story = {
  args: {
    timestamp: "2025-01-07 16:13:11",
    title: "users (email)",
    subtitle: "이름, 주소, 주민등록번호, IP주소, 전화번호",
    detectedCount: 100,
    riskLevel: "medium",
  },
};

export const LowRisk: Story = {
  args: {
    timestamp: "2025-01-07 16:13:11",
    title: "customer_backup (email)",
    subtitle: "이름, 주소",
    detectedCount: 100,
    riskLevel: "low",
  },
};
