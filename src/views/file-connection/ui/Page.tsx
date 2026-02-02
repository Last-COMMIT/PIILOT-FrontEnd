"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Folder, CheckCircle2, FileText, HardDrive } from "lucide-react";
import {
  StatCard,
  ConnectionCard,
  Button,
  Modal,
  Input,
  Dropdown,
} from "@/shared/ui";
import type { ConnectionDetailItem, ConnectionActionItem } from "@/shared/ui";
import {
  getFileConnectionList,
  getFileConnectionStats,
  getFileConnectionDetail,
  createFileConnection,
  updateFileConnection,
  deleteFileConnection,
} from "@/features/file-connection";
import type { FileServerTypeId } from "@/features/file-connection";
import type {
  FileConnectionListItem,
  FileConnectionDetailItem,
} from "@/features/file-connection";

/** UI용 서버 유형 (FTP/SFTP만 API 지원) */
type FileServerType = "ftp" | "sftp";

const FILE_SERVER_TYPE_OPTIONS = [
  { value: "ftp", label: "FTP" },
  { value: "sftp", label: "SFTP" },
];

/** API serverTypeName → UI serverType */
function serverTypeNameToType(name: string): FileServerType {
  return name.toUpperCase() === "SFTP" ? "sftp" : "ftp";
}

/** UI serverType → API serverTypeId (4: FTP, 5: SFTP) */
function serverTypeToId(type: FileServerType): FileServerTypeId {
  return type === "sftp" ? 5 : 4;
}

/** API status → UI statusVariant */
function statusToVariant(status: string): "success" | "warning" | "error" {
  if (status === "CONNECTED") return "success";
  if (status === "DISCONNECTED") return "warning";
  return "warning";
}

/** API status → 한글 라벨 */
function statusToLabel(status: string): string {
  if (status === "CONNECTED") return "연결됨";
  if (status === "DISCONNECTED") return "연결 끊김";
  return status;
}

/** 목록 한 건에서 host 문자열 분리 (예: "192.168.1.100:22") */
function parseHost(hostStr: string): { host: string; port: string } {
  if (hostStr.includes(":")) {
    const [host, port] = hostStr.split(":");
    return { host: host ?? "", port: port ?? "" };
  }
  return { host: hostStr, port: "" };
}

