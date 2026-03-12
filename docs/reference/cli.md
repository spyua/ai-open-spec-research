# CLI 指令參考

> 這些指令在終端機（terminal）中使用

## Setup

| 指令 | 用途 |
|------|------|
| `openspec init [path]` | 初始化 OpenSpec |
| `openspec update [path]` | 升級後重新生成設定檔 |

## Browsing

| 指令 | 用途 |
|------|------|
| `openspec list [--specs\|--changes]` | 列出 changes 或 specs |
| `openspec view` | 互動式 dashboard |
| `openspec show <name> [--type change\|spec]` | 檢視 change 或 spec 詳情 |

## Validation

| 指令 | 用途 |
|------|------|
| `openspec validate [name]` | 驗證結構 |
| `openspec validate --all` | 驗證全部 |
| `openspec validate --all --strict --json` | CI 用嚴格驗證 |

## Lifecycle

| 指令 | 用途 |
|------|------|
| `openspec archive <name> [-y]` | 歸檔 change |
| `openspec archive <name> --skip-specs` | 歸檔但跳過 spec 更新 |

## Workflow

| 指令 | 用途 |
|------|------|
| `openspec status --change <name>` | 查看 artifact 完成狀態 |
| `openspec instructions [artifact] --change <name>` | 取得 artifact 生成指示 |
| `openspec templates [--schema <name>]` | 查看 template 路徑 |
| `openspec schemas` | 列出所有可用 schemas |

## Schema Management

| 指令 | 用途 |
|------|------|
| `openspec schema init <name>` | 建立新 schema |
| `openspec schema fork <source> [name]` | Fork 現有 schema |
| `openspec schema validate [name]` | 驗證 schema |
| `openspec schema which [name] [--all]` | 查看 schema 來源 |

## Config

| 指令 | 用途 |
|------|------|
| `openspec config list` | 列出所有設定 |
| `openspec config get <key>` | 取得特定設定 |
| `openspec config set <key> <value>` | 設定值 |
| `openspec config profile` | 互動式設定 profile |
| `openspec config edit` | 用編輯器開啟設定 |

## 全域選項

`--version` / `--no-color` / `--help` / `--json`（大部分指令支援）

## 環境變數

| 變數 | 用途 |
|------|------|
| `OPENSPEC_CONCURRENCY` | 批量驗證並發數（預設 6） |
| `OPENSPEC_TELEMETRY=0` | 關閉遙測 |
| `DO_NOT_TRACK=1` | 同上 |
