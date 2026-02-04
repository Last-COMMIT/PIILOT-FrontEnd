# PIILOT API 명세서

## 공통 응답 형식

모든 API는 아래 형식으로 응답합니다.

```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": { ... },
  "timestamp": "2026-01-27T15:30:00"
}
```

## 인증

대부분의 API는 JWT 토큰 인증이 필요합니다. (인증 API 제외)

```
Authorization: Bearer {token}
```

---

# 0. 인증 API

## 0-1. 회원가입

| 항목 | 내용 |
|------|------|
| **Method** | `POST` |
| **Endpoint** | `/api/auth/signup` |
| **인증** | 불필요 |

### 설명

새로운 사용자 계정을 생성합니다. 이메일은 중복될 수 없으며, 비밀번호는 BCrypt로 암호화되어 저장됩니다.

### Request

**Headers**
```
Content-Type: application/json
```

**Body**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "passwordConfirm": "Password123!",
  "name": "홍길동"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | String | O | 이메일 (형식 검증) |
| password | String | O | 비밀번호 (10~16자, 영문+숫자/특수문자 2종 이상 조합) |
| passwordConfirm | String | O | 비밀번호 확인 |
| name | String | O | 이름 (2~50자) |

### Response

**성공 (201 Created)**
```json
{
  "success": true,
  "code": "COMMON201",
  "message": "요청이 성공했습니다.",
  "result": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "role": "USER"
  },
  "timestamp": "2026-01-25T10:00:00"
}
```

**실패 - 비밀번호 불일치 (400 Bad Request)**
```json
{
  "success": false,
  "code": "AUTH4001",
  "message": "비밀번호가 일치하지 않습니다.",
  "result": null,
  "timestamp": "2026-01-25T10:00:00"
}
```

**실패 - 이메일 중복 (409 Conflict)**
```json
{
  "success": false,
  "code": "AUTH4091",
  "message": "이미 존재하는 이메일입니다.",
  "result": null,
  "timestamp": "2026-01-25T10:00:00"
}
```

---

## 0-2. 로그인

| 항목 | 내용 |
|------|------|
| **Method** | `POST` |
| **Endpoint** | `/api/auth/login` |
| **인증** | 불필요 |

### 설명

이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.

### Request

**Headers**
```
Content-Type: application/json
```

**Body**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | String | O | 이메일 |
| password | String | O | 비밀번호 |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "accessTokenExpiresIn": 3600000
  },
  "timestamp": "2026-01-25T10:00:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| accessToken | String | API 요청에 사용할 액세스 토큰 |
| refreshToken | String | 토큰 재발급에 사용할 리프레시 토큰 |
| accessTokenExpiresIn | long | 액세스 토큰 만료 시간 (ms) |

**실패 - 사용자 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "AUTH4041",
  "message": "사용자를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-25T10:00:00"
}
```

**실패 - 비밀번호 오류 (401 Unauthorized)**
```json
{
  "success": false,
  "code": "AUTH4011",
  "message": "비밀번호가 올바르지 않습니다.",
  "result": null,
  "timestamp": "2026-01-25T10:00:00"
}
```

---

## 0-3. 토큰 재발급

| 항목 | 내용 |
|------|------|
| **Method** | `POST` |
| **Endpoint** | `/api/auth/refresh` |
| **인증** | Refresh Token 필요 |

### 설명

리프레시 토큰을 사용하여 새로운 액세스 토큰과 리프레시 토큰을 발급받습니다.

### Request

**Headers**
```
Authorization: Bearer {refreshToken}
```

**Body**: 없음

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "accessTokenExpiresIn": 3600000
  },
  "timestamp": "2026-01-25T10:00:00"
}
```

**실패 - 유효하지 않은 토큰 (401 Unauthorized)**
```json
{
  "success": false,
  "code": "AUTH4012",
  "message": "유효하지 않은 토큰입니다.",
  "result": null,
  "timestamp": "2026-01-25T10:00:00"
}
```

---

# 1. DB 서버 연결 API

## 1-1. DB 연결 생성

| 항목 | 내용 |
|------|------|
| **Method** | `POST` |
| **Endpoint** | `/api/db-connections` |
| **인증** | 필요 |

### 설명

새로운 데이터베이스 서버 연결을 생성합니다. 연결 생성 시 실제 DB 서버에 연결 테스트를 수행하여 연결 상태(CONNECTED/DISCONNECTED)를 설정합니다. 비밀번호는 AES-256-GCM으로 암호화되어 저장됩니다.

### Request

