"use client";

import { useState } from "react";
import { Folder, CheckCircle2, FileText, HardDrive } from "lucide-react";
import {
  StatCard,
  ConnectionCard,
  Button,
  Modal,
  Input,
  Dropdown,
} from "@/shared/ui";
import type {
  ConnectionDbType,
  ConnectionDetailItem,
  ConnectionActionItem,
} from "@/shared/ui";

type FileServerType = "nas" | "nfs" | "s3";

interface FileConnectionData {
  id: string;
  title: string;
  serverType: FileServerType;
  status: string;
  statusVariant: "success" | "warning" | "error";
  host: string;
  port: string;
  basePath: string;
  username: string;
  password: string;
  managerName: string;
  managerEmail: string;
  retentionPeriod: number;
  fileCount: number;
  fileSize: number;
}

interface FileConnectionFormData {
  title: string;
  serverType: FileServerType;
  host: string;
  port: string;
  basePath: string;
  username: string;
  password: string;
  managerName: string;
  managerEmail: string;
  retentionPeriod: number;
}

const FILE_SERVER_TYPE_OPTIONS = [
  {
    value: "nas",
    label: "NAS",
  },
  {
    value: "nfs",
    label: "NFS",
  },
  {
    value: "s3",
    label: "S3",
  },
];

