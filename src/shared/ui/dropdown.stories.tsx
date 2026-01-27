import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Dropdown } from "./dropdown";
import type { DropdownOption } from "./dropdown";

const options: DropdownOption[] = [
  { value: "a", label: "옵션 A" },
  { value: "b", label: "옵션 B" },
  { value: "c", label: "옵션 C" },
];

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
  title: "shared/Dropdown",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-4 p-6 bg-[var(--color-bg-main)] min-h-[280px] max-w-xs">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  args: {
    options,
    placeholder: "선택하세요",
  },
};

export const Controlled: Story = {
  render: function Controlled() {
    const [value, setValue] = useState<string>("");
    return (
      <Dropdown
        options={options}
        value={value}
        onChange={setValue}
        placeholder="선택하세요"
      />
    );
  },
};

export const MainFocus: Story = {
  args: {
    options,
    colorScheme: "main",
    placeholder: "민트 포커스",
  },
};
