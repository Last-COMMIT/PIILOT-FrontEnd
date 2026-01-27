import type { Meta, StoryObj } from "@storybook/react";
import { Save, Trash2, Plus } from "lucide-react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "shared/Button",
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

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "버튼",
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button colorScheme="main">메인</Button>
      <Button colorScheme="mint">민트</Button>
      <Button colorScheme="purple">퍼플</Button>
      <Button colorScheme="green">그린</Button>
      <Button colorScheme="coral">코랄</Button>
      <Button colorScheme="neutral">중립</Button>
      <Button colorScheme="warning">경고</Button>
      <Button colorScheme="destructive">삭제</Button>
    </div>
  ),
};

export const Appearances: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button colorScheme="main" appearance="solid">Solid</Button>
      <Button colorScheme="main" appearance="outline">Outline</Button>
      <Button colorScheme="main" appearance="ghost">Ghost</Button>
      <Button colorScheme="main" appearance="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">작게</Button>
      <Button size="default">기본</Button>
      <Button size="lg">크게</Button>
      <Button size="icon-sm" aria-label="아이콘">
        <Plus />
      </Button>
      <Button size="icon" aria-label="아이콘">
        <Plus />
      </Button>
      <Button size="icon-lg" aria-label="아이콘">
        <Plus />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>
        <Save />
        저장
      </Button>
      <Button colorScheme="coral" appearance="outline">
        <Trash2 />
        삭제
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button disabled>비활성</Button>
      <Button colorScheme="main" appearance="outline" disabled>
        비활성 Outline
      </Button>
    </div>
  ),
};
