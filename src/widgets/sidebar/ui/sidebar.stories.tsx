import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "./sidebar";

const meta: Meta<typeof Sidebar> = {
  component: Sidebar,
  title: "widgets/Sidebar",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    pathname: {
      control: "text",
      description:
        "Storybook용. 현재 경로에 따라 활성 메뉴·펼쳐진 메뉴가 결정됨",
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-[var(--color-bg-main)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Dashboard: Story = {
  args: {
    pathname: "/",
  },
};

export const ConnectionsDB: Story = {
  args: {
    pathname: "/connections/db",
  },
};

export const PrivacyDBList: Story = {
  args: {
    pathname: "/privacy/db/list",
  },
};

export const PrivacyFileMasking: Story = {
  args: {
    pathname: "/privacy/file/masking",
  },
};

export const Settings: Story = {
  args: {
    pathname: "/settings",
  },
};