export default function FileConnectionPage() {
  const serverTypes: FileServerType[] = ["nas", "nfs", "s3"];
  const statusVariants: Array<"success" | "warning" | "error"> = [
    "success",
    "success",
    "success",
    "warning",
  ];
  const statusLabels = ["연결됨", "연결됨", "연결됨", "연결 대기"];

  const generateConnections = (): FileConnectionData[] => {
    const connections: FileConnectionData[] = [];
    for (let i = 1; i <= 12; i++) {
      const serverType = serverTypes[(i - 1) % serverTypes.length];
      const statusVariant = statusVariants[(i - 1) % statusVariants.length];
      const status = statusLabels[(i - 1) % statusLabels.length];

      connections.push({
        id: i.toString(),
        title: `File Server ${i}${i === 1 ? " - Legacy NAS Share" : i === 2 ? " - Official S3 Bucket" : i === 3 ? " - This Love Is NAS" : ""}`,
        serverType,
        status,
        statusVariant,
        host: `192.168.1.${100 + (i - 1)}`,
        port: serverType === "s3" ? "3580" : "2049",
        basePath: `/${i === 1 ? "mnt/legacy" : i === 2 ? "usec/repeat" : i === 3 ? "wu/risk" : `path${i}`}`,
        username: i % 3 === 0 ? "admin" : i % 3 === 1 ? "user" : "root",
        password: "******",
        managerName: `Manager ${i}`,
        managerEmail: `manager${i}@example.com`,
        retentionPeriod: i * 3,
        fileCount: 1000 * i + ((i * 17) % 5000),
        fileSize: 1000 * i + ((i * 23) % 5000),
      });
    }
    return connections;
  };

  const [connections, setConnections] = useState<FileConnectionData[]>(
    generateConnections(),
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalPassword, setOriginalPassword] = useState<string>("");
  const [formData, setFormData] = useState<FileConnectionFormData>({
    title: "",
    serverType: "nas",
    host: "",
    port: "",
    basePath: "",
    username: "",
    password: "",
    managerName: "",
    managerEmail: "",
    retentionPeriod: 1,
  });

  const totalConnections = connections.length;
  const activeConnections = connections.filter(
    (c) => c.statusVariant === "success",
  ).length;
  const totalFiles = connections.reduce((sum, c) => sum + c.fileCount, 0);
  const totalFileSize = connections.reduce((sum, c) => sum + c.fileSize, 0);

  const formatFileSize = (size: number): string => {
    if (size >= 1000) {
      return `${(size / 1000).toFixed(1)} TB`;
    }
    return `${size} GB`;
  };

  const openAddModal = () => {
    setIsViewMode(false);
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      title: "",
      serverType: "nas",
      host: "",
      port: "",
      basePath: "",
      username: "",
      password: "",
      managerName: "",
      managerEmail: "",
      retentionPeriod: 1,
    });
    setIsModalOpen(true);
  };

  const openViewModal = (id: string) => {
    const connection = connections.find((c) => c.id === id);
    if (!connection) return;

    setIsViewMode(true);
    setIsEditMode(false);
    setEditingId(id);
    setFormData({
      title: connection.title,
      serverType: connection.serverType,
      host: connection.host,
      port: connection.port,
      basePath: connection.basePath,
      username: connection.username,
      password: connection.password,
      managerName: connection.managerName,
      managerEmail: connection.managerEmail,
      retentionPeriod: connection.retentionPeriod,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (id: string) => {
    const connection = connections.find((c) => c.id === id);
    if (!connection) return;

    setIsViewMode(false);
    setIsEditMode(true);
    setEditingId(id);
    setOriginalPassword(connection.password);
    setFormData({
      title: connection.title,
      serverType: connection.serverType,
      host: connection.host,
      port: connection.port,
      basePath: connection.basePath,
      username: connection.username,
      password: "",
      managerName: connection.managerName,
      managerEmail: connection.managerEmail,
      retentionPeriod: connection.retentionPeriod,
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = (id: string) => {
    openViewModal(id);
  };

  const handleEdit = (id: string) => {
    openEditModal(id);
  };

  const handleSave = () => {
    // 비밀번호 처리: 수정 모드에서 비밀번호가 비어있으면 원래 비밀번호 사용
    const passwordToSave =
      isEditMode && editingId && !formData.password.trim()
        ? originalPassword
        : formData.password;

    // 필수 필드 유효성 검사
    if (
      !formData.title.trim() ||
      !formData.host.trim() ||
      !formData.port.trim() ||
      !formData.basePath.trim() ||
      !formData.username.trim() ||
      (!isEditMode && !passwordToSave.trim()) ||
      !formData.managerName.trim() ||
      !formData.managerEmail.trim() ||
      formData.retentionPeriod <= 0
    ) {
      if (formData.retentionPeriod <= 0) {
        alert("보관 기간은 1개월 이상이어야 합니다.");
        return;
      }
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (isEditMode && editingId) {
      // 수정 모드
      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === editingId
            ? {
                ...conn,
                title: formData.title,
                serverType: formData.serverType,
                host: formData.host,
                port: formData.port,
                basePath: formData.basePath,
                username: formData.username,
                password: passwordToSave,
                managerName: formData.managerName,
                managerEmail: formData.managerEmail,
                retentionPeriod: formData.retentionPeriod,
              }
            : conn,
        ),
      );
    } else {
      // 추가 모드
      const newConnection: FileConnectionData = {
        id: Date.now().toString(),
        title: formData.title,
        serverType: formData.serverType,
        status: "연결됨",
        statusVariant: "success",
        host: formData.host,
        port: formData.port,
        basePath: formData.basePath,
        username: formData.username,
        password: passwordToSave,
        managerName: formData.managerName,
        managerEmail: formData.managerEmail,
        retentionPeriod: formData.retentionPeriod,
        fileCount: 0,
        fileSize: 0,
      };
      setConnections((prev) => [newConnection, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleScan = (id: string) => {
    // TODO: 스캔 로직
    console.log("스캔", id);
  };

  const handleDelete = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setConnections((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col p-6 gap-5 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
        <StatCard
          title="총 연결"
          value={totalConnections.toString()}
          icon={<Folder className="size-5" />}
          colorScheme="mint"
        />
        <StatCard
          title="활성 연결"
          value={activeConnections.toString()}
          icon={<CheckCircle2 className="size-5" />}
          colorScheme="green"
        />
        <StatCard
          title="총 파일"
          value={totalFiles.toLocaleString()}
          icon={<FileText className="size-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="총 파일 용량"
          value={formatFileSize(totalFileSize)}
          icon={<HardDrive className="size-5" />}
          colorScheme="coral"
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-white">
            파일 서버 연결 목록
          </h2>
          <Button
            type="button"
            colorScheme="main"
            appearance="solid"
            onClick={openAddModal}
          >
            새 연결 추가
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {connections.map((connection) => {
              const details: ConnectionDetailItem[] = [
                {
                  label: "호스트",
                  value: `${connection.host}:${connection.port}`,
                },
                { label: "경로", value: connection.basePath },
                {
                  label: "파일",
                  value: `${connection.fileCount.toLocaleString()}개`,
                },
                {
                  label: "파일 용량",
                  value: formatFileSize(connection.fileSize),
                  highlight: true,
                },
              ];

              const actions: ConnectionActionItem[] = [
                {
                  label: "상세보기",
                  variant: "detail",
                  onClick: () => handleViewDetails(connection.id),
                },
                {
                  label: "스캔",
                  variant: "scan",
                  onClick: () => handleScan(connection.id),
                },
                {
                  label: "수정",
                  variant: "edit",
                  onClick: () => handleEdit(connection.id),
                  hidden: true,
                },
                {
                  label: "삭제",
                  variant: "delete",
                  onClick: () => handleDelete(connection.id),
                },
              ];

              return (
                <ConnectionCard
                  key={connection.id}
                  dbType={connection.serverType as ConnectionDbType}
                  icon={<FileText className="size-full" />}
                  title={connection.title}
                  subtitle={`${connection.serverType.toUpperCase()} | ${connection.retentionPeriod}개월`}
                  status={connection.status}
                  statusVariant={connection.statusVariant}
                  details={details}
                  actions={actions}
                />
              );
            })}
          </div>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          isViewMode
            ? "연결 상세 정보"
            : isEditMode
              ? "연결 수정"
              : "새 파일 서버 연결"
        }
        size="wide"
        footer={
          <div className="flex justify-end gap-2">
            {isViewMode ? (
              <>
                <Button
                  type="button"
                  colorScheme="coral"
                  appearance="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  닫기
                </Button>
                <Button
                  type="button"
                  colorScheme="main"
                  appearance="outline"
                  onClick={() => {
                    if (editingId) {
                      const connection = connections.find(
                        (c) => c.id === editingId,
                      );
                      if (connection) {
                        setOriginalPassword(connection.password);
                      }
                    }
                    setIsViewMode(false);
                    setIsEditMode(true);
                    setFormData((prev) => ({ ...prev, password: "" }));
                  }}
                >
                  수정
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  colorScheme="coral"
                  appearance="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  colorScheme="main"
                  appearance="outline"
                  onClick={handleSave}
                >
                  {isEditMode ? "저장" : "추가"}
                </Button>
              </>
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="file-connection-title"
              className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
            >
              연결 이름
            </label>
            <Input
              id="file-connection-title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="연결 이름을 입력하세요"
              colorScheme="main"
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="file-connection-server-type"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                서버 유형
              </label>
              <Dropdown
                id="file-connection-server-type"
                options={FILE_SERVER_TYPE_OPTIONS}
                value={formData.serverType}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    serverType: value as FileServerType,
                  }))
                }
                colorScheme="main"
                disabled={isViewMode}
              />
            </div>

            {isViewMode ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                  보관 기간
                </label>
                <div className="h-9 px-3 py-2 rounded-md border-2 border-[var(--color-yellow-border)] bg-[var(--color-yellow-bg)] text-sm text-[var(--color-yellow-text)] flex items-center">
                  {connections.find((c) => c.id === editingId)?.retentionPeriod || 0} 개월
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="file-connection-retention-period"
                  className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
                >
                  보관 기간
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-connection-retention-period"
                    type="number"
                    min="1"
                    value={formData.retentionPeriod}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setFormData((prev) => ({
                        ...prev,
                        retentionPeriod: value < 1 ? 1 : value,
                      }));
                    }}
                    placeholder="00"
                    colorScheme="main"
                    className="flex-1"
                    disabled={isViewMode}
                  />
                  <span className="text-sm text-[var(--color-sidebar-hover-text)] shrink-0">
                    개월
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="file-connection-host"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                호스트
              </label>
              <Input
                id="file-connection-host"
                type="text"
                value={formData.host}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, host: e.target.value }))
                }
                placeholder="files.company.com"
                colorScheme="main"
                disabled={isViewMode}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="file-connection-port"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                포트
              </label>
              <Input
                id="file-connection-port"
                type="text"
                value={formData.port}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, port: e.target.value }))
                }
                placeholder="2049"
                colorScheme="main"
                disabled={isViewMode}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="file-connection-base-path"
              className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
            >
              기본 경로
            </label>
            <Input
              id="file-connection-base-path"
              type="text"
              value={formData.basePath}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, basePath: e.target.value }))
              }
              placeholder="/"
              colorScheme="main"
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="file-connection-username"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                사용자명
              </label>
              <Input
                id="file-connection-username"
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                placeholder="사용자명을 입력하세요"
                colorScheme="main"
                disabled={isViewMode}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="file-connection-password"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                비밀번호
              </label>
              <Input
                id="file-connection-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder="비밀번호를 입력하세요"
                colorScheme="main"
                disabled={isViewMode}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="file-connection-manager-name"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                담당자 이름
              </label>
              <Input
                id="file-connection-manager-name"
                type="text"
                value={formData.managerName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    managerName: e.target.value,
                  }))
                }
                placeholder="담당자 이름을 입력하세요"
                colorScheme="main"
                disabled={isViewMode}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="file-connection-manager-email"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                담당자 이메일
              </label>
              <Input
                id="file-connection-manager-email"
                type="email"
                value={formData.managerEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    managerEmail: e.target.value,
                  }))
                }
                placeholder="담당자 이메일을 입력하세요"
                colorScheme="main"
                disabled={isViewMode}
              />
            </div>
          </div>

          {(isViewMode || isEditMode) && editingId && (
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                  연결 상태
                </label>
                {(() => {
                  const connection = connections.find(
                    (c) => c.id === editingId,
                  );
                  const statusVariant = connection?.statusVariant || "success";
                  const statusColors = {
                    success: {
                      border: "border-[var(--color-green-border)]",
                      bg: "bg-[var(--color-green-bg)]",
                      text: "text-[var(--color-green-text)]",
                    },
                    warning: {
                      border: "border-[var(--color-yellow-border)]",
                      bg: "bg-[var(--color-yellow-bg)]",
                      text: "text-[var(--color-yellow-text)]",
                    },
                    error: {
                      border: "border-[var(--color-coral-border)]",
                      bg: "bg-[var(--color-coral-bg)]",
                      text: "text-[var(--color-coral-text)]",
                    },
                  };
                  const colors = statusColors[statusVariant];
                  return (
                    <div
                      className={`h-9 px-3 py-2 rounded-md border-2 ${colors.border} ${colors.bg} text-sm ${colors.text} flex items-center`}
                    >
                      {connection?.status || ""}
                    </div>
                  );
                })()}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                  총 파일 수
                </label>
                <div className="h-9 px-3 py-2 rounded-md border-2 border-[var(--color-purple-border)] bg-[var(--color-purple-bg)] text-sm text-[var(--color-purple-text)] flex items-center">
                  {connections
                    .find((c) => c.id === editingId)
                    ?.fileCount.toLocaleString() || "0"}
                  개
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                  총 파일 용량
                </label>
                <div className="h-9 px-3 py-2 rounded-md border-2 border-[var(--color-mint-border)] bg-[var(--color-mint-bg)] text-sm text-[var(--color-mint-text)] flex items-center">
                  {formatFileSize(
                    connections.find((c) => c.id === editingId)?.fileSize || 0,
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </Modal>
    </div>
  );
}
