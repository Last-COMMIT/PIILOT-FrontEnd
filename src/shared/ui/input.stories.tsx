import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { PasswordInput } from "./password-input";

const meta: Meta<typeof Input> = {
  component: Input,
  title: "shared/Input",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-4 p-6 bg-[var(--color-bg-main)] min-h-[200px] max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "입력하세요",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Input size="sm" placeholder="작게 (h-8)" />
      <Input size="default" placeholder="기본 (h-9)" />
      <Input size="lg" placeholder="크게 (h-10)" />
    </div>
  ),
};

export const MainFocus: Story = {
  args: {
    colorScheme: "main",
    placeholder: "포커스 시 민트 링",
  },
};

export const Error: Story = {
  args: {
    placeholder: "에러 상태",
    "aria-invalid": true,
    defaultValue: "잘못된 값",
  },
};

export const PasswordDefault: Story = {
  render: () => (
    <PasswordInput placeholder="비밀번호를 입력하세요" />
  ),
};
