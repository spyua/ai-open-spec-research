# Profile 系統

Profile 控制**安裝哪些工作流**（Skill/Command），分為 Core 與 Custom 兩種。

## Core Profile（預設）

提供精簡的四個核心工作流：

| 工作流 | 功能 |
|--------|------|
| `propose` | 啟動變更提案，依序產生 Artifact |
| `explore` | 探索現有規格與變更狀態 |
| `apply` | 根據 tasks.md 逐項實作 |
| `archive` | 歸檔已完成的變更，合併 Delta Specs |

## Custom Profile

從完整的 11 個工作流中自由選擇：

| 工作流 | 功能 |
|--------|------|
| `propose` | 啟動變更提案 |
| `explore` | 探索規格與變更 |
| `new` | 建立新的 change 目錄 |
| `continue` | 繼續未完成的 Artifact |
| `apply` | 實作任務 |
| `ff` | 快速前進（跳過中間 Artifact） |
| `sync` | 同步 Skill/Command 檔案 |
| `archive` | 歸檔變更 |
| `bulk-archive` | 批次歸檔多個變更 |
| `verify` | 驗證變更完整性 |
| `onboard` | 引導新使用者了解專案 |

## Delivery 模式

Profile 決定「裝什麼」，Delivery 決定「怎麼裝」：

| 模式 | 說明 |
|------|------|
| `both` | 同時產生 Skill 與 Command 檔案（預設） |
| `skills` | 僅產生 Skill 檔案 |
| `commands` | 僅產生 Command 檔案 |

## 切換 Profile

```bash
# 互動式選擇
openspec config profile

# 快速切回 core
openspec config profile core

# 套用到專案
openspec update
```