**Headers**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Body**
```json
{
  "dbmsTypeId": 1,
  "connectionName": "운영 DB 서버",
  "host": "192.168.1.100",
  "port": 5432,
  "dbName": "piilot_db",
  "username": "admin",
  "password": "password123",
  "managerName": "홍길동",
  "managerEmail": "hong@example.com"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| dbmsTypeId | Integer | O | DBMS 유형 ID (1: MySQL, 2: PostgreSQL, 3: Oracle) |
| connectionName | String | O | 연결 이름 (최대 100자) |
| host | String | O | 호스트 주소 |
| port | Integer | O | 포트 번호 (1~65535) |
| dbName | String | O | 데이터베이스 이름 (최대 100자) |
| username | String | O | 사용자명 (최대 100자) |
| password | String | O | 비밀번호 (생성 시 필수) |
| managerName | String | O | 담당자 이름 (최대 100자) |
| managerEmail | String | O | 담당자 이메일 |

### Response

**성공 (201 Created)**
```json
{
  "success": true,
  "code": "COMMON201",
  "message": "요청이 성공했습니다.",
  "result": {
    "id": 1,
    "dbmsTypeName": "PostgreSQL",
    "connectionName": "운영 DB 서버",
    "host": "192.168.1.100",
    "port": 5432,
    "dbName": "piilot_db",
    "username": "admin",
    "managerName": "홍길동",
    "managerEmail": "hong@example.com",
    "status": "CONNECTED",
    "createdAt": "2026-01-27T15:30:00"
  },
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 비밀번호 누락 (400 Bad Request)**
```json
{
  "success": false,
  "code": "DBCONN4002",
  "message": "비밀번호는 필수입니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - DBMS 유형 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "DBCONN4041",
  "message": "DBMS 유형을 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 연결 이름 중복 (409 Conflict)**
```json
{
  "success": false,
  "code": "DBCONN4091",
  "message": "이미 존재하는 연결 이름입니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

---

## 1-2. DB 연결 수정

| 항목 | 내용 |
|------|------|
| **Method** | `PUT` |
| **Endpoint** | `/api/db-connections/{connectionId}` |
| **인증** | 필요 |

### 설명

기존 데이터베이스 서버 연결 정보를 수정합니다. 비밀번호를 입력하지 않으면 기존 비밀번호가 유지됩니다. 수정 시에도 연결 테스트를 수행하여 상태를 업데이트합니다. 본인이 생성한 연결만 수정할 수 있습니다.

### Request

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| connectionId | Long | O | 연결 ID |


**Body**
```json
{
  "dbmsTypeId": 1,
  "connectionName": "운영 DB 서버 (수정)",
  "host": "192.168.1.100",
  "port": 5432,
  "dbName": "piilot_db",
  "username": "admin",
  "password": "",
  "managerName": "홍길동",
  "managerEmail": "hong@example.com"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| password | String | X | 비밀번호 (빈 값이면 기존 유지) |
| 나머지 | - | O | 생성 API와 동일 |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "id": 1,
    "dbmsTypeName": "PostgreSQL",
    "connectionName": "운영 DB 서버 (수정)",
    "host": "192.168.1.100",
    "port": 5432,
    "dbName": "piilot_db",
    "username": "admin",
    "managerName": "홍길동",
    "managerEmail": "hong@example.com",
    "status": "CONNECTED",
    "createdAt": "2026-01-27T15:30:00"
  },
  "timestamp": "2026-01-27T15:35:00"
}
```

**실패 - 연결 정보 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "DBCONN4042",
  "message": "DB 연결 정보를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "DBCONN4031",
  "message": "해당 연결에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 연결 이름 중복 (409 Conflict)**
```json
{
  "success": false,
  "code": "DBCONN4091",
  "message": "이미 존재하는 연결 이름입니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

---

## 1-3. DB 연결 삭제

| 항목 | 내용 |
|------|------|
| **Method** | `DELETE` |
| **Endpoint** | `/api/db-connections/{connectionId}` |
| **인증** | 필요 |

### 설명

데이터베이스 서버 연결 정보를 삭제합니다. 본인이 생성한 연결만 삭제할 수 있습니다.

### Request

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| connectionId | Long | O | 연결 ID |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:40:00"
}
```

**실패 - 연결 정보 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "DBCONN4042",
  "message": "DB 연결 정보를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "DBCONN4031",
  "message": "해당 연결에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

---

## 1-4. DB 연결 상세 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/db-connections/{connectionId}` |
| **인증** | 필요 |

### 설명

데이터베이스 서버 연결의 상세 정보를 조회합니다. 연결에 속한 테이블 수와 컬럼 수도 함께 반환됩니다. 보안상 비밀번호는 응답에 포함되지 않습니다. 본인이 생성한 연결만 조회할 수 있습니다.

### Request

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| connectionId | Long | O | 연결 ID |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "id": 1,
    "connectionName": "운영 DB 서버",
    "status": "CONNECTED",
    "dbmsTypeName": "PostgreSQL",
    "host": "192.168.1.100",
    "port": 5432,
    "dbName": "piilot_db",
    "username": "admin",
    "managerName": "홍길동",
    "managerEmail": "hong@example.com",
    "totalTables": 15,
    "totalColumns": 120,
    "isScanning": false
  },
  "timestamp": "2026-01-27T15:30:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| isScanning | Boolean | 스캔 진행 중 여부 (true: 스캔 중, false: 대기) |

**실패 - 연결 정보 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "DBCONN4042",
  "message": "DB 연결 정보를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "DBCONN4031",
  "message": "해당 연결에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

---

## 1-5. DB 연결 목록 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/db-connections` |
| **인증** | 필요 |

### 설명

사용자의 데이터베이스 서버 연결 목록을 조회합니다. 무한 스크롤을 위한 Slice 기반 페이지네이션을 지원합니다. 최신 생성순으로 정렬됩니다.

### Request

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| page | Integer | X | 0 | 페이지 번호 (0부터 시작) |
| size | Integer | X | 10 | 페이지 크기 |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "content": [
      {
        "id": 2,
        "connectionName": "개발 DB 서버",
        "dbmsTypeName": "MySQL",
        "status": "CONNECTED",
        "host": "192.168.1.101:3306",
        "dbName": "dev_db",
        "totalTables": 10,
        "totalColumns": 80,
        "isScanning": true
      },
      {
        "id": 1,
        "connectionName": "운영 DB 서버",
        "dbmsTypeName": "PostgreSQL",
        "status": "DISCONNECTED",
        "host": "192.168.1.100:5432",
        "dbName": "piilot_db",
        "totalTables": 15,
        "totalColumns": 120,
        "isScanning": false
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "first": true,
    "last": true,
    "hasNext": false,
    "numberOfElements": 2
  },
  "timestamp": "2026-01-27T15:30:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| isScanning | Boolean | 스캔 진행 중 여부 (true: 스캔 중, false: 대기) |

---

## 1-6. DB 연결 통계 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/db-connections/stats` |
| **인증** | 필요 |

### 설명

사용자의 데이터베이스 서버 연결 통계를 조회합니다. UI 상단 통계 카드에 표시할 데이터를 반환합니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "totalConnections": 5,
    "activeConnections": 3,
    "totalTables": 45,
    "totalColumns": 320
  },
  "timestamp": "2026-01-27T15:30:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| totalConnections | long | 사용자의 총 DB 연결 수 |
| activeConnections | long | 활성(CONNECTED) 연결 수 |
| totalTables | long | 모든 연결의 총 테이블 수 |
| totalColumns | long | 모든 연결의 총 컬럼 수 |

---

# 2. 파일 서버 연결 API

## 2-1. 파일 서버 연결 생성

| 항목 | 내용 |
|------|------|
| **Method** | `POST` |
| **Endpoint** | `/api/file-connections` |
| **인증** | 필요 |

### 설명

새로운 파일 서버 연결을 생성합니다. FTP, SFTP, WebDAV를 지원합니다. 연결 생성 시 실제 서버에 연결 및 로그인 테스트를 수행하여 연결 상태를 설정합니다. 비밀번호는 AES-256-GCM으로 암호화되어 저장됩니다.

### Request

**Headers**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Body**
```json
{
  "serverTypeId": 5,
  "connectionName": "운영 SFTP 서버",
  "host": "192.168.1.200",
  "port": 22,
  "defaultPath": "/data/files",
  "username": "sftpuser",
  "password": "password123",
  "managerName": "김철수",
  "managerEmail": "kim@example.com",
  "retentionPeriodMonths": 12
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| serverTypeId | Integer | O | 서버 유형 ID (4: FTP, 5: SFTP, 6: WebDAV) |
| connectionName | String | O | 연결 이름 (최대 100자) |
| host | String | O | 호스트 주소 |
| port | Integer | O | 포트 번호 (1~65535) |
| defaultPath | String | O | 기본 경로 (최대 255자) |
| username | String | O | 사용자명 (최대 100자) |
| password | String | O | 비밀번호 (생성 시 필수) |
| managerName | String | O | 담당자 이름 (최대 100자) |
| managerEmail | String | O | 담당자 이메일 |
| retentionPeriodMonths | Integer | O | 파일 보존 기간 (월, 최소 1) |

### Response

**성공 (201 Created)**
```json
{
  "success": true,
  "code": "COMMON201",
  "message": "요청이 성공했습니다.",
  "result": {
    "id": 1,
    "connectionName": "운영 SFTP 서버",
    "status": "CONNECTED",
    "createdAt": "2026-01-27T15:30:00"
  },
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 비밀번호 누락 (400 Bad Request)**
```json
{
  "success": false,
  "code": "FILECONN4002",
  "message": "비밀번호는 필수입니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 지원하지 않는 서버 유형 (400 Bad Request)**
```json
{
  "success": false,
  "code": "FILECONN4003",
  "message": "지원하지 않는 서버 유형입니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 서버 유형 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "FILECONN4041",
  "message": "파일 서버 유형을 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 연결 이름 중복 (409 Conflict)**
```json
{
  "success": false,
  "code": "FILECONN4091",
  "message": "이미 존재하는 연결 이름입니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

---

## 2-2. 파일 서버 연결 수정

| 항목 | 내용 |
|------|------|
| **Method** | `PUT` |
| **Endpoint** | `/api/file-connections/{connectionId}` |
| **인증** | 필요 |

### 설명

기존 파일 서버 연결 정보를 수정합니다. 비밀번호를 입력하지 않으면 기존 비밀번호가 유지됩니다. 수정 시에도 연결 테스트를 수행하여 상태를 업데이트합니다. 본인이 생성한 연결만 수정할 수 있습니다.

### Request

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| connectionId | Long | O | 연결 ID |

**Body**
```json
{
  "serverTypeId": 5,
  "connectionName": "운영 SFTP 서버 (수정)",
  "host": "192.168.1.200",
  "port": 22,
  "defaultPath": "/data/files",
  "username": "sftpuser",
  "password": "",
  "managerName": "김철수",
  "managerEmail": "kim@example.com",
  "retentionPeriodMonths": 24
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| password | String | X | 비밀번호 (빈 값이면 기존 유지) |
| 나머지 | - | O | 생성 API와 동일 |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "id": 1,
    "connectionName": "운영 SFTP 서버 (수정)",
    "status": "CONNECTED",
    "createdAt": "2026-01-27T15:30:00"
  },
  "timestamp": "2026-01-27T15:35:00"
}
```

**실패 - 연결 정보 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "FILECONN4042",
  "message": "파일 서버 연결 정보를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "FILECONN4031",
  "message": "해당 연결에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 연결 이름 중복 (409 Conflict)**
```json
{
  "success": false,
  "code": "FILECONN4091",
  "message": "이미 존재하는 연결 이름입니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

---

## 2-3. 파일 서버 연결 삭제

| 항목 | 내용 |
|------|------|
| **Method** | `DELETE` |
| **Endpoint** | `/api/file-connections/{connectionId}` |
| **인증** | 필요 |

### 설명

파일 서버 연결 정보를 삭제합니다. 본인이 생성한 연결만 삭제할 수 있습니다.

### Request

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| connectionId | Long | O | 연결 ID |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:40:00"
}
```

**실패 - 연결 정보 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "FILECONN4042",
  "message": "파일 서버 연결 정보를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "FILECONN4031",
  "message": "해당 연결에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

---

## 2-4. 파일 서버 연결 상세 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/file-connections/{connectionId}` |
| **인증** | 필요 |

### 설명

파일 서버 연결의 상세 정보를 조회합니다. 연결에 속한 파일 수도 함께 반환됩니다. 보안상 비밀번호는 응답에 포함되지 않습니다. 본인이 생성한 연결만 조회할 수 있습니다.

### Request

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| connectionId | Long | O | 연결 ID |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "id": 1,
    "connectionName": "운영 SFTP 서버",
    "status": "CONNECTED",
    "serverTypeName": "SFTP",
    "host": "192.168.1.200",
    "port": 22,
    "defaultPath": "/data/files",
    "username": "sftpuser",
    "managerName": "김철수",
    "managerEmail": "kim@example.com",
    "retentionPeriodMonths": 12,
    "totalFiles": 1250,
    "totalFileSize": 5368709120,
    "isScanning": false
  },
  "timestamp": "2026-01-27T15:30:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| isScanning | Boolean | 스캔 진행 중 여부 (true: 스캔 중, false: 대기) |

**실패 - 연결 정보 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "FILECONN4042",
  "message": "파일 서버 연결 정보를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "FILECONN4031",
  "message": "해당 연결에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T15:30:00"
}
```

---

## 2-5. 파일 서버 연결 목록 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/file-connections` |
| **인증** | 필요 |

