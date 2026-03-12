# 系統架構

> **一句話定義**：OpenSpec 是一個以 Schema 驅動的 AI 規格工作流框架，透過結構化的 Artifact 依賴圖，將「提案 → 規格 → 設計 → 任務 → 實作」的軟體變更流程標準化、可追蹤化。

## 系統架構全景圖

```
┌─────────────────────────────────────────────────────────────┐
│                      OpenSpec CLI                           │
│  /opsx:propose  /opsx:apply  /opsx:archive  /opsx:status   │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │    Schema Resolution    │
              │  1. --schema CLI flag   │
              │  2. .openspec.yaml      │
              │  3. config.yaml         │
              │  4. built-in fallback   │
              └────────────┬────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │ Schema     │  │ Config     │  │ Change     │
   │            │  │            │  │            │
   │ schema.yaml│  │ context    │  │ .openspec  │
   │ templates/ │  │ rules      │  │  .yaml     │
   └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
         │               │               │
         └───────────────┬┘               │
                         ▼                │
              ┌──────────────────┐        │
              │ AI Prompt 組裝    │◄───────┘
              │                  │
              │ context          │
              │ + rules          │
              │ + dependencies   │
              │ + template       │
              │ + instruction    │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ Artifact 產出     │
              │ proposal.md      │
              │ specs/**/*.md    │
              │ design.md        │
              │ tasks.md         │
              └──────────────────┘
```

**運作流程：**

1. 使用者透過 CLI 或 AI 工具的 Skill/Command 觸發工作流
2. 系統依優先順序解析出要使用的 Schema
3. 從 Schema、Config、Change 三方收集資訊
4. 組裝完整的 AI Prompt（包含上下文、規則、依賴、模板、指令）
5. AI 根據 Prompt 產出對應的 Artifact 檔案

## 核心資料模型

### Config（`openspec/config.yaml`）

專案層級設定，控制 Schema 選擇與 AI Prompt 注入內容。

```yaml
schema: spec-driven          # 使用的 workflow schema 名稱
context: |                   # 注入所有 AI 指令的專案背景（上限 50KB）
  這是一個使用 TypeScript + pnpm 的 monorepo...
rules:                       # 按 artifact ID 分組的約束規則
  proposal:
    - "必須包含 rollback 章節"
  tasks:
    - "每個任務應在一個 session 內完成"
```

### Schema（`schema.yaml`）

> **為什麼叫 Schema？** 跟 DB Schema、JSON Schema 同理 — Schema 的意思是「結構定義」。它**只描述「工作流的骨架長什麼樣子」**（有哪些 Artifact、什麼依賴順序、什麼模板），不描述「怎麼執行」。

```yaml
name: spec-driven
version: 1
description: Default OpenSpec workflow
artifacts:
  - id: proposal
    generates: proposal.md
    template: proposal.md
    instruction: |
      Create the proposal...
    requires: []
apply:
  requires: [tasks]
  tracks: tasks.md
```

### Artifact

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼，被 `requires` 引用 |
| `generates` | string | 輸出檔案路徑，支援 glob（如 `specs/**/*.md`） |
| `description` | string | Artifact 描述 |
| `template` | string | 模板檔案路徑（相對於 `templates/`） |
| `instruction` | string? | AI 引導指令文字 |
| `requires` | string[] | 依賴的 artifact ID 列表 |

### Change（`.openspec.yaml`）

每個變更提案的元資料檔案：

```yaml
schema: spec-driven           # 此變更使用的 schema
created: 2026-03-12           # 建立日期（YYYY-MM-DD）
```

## Change 生命週期

```
  ┌────────┐     ┌──────────────┐     ┌────────┐     ┌───────────┐     ┌─────────┐
  │ Create │────▶│   Generate   │────▶│ Review │────▶│ Implement │────▶│ Archive │
  │        │     │  Artifacts   │     │        │     │  (Apply)  │     │         │
  └────────┘     └──────────────┘     └────────┘     └───────────┘     └────┬────┘
                                                                            │
       openspec        AI 依序產出          人工審查        AI 依 tasks.md      │
       new change      proposal.md         修改調整        逐項實作             │
       <name>          specs/**/*.md                      勾選 checkbox        │
                       design.md                                              ▼
                       tasks.md                                     ┌─────────────────┐
                                                                    │ Delta Specs 合併 │
                                                                    │ 至 specs/ (SoT)  │
                                                                    │ 變更搬入 archive/ │
                                                                    └─────────────────┘
```

1. **Create**：`openspec new change <name>` 建立變更目錄
2. **Generate Artifacts**：AI 依 DAG 順序產出各 Artifact
3. **Review**：人工檢視並修改 Artifact 內容
4. **Implement（Apply）**：AI 讀取 tasks.md，逐項實作並勾選完成
5. **Archive**：驗證 Delta Specs → 合併至 `specs/` → 搬移至 `archive/`

## 目錄結構與兩大區域

```
openspec/
├── config.yaml              ← 專案設定（schema / context / rules）
│
├── specs/                   ← 🟢 永久規格區（Source of Truth）
│   ├── user-auth/
│   │   └── spec.md
│   └── data-export/
│       └── spec.md
│
├── changes/                 ← 🟡 變更提案區（臨時，完成後歸檔）
│   ├── add-2fa/
│   │   ├── .openspec.yaml
│   │   ├── proposal.md
│   │   ├── specs/
│   │   │   ├── user-auth/
│   │   │   │   └── spec.md
│   │   │   └── two-factor/
│   │   │       └── spec.md
│   │   ├── design.md
│   │   └── tasks.md
│   └── archive/
│       └── 2026-03-10-add-2fa/
│
└── schemas/                 ← 專案自訂 schema（可選）
    └── my-workflow/
        ├── schema.yaml
        └── templates/
```

- **`specs/`（永久區）**：代表系統的 Source of Truth，只在 Archive 時透過 Delta Specs 合併更新
- **`changes/`（臨時區）**：正在進行的變更提案，完成後歸檔至 `archive/`
