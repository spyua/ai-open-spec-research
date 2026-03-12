# OpenSpec 設計概念文件

> **一句話定義**：OpenSpec 是一個以 Schema 驅動的 AI 規格工作流框架，透過結構化的 Artifact 依賴圖，將「提案 → 規格 → 設計 → 任務 → 實作」的軟體變更流程標準化、可追蹤化。

---

## 1. 設計哲學

OpenSpec 的設計建立在四大原則之上：

| 原則 | 說明 |
|------|------|
| **Fluid（流暢）** | 工作流不強制線性步驟，而是透過 DAG 依賴圖自動推導「下一步該做什麼」，讓使用者在準備好時自然推進 |
| **Iterative（迭代）** | 每個 Artifact 可獨立產生、修改、重新產生，不需要推倒重來整個流程 |
| **Easy（簡單）** | 零配置即可開始（內建 `spec-driven` schema），進階使用者可逐步自訂 schema、context、rules |
| **Brownfield-first（棕地優先）** | 透過 Delta Specs 機制，支援在既有規格上做增量變更，而非要求從零撰寫完整規格 |

```
                    ┌─────────────┐
                    │   Fluid     │  DAG 驅動，非線性
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │                         │
       ┌──────▼──────┐          ┌───────▼─────┐
       │  Iterative  │          │    Easy     │
       │  可重複產生  │          │  零配置啟動 │
       └──────┬──────┘          └───────┬─────┘
              │                         │
              └────────────┬────────────┘
                           │
                    ┌──────▼──────┐
                    │ Brownfield  │  Delta Specs
                    │   -first    │  增量變更
                    └─────────────┘
```

---

## 2. 系統架構全景圖

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

**運作流程**：

1. 使用者透過 CLI 或 AI 工具的 Skill/Command 觸發工作流
2. 系統依優先順序解析出要使用的 Schema
3. 從 Schema、Config、Change 三方收集資訊
4. 組裝完整的 AI Prompt（包含上下文、規則、依賴、模板、指令）
5. AI 根據 Prompt 產出對應的 Artifact 檔案

---

## 3. 核心資料模型

### 3.1 Config（`openspec/config.yaml`）

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

### 3.2 Schema（`schema.yaml`）

> **為什麼叫 Schema？** 跟 DB Schema、JSON Schema 同理 —— Schema 的意思是「結構定義」。它**只描述「工作流的骨架長什麼樣子」**（有哪些 Artifact、什麼依賴順序、什麼模板），不描述「怎麼執行」。具體怎麼跑 prompt、用哪個 AI，是 OpenSpec 引擎的事。就像 DB Schema 定義表結構但不管 SQL 怎麼跑一樣。這也是它不叫 `workflow.yaml` 或 `pipeline.yaml` 的原因。

定義工作流的 Artifact 依賴圖與 Apply 階段。

```yaml
name: spec-driven
version: 1
description: Default OpenSpec workflow
artifacts:                    # Artifact 節點列表
  - id: proposal
    generates: proposal.md    # 輸出檔案路徑（支援 glob）
    description: "Initial proposal document"
    template: proposal.md     # templates/ 目錄下的模板檔
    instruction: |            # AI 引導指令
      Create the proposal...
    requires: []              # 依賴的 artifact ID（DAG 邊）

apply:                        # Apply 階段設定
  requires: [tasks]           # 前置 artifact
  tracks: tasks.md            # 進度追蹤檔案
  instruction: |              # Apply 階段指令
    Read context files...
```

### 3.3 Artifact

Schema 中的每個節點，定義一個工作產出物。

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼，被 `requires` 引用 |
| `generates` | string | 輸出檔案路徑，支援 glob（如 `specs/**/*.md`） |
| `description` | string | Artifact 描述 |
| `template` | string | 模板檔案路徑（相對於 `templates/`） |
| `instruction` | string? | AI 引導指令文字 |
| `requires` | string[] | 依賴的 artifact ID 列表 |

### 3.4 Change（`.openspec.yaml`）

每個變更提案的元資料檔案。

```yaml
schema: spec-driven           # 此變更使用的 schema
created: 2026-03-12           # 建立日期（YYYY-MM-DD）
```

---

## 4. 目錄結構與兩大區域