### 설명

사용자의 파일 서버 연결 목록을 조회합니다. 무한 스크롤을 위한 Slice 기반 페이지네이션을 지원합니다. 최신 생성순으로 정렬됩니다.

### Request

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| page | Integer | X | 0 | 페이지 번호 (0부터 시작) |
| size | Integer | X | 10 | 페이지 크기 |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "content": [
      {
        "id": 2,
        "connectionName": "백업 FTP 서버",
        "status": "DISCONNECTED",
        "serverTypeName": "FTP",
        "host": "192.168.1.201:21",
        "totalFiles": 500,
        "totalFileSize": 2147483648,
        "createdAt": "2026-01-27T16:00:00",
        "isScanning": false
      },
      {
        "id": 1,
        "connectionName": "운영 SFTP 서버",
        "status": "CONNECTED",
        "serverTypeName": "SFTP",
        "host": "192.168.1.200:22",
        "totalFiles": 1250,
        "totalFileSize": 5368709120,
        "createdAt": "2026-01-27T15:30:00",
        "isScanning": true
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "first": true,
    "last": true,
    "hasNext": false,
    "numberOfElements": 2
  },
  "timestamp": "2026-01-27T16:30:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| isScanning | Boolean | 스캔 진행 중 여부 (true: 스캔 중, false: 대기) |

---

## 2-6. 파일 서버 연결 통계 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/file-connections/stats` |
| **인증** | 필요 |

### 설명

사용자의 파일 서버 연결 통계를 조회합니다. UI 상단 통계 카드에 표시할 데이터를 반환합니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "totalConnections": 3,
    "activeConnections": 2,
    "totalFiles": 1750,
    "totalFileSize": 7516192768
  },
  "timestamp": "2026-01-27T15:30:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| totalConnections | long | 사용자의 총 파일 서버 연결 수 |
| activeConnections | long | 활성(CONNECTED) 연결 수 |
| totalFiles | long | 모든 연결의 총 파일 수 |
| totalFileSize | long | 모든 연결의 총 파일 용량 (bytes) |

---

# 3. DB 스캔 API

## 3-1. DB 수동 스캔

| 항목 | 내용 |
|------|------|
| **Method** | `POST` |
| **Endpoint** | `/api/db-connections/{connectionId}/scan` |
| **인증** | 필요 |

### 설명

지정한 DB 연결에 대해 전체 스캔을 수행합니다. 5단계 파이프라인(스키마 스캔 → PII 식별 → 암호화 확인 → 후처리 → 이슈 처리)을 동기적으로 실행하고 결과를 반환합니다. CONNECTED 상태인 연결에 대해서만 스캔이 가능합니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| connectionId | Long | O | DB 연결 ID |

**Body**: 없음

### Response

**성공 (201 Created)**
```json
{
  "success": true,
  "code": "COMMON201",
  "message": "요청이 성공했습니다.",
  "result": {
    "scanHistoryId": 1,
    "connectionId": 5,
    "status": "COMPLETED",
    "scanStartTime": "2026-01-27T14:30:00",
    "scanEndTime": "2026-01-27T14:30:05",
    "totalTablesCount": 10,
    "totalColumnsCount": 85,
    "scannedColumnsCount": 4
  },
  "timestamp": "2026-01-27T14:30:05"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| scanHistoryId | Long | 스캔 이력 ID |
| connectionId | Long | DB 연결 ID |
| status | String | 스캔 상태 (COMPLETED / IN_PROGRESS) |
| scanStartTime | LocalDateTime | 스캔 시작 시각 |
| scanEndTime | LocalDateTime | 스캔 종료 시각 |
| totalTablesCount | Long | 총 테이블 수 |
| totalColumnsCount | Long | 총 컬럼 수 |
| scannedColumnsCount | Long | PII로 식별된 컬럼 수 |

**실패 - 연결되지 않은 DB (400 Bad Request)**
```json
{
  "success": false,
  "code": "DBSCAN4001",
  "message": "연결되지 않은 DB입니다.",
  "result": null,
  "timestamp": "2026-01-27T14:30:00"
}
```

**실패 - 연결 정보 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "DBCONN4042",
  "message": "DB 연결 정보를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-27T14:30:00"
}
```

**실패 - 스키마 스캔 실패 (500 Internal Server Error)**
```json
{
  "success": false,
  "code": "DBSCAN5001",
  "message": "스키마 스캔에 실패했습니다.",
  "result": null,
  "timestamp": "2026-01-27T14:30:00"
}
```

**실패 - PII 식별 실패 (500 Internal Server Error)**
```json
{
  "success": false,
  "code": "DBSCAN5002",
  "message": "PII 식별에 실패했습니다.",
  "result": null,
  "timestamp": "2026-01-27T14:30:00"
}
```

**실패 - 암호화 확인 실패 (500 Internal Server Error)**
```json
{
  "success": false,
  "code": "DBSCAN5003",
  "message": "암호화 확인에 실패했습니다.",
  "result": null,
  "timestamp": "2026-01-27T14:30:00"
}
```

---

# 4. 파일 서버 스캔 API

## 4-1. 파일 서버 스캔 시작

| 항목 | 내용 |
|------|------|
| **Method** | `POST` |
| **Endpoint** | `/api/file-connections/{connectionId}/scan` |
| **인증** | 필요 |

### 설명

지정한 파일 서버 연결에 대해 스캔을 시작합니다. 스캔은 비동기로 실행되며, 즉시 202 Accepted와 함께 스캔 이력 ID를 반환합니다. 스캔 진행 상황은 상태 조회 API로 확인할 수 있습니다. CONNECTED 상태인 연결에 대해서만 스캔이 가능합니다.

### 스캔 파이프라인 (4단계)

1. **메타데이터 수집**: 파일 서버에서 파일 목록 및 메타데이터 수집 (SFTP/FTP/WebDAV)
2. **암호화 확인**: PDF, Office 문서 등 파일 암호화 여부 확인
3. **AI 배치 스캔**: AI 서버에 배치 요청으로 PII 탐지
4. **이슈 처리**: 비암호화 + 미마스킹 PII 파일에 대한 이슈 생성/해결

### Request

**Headers**
```
Authorization: Bearer {token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| connectionId | Long | O | 파일 서버 연결 ID |

**Body**: 없음

### Response

**성공 (202 Accepted)**
```json
{
  "success": true,
  "code": "COMMON202",
  "message": "요청이 수락되었습니다.",
  "result": {
    "scanHistoryId": 1,
    "connectionId": 5,
    "status": "IN_PROGRESS",
    "scanStartTime": "2026-02-01T14:30:00"
  },
  "timestamp": "2026-02-01T14:30:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| scanHistoryId | Long | 스캔 이력 ID (상태 조회에 사용) |
| connectionId | Long | 파일 서버 연결 ID |
| status | String | 스캔 상태 (IN_PROGRESS) |
| scanStartTime | LocalDateTime | 스캔 시작 시각 |

**실패 - 연결되지 않은 서버 (400 Bad Request)**
```json
{
  "success": false,
  "code": "FILESCAN4001",
  "message": "연결되지 않은 파일 서버입니다.",
  "result": null,
  "timestamp": "2026-02-01T14:30:00"
}
```

**실패 - 이미 스캔 진행 중 (409 Conflict)**
```json
{
  "success": false,
  "code": "FILESCAN4091",
  "message": "이미 스캔이 진행 중입니다.",
  "result": null,
  "timestamp": "2026-02-01T14:30:00"
}
```

**실패 - 연결 정보 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "FILESCAN4041",
  "message": "파일 서버 연결 정보를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-02-01T14:30:00"
}
```

---

## 4-2. 파일 서버 스캔 상태 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/file-connections/{connectionId}/scan/{scanHistoryId}` |
| **인증** | 필요 |

