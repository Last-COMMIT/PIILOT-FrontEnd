import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "./header";

const meta: Meta<typeof Header> = {
  component: Header,
  title: "widgets/Header",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description:
        "헤더에 표시할 페이지 제목. 미지정 시 pathname으로 자동 매핑",
    },
    pathname: {
      control: "text",
      description:
        "Storybook용. 현재 경로(예: /, /settings). 제목 자동 매핑에 사용",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Header>;

export const Dashboard: Story = {
  args: {
    pathname: "/",
  },
};

export const CustomTitle: Story = {
  args: {
    title: "직접 지정한 제목",
  },
};

export const DBServerConnection: Story = {
  args: {
    pathname: "/connections/db",
  },
};

export const PrivacyDBList: Story = {
  args: {
    pathname: "/privacy/db/list",
  },
};

export const Settings: Story = {
  args: {
    pathname: "/settings",
  },
};
