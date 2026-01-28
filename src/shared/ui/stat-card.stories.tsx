import type { Meta, StoryObj } from "@storybook/react";
import { Database, FileText, TriangleAlert } from "lucide-react";
import { StatCard } from "./stat-card";

const meta: Meta<typeof StatCard> = {
  component: StatCard,
  title: "shared/StatCard",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-6 bg-[var(--color-bg-main)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    title: "총 서버 연결",
    value: "6",
    detail: "DB: 3 | 파일: 3",
    trend: "up",
    icon: <Database className="size-5" />,
    colorScheme: "default",
  },
};

export const Mint: Story = {
  args: {
    colorScheme: "mint",
    title: "총 서버 연결",
    value: "6",
    detail: "DB: 3 | 파일: 3",
    trend: "up",
    icon: <Database className="size-5" />,
  },
};

export const Purple: Story = {
  args: {
    colorScheme: "purple",
    title: "개인정보 포함 컬럼 수",
    value: "625,500",
    detail: "암호화 91%",
    trend: "up",
    icon: <FileText className="size-5" />,
  },
};

export const Green: Story = {
  args: {
    colorScheme: "green",
    title: "개인정보 포함 파일 수",
    value: "250",
    detail: "암호화 60%",
    trend: "up",
    icon: <FileText className="size-5" />,
  },
};

export const Coral: Story = {
  args: {
    colorScheme: "coral",
    title: "총 이슈 개수",
    value: "4",
    detail: "DB: 3 | 파일: 1",
    trend: "up",
    icon: <TriangleAlert className="size-5" />,
  },
};