```
openspec/
├── config.yaml              ← 專案設定（schema / context / rules）
│
├── specs/                   ← 🟢 永久規格區（Source of Truth）
│   ├── user-auth/           ← 一個 capability = 一個目錄
│   │   └── spec.md
│   └── data-export/
│       └── spec.md
│
├── changes/                 ← 🟡 變更提案區（臨時，完成後歸檔）
│   ├── add-2fa/
│   │   ├── .openspec.yaml   ← 變更元資料
│   │   ├── proposal.md      ← Artifact：提案
│   │   ├── specs/           ← Artifact：差異規格（Delta Specs）
│   │   │   ├── user-auth/
│   │   │   │   └── spec.md  ←   修改既有 capability
│   │   │   └── two-factor/
│   │   │       └── spec.md  ←   新增 capability
│   │   ├── design.md        ← Artifact：設計文件
│   │   └── tasks.md         ← Artifact：任務清單
│   └── archive/             ← 已完成的變更歸檔
│       └── 2026-03-10-add-2fa/
│
└── schemas/                 ← 專案自訂 schema（可選）
    └── my-workflow/
        ├── schema.yaml
        └── templates/
```

**兩大區域的設計意圖**：

- **`specs/`（永久區）**：代表系統的 Source of Truth，記錄「系統現在應該做什麼」。只在 Archive 時透過 Delta Specs 合併更新。
- **`changes/`（臨時區）**：代表正在進行的變更提案，每個變更是一個獨立目錄，完成後歸檔至 `archive/`。

---

## 5. Artifact 依賴流程（DAG）

OpenSpec 將工作流建模為**有向無環圖（DAG）**。每個 Artifact 透過 `requires` 宣告依賴，系統自動推導建置順序。

### 內建 `spec-driven` 依賴圖

```
                 ┌──────────┐
                 │ proposal │
                 └────┬─────┘
                      │
            ┌─────────┼──────────┐
            ▼                    ▼
      ┌──────────┐        ┌──────────┐
      │  specs   │        │  design  │
      └────┬─────┘        └────┬─────┘
           │                   │
           └─────────┬─────────┘
                     ▼
               ┌──────────┐
               │  tasks   │
               └────┬─────┘
                    │
                    ▼
              ┌───────────┐
              │   apply   │  （實作階段）
              └───────────┘
```

### DAG 運作機制

系統使用 **Kahn's 演算法**進行拓撲排序，提供三個核心查詢：

| 方法 | 功能 |
|------|------|
| `getNextArtifacts(completed)` | 返回所有依賴已滿足、可以開始的 Artifact |
| `getBlocked(completed)` | 返回尚在等待依賴的 Artifact 及其未完成的依賴 |
| `getBuildOrder()` | 返回完整的拓撲排序建置順序 |

**完成偵測**透過檔案系統：如果 `generates` 指定的檔案存在（支援 glob 匹配），該 Artifact 即為「已完成」。

### 自訂 Schema 範例

```yaml
# schemas/spring-boot-analysis/schema.yaml
name: spring-boot-analysis
artifacts:
  - id: analysis
    generates: analysis.md
    requires: []

  - id: specs
    generates: "specs/**/*.md"
    requires: [analysis]

  - id: design
    generates: design.md
    requires: [analysis]

  - id: tasks
    generates: tasks.md
    requires: [specs, design]
```

```yaml
# schemas/spring-boot-dev/schema.yaml
name: spring-boot-dev
artifacts:
  - id: proposal
    generates: proposal.md
    requires: []

  - id: design
    generates: design.md
    requires: [proposal]

  - id: tasks
    generates: tasks.md
    requires: [design]
```

---

## 6. Change 生命週期

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

**各階段詳細說明**：

1. **Create**：`openspec new change <name>` 建立變更目錄，寫入 `.openspec.yaml`
2. **Generate Artifacts**：AI 依 DAG 順序產出各 Artifact（proposal → specs + design → tasks）
3. **Review**：人工檢視並修改 Artifact 內容，確保品質
4. **Implement（Apply）**：AI 讀取 tasks.md 中的待辦事項，逐項實作並勾選完成
5. **Archive**：驗證 Delta Specs → 合併至 `specs/`（Source of Truth）→ 搬移至 `archive/`

---

## 7. AI Prompt 組裝機制

當使用者執行 `openspec instructions <artifact>` 時，系統將五層資訊組裝成結構化的 XML Prompt：

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Prompt 組裝                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Layer 1: project_context                            │    │
│  │ 來源：config.yaml → context                         │    │
│  │ 作用：提供專案背景，讓 AI 理解技術棧與架構          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Layer 2: rules                                      │    │
│  │ 來源：config.yaml → rules[artifactId]               │    │
│  │ 作用：per-artifact 的約束條件（如品質標準、格式）    │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Layer 3: dependencies                               │    │
│  │ 來源：schema.yaml → artifact.requires               │    │
│  │ 作用：列出依賴 artifact 的檔案路徑與完成狀態        │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Layer 4: template                                   │    │
│  │ 來源：schemas/<name>/templates/<template>           │    │
│  │ 作用：定義輸出檔案的結構骨架                        │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Layer 5: instruction                                │    │
│  │ 來源：schema.yaml → artifact.instruction            │    │
│  │ 作用：AI 產出的具體指引與注意事項                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**組裝後的 Prompt 結構**：

