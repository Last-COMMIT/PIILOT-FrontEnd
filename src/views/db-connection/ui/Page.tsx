"use client";

import { useState } from "react";
import { Database, CheckCircle2, Table, Columns } from "lucide-react";
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

interface ConnectionData {
  id: string;
  title: string;
  dbType: ConnectionDbType;
  status: string;
  statusVariant: "success" | "warning" | "error";
  host: string;
  port: string;
  databaseName: string;
  username: string;
  password: string;
  managerName: string;
  managerEmail: string;
  tableCount: number;
  columnCount: number;
}

interface ConnectionFormData {
  title: string;
  dbType: ConnectionDbType;
  host: string;
  port: string;
  databaseName: string;
  username: string;
  password: string;
  managerName: string;
  managerEmail: string;
}

const DB_TYPE_OPTIONS = [
  {
    value: "postgresql",
    label: "PostgreSQL",
    icon: (
      <img
        src="/images/postgresql_icon.png"
        alt=""
        className="size-5 shrink-0 object-contain"
        aria-hidden
      />
    ),
  },
  {
    value: "oracle",
    label: "Oracle",
    icon: (
      <img
        src="/images/oracle_icon.png"
        alt=""
        className="size-5 shrink-0 object-contain"
        aria-hidden
      />
    ),
  },
  {
    value: "mysql",
    label: "MySQL",
    icon: (
      <img
        src="/images/mysql_icon.png"
        alt=""
        className="size-5 shrink-0 object-contain"
        aria-hidden
      />
    ),
  },
];