### 설명

진행 중이거나 완료된 파일 서버 스캔의 상태와 결과를 조회합니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| connectionId | Long | O | 파일 서버 연결 ID |
| scanHistoryId | Long | O | 스캔 이력 ID |

### Response

**성공 - 스캔 완료 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "scanHistoryId": 1,
    "connectionId": 5,
    "status": "COMPLETED",
    "scanStartTime": "2026-02-01T14:30:00",
    "scanEndTime": "2026-02-01T14:35:00",
    "totalFilesCount": 150,
    "totalFilesSize": 1073741824,
    "scannedFilesCount": 45
  },
  "timestamp": "2026-02-01T14:35:00"
}
```

**성공 - 스캔 진행 중 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "scanHistoryId": 1,
    "connectionId": 5,
    "status": "IN_PROGRESS",
    "scanStartTime": "2026-02-01T14:30:00",
    "scanEndTime": null,
    "totalFilesCount": 0,
    "totalFilesSize": 0,
    "scannedFilesCount": 0
  },
  "timestamp": "2026-02-01T14:32:00"
}
```

**성공 - 스캔 실패 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "scanHistoryId": 1,
    "connectionId": 5,
    "status": "FAILED",
    "scanStartTime": "2026-02-01T14:30:00",
    "scanEndTime": "2026-02-01T14:31:00",
    "totalFilesCount": 0,
    "totalFilesSize": 0,
    "scannedFilesCount": 0
  },
  "timestamp": "2026-02-01T14:31:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| scanHistoryId | Long | 스캔 이력 ID |
| connectionId | Long | 파일 서버 연결 ID |
| status | String | 스캔 상태 (IN_PROGRESS, COMPLETED, FAILED) |
| scanStartTime | LocalDateTime | 스캔 시작 시각 |
| scanEndTime | LocalDateTime | 스캔 종료 시각 (진행 중일 때 null) |
| totalFilesCount | Long | 서버의 총 파일 수 |
| totalFilesSize | Long | 총 파일 용량 (bytes) |
| scannedFilesCount | Long | 실제 스캔한 파일 수 (증분 스캔 대상) |

**실패 - 스캔 이력 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "FILESCAN4042",
  "message": "스캔 이력을 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-02-01T14:30:00"
}
```

---

# 5. 공지사항 API

## 4-1. 공지사항 목록 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/notices` |
| **인증** | 필요 |

### 설명

공지사항 목록을 조회합니다. 무한 스크롤을 위한 Slice 기반 페이지네이션을 지원합니다. 최신 생성순으로 정렬됩니다.

### Request

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| page | Integer | X | 0 | 페이지 번호 (0부터 시작) |
| size | Integer | X | 10 | 페이지 크기 |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "content": [
      {
        "id": 2,
        "title": "서비스 점검 안내",
        "authorName": "관리자",
        "createdAt": "2026-01-29T10:00:00"
      },
      {
        "id": 1,
        "title": "서비스 오픈 안내",
        "authorName": "관리자",
        "createdAt": "2026-01-28T09:00:00"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "first": true,
    "last": true,
    "hasNext": false,
    "numberOfElements": 2
  },
  "timestamp": "2026-01-29T15:30:00"
}
```

---

## 4-2. 공지사항 상세 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/notices/{noticeId}` |
| **인증** | 필요 |

### 설명

공지사항의 상세 내용을 조회합니다.

### Request

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| noticeId | Long | O | 공지사항 ID |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "id": 1,
    "title": "서비스 오픈 안내",
    "content": "안녕하세요. PIILOT 서비스가 오픈되었습니다.",
    "authorName": "관리자",
    "createdAt": "2026-01-28T09:00:00"
  },
  "timestamp": "2026-01-29T15:30:00"
}
```

**실패 - 공지사항 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "NOTICE4041",
  "message": "공지사항을 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-29T15:30:00"
}
```

---

## 4-3. 공지사항 생성 (관리자)

| 항목 | 내용 |
|------|------|
| **Method** | `POST` |
| **Endpoint** | `/api/admin/notices` |
| **인증** | 필요 (관리자) |

### 설명

새로운 공지사항을 생성합니다. 관리자만 접근 가능합니다.

### Request

**Headers**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Body**
```json
{
  "title": "서비스 점검 안내",
  "content": "2026년 1월 30일 02:00 ~ 04:00 서비스 점검이 예정되어 있습니다."
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | String | O | 제목 (최대 100자) |
| content | String | O | 내용 |

### Response

**성공 (201 Created)**
```json
{
  "success": true,
  "code": "COMMON201",
  "message": "요청이 성공했습니다.",
  "result": {
    "id": 3,
    "title": "서비스 점검 안내",
    "authorName": "관리자",
    "createdAt": "2026-01-29T16:00:00"
  },
  "timestamp": "2026-01-29T16:00:00"
}
```

---

## 4-4. 공지사항 삭제 (관리자)

| 항목 | 내용 |
|------|------|
| **Method** | `DELETE` |
| **Endpoint** | `/api/admin/notices/{noticeId}` |
| **인증** | 필요 (관리자) |

### 설명

공지사항을 삭제합니다. 관리자만 접근 가능합니다.

### Request

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| noticeId | Long | O | 공지사항 ID |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": null,
  "timestamp": "2026-01-29T16:30:00"
}
```

**실패 - 공지사항 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "NOTICE4041",
  "message": "공지사항을 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-29T16:30:00"
}
```

---

# 6. DB 개인정보 목록 API

## 6-1. DB PII 커넥션 목록 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/db-pii/connections` |
| **인증** | 필요 |

### 설명

필터 드롭다운용 DB 커넥션 목록을 조회합니다. 사용자가 소유한 모든 DB 연결을 연결명 알파벳순으로 반환합니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": [
    {
      "id": 1,
      "connectionName": "개발 DB",
      "dbmsTypeName": "MySQL"
    },
    {
      "id": 2,
      "connectionName": "운영 DB",
      "dbmsTypeName": "PostgreSQL"
    }
  ],
  "timestamp": "2026-01-30T10:00:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | 커넥션 ID |
| connectionName | String | 커넥션 이름 |
| dbmsTypeName | String | DBMS 유형명 (MySQL, PostgreSQL 등) |

---

## 6-2. DB PII 테이블 목록 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/db-pii/connections/{connectionId}/tables` |
| **인증** | 필요 |

### 설명

선택한 커넥션의 테이블 목록을 조회합니다. 테이블명 알파벳순으로 반환합니다. 본인 소유 연결만 조회 가능합니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| connectionId | Long | O | 커넥션 ID |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": [
    {
      "id": 1,
      "tableName": "customers"
    },
    {
      "id": 2,
      "tableName": "orders"
    },
    {
      "id": 3,
      "tableName": "users"
    }
  ],
  "timestamp": "2026-01-30T10:00:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | 테이블 ID |
| tableName | String | 테이블명 |

**실패 - 연결 정보 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "DBPII4041",
  "message": "DB 연결 정보를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-30T10:00:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "DBPII4031",
  "message": "해당 연결에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-01-30T10:00:00"
}
```

---

## 6-3. DB PII 컬럼 목록 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/db-pii/columns` |
| **인증** | 필요 |

### 설명