```xml
<artifact id="proposal" change="add-2fa" schema="spec-driven">

<task>
Create the proposal artifact for change "add-2fa".
Initial proposal document outlining the change
</task>

<project_context>
<!-- 來自 config.yaml 的 context -->
這是一個使用 TypeScript 的專案...
</project_context>

<rules>
<!-- 來自 config.yaml 的 rules[proposal] -->
- 必須包含 rollback 章節
</rules>

<dependencies>
<!-- 來自 schema 的 requires + 檔案系統狀態 -->
Read these files for context before creating this artifact:
<dependency id="proposal" status="done">
  <path>openspec/changes/add-2fa/proposal.md</path>
</dependency>
</dependencies>

<output>
Write to: openspec/changes/add-2fa/proposal.md
</output>

<instruction>
<!-- 來自 schema.yaml 的 artifact.instruction -->
Create the proposal document that establishes WHY this change is needed...
</instruction>

<template>
<!-- 來自 templates/proposal.md 的模板內容 -->
# Proposal: {{change-name}}
...
</template>

<unlocks>
Completing this artifact enables: specs, design
</unlocks>

</artifact>
```

---

## 8. Delta Specs 概念

Delta Specs 是 OpenSpec 支援 Brownfield 開發的核心機制。變更提案中的規格檔案不是完整規格，而是描述**與現有規格的差異**。

### 四種操作語義

| 操作 | 語法 | 說明 |
|------|------|------|
| **ADDED** | `## ADDED Requirements` | 新增需求，Archive 時插入至目標規格 |
| **MODIFIED** | `## MODIFIED Requirements` | 修改既有需求，必須包含完整替換內容 |
| **REMOVED** | `## REMOVED Requirements` | 移除需求，必須包含 `**Reason**` 與 `**Migration**` |
| **RENAMED** | `## RENAMED Requirements` | 重新命名，使用 `FROM:` / `TO:` 格式 |

### Delta Spec 範例

```markdown
## ADDED Requirements

### Requirement: User can enable 2FA
The system SHALL allow users to enable two-factor authentication.

#### Scenario: Enable 2FA
- **WHEN** user navigates to security settings
- **THEN** system displays 2FA setup wizard

## MODIFIED Requirements

### Requirement: User login
The system SHALL require 2FA verification after password authentication
when 2FA is enabled on the account.

#### Scenario: Login with 2FA
- **WHEN** user enters correct password AND 2FA is enabled
- **THEN** system prompts for 2FA code

## REMOVED Requirements

### Requirement: Security question verification
**Reason**: Replaced by 2FA
**Migration**: Users will be prompted to set up 2FA on next login
```

### Archive 時的合併規則

合併按固定順序執行，確保操作一致性：

```
1. RENAMED  → 在需求映射中重新命名 key
       ▼
2. REMOVED  → 從映射中刪除
       ▼
3. MODIFIED → 以新內容完整替換
       ▼
4. ADDED    → 插入映射（若已存在則報錯）
       ▼
   重組輸出：保持原始順序，新增項附加在尾端
```

### 為什麼 Brownfield 需要 Delta

- **增量描述**：只需描述「什麼變了」，不需重寫整份規格
- **衝突可見**：MODIFIED 和 REMOVED 明確標示受影響的需求
- **可審查**：Delta 格式讓 reviewer 一眼看出變更範圍
- **可逆**：Archive 前隨時可調整 Delta 內容

---

## 9. Apply 與進度追蹤

Apply 階段是 AI 根據 `tasks.md` 逐項實作的過程。

### 進度追蹤機制

Schema 的 `apply.tracks` 指向一個 Markdown 檔案（通常是 `tasks.md`），系統解析其中的 checkbox 格式追蹤進度：

```markdown
## 1. Setup

- [x] 1.1 Create new module structure        ← 已完成
- [x] 1.2 Add dependencies to package.json   ← 已完成

## 2. Core Implementation

- [ ] 2.1 Implement 2FA verification logic    ← 待完成
- [ ] 2.2 Add TOTP library integration        ← 待完成
```

### Apply 狀態機

