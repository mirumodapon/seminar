# Seminar 研討會管理系統

一個全端研討會活動管理平台，提供活動建立、報名管理、頁面編輯等功能。

## 技術棧

| 層級 | 技術 |
|------|------|
| 後端 | NestJS、Knex.js、MySQL、Redis |
| 前端 | React Router v7 (SSR)、Tailwind CSS |
| 認證 | Google OAuth 2.0 |
| 套件管理 | pnpm workspaces（Monorepo） |
| 容器化 | Docker、Docker Compose |

## 專案結構

```
seminar/
├── apps/
│   ├── backend/   # NestJS API 伺服器
│   └── frontend/  # React Router v7 前端
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## 快速開始

### 環境需求

- Node.js 20+
- pnpm 10+
- MySQL 8+
- Redis

### 安裝依賴

```bash
pnpm install
```

### 環境變數設定

在 `apps/backend/` 建立 `.env.local`：

```env
PORT=3000
SESSION_SECRET=your-session-secret

# 資料庫
DB_HOST=localhost
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=seminar

# Redis
REDIS_URL=redis://localhost:6379

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
GOOGLE_OAUTH_SCOPE=email,profile
```

在 `apps/frontend/` 建立 `.env`：

```env
VITE_API_URL=/api
```

### 執行資料庫遷移

```bash
cd apps/backend
npx knex migrate:latest --knexfile knexfile.ts
```

### 啟動開發環境

```bash
# 後端
pnpm --filter @seminar/backend start:dev

# 前端（另開終端機）
pnpm --filter @seminar/frontend dev
```

## 常用指令

### 後端

```bash
# 開發模式
pnpm --filter @seminar/backend start:dev

# 建置
pnpm --filter @seminar/backend build

# 執行測試
pnpm --filter @seminar/backend test

# 執行 E2E 測試
pnpm --filter @seminar/backend test:e2e

# 產生測試覆蓋率報告
pnpm --filter @seminar/backend test:cov

# 建立新的資料庫遷移
cd apps/backend
npx knex migrate:make <migration_name> --knexfile knexfile.ts
```

### 前端

```bash
# 開發模式
pnpm --filter @seminar/frontend dev

# 建置
pnpm --filter @seminar/frontend build

# 型別檢查
pnpm --filter @seminar/frontend typecheck
```

### 整個 Monorepo

```bash
# Lint 整個專案
eslint .
```

## 使用 Docker 部署

填寫 `docker-compose.yml` 中的環境變數後執行：

```bash
docker compose up -d
```

## 功能介紹

### 一般使用者
- 瀏覽活動首頁與各活動詳情頁
- 透過 Google 帳號登入
- 報名參加活動

### 管理員
- 建立與管理活動
- 編輯活動頁面內容
- 設定報名時間表
- 管理報名資料
- 查看活動統計數據

## 資料庫結構

| 資料表 | 說明 |
|--------|------|
| `user` | 使用者資料 |
| `activity` | 活動資訊 |
| `page` | 活動頁面內容 |
| `apply` | 報名記錄 |
| `activity_apply_schedule` | 報名時間表 |

所有資料表皆使用 `createdAt`、`updatedAt`、`deletedAt` 欄位，並支援軟刪除。