DB 개인정보 컬럼 목록과 통계를 조회합니다. 다양한 필터 조건을 지원하며, 무한 스크롤을 위한 Slice 기반 페이지네이션을 사용합니다. 마지막 스캔 시각 기준 최신순으로 정렬됩니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| connectionId | Long | X | - | 커넥션 ID 필터 |
| tableId | Long | X | - | 테이블 ID 필터 |
| piiType | String | X | - | PII 유형 필터 (NM, EM, PH, RRN, ADD, IP, ACN, PP) |
| encrypted | Boolean | X | - | 암호화 여부 (true: 암호화됨, false: 보안필요) |
| riskLevel | String | X | - | 위험도 필터 (HIGH, MEDIUM, LOW) |
| keyword | String | X | - | 컬럼명 검색어 |
| page | Integer | X | 0 | 페이지 번호 (0부터 시작) |
| size | Integer | X | 20 | 페이지 크기 |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "stats": {
      "totalItems": 42,
      "highRiskItems": 15,
      "encryptionRate": 85.5,
      "totalRecords": 125000
    },
    "content": {
      "content": [
        {
          "id": 1,
          "connectionName": "운영 DB",
          "dbmsTypeName": "PostgreSQL",
          "tableName": "users",
          "columnName": "email",
          "piiTypeName": "이메일",
          "piiTypeCode": "EM",
          "encrypted": false,
          "riskLevel": "HIGH",
          "lastScannedAt": "2026-01-29T02:00:00"
        },
        {
          "id": 2,
          "connectionName": "운영 DB",
          "dbmsTypeName": "PostgreSQL",
          "tableName": "customers",
          "columnName": "phone",
          "piiTypeName": "전화번호",
          "piiTypeCode": "PH",
          "encrypted": true,
          "riskLevel": "LOW",
          "lastScannedAt": "2026-01-29T02:00:00"
        }
      ],
      "pageable": {
        "pageNumber": 0,
        "pageSize": 20
      },
      "first": true,
      "last": false,
      "hasNext": true,
      "numberOfElements": 2
    }
  },
  "timestamp": "2026-01-30T10:00:00"
}
```

**stats 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| totalItems | Long | 필터 조건에 맞는 총 PII 컬럼 수 |
| highRiskItems | Long | 고위험(HIGH) 등급 컬럼 수 |
| encryptionRate | Double | 암호화율 (%, 소수점 1자리) |
| totalRecords | Long | 총 레코드 수 |

**content 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | PII 컬럼 ID |
| connectionName | String | DB 연결명 |
| dbmsTypeName | String | DBMS 유형명 |
| tableName | String | 테이블명 |
| columnName | String | 컬럼명 |
| piiTypeName | String | PII 유형 한글명 (이름, 이메일 등) |
| piiTypeCode | String | PII 유형 코드 (NM, EM 등) |
| encrypted | Boolean | 암호화 여부 (true: 완전 암호화, false: 보안필요) |
| riskLevel | String | 위험도 (HIGH, MEDIUM, LOW) |
| lastScannedAt | LocalDateTime | 마지막 스캔 시각 |

**암호화 여부 판별 로직**
- `encrypted = true`: encRecordsCount = totalRecordsCount (모든 레코드 암호화)
- `encrypted = false`: encRecordsCount ≠ totalRecordsCount 또는 null (일부/전체 미암호화)

**실패 - 연결 정보 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "DBPII4041",
  "message": "DB 연결 정보를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-30T10:00:00"
}
```

**실패 - 테이블 정보 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "DBPII4042",
  "message": "테이블을 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-30T10:00:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "DBPII4031",
  "message": "해당 연결에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-01-30T10:00:00"
}
```

---

# 7. DB 개인정보 이슈 API

## 7-1. 이슈 목록 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/db-pii/issues` |
| **인증** | 필요 |

### 설명

DB 개인정보 이슈 목록과 통계를 조회합니다. 테이블별로 그룹화되며, 이슈가 많은 테이블 순으로 정렬됩니다. ACTIVE 상태인 이슈만 조회됩니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| page | Integer | X | 0 | 페이지 번호 (0부터 시작) |
| size | Integer | X | 10 | 페이지 크기 (테이블 그룹 단위) |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "stats": {
      "totalIssues": 9,
      "highRiskCount": 3,
      "mediumRiskCount": 3,
      "lowRiskCount": 3,
      "totalRecords": 3630
    },
    "content": {
      "content": [
        {
          "tableId": 2,
          "tableName": "orders",
          "connectionName": "운영 DB",
          "dbmsTypeName": "PostgreSQL",
          "issueCount": 2,
          "issues": [
            {
              "issueId": 3,
              "columnName": "delivery_address",
              "piiTypeName": "주소",
              "piiTypeCode": "ADD",
              "totalRecordsCount": 89000,
              "riskLevel": "HIGH",
              "userStatus": "RUNNING",
              "detectedAt": "2026-01-29T02:00:00"
            },
            {
              "issueId": 4,
              "columnName": "phone_number",
              "piiTypeName": "전화번호",
              "piiTypeCode": "PH",
              "totalRecordsCount": 125000,
              "riskLevel": "MEDIUM",
              "userStatus": "DONE",
              "detectedAt": "2026-01-29T02:00:00"
            }
          ]
        },
        {
          "tableId": 1,
          "tableName": "users",
          "connectionName": "운영 DB",
          "dbmsTypeName": "PostgreSQL",
          "issueCount": 1,
          "issues": [
            {
              "issueId": 1,
              "columnName": "email",
              "piiTypeName": "이메일",
              "piiTypeCode": "EM",
              "totalRecordsCount": 125000,
              "riskLevel": "LOW",
              "userStatus": "RUNNING",
              "detectedAt": "2026-01-29T02:00:00"
            }
          ]
        }
      ],
      "pageable": {
        "pageNumber": 0,
        "pageSize": 10
      },
      "first": true,
      "last": false,
      "hasNext": true,
      "numberOfElements": 2
    }
  },
  "timestamp": "2026-01-30T15:00:00"
}
```

**stats 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| totalIssues | Long | ACTIVE 상태인 총 이슈 수 |
| highRiskCount | Long | 고위험(HIGH) 이슈 수 |
| mediumRiskCount | Long | 중위험(MEDIUM) 이슈 수 |
| lowRiskCount | Long | 저위험(LOW) 이슈 수 |
| totalRecords | Long | 이슈 컬럼들의 총 레코드 수 합계 |

**issues 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| issueId | Long | 이슈 ID |
| columnName | String | 컬럼명 |
| piiTypeName | String | PII 유형 한글명 |
| piiTypeCode | String | PII 유형 코드 |
| totalRecordsCount | Long | 총 레코드 수 |
| riskLevel | String | 위험도 (HIGH, MEDIUM, LOW) |
| userStatus | String | 작업 상태 (ISSUE, RUNNING, DONE) |
| detectedAt | LocalDateTime | 탐지 시각 |

---

## 7-2. 이슈 상세 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/db-pii/issues/{issueId}` |
| **인증** | 필요 |

### 설명

DB 개인정보 이슈의 상세 정보와 비암호화 데이터 목록을 조회합니다. 비암호화 데이터는 대상 DB에 직접 접속하여 조회합니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| issueId | Long | O | 이슈 ID |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "issueId": 1,
    "connectionName": "운영 DB",
    "dbmsTypeName": "PostgreSQL",
    "tableName": "users",
    "columnName": "email",
    "piiTypeName": "이메일",
    "piiTypeCode": "EM",
    "totalRecordsCount": 125000,
    "encRecordsCount": 124900,
    "unencryptedCount": 100,
    "riskLevel": "MEDIUM",
    "userStatus": "ISSUE",
    "issueStatus": "ACTIVE",
    "detectedAt": "2026-01-29T02:00:00",
    "managerName": "홍길동 대리",
    "managerEmail": "honggildong@naver.com",
    "unencryptedRecords": [
      { "primaryKey": "2000000", "value": "honggildong@naver.com" },
      { "primaryKey": "2000001", "value": "minsu.kim@gmail.com" },
      { "primaryKey": "2000002", "value": "jiyoon.lee@hanmail.net" }
    ]
  },
  "timestamp": "2026-01-30T15:00:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| issueId | Long | 이슈 ID |
| connectionName | String | DB 연결명 |
| dbmsTypeName | String | DBMS 유형명 |
| tableName | String | 테이블명 |
| columnName | String | 컬럼명 |
| piiTypeName | String | PII 유형 한글명 |
| piiTypeCode | String | PII 유형 코드 |
| totalRecordsCount | Long | 총 레코드 수 |
| encRecordsCount | Long | 암호화된 레코드 수 |
| unencryptedCount | Long | 비암호화 레코드 수 (계산값) |
| riskLevel | String | 위험도 |
| userStatus | String | 작업 상태 (ISSUE, RUNNING, DONE) |
| issueStatus | String | 이슈 상태 (ACTIVE, RESOLVED) |
| detectedAt | LocalDateTime | 탐지 시각 |
| managerName | String | 담당자 이름 |
| managerEmail | String | 담당자 이메일 |
| unencryptedRecords | Array | 비암호화 데이터 목록 (최대 100건) |

**unencryptedRecords 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| primaryKey | String | 레코드의 PK 값 |
| value | String | 해당 PII 컬럼의 값 |

