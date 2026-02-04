"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Database, CheckCircle2, Table, Columns } from "lucide-react";
import {
  StatCard,
  ConnectionCard,
  Button,
  Modal,
  Input,
  Dropdown,
  LoadingIndicator,
} from "@/shared/ui";
import type {
  ConnectionDbType,
  ConnectionDetailItem,
  ConnectionActionItem,
} from "@/shared/ui";
import {
  getDbConnectionList,
  getDbConnectionStats,
  getDbConnectionDetail,
  createDbConnection,
  updateDbConnection,
  deleteDbConnection,
  scanDbConnection,
} from "@/features/db-connection";
import type { DbmsTypeId } from "@/features/db-connection";
import type {
  DbConnectionListItem,
  DbConnectionDetailItem,
} from "@/features/db-connection";

const DB_TYPE_OPTIONS = [
  {
    value: "postgresql",
    label: "PostgreSQL",
    icon: (
      <Image
        src="/images/postgresql_icon.png"
        alt=""
        width={20}
        height={20}
        className="shrink-0 object-contain"
        aria-hidden
      />
    ),
  },
  {
    value: "oracle",
    label: "Oracle",
    icon: (
      <Image
        src="/images/oracle_icon.png"
        alt=""
        width={20}
        height={20}
        className="shrink-0 object-contain"
        aria-hidden
      />
    ),
  },
  {
    value: "mysql",
    label: "MySQL",
    icon: (
      <Image
        src="/images/mysql_icon.png"
        alt=""
        width={20}
        height={20}
        className="shrink-0 object-contain"
        aria-hidden
      />
    ),
  },
];

/** API dbmsTypeName → UI ConnectionDbType */
function dbmsTypeNameToDbType(name: string): ConnectionDbType {
  const map: Record<string, ConnectionDbType> = {
    MySQL: "mysql",
    PostgreSQL: "postgresql",
    Oracle: "oracle",
  };
  return map[name] ?? "postgresql";
}