export default function DbConnectionPage() {
  const dbTypes: ConnectionDbType[] = ["postgresql", "oracle", "mysql"];
  const statusVariants: Array<"success" | "warning" | "error"> = [
    "success",
    "success",
    "success",
    "warning",
  ];
  const statusLabels = ["연결됨", "연결됨", "연결됨", "연결 대기"];

  const generateConnections = (): ConnectionData[] => {
    const connections: ConnectionData[] = [];
    for (let i = 1; i <= 12; i++) {
      const dbType = dbTypes[(i - 1) % dbTypes.length];
      const statusVariant = statusVariants[(i - 1) % statusVariants.length];
      const status = statusLabels[(i - 1) % statusLabels.length];

      connections.push({
        id: i.toString(),
        title: `Connection ${i}${i === 1 ? " - Legacy Project" : i === 2 ? " - LASTCOMMIT" : i === 3 ? " - AivleGood Co" : ""}`,
        dbType,
        status,
        statusVariant,
        host: `192.168.1.${100 + (i - 1)}`,
        port: dbType === "postgresql" ? "5432" : "3306",
        databaseName: `DB_${i}${dbType === "postgresql" ? "_PG" : dbType === "oracle" ? "_ORA" : "_MY"}`,
        username: i % 3 === 0 ? "admin" : i % 3 === 1 ? "user" : "root",
        password: "******",
        managerName: `Manager ${i}`,
        managerEmail: `manager${i}@example.com`,
        tableCount: 100 * i + ((i * 17) % 500),
        columnCount: 50 * i + ((i * 23) % 1000),
      });
    }
    return connections;
  };

  const [connections, setConnections] = useState<ConnectionData[]>(
    generateConnections(),
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ConnectionFormData>({
    title: "",
    dbType: "postgresql",
    host: "",
    port: "",
    databaseName: "",
    username: "",
    password: "",
    managerName: "",
    managerEmail: "",
  });

  const totalConnections = connections.length;
  const activeConnections = connections.filter(
    (c) => c.statusVariant === "success",
  ).length;
  const totalTables = connections.reduce((sum, c) => sum + c.tableCount, 0);
  const totalColumns = connections.reduce((sum, c) => sum + c.columnCount, 0);

  const openAddModal = () => {
    setIsViewMode(false);
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      title: "",
      dbType: "postgresql",
      host: "",
      port: "",
      databaseName: "",
      username: "",
      password: "",
      managerName: "",
      managerEmail: "",
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
      dbType: connection.dbType,
      host: connection.host,
      port: connection.port,
      databaseName: connection.databaseName,
      username: connection.username,
      password: connection.password,
      managerName: connection.managerName,
      managerEmail: connection.managerEmail,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (id: string) => {
    const connection = connections.find((c) => c.id === id);
    if (!connection) return;

    setIsViewMode(false);
    setIsEditMode(true);
    setEditingId(id);
    setFormData({
      title: connection.title,
      dbType: connection.dbType,
      host: connection.host,
      port: connection.port,
      databaseName: connection.databaseName,
      username: connection.username,
      password: connection.password,
      managerName: connection.managerName,
      managerEmail: connection.managerEmail,
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
    if (isEditMode && editingId) {
      // 수정 모드
      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === editingId
            ? {
                ...conn,
                title: formData.title,
                dbType: formData.dbType,
                host: formData.host,
                port: formData.port,
                databaseName: formData.databaseName,
                username: formData.username,
                password: formData.password,
                managerName: formData.managerName,
                managerEmail: formData.managerEmail,
              }
            : conn,
        ),
      );
    } else {
      // 추가 모드
      const newConnection: ConnectionData = {
        id: Date.now().toString(),
        title: formData.title,
        dbType: formData.dbType,
        status: "연결됨",
        statusVariant: "success",
        host: formData.host,
        port: formData.port,
        databaseName: formData.databaseName,
        username: formData.username,
        password: formData.password,
        managerName: formData.managerName,
        managerEmail: formData.managerEmail,
        tableCount: 0,
        columnCount: 0,
      };
      setConnections((prev) => [...prev, newConnection]);
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
          icon={<Database className="size-5" />}
          colorScheme="mint"
        />
        <StatCard
          title="활성 연결"
          value={activeConnections.toString()}
          icon={<CheckCircle2 className="size-5" />}
          colorScheme="green"
        />
        <StatCard
          title="총 테이블"
          value={totalTables.toLocaleString()}
          icon={<Table className="size-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="총 컬럼"
          value={totalColumns.toLocaleString()}
          icon={<Columns className="size-5" />}
          colorScheme="coral"
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-white">
            DB 서버 연결 목록
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
                { label: "데이터베이스명", value: connection.databaseName },
                {
                  label: "테이블 수",
                  value: `${connection.tableCount.toLocaleString()}개`,
                },
                {
                  label: "컬럼 수",
                  value: `${connection.columnCount.toLocaleString()}개`,
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
                  dbType={connection.dbType}
                  title={connection.title}
                  subtitle={connection.dbType.toUpperCase()}
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
              : "새 데이터베이스 연결"
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
                  {isEditMode ? "수정" : "저장"}
                </Button>
              </>
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
              연결 이름
            </label>
            <Input
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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
              서버 유형
            </label>
            <Dropdown
              options={DB_TYPE_OPTIONS}
              value={formData.dbType}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  dbType: value as ConnectionDbType,
                }))
              }
              colorScheme="main"
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                호스트
              </label>
              <Input
                type="text"
                value={formData.host}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, host: e.target.value }))
                }
                placeholder="192.168.1.100"
                colorScheme="main"
                disabled={isViewMode}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                포트
              </label>
              <Input
                type="text"
                value={formData.port}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, port: e.target.value }))
                }
                placeholder="5432"
                colorScheme="main"
                disabled={isViewMode}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
              데이터베이스명
            </label>
            <Input
              type="text"
              value={formData.databaseName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  databaseName: e.target.value,
                }))
              }
              placeholder="데이터베이스명을 입력하세요"
              colorScheme="main"
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                사용자명
              </label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="사용자명을 입력하세요"
                colorScheme="main"
                disabled={isViewMode}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                비밀번호
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="비밀번호를 입력하세요"
                colorScheme="main"
                disabled={isViewMode}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                담당자 이름
              </label>
              <Input
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
              <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                담당자 이메일
              </label>
              <Input
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
                  총 테이블 수
                </label>
                <div className="h-9 px-3 py-2 rounded-md border-2 border-[var(--color-purple-border)] bg-[var(--color-purple-bg)] text-sm text-[var(--color-purple-text)] flex items-center">
                  {connections
                    .find((c) => c.id === editingId)
                    ?.tableCount.toLocaleString() || "0"}
                  개
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                  총 컬럼 수
                </label>
                <div className="h-9 px-3 py-2 rounded-md border-2 border-[var(--color-yellow-border)] bg-[var(--color-yellow-bg)] text-sm text-[var(--color-yellow-text)] flex items-center">
                  {connections
                    .find((c) => c.id === editingId)
                    ?.columnCount.toLocaleString() || "0"}
                  개
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