**실패 - 이슈 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "DBPII4043",
  "message": "이슈를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-30T15:00:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "DBPII4032",
  "message": "해당 이슈에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-01-30T15:00:00"
}
```

---

## 7-3. 작업 상태 변경

| 항목 | 내용 |
|------|------|
| **Method** | `PATCH` |
| **Endpoint** | `/api/db-pii/issues/{issueId}/status` |
| **인증** | 필요 |

### 설명

DB 개인정보 이슈의 작업 상태를 변경합니다. 사용자가 이슈 처리 진행 상황을 트래킹하기 위해 사용합니다.

### Request

**Headers**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| issueId | Long | O | 이슈 ID |

**Body**
```json
{
  "userStatus": "RUNNING"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| userStatus | String | O | 작업 상태 (ISSUE, RUNNING, DONE) |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "issueId": 1,
    "userStatus": "RUNNING",
    "updatedAt": "2026-01-30T15:30:00"
  },
  "timestamp": "2026-01-30T15:30:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| issueId | Long | 이슈 ID |
| userStatus | String | 변경된 작업 상태 |
| updatedAt | LocalDateTime | 변경 시각 |

**실패 - 이슈 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "DBPII4043",
  "message": "이슈를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-01-30T15:30:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "DBPII4032",
  "message": "해당 이슈에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-01-30T15:30:00"
}
```

---

# 8. 파일 마스킹 API

## 8-1. 파일 마스킹 커넥션 목록 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/file-masking/connections` |
| **인증** | 필요 |

### 설명

마스킹 대상 파일이 있는 파일 서버 커넥션 목록을 조회합니다. 필터 드롭다운용으로 사용됩니다.

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": [
    { "connectionId": 1, "connectionName": "Legacy NAS Share" },
    { "connectionId": 2, "connectionName": "Official S3 Bucket" }
  ],
  "timestamp": "2026-02-02T10:00:00"
}
```

---

## 8-2. 이슈 파일 목록 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/file-masking/files` |
| **인증** | 필요 |

### 설명

마스킹 대상 파일 목록을 조회합니다. 페이징 없이 전체 목록을 반환합니다.

### 조회 조건

- `hasPersonalInfo = true` (개인정보 포함)
- `isEncrypted = false` (암호화되지 않음)
- `isIssueOpen = true` (이슈 존재)
- `maskedPiisCount < totalPiisCount` (미마스킹 PII 존재)

### Request

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| connectionId | Long | X | 파일 서버 연결 ID |
| fileCategory | String | X | 파일 유형 (DOCUMENT, PHOTO, AUDIO, VIDEO) |
| riskLevel | String | X | 위험도 (HIGH, MEDIUM, LOW) |
| fileName | String | X | 파일명 검색어 |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": [
    {
      "fileId": 1,
      "connectionId": 1,
      "connectionName": "Legacy NAS Share",
      "fileName": "user_guide.png",
      "filePath": "/desktop/user/add/user_guide.png",
      "fileCategory": "PHOTO",
      "extension": "PNG",
      "riskLevel": "HIGH"
    }
  ],
  "timestamp": "2026-02-02T10:00:00"
}
```

---

## 8-3. 파일 미리보기

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/file-masking/files/{fileId}/preview` |
| **인증** | 필요 |

### 설명

원본 파일의 미리보기를 조회합니다. 파일 서버에서 다운로드하여 Base64로 인코딩하여 반환합니다.

### 파일 크기 제한

- 20MB 미만: Base64로 미리보기 제공
- 20MB 이상: `previewAvailable: false`, 미리보기 미지원 메시지

### Request

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| fileId | Long | O | 파일 ID |

### Response

**성공 - 미리보기 가능 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "fileId": 1,
    "fileName": "user_guide.png",
    "fileCategory": "PHOTO",
    "mimeType": "image/png",
    "fileSize": 2048000,
    "previewAvailable": true,
    "content": "base64EncodedContent...",
    "previewMessage": null
  },
  "timestamp": "2026-02-02T10:00:00"
}
```

**성공 - 미리보기 불가 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "fileId": 1,
    "fileName": "large_video.mp4",
    "fileCategory": "VIDEO",
    "mimeType": "video/mp4",
    "fileSize": 52428800,
    "previewAvailable": false,
    "content": null,
    "previewMessage": "파일 크기가 20MB를 초과하여 미리보기를 지원하지 않습니다."
  },
  "timestamp": "2026-02-02T10:00:00"
}
```

**실패 - 파일 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "MASKING4041",
  "message": "파일을 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-02-02T10:00:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "MASKING4031",
  "message": "파일 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-02-02T10:00:00"
}
```

---

## 8-4. 파일 마스킹 변환

| 항목 | 내용 |
|------|------|
| **Method** | `POST` |
| **Endpoint** | `/api/file-masking/files/{fileId}/mask` |
| **인증** | 필요 |

### 설명

AI 서버를 호출하여 파일을 마스킹 처리합니다. 결과는 Redis에 30분간 캐싱됩니다. 이미 캐시된 결과가 있으면 AI 서버 호출 없이 바로 반환됩니다.

### Request

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| fileId | Long | O | 파일 ID |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "fileId": 1,
    "originalFileName": "user_guide.png",
    "maskedFileName": "user_guide_masked.png",
    "fileCategory": "PHOTO",
    "mimeType": "image/png",
    "previewAvailable": true,
    "maskedContent": "base64EncodedMaskedContent...",
    "previewMessage": null
  },
  "timestamp": "2026-02-02T10:00:00"
}
```

**실패 - 마스킹 대상 아님 (400 Bad Request)**
```json
{
  "success": false,
  "code": "MASKING4001",
  "message": "마스킹 대상 파일이 아닙니다.",
  "result": null,
  "timestamp": "2026-02-02T10:00:00"
}
```

**실패 - AI 서버 연결 실패 (503 Service Unavailable)**
```json
{
  "success": false,
  "code": "MASKING5031",
  "message": "AI 서버 연결에 실패했습니다.",
  "result": null,
  "timestamp": "2026-02-02T10:00:00"
}
```

---

## 8-5. 마스킹 결과 저장

| 항목 | 내용 |
|------|------|
| **Method** | `POST` |
| **Endpoint** | `/api/file-masking/files/{fileId}/save` |
| **인증** | 필요 |

### 설명

마스킹된 파일을 저장하고 원본 파일을 암호화합니다. Redis에서 마스킹 결과를 조회하여 사용합니다.

### 저장 프로세스

1. Redis에서 마스킹된 파일 조회 (`masking:{userId}:{fileId}`)
2. 원본 파일 다운로드 → ZIP 압축 + 비밀번호 암호화
3. ZIP 파일 업로드 (원본 삭제 전 먼저 업로드하여 데이터 유실 방지)
4. 마스킹 파일 업로드 (`_masked` 접미사) - 실패 시 ZIP 파일 롤백 삭제
5. 원본 파일 삭제 (모든 업로드 성공 후에만 삭제)
6. DB 업데이트:
   - File: filePath → ZIP 경로, name → ZIP 파일명, fileType → ARCHIVE, isEncrypted → true, isIssueOpen → false
   - FilePii: 모든 PII를 마스킹됨으로 처리
   - FilePiiIssue: RESOLVED로 변경
7. MaskingLog 기록 생성
8. Redis 키 삭제

### Request

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| fileId | Long | O | 파일 ID |

**Body**
```json
{
  "encryptionPassword": "user_password_123"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| encryptionPassword | String | O | ZIP 암호화 비밀번호 (4~50자) |

### Response

**성공 (201 Created)**
```json
{
  "success": true,
  "code": "COMMON201",
  "message": "요청이 성공했습니다.",
  "result": {
    "fileId": 1,
    "originalZipPath": "/desktop/user/add/user_guide.zip",
    "maskedFilePath": "/desktop/user/add/user_guide_masked.png",
    "message": "마스킹이 완료되었습니다."
  },
  "timestamp": "2026-02-02T10:00:00"
}
```

**실패 - 마스킹 결과 만료 (400 Bad Request)**
```json
{
  "success": false,
  "code": "MASKING4003",
  "message": "마스킹 결과가 만료되었습니다. 다시 마스킹해주세요.",
  "result": null,
  "timestamp": "2026-02-02T10:00:00"
}
```

**실패 - 파일 업로드 실패 (500 Internal Server Error)**
```json
{
  "success": false,
  "code": "MASKING5002",
  "message": "파일 업로드에 실패했습니다.",
  "result": null,
  "timestamp": "2026-02-02T10:00:00"
}
```

---

# 9. 파일 개인정보 목록 API

## 9-1. 파일 PII 커넥션 목록 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/file-pii/connections` |
| **인증** | 필요 |

### 설명

필터 드롭다운용 파일 서버 커넥션 목록을 조회합니다. 사용자가 소유한 모든 파일 서버 연결을 연결명 알파벳순으로 반환합니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": [
    {
      "id": 1,
      "connectionName": "S3 Document Storage",
      "serverTypeName": "S3"
    },
    {
      "id": 2,
      "connectionName": "Legacy NAS Share",
      "serverTypeName": "SFTP"
    }
  ],
  "timestamp": "2026-02-03T10:00:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | 커넥션 ID |