interface ConnectionFormData {
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

const emptyForm: ConnectionFormData = {
  title: "",
  serverType: "sftp",
  host: "",
  port: "",
  basePath: "/",
  username: "",
  password: "",
  managerName: "",
  managerEmail: "",
  retentionPeriod: 1,
};

/** API 명세 기준 입력 규칙 */
const INPUT_RULES = {
  connectionName: { maxLength: 100 },
  host: { maxLength: 255 },
  port: { min: 1, max: 65535 },
  defaultPath: { maxLength: 255 },
  username: { maxLength: 100 },
  managerName: { maxLength: 100 },
} as const;

export default function FileConnectionPage() {
  const router = useRouter();
  const [list, setList] = useState<FileConnectionListItem[]>([]);
  const [stats, setStats] = useState<{
    totalConnections: number;
    activeConnections: number;
    totalFiles: number;
    totalFileSize: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailForModal, setDetailForModal] =
    useState<FileConnectionDetailItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState<ConnectionFormData>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ConnectionFormData, string>>
  >({});

  const loadListAndStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [listRes, statsRes] = await Promise.all([
      getFileConnectionList({ page: 0, size: 100 }),
      getFileConnectionStats(),
    ]);
    if (listRes.success && listRes.result) setList(listRes.result.content);
    if (statsRes.success && statsRes.result) setStats(statsRes.result);
    if (!listRes.success) setError(listRes.message);
    else if (!statsRes.success) setError(statsRes.message);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadListAndStats();
  }, [loadListAndStats]);

  useEffect(() => {
    if (!isModalOpen || !editingId || (!isViewMode && !isEditMode)) {
      setDetailForModal(null);
      setModalLoading(false);
      return;
    }
    let cancelled = false;
    setModalLoading(true);
    getFileConnectionDetail(Number(editingId))
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.result) {
          const d = res.result;
          setDetailForModal(res.result);
          setFormData({
            title: d.connectionName,
            serverType: serverTypeNameToType(d.serverTypeName),
            host: d.host,
            port: String(d.port ?? ""),
            basePath: d.defaultPath ?? "",
            username: d.username ?? "",
            password: "",
            managerName: d.managerName ?? "",
            managerEmail: d.managerEmail ?? "",
            retentionPeriod: d.retentionPeriodMonths ?? 1,
          });
        } else {
          setDetailForModal(null);
          alert(res.message ?? "상세 정보를 불러오는 데 실패했습니다.");
          setIsModalOpen(false);
        }
        setModalLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setModalLoading(false);
          alert("상세 정보를 불러오는 중 오류가 발생했습니다.");
          setIsModalOpen(false);
        }
      });
    return () => {
      cancelled = true;
      setModalLoading(false);
    };
  }, [isModalOpen, editingId, isViewMode, isEditMode]);

  const openAddModal = () => {
    setDetailForModal(null);
    setEditingId(null);
    setIsViewMode(false);
    setIsEditMode(false);
    setFormData(emptyForm);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openViewModal = (id: string) => {
    setEditingId(id);
    setIsViewMode(true);
    setIsEditMode(false);
    setFormData(emptyForm);
    setDetailForModal(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (id: string) => {
    setEditingId(id);
    setIsViewMode(false);
    setIsEditMode(true);
    setFormData(emptyForm);
    setDetailForModal(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const portNum = parseInt(formData.port, 10);
    const emailTrim = formData.managerEmail.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors: Partial<Record<keyof ConnectionFormData, string>> = {};

    if (!formData.title.trim()) errors.title = "연결 이름을 입력해 주세요.";
    else if (
      formData.title.trim().length > INPUT_RULES.connectionName.maxLength
    )
      errors.title = `최대 ${INPUT_RULES.connectionName.maxLength}자까지 입력 가능합니다.`;

    if (!formData.host.trim()) errors.host = "호스트를 입력해 주세요.";
    else if (formData.host.trim().length > INPUT_RULES.host.maxLength)
      errors.host = `최대 ${INPUT_RULES.host.maxLength}자까지 입력 가능합니다.`;

    if (!formData.port.trim()) errors.port = "포트를 입력해 주세요.";
    else if (
      Number.isNaN(portNum) ||
      portNum < INPUT_RULES.port.min ||
      portNum > INPUT_RULES.port.max
    )
      errors.port = `${INPUT_RULES.port.min}~${INPUT_RULES.port.max} 사이의 숫자를 입력해 주세요.`;

    if (!formData.basePath.trim())
      errors.basePath = "기본 경로를 입력해 주세요.";
    else if (
      formData.basePath.trim().length > INPUT_RULES.defaultPath.maxLength
    )
      errors.basePath = `최대 ${INPUT_RULES.defaultPath.maxLength}자까지 입력 가능합니다.`;

    if (!formData.username.trim())
      errors.username = "사용자명을 입력해 주세요.";
    else if (formData.username.trim().length > INPUT_RULES.username.maxLength)
      errors.username = `최대 ${INPUT_RULES.username.maxLength}자까지 입력 가능합니다.`;

    if (!isEditMode && !formData.password.trim())
      errors.password = "비밀번호를 입력해 주세요.";

    if (!formData.managerName.trim())
      errors.managerName = "담당자 이름을 입력해 주세요.";
    else if (
      formData.managerName.trim().length > INPUT_RULES.managerName.maxLength
    )
      errors.managerName = `최대 ${INPUT_RULES.managerName.maxLength}자까지 입력 가능합니다.`;

    if (!emailTrim) errors.managerEmail = "담당자 이메일을 입력해 주세요.";
    else if (!emailRe.test(emailTrim))
      errors.managerEmail = "이메일 형식이 올바르지 않습니다.";

    if (
      formData.retentionPeriod < 1 ||
      !Number.isInteger(formData.retentionPeriod)
    ) {
      errors.retentionPeriod = "보관 기간은 1개월 이상의 정수여야 합니다.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSaveLoading(true);
    const baseBody = {
      serverTypeId: serverTypeToId(formData.serverType),
      connectionName: formData.title.trim(),
      host: formData.host.trim(),
      port: portNum,
      defaultPath: formData.basePath.trim(),
      username: formData.username.trim(),
      managerName: formData.managerName.trim(),
      managerEmail: emailTrim,
      retentionPeriodMonths: formData.retentionPeriod,
    };

    if (isEditMode && editingId) {
      const updateBody = {
        ...baseBody,
        password: formData.password.trim(),
      };
      const res = await updateFileConnection(Number(editingId), updateBody);
      setSaveLoading(false);
      if (res.success) {
        loadListAndStats();
        setIsModalOpen(false);
        alert("수정되었습니다. 목록이 갱신되었습니다.");
      } else {
        alert(res.message);
      }
    } else {
      const res = await createFileConnection({
        ...baseBody,
        password: formData.password.trim(),
      });
      setSaveLoading(false);
      if (res.success) {
        loadListAndStats();
        setIsModalOpen(false);
        alert("저장되었습니다. 목록이 갱신되었습니다.");
      } else {
        alert(res.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await deleteFileConnection(Number(id));
    if (res.success) {
      loadListAndStats();
      if (editingId === id) setIsModalOpen(false);
    } else {
      alert(res.message);
    }
  };

  const handleScan = (_id: string) => {
    alert("스캔 기능은 준비 중입니다.");
    // TODO: 파일 스캔 API 연동
  };

  const formatFileSize = (sizeBytes: number): string => {
    if (sizeBytes >= 1024 * 1024 * 1024 * 1024) {
      return `${(sizeBytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TB`;
    }
    if (sizeBytes >= 1024 * 1024 * 1024) {
      return `${(sizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    if (sizeBytes >= 1024 * 1024) {
      return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${sizeBytes} B`;
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-white">
        <div
          className="size-10 rounded-full border-2 border-[var(--color-main-bg)] border-t-transparent animate-spin"
          aria-hidden
        />
        <p className="text-sm text-[var(--color-sidebar-hover-text)]">
          로딩 중…
        </p>
      </div>
    );
  }

  if (error) {
    const isAuthError =
      error.includes("403") ||
      error.includes("401") ||
      error.toLowerCase().includes("forbidden") ||
      error.includes("권한") ||
      error.includes("인증");
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-white">
        <p>{error}</p>
        {isAuthError && (
          <p className="text-sm text-[var(--color-sidebar-hover-text)]">
            로그인 후 다시 시도해 주세요.
          </p>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            colorScheme="main"
            appearance="outline"
            onClick={() => loadListAndStats()}
          >
            다시 시도
          </Button>
          <Button
            type="button"
            colorScheme="main"
            appearance="outline"
            onClick={() => router.push("/login")}
          >
            로그인 페이지로
          </Button>
        </div>
      </div>
    );
  }

  const totalConnections = stats?.totalConnections ?? 0;
  const activeConnections = stats?.activeConnections ?? 0;
  const totalFiles = stats?.totalFiles ?? 0;
  const totalFileSize = stats?.totalFileSize ?? 0;

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
            {list.map((item) => {
              const { host, port } = parseHost(item.host);
              const statusVariant = statusToVariant(item.status);
              const statusLabel = statusToLabel(item.status);
              const details: ConnectionDetailItem[] = [
                {
                  label: "호스트",
                  value: port ? `${host}:${port}` : item.host,
                },
                { label: "경로", value: "-" },
                {
                  label: "파일",
                  value: `${item.totalFiles.toLocaleString()}개`,
                },
                {
                  label: "파일 용량",
                  value: formatFileSize(item.totalFileSize),
                  highlight: true,
                },
              ];
              const actions: ConnectionActionItem[] = [
                {
                  label: "상세보기",
                  variant: "detail",
                  onClick: () => openViewModal(String(item.id)),
                },
                {
                  label: "스캔",
                  variant: "scan",
                  onClick: () => handleScan(String(item.id)),
                },
                {
                  label: "수정",
                  variant: "edit",
                  onClick: () => openEditModal(String(item.id)),
                  hidden: true,
                },
                {
                  label: "삭제",
                  variant: "delete",
                  onClick: () => handleDelete(String(item.id)),
                },
              ];
              return (
                <ConnectionCard
                  key={item.id}
                  icon={<FileText className="size-full" />}
                  title={item.connectionName}
                  subtitle={`${item.serverTypeName}`}
                  status={statusLabel}
                  statusVariant={statusVariant}
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
                  onClick={() => editingId && openEditModal(editingId)}
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
                  disabled={saveLoading}
                >
                  {saveLoading ? "처리 중…" : isEditMode ? "저장" : "추가"}
                </Button>
              </>
            )}
          </div>
        }
      >
        {modalLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-[var(--color-sidebar-hover-text)]">
            <div
              className="size-8 rounded-full border-2 border-[var(--color-main-bg)] border-t-transparent animate-spin"
              aria-hidden
            />
            <p className="text-sm">로딩 중…</p>
          </div>
        ) : (
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
              {fieldErrors.title && (
                <p className="text-sm text-[var(--color-coral-text)]">
                  {fieldErrors.title}
                </p>
              )}
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

              {isViewMode && detailForModal ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                    보관 기간
                  </label>
                  <div className="h-9 px-3 py-2 rounded-md border-2 border-[var(--color-yellow-border)] bg-[var(--color-yellow-bg)] text-sm text-[var(--color-yellow-text)] flex items-center">
                    {detailForModal.retentionPeriodMonths} 개월
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
                      min={1}
                      value={formData.retentionPeriod}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10) || 0;
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
                  {fieldErrors.retentionPeriod && (
                    <p className="text-sm text-[var(--color-coral-text)]">
                      {fieldErrors.retentionPeriod}
                    </p>
                  )}
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
                {fieldErrors.host && (
                  <p className="text-sm text-[var(--color-coral-text)]">
                    {fieldErrors.host}
                  </p>
                )}
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
                  placeholder="22"
                  colorScheme="main"
                  disabled={isViewMode}
                />
                {fieldErrors.port && (
                  <p className="text-sm text-[var(--color-coral-text)]">
                    {fieldErrors.port}
                  </p>
                )}
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
                  setFormData((prev) => ({
                    ...prev,
                    basePath: e.target.value,
                  }))
                }
                placeholder="/"
                colorScheme="main"
                disabled={isViewMode}
              />
              {fieldErrors.basePath && (
                <p className="text-sm text-[var(--color-coral-text)]">
                  {fieldErrors.basePath}
                </p>
              )}
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
                {fieldErrors.username && (
                  <p className="text-sm text-[var(--color-coral-text)]">
                    {fieldErrors.username}
                  </p>
                )}
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
                  placeholder={
                    isViewMode
                      ? "********"
                      : isEditMode
                        ? "변경 시에만 입력"
                        : "비밀번호를 입력하세요"
                  }
                  colorScheme="main"
                  disabled={isViewMode}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-[var(--color-coral-text)]">
                    {fieldErrors.password}
                  </p>
                )}
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
                {fieldErrors.managerName && (
                  <p className="text-sm text-[var(--color-coral-text)]">
                    {fieldErrors.managerName}
                  </p>
                )}
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
                {fieldErrors.managerEmail && (
                  <p className="text-sm text-[var(--color-coral-text)]">
                    {fieldErrors.managerEmail}
                  </p>
                )}
              </div>
            </div>

            {(isViewMode || isEditMode) && detailForModal && (
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                    연결 상태
                  </label>
                  <div
                    className={`h-9 px-3 py-2 rounded-md border-2 text-sm flex items-center ${
                      detailForModal.status === "CONNECTED"
                        ? "border-[var(--color-green-border)] bg-[var(--color-green-bg)] text-[var(--color-green-text)]"
                        : "border-[var(--color-yellow-border)] bg-[var(--color-yellow-bg)] text-[var(--color-yellow-text)]"
                    }`}
                  >
                    {statusToLabel(detailForModal.status)}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                    총 파일 수
                  </label>
                  <div className="h-9 px-3 py-2 rounded-md border-2 border-[var(--color-purple-border)] bg-[var(--color-purple-bg)] text-sm text-[var(--color-purple-text)] flex items-center">
                    {detailForModal.totalFiles.toLocaleString()} 개
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                    총 파일 용량
                  </label>
                  <div className="h-9 px-3 py-2 rounded-md border-2 border-[var(--color-mint-border)] bg-[var(--color-mint-bg)] text-sm text-[var(--color-mint-text)] flex items-center">
                    {formatFileSize(detailForModal.totalFileSize)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