/** UI dbType → API dbmsTypeId (1: MySQL, 2: PostgreSQL, 3: Oracle) */
function dbTypeToId(dbType: ConnectionDbType): DbmsTypeId {
  const map: Record<ConnectionDbType, DbmsTypeId> = {
    mysql: 1,
    postgresql: 2,
    oracle: 3,
  };
  return map[dbType];
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

/** 목록 한 건에서 host 문자열 분리 (예: "192.168.1.100:5432") */
function parseHost(hostStr: string): { host: string; port: string } {
  if (hostStr.includes(":")) {
    const [host, port] = hostStr.split(":");
    return { host: host ?? "", port: port ?? "" };
  }
  return { host: hostStr, port: "" };
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

const emptyForm: ConnectionFormData = {
  title: "",
  dbType: "postgresql",
  host: "",
  port: "",
  databaseName: "",
  username: "",
  password: "",
  managerName: "",
  managerEmail: "",
};

/** API 명세 기준 입력 규칙 */
const INPUT_RULES = {
  connectionName: { maxLength: 100 },
  host: { maxLength: 255 },
  port: { min: 1, max: 65535 },
  dbName: { maxLength: 100 },
  username: { maxLength: 100 },
  managerName: { maxLength: 100 },
} as const;

export default function DbConnectionPage() {
  const router = useRouter();
  const [list, setList] = useState<DbConnectionListItem[]>([]);
  const [stats, setStats] = useState<{
    totalConnections: number;
    activeConnections: number;
    totalTables: number;
    totalColumns: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailForModal, setDetailForModal] =
    useState<DbConnectionDetailItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState<ConnectionFormData>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ConnectionFormData, string>>
  >({});
  const [scanningConnectionId, setScanningConnectionId] = useState<
    number | null
  >(null);

  const loadListAndStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [listRes, statsRes] = await Promise.all([
      getDbConnectionList({ page: 0, size: 100 }),
      getDbConnectionStats(),
    ]);
    if (listRes.success && listRes.result) setList(listRes.result.content);
    if (statsRes.success && statsRes.result) setStats(statsRes.result);
    if (!listRes.success) setError(listRes.message);
    else if (!statsRes.success) setError(statsRes.message);
    setLoading(false);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => loadListAndStats(), 0);
    return () => clearTimeout(id);
  }, [loadListAndStats]);

  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      if (!isModalOpen || !editingId || (!isViewMode && !isEditMode)) {
        setDetailForModal(null);
        setModalLoading(false);
        return;
      }
      setModalLoading(true);
      getDbConnectionDetail(Number(editingId))
        .then((res) => {
          if (cancelled) return;
          if (res.success && res.result) {
            const d = res.result;
            setDetailForModal(res.result);
            setFormData({
              title: d.connectionName,
              dbType: dbmsTypeNameToDbType(d.dbmsTypeName ?? "PostgreSQL"),
              host: d.host,
              port: d.port != null ? String(d.port) : "",
              databaseName: d.dbName,
              username: d.username ?? "",
              password: "",
              managerName: d.managerName ?? "",
              managerEmail: d.managerEmail ?? "",
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
    }, 0);
    return () => {
      clearTimeout(id);
      cancelled = true;
      setModalLoading(false);
    };
  }, [isModalOpen, editingId, isViewMode, isEditMode]);

  const clearFieldError = (field: keyof ConnectionFormData) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

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

    if (!formData.databaseName.trim())
      errors.databaseName = "데이터베이스명을 입력해 주세요.";
    else if (formData.databaseName.trim().length > INPUT_RULES.dbName.maxLength)
      errors.databaseName = `최대 ${INPUT_RULES.dbName.maxLength}자까지 입력 가능합니다.`;

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

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSaveLoading(true);
    const baseBody = {
      dbmsTypeId: dbTypeToId(formData.dbType),
      connectionName: formData.title.trim(),
      host: formData.host.trim(),
      port: portNum,
      dbName: formData.databaseName.trim(),
      username: formData.username.trim(),
      managerName: formData.managerName.trim(),
      managerEmail: emailTrim,
    };

    if (isEditMode && editingId) {
      const updateBody =
        formData.password.trim() === ""
          ? { ...baseBody }
          : { ...baseBody, password: formData.password.trim() };
      const res = await updateDbConnection(Number(editingId), updateBody);
      setSaveLoading(false);
      if (res.success) {
        loadListAndStats();
        setIsModalOpen(false);
        alert("수정되었습니다. 목록이 갱신되었습니다.");
      } else {
        alert(res.message);
      }
    } else {
      const res = await createDbConnection({
        ...baseBody,
        password: formData.password.trim(),
      });
      setSaveLoading(false);
      if (res.success) {
        loadListAndStats();
        setIsModalOpen(false);
        alert("저장되었습니다. DB에 반영되었고 목록이 갱신되었습니다.");
      } else {
        alert(res.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await deleteDbConnection(Number(id));
    if (res.success) {
      loadListAndStats();
      if (editingId === id) setIsModalOpen(false);
    } else {
      alert(res.message);
    }
  };

  const handleScan = async (id: string) => {
    const connectionId = Number(id);
    if (scanningConnectionId != null) {
      alert("다른 스캔이 진행 중입니다. 완료 후 다시 시도해 주세요.");
      return;
    }
    setScanningConnectionId(connectionId);
    try {
      const res = await scanDbConnection(connectionId);
      if (res.success && res.result) {
        const r = res.result;
        alert(
          `스캔이 완료되었습니다.\n테이블 ${r.totalTablesCount}개, 컬럼 ${r.totalColumnsCount}개 중 PII 컬럼 ${r.scannedColumnsCount}개 식별`,
        );
        loadListAndStats();
      } else {
        const msg = res.message ?? "";
        const code = res.code ?? "";
        const isNotConnected =
          code === "CONNECTION_NOT_CONNECTED" ||
          code === "DBSCAN4001" ||
          /연결되지 않은|CONNECTION_NOT_CONNECTED/i.test(msg);
        alert(
          isNotConnected
            ? "연결됨 상태인 DB에서만 스캔할 수 있습니다. 연결 상태를 확인해 주세요."
            : msg || "스캔에 실패했습니다.",
        );
      }
    } catch {
      alert("스캔 요청 중 오류가 발생했습니다.");
    } finally {
      setScanningConnectionId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-white">
        <LoadingIndicator message="로딩 중…" size="lg" />
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
  const totalTables = stats?.totalTables ?? 0;
  const totalColumns = stats?.totalColumns ?? 0;

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
            {list.map((item) => {
              const { host, port } = parseHost(item.host);
              const dbType = dbmsTypeNameToDbType(item.dbmsTypeName);
              const statusVariant = statusToVariant(item.status);
              const statusLabel = statusToLabel(item.status);
              const details: ConnectionDetailItem[] = [
                {
                  label: "호스트",
                  value: port ? `${host}:${port}` : item.host,
                },
                { label: "데이터베이스명", value: item.dbName },
                {
                  label: "테이블 수",
                  value: `${item.totalTables.toLocaleString()}개`,
                },
                {
                  label: "컬럼 수",
                  value: `${item.totalColumns.toLocaleString()}개`,
                  highlight: true,
                },
              ];
              const isScanning = scanningConnectionId === item.id;
              const actions: ConnectionActionItem[] = [
                {
                  label: "상세보기",
                  variant: "detail",
                  onClick: () => openViewModal(String(item.id)),
                },
                {
                  label: isScanning ? "스캔 중…" : "스캔",
                  variant: "scan",
                  onClick: isScanning ? undefined : () => handleScan(String(item.id)),
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
                  dbType={dbType}
                  title={item.connectionName}
                  subtitle={item.dbmsTypeName}
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
              : "새 데이터베이스 연결"
        }
        size="wide"
        footer={
          <div className="flex justify-end gap-2">
            {modalLoading ? (
              <div className="flex items-center gap-2 text-sm text-[var(--color-sidebar-hover-text)]">
                <LoadingIndicator size="sm" className="gap-0 min-h-0" message="" />
                <span>로딩 중…</span>
              </div>
            ) : isViewMode ? (
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
                  disabled={saveLoading}
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="connection-title"
              className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
            >
              연결 이름
            </label>
            <Input
              id="connection-title"
              type="text"
              value={formData.title}
              onChange={(e) => {
                clearFieldError("title");
                setFormData((prev) => ({ ...prev, title: e.target.value }));
              }}
              placeholder="연결 이름을 입력하세요"
              colorScheme="main"
              disabled={isViewMode}
              maxLength={INPUT_RULES.connectionName.maxLength}
              aria-invalid={!!fieldErrors.title}
              aria-describedby={
                fieldErrors.title ? "connection-title-error" : undefined
              }
            />
            {fieldErrors.title && (
              <span
                id="connection-title-error"
                className="text-xs text-[var(--color-coral-text)]"
                role="alert"
              >
                {fieldErrors.title}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="connection-db-type"
              className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
            >
              서버 유형
            </label>
            <Dropdown
              id="connection-db-type"
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
              <label
                htmlFor="connection-host"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                호스트
              </label>
              <Input
                id="connection-host"
                type="text"
                value={formData.host}
                onChange={(e) => {
                  clearFieldError("host");
                  setFormData((prev) => ({ ...prev, host: e.target.value }));
                }}
                placeholder="192.168.1.100 또는 example.com"
                colorScheme="main"
                disabled={isViewMode}
                maxLength={INPUT_RULES.host.maxLength}
                aria-invalid={!!fieldErrors.host}
              />
              {fieldErrors.host && (
                <span
                  className="text-xs text-[var(--color-coral-text)]"
                  role="alert"
                >
                  {fieldErrors.host}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="connection-port"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                포트
              </label>
              <Input
                id="connection-port"
                type="text"
                inputMode="numeric"
                value={formData.port}
                onChange={(e) => {
                  clearFieldError("port");
                  const v = e.target.value.replace(/\D/g, "");
                  if (v === "" || parseInt(v, 10) <= INPUT_RULES.port.max) {
                    setFormData((prev) => ({ ...prev, port: v }));
                  }
                }}
                placeholder="5432 / 3306 / 1521"
                colorScheme="main"
                disabled={isViewMode}
                maxLength={5}
                aria-invalid={!!fieldErrors.port}
              />
              {fieldErrors.port && (
                <span
                  className="text-xs text-[var(--color-coral-text)]"
                  role="alert"
                >
                  {fieldErrors.port}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="connection-database-name"
              className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
            >
              데이터베이스명
            </label>
            <Input
              id="connection-database-name"
              type="text"
              value={formData.databaseName}
              onChange={(e) => {
                clearFieldError("databaseName");
                setFormData((prev) => ({
                  ...prev,
                  databaseName: e.target.value,
                }));
              }}
              placeholder="데이터베이스명을 입력하세요"
              colorScheme="main"
              disabled={isViewMode}
              maxLength={INPUT_RULES.dbName.maxLength}
              aria-invalid={!!fieldErrors.databaseName}
            />
            {fieldErrors.databaseName && (
              <span
                className="text-xs text-[var(--color-coral-text)]"
                role="alert"
              >
                {fieldErrors.databaseName}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="connection-username"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                사용자명
              </label>
              <Input
                id="connection-username"
                type="text"
                value={formData.username}
                onChange={(e) => {
                  clearFieldError("username");
                  setFormData((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }));
                }}
                placeholder="사용자명을 입력하세요"
                colorScheme="main"
                disabled={isViewMode}
                maxLength={INPUT_RULES.username.maxLength}
                aria-invalid={!!fieldErrors.username}
              />
              {fieldErrors.username && (
                <span
                  className="text-xs text-[var(--color-coral-text)]"
                  role="alert"
                >
                  {fieldErrors.username}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="connection-password"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                비밀번호
              </label>
              <Input
                id="connection-password"
                type="password"
                value={isViewMode ? "********" : formData.password}
                onChange={(e) => {
                  clearFieldError("password");
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));
                }}
                placeholder={
                  isEditMode ? "변경 시에만 입력" : "비밀번호를 입력하세요"
                }
                colorScheme="main"
                disabled={isViewMode}
                aria-invalid={!!fieldErrors.password}
                readOnly={isViewMode}
              />
              {fieldErrors.password && (
                <span
                  className="text-xs text-[var(--color-coral-text)]"
                  role="alert"
                >
                  {fieldErrors.password}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="connection-manager-name"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                담당자 이름
              </label>
              <Input
                id="connection-manager-name"
                type="text"
                value={formData.managerName}
                onChange={(e) => {
                  clearFieldError("managerName");
                  setFormData((prev) => ({
                    ...prev,
                    managerName: e.target.value,
                  }));
                }}
                placeholder="담당자 이름을 입력하세요"
                colorScheme="main"
                disabled={isViewMode}
                maxLength={INPUT_RULES.managerName.maxLength}
                aria-invalid={!!fieldErrors.managerName}
              />
              {fieldErrors.managerName && (
                <span
                  className="text-xs text-[var(--color-coral-text)]"
                  role="alert"
                >
                  {fieldErrors.managerName}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="connection-manager-email"
                className="text-sm font-medium text-[var(--color-sidebar-hover-text)]"
              >
                담당자 이메일
              </label>
              <Input
                id="connection-manager-email"
                type="email"
                value={formData.managerEmail}
                onChange={(e) => {
                  clearFieldError("managerEmail");
                  setFormData((prev) => ({
                    ...prev,
                    managerEmail: e.target.value,
                  }));
                }}
                placeholder="example@company.com"
                colorScheme="main"
                disabled={isViewMode}
                aria-invalid={!!fieldErrors.managerEmail}
              />
              {fieldErrors.managerEmail && (
                <span
                  className="text-xs text-[var(--color-coral-text)]"
                  role="alert"
                >
                  {fieldErrors.managerEmail}
                </span>
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
                  className={`h-9 px-3 py-2 rounded-md border-2 flex items-center text-sm ${
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
                  총 테이블 수
                </label>
                <div className="h-9 px-3 py-2 rounded-md border-2 border-[var(--color-purple-border)] bg-[var(--color-purple-bg)] text-sm text-[var(--color-purple-text)] flex items-center">
                  {detailForModal.totalTables.toLocaleString()}개
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--color-sidebar-hover-text)]">
                  총 컬럼 수
                </label>
                <div className="h-9 px-3 py-2 rounded-md border-2 border-[var(--color-yellow-border)] bg-[var(--color-yellow-bg)] text-sm text-[var(--color-yellow-text)] flex items-center">
                  {detailForModal.totalColumns.toLocaleString()}개
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