| connectionName | String | 커넥션 이름 |
| serverTypeName | String | 서버 유형명 (FTP, SFTP 등) |

---

## 9-2. 파일 PII 목록 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/file-pii/files` |
| **인증** | 필요 |

### 설명

파일 개인정보 목록과 통계를 조회합니다. 다양한 필터 조건을 지원하며, 무한 스크롤을 위한 Slice 기반 페이지네이션을 사용합니다. 마지막 스캔 시각 기준 최신순으로 정렬됩니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| connectionId | Long | X | - | 커넥션 ID 필터 |
| category | String | X | - | 파일 카테고리 (DOCUMENT, PHOTO, VIDEO, AUDIO) |
| masked | Boolean | X | - | 마스킹 여부 (true: 완료, false: 미완료) |
| riskLevel | String | X | - | 위험도 필터 (HIGH, MEDIUM, LOW) |
| keyword | String | X | - | 파일명 검색어 |
| page | Integer | X | 0 | 페이지 번호 (0부터 시작) |
| size | Integer | X | 20 | 페이지 크기 |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "stats": {
      "totalFiles": 8,
      "highRiskCount": 3,
      "maskingRate": 55.0,
      "totalFileSize": 6917529027
    },
    "content": {
      "content": [
        {
          "fileId": 1,
          "connectionName": "S3 Document Storage",
          "serverTypeName": "S3",
          "fileName": "user_guide.txt",
          "filePath": "desktop/user/add",
          "fileCategory": "DOCUMENT",
          "fileCategoryName": "문서",
          "masked": false,
          "riskLevel": "LOW",
          "lastScannedAt": "2026-01-19T02:00:00"
        },
        {
          "fileId": 2,
          "connectionName": "Legacy NAS Share",
          "serverTypeName": "SFTP",
          "fileName": "reservation_info.txt",
          "filePath": "desktop/reservation/detail",
          "fileCategory": "DOCUMENT",
          "fileCategoryName": "문서",
          "masked": true,
          "riskLevel": "MEDIUM",
          "lastScannedAt": "2026-01-18T23:00:00"
        }
      ],
      "pageable": {
        "pageNumber": 0,
        "pageSize": 20
      },
      "first": true,
      "last": false,
      "hasNext": true,
      "numberOfElements": 2
    }
  },
  "timestamp": "2026-02-03T10:00:00"
}
```

**stats 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| totalFiles | Long | 필터 조건에 맞는 총 파일 수 |
| highRiskCount | Long | 고위험(HIGH) 등급 파일 수 |
| maskingRate | Double | 마스킹율 (%, 소수점 1자리) |
| totalFileSize | Long | 총 파일 용량 (bytes) |

**content 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| fileId | Long | 파일 ID |
| connectionName | String | 파일 서버 연결명 |
| serverTypeName | String | 서버 유형명 |
| fileName | String | 파일명 |
| filePath | String | 파일 경로 |
| fileCategory | String | 파일 카테고리 코드 |
| fileCategoryName | String | 파일 카테고리 한글명 |
| masked | Boolean | 마스킹 여부 (true: 완료, false: 미완료) |
| riskLevel | String | 위험도 (HIGH, MEDIUM, LOW) |
| lastScannedAt | LocalDateTime | 마지막 스캔 시각 |

**마스킹 여부 판별 로직**
- `masked = true`: 모든 FilePii의 totalPiisCount = maskedPiisCount (완전 마스킹)
- `masked = false`: 하나라도 totalPiisCount ≠ maskedPiisCount (일부/전체 미마스킹)

**실패 - 연결 정보 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "FILEPII4041",
  "message": "파일 서버 연결 정보를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-02-03T10:00:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "FILEPII4031",
  "message": "해당 연결에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-02-03T10:00:00"
}
```

---

# 10. 파일 개인정보 이슈 API

## 10-1. 이슈 목록 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/file-pii/issues` |
| **인증** | 필요 |

### 설명

파일 개인정보 이슈 목록과 통계를 조회합니다. 파일 서버(Connection)별로 그룹화되며, 이슈가 많은 서버 순으로 정렬됩니다. ACTIVE 상태인 이슈만 조회됩니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| page | Integer | X | 0 | 페이지 번호 (0부터 시작) |
| size | Integer | X | 10 | 페이지 크기 (서버 그룹 단위) |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "stats": {
      "totalIssues": 12,
      "highRiskCount": 4,
      "mediumRiskCount": 5,
      "lowRiskCount": 3,
      "totalPiiCount": 156
    },
    "content": {
      "content": [
        {
          "connectionId": 1,
          "connectionName": "S3 Document Storage",
          "serverTypeName": "SFTP",
          "managerName": "김철수 대리",
          "issueCount": 3,
          "issues": [
            {
              "issueId": 1,
              "fileName": "profile_photo.png",
              "filePath": "/uploads/profile_photo.png",
              "totalPiiCount": 9,
              "piiTypes": ["이름", "주민번호", "얼굴"],
              "riskLevel": "HIGH",
              "userStatus": "ISSUE",
              "detectedAt": "2026-01-13T04:00:00"
            }
          ]
        }
      ],
      "pageable": {
        "pageNumber": 0,
        "pageSize": 10
      },
      "first": true,
      "last": false,
      "hasNext": true,
      "numberOfElements": 1
    }
  },
  "timestamp": "2026-02-03T10:00:00"
}
```

**stats 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| totalIssues | Long | ACTIVE 상태인 총 이슈 수 |
| highRiskCount | Long | 고위험(HIGH) 이슈 수 |
| mediumRiskCount | Long | 중위험(MEDIUM) 이슈 수 |
| lowRiskCount | Long | 저위험(LOW) 이슈 수 |
| totalPiiCount | Long | 총 PII 개수 합계 |

**issues 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| issueId | Long | 이슈 ID |
| fileName | String | 파일명 |
| filePath | String | 파일 경로 |
| totalPiiCount | Integer | 총 PII 개수 |
| piiTypes | Array | PII 유형 한글명 목록 |
| riskLevel | String | 위험도 (HIGH, MEDIUM, LOW) |
| userStatus | String | 작업 상태 (ISSUE, RUNNING, DONE) |
| detectedAt | LocalDateTime | 탐지 시각 |

---

## 10-2. 이슈 상세 조회

| 항목 | 내용 |
|------|------|
| **Method** | `GET` |
| **Endpoint** | `/api/file-pii/issues/{issueId}` |
| **인증** | 필요 |

### 설명

파일 개인정보 이슈의 상세 정보와 원본 파일 미리보기(base64)를 조회합니다. 파일 크기가 20MB를 초과하거나 다운로드 실패 시 미리보기가 제공되지 않습니다.

### Request

**Headers**
```
Authorization: Bearer {token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| issueId | Long | O | 이슈 ID |

### Response

**성공 - 미리보기 가능 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "issueId": 1,
    "connectionName": "S3 Document Storage",
    "serverTypeName": "SFTP",
    "fileName": "profile_photo.png",
    "filePath": "/uploads/profile_photo.png",
    "fileExtension": "png",
    "fileCategory": "PNG",
    "fileCategoryName": "사진",
    "mimeType": "image/png",
    "previewAvailable": true,
    "fileContent": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAA...",
    "previewMessage": null,
    "totalPiiCount": 9,
    "maskedPiiCount": 0,
    "unmaskedPiiCount": 9,
    "riskLevel": "MEDIUM",
    "userStatus": "ISSUE",
    "issueStatus": "ACTIVE",
    "detectedAt": "2026-01-13T04:00:00",
    "managerName": "김철수 대리",
    "managerEmail": "chulsoo123@gmail.com",
    "piiDetails": [
      {"piiTypeName": "이름", "piiTypeCode": "NM", "count": 3},
      {"piiTypeName": "주민번호", "piiTypeCode": "RRN", "count": 2},
      {"piiTypeName": "얼굴", "piiTypeCode": "FACE", "count": 4}
    ]
  },
  "timestamp": "2026-02-03T10:00:00"
}
```

**성공 - 미리보기 불가 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "issueId": 2,
    "previewAvailable": false,
    "fileContent": null,
    "previewMessage": "파일 크기가 20MB를 초과하여 미리보기를 지원하지 않습니다."
  },
  "timestamp": "2026-02-03T10:00:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| issueId | Long | 이슈 ID |
| connectionName | String | 파일 서버 연결명 |
| serverTypeName | String | 서버 유형명 (SFTP, FTP 등) |
| fileName | String | 파일명 |
| filePath | String | 파일 경로 |
| fileExtension | String | 파일 확장자 (소문자) |
| fileCategory | String | 파일 유형 (대문자) |
| fileCategoryName | String | 파일 카테고리 한글명 |
| mimeType | String | MIME 타입 |
| previewAvailable | Boolean | 미리보기 가능 여부 |
| fileContent | String | base64 인코딩된 파일 내용 |
| previewMessage | String | 미리보기 불가 시 안내 메시지 |
| totalPiiCount | Integer | 총 PII 개수 |
| maskedPiiCount | Integer | 마스킹된 PII 개수 |
| unmaskedPiiCount | Integer | 미마스킹 PII 개수 |
| riskLevel | String | 위험도 (HIGH, MEDIUM, LOW) |
| userStatus | String | 작업 상태 (ISSUE, RUNNING, DONE) |
| issueStatus | String | 이슈 상태 (ACTIVE, RESOLVED) |
| detectedAt | LocalDateTime | 탐지 시각 |
| managerName | String | 담당자 이름 |
| managerEmail | String | 담당자 이메일 |
| piiDetails | Array | PII 유형별 상세 |

**실패 - 이슈 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "FILEPII4043",
  "message": "이슈를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-02-03T10:00:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "FILEPII4032",
  "message": "해당 이슈에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-02-03T10:00:00"
}
```

