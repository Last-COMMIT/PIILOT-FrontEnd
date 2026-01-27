import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";

const meta: Meta<typeof Modal> = {
  component: Modal,
  title: "shared/Modal",
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    size: {
      control: "select",
      options: ["narrow", "wide"],
      description: "narrow=폼 위주, wide=상세/테이블 등",
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[400px] bg-[var(--color-bg-main)] p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Modal>;

function ModalWithTrigger({ title, size }: { title: string; size: "narrow" | "wide" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" colorScheme="main" onClick={() => setOpen(true)}>
        모달 열기
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        size={size}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              appearance="outline"
              colorScheme="coral"
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              appearance="outline"
              colorScheme="main"
              onClick={() => setOpen(false)}
            >
              저장
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-text-light-gray)]">
          버튼으로 열고, X·백드롭·Escape로 닫을 수 있습니다.
        </p>
      </Modal>
    </>
  );
}

export const WithTrigger: Story = {
  render: () => (
    <ModalWithTrigger title="연결 삭제" size="narrow" />
  ),
};