```
                    ┌─────────────────────┐
                    │ 檢查 apply.requires │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                                 ▼
     requires 未滿足                    requires 已滿足
     ┌──────────┐                              │
     │ blocked  │               ┌──────────────┼──────────────┐
     └──────────┘               ▼                             ▼
                        tracks 檔案存在              tracks 未設定
                               │                    ┌─────────┐
                    ┌──────────┼──────────┐         │  ready  │
                    ▼                     ▼         └─────────┘
              有未完成任務          全部完成
              ┌─────────┐     ┌──────────┐
              │  ready  │     │ all_done │
              │ (進度中) │     └──────────┘
              └─────────┘
```

---

## 10. Schema 可插拔設計

### Schema 解析優先順序

Schema 名稱的來源（Change 層級）：

```
┌─────────────────────────────────────────────┐
│ 1. --schema CLI flag                        │ ← 最高優先
├─────────────────────────────────────────────┤
│ 2. .openspec.yaml 中的 schema 欄位          │
├─────────────────────────────────────────────┤
│ 3. config.yaml 中的 schema 欄位             │
├─────────────────────────────────────────────┤
│ 4. 內建 fallback："spec-driven"             │ ← 最低優先
└─────────────────────────────────────────────┘
```

Schema 檔案的解析位置（三層查找）：

```
┌─────────────────────────────────────────────┐
│ 1. 專案本地：openspec/schemas/<name>/       │ ← 最高優先
├─────────────────────────────────────────────┤
│ 2. 使用者全域：$XDG_DATA_HOME/openspec/     │
│                schemas/<name>/              │
├─────────────────────────────────────────────┤
│ 3. 套件內建：<package>/schemas/<name>/      │ ← 最低優先
└─────────────────────────────────────────────┘
```

### 自訂 Schema 結構

```
openspec/schemas/my-workflow/
├── schema.yaml          # Artifact 定義 + Apply 設定
└── templates/           # Markdown 模板
    ├── analysis.md
    ├── spec.md
    └── tasks.md
```

只要遵循 `schema.yaml` 的格式規範（artifact 節點含 `id`/`generates`/`requires`，無循環依賴），即可建立任意工作流。

---

## 11. Profile 系統

Profile 控制**安裝哪些工作流**（Skill/Command），分為 Core 與 Custom 兩種。

### Core Profile（預設）

提供精簡的四個核心工作流：

| 工作流 | 功能 |
|--------|------|
| `propose` | 啟動變更提案，依序產生 Artifact |
| `explore` | 探索現有規格與變更狀態 |
| `apply` | 根據 tasks.md 逐項實作 |
| `archive` | 歸檔已完成的變更，合併 Delta Specs |

### Custom Profile

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

### Delivery 模式

Profile 決定「裝什麼」，Delivery 決定「怎麼裝」：

| 模式 | 說明 |
|------|------|
| `both` | 同時產生 Skill 與 Command 檔案（預設） |
| `skills` | 僅產生 Skill 檔案 |
| `commands` | 僅產生 Command 檔案 |

---

## 12. 兩條 Pipeline 串接

在大型專案中，可以定義多個 Schema 並在不同階段使用，形成 Pipeline 串接。

### 範例：Spring Boot 分析 → 開發

```
┌─────────────────────────────────────────────────────────────────┐
│                Pipeline 1: spring-boot-analysis                 │
│                                                                 │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌───────┐  │
│  │ analysis │────▶│  specs   │────▶│  design  │────▶│ tasks │  │
│  └──────────┘     └──────────┘     └──────────┘     └───┬───┘  │
│                                                         │      │
│  目的：分析現有系統，產出理解文件與改善規格               │      │
└─────────────────────────────────────────────────────────┼──────┘
                                                         │
                              產出的 specs 成為下一條 Pipeline 的輸入
                                                         │
┌─────────────────────────────────────────────────────────▼──────┐
│                Pipeline 2: spring-boot-dev                      │
│                                                                 │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│  │ proposal │────▶│  design  │────▶│  tasks   │                │
│  └──────────┘     └──────────┘     └──────────┘                │
│                                                                 │
│  目的：基於分析結果，規劃並實作具體變更                          │
└─────────────────────────────────────────────────────────────────┘
```

**串接方式**：

1. 使用 `spring-boot-analysis` schema 建立第一個 Change，進行系統分析
2. Archive 後，分析產出的 specs 合併至 `specs/`（Source of Truth）
3. 使用 `spring-boot-dev` schema 建立第二個 Change，基於已有的 specs 進行開發
4. 第二條 Pipeline 的 proposal 可引用 `specs/` 中的分析結果

這種設計讓不同團隊角色（架構師 vs 開發者）可以使用不同的工作流，同時透過 `specs/` 作為共享的 Source of Truth 保持一致性。