---

## 10-3. 작업 상태 변경

| 항목 | 내용 |
|------|------|
| **Method** | `PATCH` |
| **Endpoint** | `/api/file-pii/issues/{issueId}/status` |
| **인증** | 필요 |

### 설명

파일 개인정보 이슈의 작업 상태를 변경합니다. 사용자가 이슈 처리 진행 상황을 트래킹하기 위해 사용합니다.

### Request

**Headers**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| issueId | Long | O | 이슈 ID |

**Body**
```json
{
  "userStatus": "RUNNING"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| userStatus | String | O | 작업 상태 (ISSUE, RUNNING, DONE) |

### Response

**성공 (200 OK)**
```json
{
  "success": true,
  "code": "COMMON200",
  "message": "요청이 성공했습니다.",
  "result": {
    "issueId": 1,
    "userStatus": "RUNNING",
    "updatedAt": "2026-02-03T10:30:00"
  },
  "timestamp": "2026-02-03T10:30:00"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| issueId | Long | 이슈 ID |
| userStatus | String | 변경된 작업 상태 |
| updatedAt | LocalDateTime | 변경 시각 |

**실패 - 이슈 없음 (404 Not Found)**
```json
{
  "success": false,
  "code": "FILEPII4043",
  "message": "이슈를 찾을 수 없습니다.",
  "result": null,
  "timestamp": "2026-02-03T10:30:00"
}
```

**실패 - 접근 권한 없음 (403 Forbidden)**
```json
{
  "success": false,
  "code": "FILEPII4032",
  "message": "해당 이슈에 대한 접근 권한이 없습니다.",
  "result": null,
  "timestamp": "2026-02-03T10:30:00"
}
```

---

# 에러 코드 정리

## 인증 에러 코드

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| AUTH4001 | 400 Bad Request | 비밀번호가 일치하지 않습니다. |
| AUTH4011 | 401 Unauthorized | 비밀번호가 올바르지 않습니다. |
| AUTH4012 | 401 Unauthorized | 유효하지 않은 토큰입니다. |
| AUTH4013 | 401 Unauthorized | 만료된 토큰입니다. |
| AUTH4041 | 404 Not Found | 사용자를 찾을 수 없습니다. |
| AUTH4091 | 409 Conflict | 이미 존재하는 이메일입니다. |

## DB 연결 에러 코드

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| DBCONN4002 | 400 Bad Request | 비밀번호는 필수입니다. |
| DBCONN4031 | 403 Forbidden | 해당 연결에 대한 접근 권한이 없습니다. |
| DBCONN4041 | 404 Not Found | DBMS 유형을 찾을 수 없습니다. |
| DBCONN4042 | 404 Not Found | DB 연결 정보를 찾을 수 없습니다. |
| DBCONN4091 | 409 Conflict | 이미 존재하는 연결 이름입니다. |

## 파일 서버 연결 에러 코드

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| FILECONN4002 | 400 Bad Request | 비밀번호는 필수입니다. |
| FILECONN4003 | 400 Bad Request | 지원하지 않는 서버 유형입니다. |
| FILECONN4031 | 403 Forbidden | 해당 연결에 대한 접근 권한이 없습니다. |
| FILECONN4041 | 404 Not Found | 파일 서버 유형을 찾을 수 없습니다. |
| FILECONN4042 | 404 Not Found | 파일 서버 연결 정보를 찾을 수 없습니다. |
| FILECONN4091 | 409 Conflict | 이미 존재하는 연결 이름입니다. |

## DB 스캔 에러 코드

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| DBSCAN4001 | 400 Bad Request | 연결되지 않은 DB입니다. |
| DBSCAN4091 | 409 Conflict | 이미 스캔이 진행 중입니다. |
| DBSCAN5001 | 500 Internal Server Error | 스키마 스캔에 실패했습니다. |
| DBSCAN5002 | 500 Internal Server Error | PII 식별에 실패했습니다. |
| DBSCAN5003 | 500 Internal Server Error | 암호화 확인에 실패했습니다. |
| DBSCAN5004 | 500 Internal Server Error | PII 유형을 찾을 수 없습니다. |

## 파일 스캔 에러 코드

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| FILESCAN4001 | 400 Bad Request | 연결되지 않은 파일 서버입니다. |
| FILESCAN4041 | 404 Not Found | 파일 서버 연결 정보를 찾을 수 없습니다. |
| FILESCAN4042 | 404 Not Found | 스캔 이력을 찾을 수 없습니다. |
| FILESCAN4091 | 409 Conflict | 이미 스캔이 진행 중입니다. |

## 공지사항 에러 코드

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| NOTICE4041 | 404 Not Found | 공지사항을 찾을 수 없습니다. |

## DB PII 에러 코드

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| DBPII4001 | 400 Bad Request | 테이블이 지정된 커넥션에 속하지 않습니다. |
| DBPII4002 | 400 Bad Request | 유효하지 않은 작업 상태입니다. |
| DBPII4031 | 403 Forbidden | 해당 연결에 대한 접근 권한이 없습니다. |
| DBPII4032 | 403 Forbidden | 해당 이슈에 대한 접근 권한이 없습니다. |
| DBPII4041 | 404 Not Found | DB 연결 정보를 찾을 수 없습니다. |
| DBPII4042 | 404 Not Found | 테이블을 찾을 수 없습니다. |
| DBPII4043 | 404 Not Found | 이슈를 찾을 수 없습니다. |
| DBPII5001 | 500 Internal Server Error | 비암호화 데이터 조회에 실패했습니다. |

## 파일 마스킹 에러 코드

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| MASKING4001 | 400 Bad Request | 마스킹 대상 파일이 아닙니다. |
| MASKING4002 | 400 Bad Request | 미리보기를 지원하지 않는 파일입니다. |
| MASKING4003 | 400 Bad Request | 마스킹 결과가 만료되었습니다. 다시 마스킹해주세요. |
| MASKING4031 | 403 Forbidden | 파일 접근 권한이 없습니다. |
| MASKING4041 | 404 Not Found | 파일을 찾을 수 없습니다. |
| MASKING4042 | 404 Not Found | 커넥션을 찾을 수 없습니다. |
| MASKING5001 | 500 Internal Server Error | 파일 다운로드에 실패했습니다. |
| MASKING5002 | 500 Internal Server Error | 파일 업로드에 실패했습니다. |
| MASKING5003 | 500 Internal Server Error | 마스킹 처리에 실패했습니다. |
| MASKING5031 | 503 Service Unavailable | AI 서버 연결에 실패했습니다. |

## 파일 PII 에러 코드

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| FILEPII4002 | 400 Bad Request | 유효하지 않은 작업 상태입니다. |
| FILEPII4031 | 403 Forbidden | 해당 연결에 대한 접근 권한이 없습니다. |
| FILEPII4032 | 403 Forbidden | 해당 이슈에 대한 접근 권한이 없습니다. |
| FILEPII4041 | 404 Not Found | 파일 서버 연결 정보를 찾을 수 없습니다. |
| FILEPII4042 | 404 Not Found | 파일을 찾을 수 없습니다. |
| FILEPII4043 | 404 Not Found | 이슈를 찾을 수 없습니다. |
