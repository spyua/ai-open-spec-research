# OpenSpec 企業導入分析報告：跨部門統一規格管理策略

> 報告日期：2026-03-12
> 目標讀者：技術主管、架構師、團隊負責人
> 範疇：評估 OpenSpec 與現有部門級 Skill Plugin Flow 的整合可行性與統一策略

---

## 一、問題陳述

### 1.1 現況

集團內各部門團隊已各自發展出成熟的 **Skill Plugin + Flow** 工具鏈（以下以 Spring Boot Scaffolds Plugin 為代表性案例分析）。這些工具鏈解決了**執行層**的效率問題：程式碼生成、品質門檻、Commit 規範等。

但跨部門面臨以下挑戰：

| 挑戰 | 說明 |
|------|------|
| **流程孤島** | 各部門的 Flow 封閉在自己的 Plugin 內，沒有統一的上游規格語言 |
| **需求脈絡斷裂** | 「為什麼做這個功能」的脈絡在 Session 結束後消失，只剩生成的程式碼 |
| **跨部門協作缺乏共同基準** | 前端團隊、後端團隊、資料團隊各自定義「完成」的標準 |
| **行為規格不存在** | 程式碼生成了，但「系統在什麼條件下應有什麼行為」沒有獨立於實作的規格 |
| **變更影響難以追溯** | 無法回答「這次改動影響了哪些行為契約」 |

### 1.2 核心問題

> 如何在不破壞各部門現有工具鏈的前提下，建立集團統一的規格管理層？

---

## 二、架構定位分析

### 2.1 兩層架構模型

```
┌─────────────────────────────────────────────────────────────┐
│                    規格層 (Specification Layer)               │
│                                                              │
│    OpenSpec                                                   │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│    │ Proposal │→ │   Spec   │→ │  Design  │→ │  Tasks   │  │
│    │ 為什麼做  │  │ 行為契約  │  │ 怎麼設計  │  │ 做什麼   │  │
│    └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                              │
│    統一語言 · 統一結構 · 跨部門可讀                            │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                   │
│                    銜接點 (Handoff)                           │
│              規格產出 → 驅動執行層 Flow                       │
│                          │                                   │
├──────────────────────────┴──────────────────────────────────┤
│                    執行層 (Execution Layer)                   │
│                                                              │
│    各部門 Skill Plugin + Flow                                │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│    │ Spring Boot  │  │   Frontend   │  │   Data/ML    │     │
│    │  Scaffolds   │  │   Toolkit    │  │   Pipeline   │     │
│    │              │  │              │  │              │      │
│    │ openapi-gen  │  │ component-   │  │ pipeline-    │     │
│    │ impl-api     │  │ scaffold     │  │ scaffold     │     │
│    │ jpa-pattern  │  │ i18n-gen     │  │ model-gen    │     │
│    │ commit-conv  │  │ test-gen     │  │ feature-eng  │     │
│    └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│    各自封裝 · 各自演進 · 領域專精                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 關鍵洞察：OpenSpec 不替代任何 Skill

| 維度 | OpenSpec 負責 | Skill Plugin 負責 |
|------|-------------|-------------------|
| **回答的問題** | 做什麼？為什麼？做到什麼程度算對？ | 怎麼做？用什麼工具？遵守什麼格式？ |
| **產出** | 行為規格 (Spec)、提案 (Proposal)、設計 (Design)、任務清單 (Tasks) | 程式碼、設定檔、測試、文件 |
| **生命週期** | 跨 Session 持久化，可歸檔追溯 | Session 內執行，產出進入版控 |
| **受眾** | 跨部門可讀（PM、QA、其他團隊） | 部門內開發者 |
| **變更追蹤** | Delta Spec（行為變更） | Git Diff（程式碼變更） |

---

## 三、案例深度分析：Spring Boot Scaffolds Plugin

### 3.1 現有 Plugin 能力盤點

以下是 Spring Boot Scaffolds Plugin 的完整能力地圖：

```
Spring Boot Scaffolds Plugin v3.0.0
│
├── Meta 層
│   └── using-spring-boot-tools     ← 路由引擎，1% 門檻決策
│
├── 前置設定 (Pre-project)
│   ├── spring-boot-coding-rules    ← 編碼標準部署
│   └── static-analysis-scaffold    ← Checkstyle + PMD + Git Hooks
│
├── 程式碼生成 (Code Generation)
│   ├── openapi-gen                 ← OpenAPI Spec → API Interface + DTO
│   ├── impl-api                    ← API Interface → Controller + Service
│   ├── jpa-repository-pattern      ← Entity → Repository → Service → Controller
│   └── gcp-secret-manager          ← GCP Secret Manager 整合
│
├── 文件生成 (Documentation)
│   └── generate-sd                 ← PRD → System Design 文件（6 階段互動式）
│
├── 品質管理 (Quality)
│   ├── commit-convention           ← Emoji Conventional Commits + 品質門檻
│   └── code-refactoring            ← 7 階段系統化重構
│
└── 編排指令 (Commands)
    ├── /gen-api-task                ← openapi-gen → impl-api 編排
    ├── /commit                     ← 標準化提交
    ├── /scaffold                   ← 模組拉取
    └── /reflection                 ← 品質反思
```

### 3.2 Plugin 的強項與盲點

**強項（不應被取代）：**

- 912 行的 `generate.sh` 實現了精密的 DTO 分類演算法（request/response/common 遞迴傳播）
- `impl-api` 嚴格遵守 Hibernate Validator 繼承規則（Controller 不可重複定義 `@Valid` 等）
- `commit-convention` 整合了 IntelliJ 格式化 → Checkstyle → PMD → Commit 的完整管線
- `generate-sd` 實現了 6 階段互動式 PRD → System Design 轉換（含 4 輪確認）
- 所有規則均有量化標準（類名 ≤ 45 字元、方法 ≤ 45 行、參數 ≤ 4 個等）

**盲點（OpenSpec 可補足）：**

| 盲點 | 具體問題 | 影響 |
|------|---------|------|
| **PRD → OpenAPI 之間無結構化規格** | `generate-sd` 產出 SD 文件，但不是可驗證的行為規格 | 實作完成後無法自動驗證是否符合需求 |
| **行為契約不存在** | 沒有 Given/When/Then 格式的行為場景定義 | QA 只能從 PRD 和程式碼反推測試案例 |
| **變更脈絡隨 Session 消失** | 為什麼加這個 API？影響哪些現有行為？沒有持久化記錄 | 三個月後沒人記得為什麼做這個改動 |
| **跨 API 的行為一致性無法追蹤** | 每個 API 獨立生成，業務流程的端到端行為沒有統一描述 | 微服務間的行為契約只存在於開發者腦中 |

### 3.3 整合後的工作流程

**整合前（現有流程）：**

```
PRD (口頭/文件)
    ↓
/generate-sd          ← 產出 System Design 文件
    ↓
撰寫 OpenAPI Spec     ← 手動，基於 SD 文件
    ↓
/openapi-gen          ← 生成 API Interface + DTO
    ↓
/impl-api             ← 生成 Controller + Service
    ↓
實作業務邏輯           ← 手動填充 TODO
    ↓
/commit               ← 提交
```

**整合後（加入 OpenSpec）：**

```
PRD (口頭/文件)
    ↓
openspec new change add-user-api --schema spring-boot-api-flow
    ↓
┌─ OpenSpec Schema 管轄 ─────────────────────────────────┐
│                                                         │
│  proposal.md (文件型)  ← 為什麼做？影響範圍？JIRA 單號？  │
│       ↓                                                 │
│  specs/ (文件型)       ← 行為契約 (Given/When/Then)      │
│       ↓                                                 │
│  openapi-gen-result.md (Skill 執行型)                    │
│       │  instruction: 「使用 /openapi-gen skill...」     │
│       │  → AI Agent 呼叫 /openapi-gen                   │
│       ↓                                                 │
│  impl-api-result.md (Skill 執行型)                      │
│       │  instruction: 「使用 /impl-api skill...」        │
│       │  → AI Agent 呼叫 /impl-api                      │
│       ↓                                                 │
│  implementation.md (文件型)                              │
│       ← 業務邏輯實作 + Scenario 覆蓋追蹤                 │
│                                                         │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
openspec verify add-user-api   ← 對照 specs 驗收
                          ↓
openspec archive add-user-api  ← 行為規格歸檔為 Source of Truth
```

**關鍵差異：** 整合後不再需要 tasks.md 作為橋樑。Schema 的 Skill 執行型 artifact 的 instruction 直接引導 AI Agent 呼叫 Skill，AI Agent 作為 runtime 完成執行並記錄結果。

---

## 四、跨部門統一策略

### 4.1 Custom Schema：統一流程的關鍵機制

OpenSpec 的 Custom Schema 允許每個部門定義自己的 artifact 工作流程，同時共享統一的規格結構。

**集團級 Schema（所有部門共用基礎）：**

```yaml
# openspec/schemas/enterprise-standard/schema.yaml
name: enterprise-standard
version: 1
description: 集團標準規格流程 — 所有部門共用

artifacts:
  - id: proposal
    generates: proposal.md
    template: proposal.md
    instruction: |
      建立提案，必須包含：
      1. 業務動機（連結 JIRA/需求單號）
      2. 影響範圍分析（哪些服務、哪些團隊）
      3. 風險評估（安全性、效能、相容性）
    requires: []

  - id: specs
    generates: specs/**/*.md
    template: specs/spec.md
    instruction: |
      定義行為規格，使用 Given/When/Then 格式。
      每個 Requirement 必須有至少一個 Scenario。
      使用 RFC 2119 關鍵字（MUST/SHOULD/MAY）。
    requires: [proposal]

  - id: design
    generates: design.md
    template: design.md
    instruction: |
      技術設計文件。包含架構決策、API 設計、資料模型。
      可整合各部門 Plugin 的設計產出。
    requires: [proposal]

  - id: tasks
    generates: tasks.md
    template: tasks.md
    instruction: |
      實作任務清單。每個任務應對應具體的 Plugin 指令或手動步驟。
      格式：- [ ] 任務描述
    requires: [specs, design]
```

**部門級 Schema 擴展（後端 API 團隊）：**

```yaml
# openspec/schemas/backend-api/schema.yaml
name: backend-api
version: 1
description: 後端 API 團隊 — 擴展企業標準，銜接 Spring Boot Plugin

artifacts:
  - id: proposal
    generates: proposal.md
    template: proposal.md
    requires: []

  - id: specs
    generates: specs/**/*.md
    template: specs/spec.md
    requires: [proposal]

  - id: api-design
    generates: api-design.md
    template: api-design.md
    instruction: |
      API 設計文件，包含：
      1. Endpoint 清單（Method + Path + 說明）
      2. Request/Response 結構
      3. 錯誤碼定義
      此文件完成後，可作為 OpenAPI Spec 的輸入。
    requires: [specs]

  - id: tasks
    generates: tasks.md
    template: tasks.md
    instruction: |
      任務清單，應包含以下 Plugin 指令步驟：
      - [ ] /openapi-gen --init-config
      - [ ] /openapi-gen
      - [ ] /impl-api <ApiInterface>
      - [ ] 實作業務邏輯
      - [ ] /commit
    requires: [api-design]
```

### 4.2 統一架構：各部門獨立演進

```
集團層級（Global Override 統一分發）
├── $XDG_DATA_HOME/openspec/schemas/
│   └── enterprise-standard/             ← 所有部門共用的基礎流程
│       ├── schema.yaml
│       └── templates/
│           ├── proposal.md              ← 統一的提案模板
│           └── specs/spec.md            ← 統一的行為規格模板
│
部門層級（Project-local 隨專案版控）
├── openspec/schemas/backend-api/        ← 後端團隊
│   ├── schema.yaml                      ← 銜接 Spring Boot Plugin
│   └── templates/
│       └── api-design.md
│
├── openspec/schemas/frontend-feature/   ← 前端團隊
│   ├── schema.yaml                      ← 銜接 Frontend Toolkit Plugin
│   └── templates/
│       └── component-design.md
│
├── openspec/schemas/data-pipeline/      ← 資料團隊
│   ├── schema.yaml                      ← 銜接 Data Pipeline Plugin
│   └── templates/
│       └── pipeline-design.md
│
└── openspec/schemas/mobile-feature/     ← Mobile 團隊
    ├── schema.yaml
    └── templates/
        └── mobile-design.md
```

### 4.3 Schema 解析優先順序與分發策略

| 層級 | 來源 | 適用場景 | 分發機制 |
|------|------|---------|---------|
| 1 (最高) | CLI `--schema` flag | 臨時指定 | 手動 |
| 2 | Change `.openspec.yaml` | 已建立的 change | 自動記錄 |
| 3 | 專案 `openspec/config.yaml` | 部門預設 | Git 版控 |
| 4 | Global Override `$XDG_DATA_HOME` | 集團標準 | IT 統一部署 |
| 5 (最低) | 內建 `spec-driven` | 預設 | 隨 OpenSpec 安裝 |

**分發建議：**

| 方式 | 目的 | 操作 |
|------|------|------|
| Global Override | 集團標準 Schema 統一分發 | IT 部署到每台開發機的 `$XDG_DATA_HOME/openspec/schemas/` |
| Project-local | 部門 Schema 隨專案版控 | `openspec schema fork enterprise-standard backend-api` |
| `config.yaml` 預設 | 免去每次指定 `--schema` | 專案 `openspec/config.yaml` 設定 `schema: backend-api` |

---

## 五、整合的具體價值量化

### 5.1 以 Spring Boot Plugin 為例

| 現有能力 | 整合後增益 | 價值 |
|---------|-----------|------|
| `generate-sd`：PRD → SD 文件 | SD 文件的關鍵行為提取為 OpenSpec Spec | SD 不再是一次性文件，行為規格可持續追蹤 |
| `openapi-gen`：Spec → Code | Schema 的 Skill 執行型 artifact 引導 AI 呼叫 /openapi-gen，specs 提供行為契約作為上游輸入 | API 設計有結構化的上游規格，執行可追蹤 |
| `impl-api`：生成 Controller + Service | Schema 的 Skill 執行型 artifact 引導 AI 呼叫 /impl-api，結果記錄到 artifact 文件 | 執行結果持久化，不隨 Session 消失 |
| `commit-convention`：標準化提交 | Commit message 可引用 OpenSpec change 名稱 | 程式碼變更可追溯到行為規格變更 |
| 無 | `openspec verify`：對照 spec 驗收實作 | **新增能力**：自動化驗收，不再純靠人工 review |
| 無 | `openspec archive`：歸檔行為規格 | **新增能力**：系統行為的 Source of Truth 持續累積 |

### 5.2 跨部門層級的價值

| 價值 | 說明 |
|------|------|
| **統一的變更語言** | 所有部門用相同結構描述變更（Proposal → Spec → Design → Tasks），PM 和 QA 不需要學各部門的工具 |
| **跨部門影響分析** | 當後端 API 行為變更時，可以在 Spec 層看到影響，前端團隊可以提前感知 |
| **行為規格作為契約** | 微服務間的行為契約從「口頭約定」變為「版控管理的 Spec」 |
| **新人 Onboarding** | 新人可以從 `openspec/specs/` 理解系統行為，不需要讀全部程式碼 |
| **審計與合規** | 每次變更都有完整的 Proposal → Spec → Design → Code 鏈，滿足合規要求 |

---

## 六、與現有 Plugin 的互補矩陣

```
                    ┌──────────────────────────────────────────┐
                    │           完整開發生命週期                 │
                    │                                          │
                    │   需求    規格    設計    實作    驗收     │
                    │                                          │
   OpenSpec         │   ████   ████   ████    ░░░   ████      │
                    │                                          │
   Spring Boot      │   ░░░    ░░░    ██░░   ████   ░░░░      │
   Plugin           │                  ↑SD                     │
                    │                                          │
   兩者整合          │   ████   ████   ████   ████   ████      │
                    │                                          │
                    └──────────────────────────────────────────┘

   ████ = 完整覆蓋    ██░░ = 部分覆蓋    ░░░░ = 未覆蓋
```

| 生命週期階段 | OpenSpec 提供 | Plugin 提供 | 整合效果 |
|-------------|-------------|------------|---------|
| **需求** | Proposal（結構化提案） | 無 | 需求有結構化記錄 |
| **規格** | Spec（Given/When/Then 行為契約） | 無 | 行為規格獨立於實作 |
| **設計** | Design（技術設計 artifact） | generate-sd（PRD→SD） | SD 文件的行為部分提取為 Spec |
| **實作** | Tasks（任務追蹤） | openapi-gen, impl-api, jpa-pattern | 任務清單驅動 Plugin 指令 |
| **驗收** | Verify（對照 spec 驗收） | commit-convention（品質門檻） | 行為驗收 + 程式碼品質雙重保障 |

---

## 七、導入策略與風險

### 7.1 建議的導入路徑

```
Phase 1: 試點 (1-2 個月)
├── 選擇一個後端團隊作為試點
├── 使用 enterprise-standard schema
├── 僅在新功能開發時使用 OpenSpec
├── 不改動現有 Plugin Flow
└── 目標：驗證 OpenSpec + Plugin 共存可行性

Phase 2: 部門客製 (1-2 個月)
├── 試點團隊 fork enterprise-standard 為部門 schema
├── 在 schema 中銜接部門 Plugin 指令
├── 建立部門級的 config.yaml（context + rules）
└── 目標：找到規格層與執行層的最佳銜接點

Phase 3: 橫向推廣 (2-3 個月)
├── 其他部門基於試點經驗建立自己的 schema
├── 集團層級建立 Global Override schema
├── 跨部門的 Spec 開始互相引用
└── 目標：集團統一規格語言，各部門保留執行自主權

Phase 4: 深度整合 (持續)
├── Plugin 的 Skill 可讀取 OpenSpec 的 artifact 作為輸入
├── OpenSpec 的 tasks.md 自動觸發對應的 Plugin 指令
├── 行為規格驅動測試案例生成
└── 目標：規格驅動開發 (Spec-Driven Development) 常態化
```

### 7.2 風險與緩解

| 風險 | 嚴重度 | 緩解措施 |
|------|--------|---------|
| **流程負擔增加** | 高 | 小變更使用 rapid schema（只有 proposal + tasks），僅大功能走完整流程 |
| **團隊抗拒** | 高 | 從「可選」開始，展示價值後再推為「建議」，最後才「要求」 |
| **規格與程式碼脫節** | 中 | 利用 `openspec verify` 定期驗收，納入 PR Review 流程 |
| **Schema 碎片化** | 中 | 集團標準 schema 作為 base，部門只能 fork 擴展，不能從零建立 |
| **維護成本** | 中 | OpenSpec 的 spec 是行為契約，不是實作文件，更新頻率遠低於程式碼 |
| **與現有 Plugin 衝突** | 低 | OpenSpec 是純規格層，不執行程式碼，不影響 Plugin 的任何功能 |

---

## 八、技術整合要點

### 8.1 OpenSpec 的客製化邊界

| 面向 | 靈活度 | 說明 |
|------|--------|------|
| Artifact 類型與依賴 | **完全可控** | Schema 可定義任意 artifact 和 DAG 依賴 |
| Artifact 指令與模板 | **完全可控** | 每個 artifact 可自訂 AI 指令和 Markdown 模板 |
| 專案 Context 注入 | **高度可控** | config.yaml 可注入 50KB 的專案上下文到所有 artifact |
| Per-artifact Rules | **高度可控** | 每個 artifact 可有獨立的生成規則 |
| 驗證維度 | **有限** | 固定三維度（完整性、正確性、一致性），不可擴展 |
| CLI 擴展 | **不支援** | 無法新增自訂 CLI 指令或 Hook |
| 外部工具執行 | **不支援** | OpenSpec 不執行外部指令，需靠包裝腳本銜接 |

### 8.2 銜接點設計

OpenSpec 與 Skill Plugin 的銜接透過 **instruction → AI Agent → Skill** 機制完成：

Schema 的 Skill 執行型 artifact 的 instruction 告訴 AI Agent 該呼叫哪個 Skill。AI Agent 作為 runtime，在同一 Session 中執行 Skill 並將結果記錄到 artifact 文件。

```yaml
# Skill 執行型 artifact 範例
- id: openapi-gen
  generates: openapi-gen-result.md
  instruction: |
    使用 /openapi-gen skill 從 OpenAPI Spec 生成 API Interface 和 DTO。
    執行完成後，將生成結果摘要記錄到此文件。
  requires: [specs]
```

**instruction 只放 Skill 指令名稱，不放 Skill 的領域知識。** DTO 分類規則、命名規範等知識封裝在 Skill Plugin 內部，AI 呼叫 Skill 時自然生效。

### 8.3 Config 範例：Spring Boot 專案

```yaml
# openspec/config.yaml
schema: spring-boot-api-flow

context: |
  技術棧：Java 17, Spring Boot 3.x, PostgreSQL, GCP
  架構：分層架構 (Controller → Service → Repository)
  回應格式：ResponseEntity<ReturnMsg<T>>
  API 路徑風格：RPC-style（/users/createUser, 非 RESTful）

  可用的 Skill Plugin：
  - /openapi-gen：從 OpenAPI Spec 生成 API Interface + DTO
  - /impl-api：從 API Interface 生成 Controller + Service
  - /commit：標準化提交（Checkstyle + PMD + Emoji Conventional Commits）

rules:
  proposal:
    - 必須連結 JIRA 單號
    - 標明影響的微服務清單
    - 安全性變更需標注 Security Review
  specs:
    - 使用 Given/When/Then 格式
    - 錯誤場景必須包含錯誤碼和錯誤訊息
    - API 行為規格必須標明 HTTP Status Code
```

**Config 設計原則：** `context` 列出 Skill Plugin 的名稱和用途即可，不重複 Skill 內部的領域知識（DTO 分類規則、命名規範等由 `.claude/rules/` 和 Skill Plugin 自身管理）。`rules` 只針對文件型 artifact。

---

## 九、假設其他部門的 Schema 範例

### 9.1 前端團隊

```yaml
# openspec/schemas/frontend-feature/schema.yaml
name: frontend-feature
version: 1
description: 前端團隊 — 元件開發流程

artifacts:
  - id: proposal
    generates: proposal.md
    template: proposal.md
    requires: []

  - id: specs
    generates: specs/**/*.md
    template: specs/spec.md
    instruction: |
      定義 UI 行為規格：
      - 使用者操作 → 預期畫面反應
      - 狀態變化（loading, error, empty, success）
      - RWD 斷點行為
    requires: [proposal]

  - id: component-design
    generates: component-design.md
    template: component-design.md
    instruction: |
      元件設計：
      1. Component tree
      2. Props interface
      3. State management approach
      4. API 呼叫（引用後端 Spec）
    requires: [specs]

  - id: tasks
    generates: tasks.md
    template: tasks.md
    requires: [component-design]
```

### 9.2 資料團隊

```yaml
# openspec/schemas/data-pipeline/schema.yaml
name: data-pipeline
version: 1
description: 資料團隊 — Pipeline 開發流程

artifacts:
  - id: proposal
    generates: proposal.md
    template: proposal.md
    requires: []

  - id: specs
    generates: specs/**/*.md
    template: specs/spec.md
    instruction: |
      資料行為規格：
      - 輸入資料格式與來源
      - 轉換規則（Given 輸入 When 處理 Then 輸出）
      - 資料品質門檻（completeness, accuracy, freshness）
      - SLA 定義
    requires: [proposal]

  - id: pipeline-design
    generates: pipeline-design.md
    template: pipeline-design.md
    instruction: |
      Pipeline 設計：
      1. DAG 結構
      2. 每個 stage 的輸入/輸出 schema
      3. 錯誤處理與重試策略
      4. 監控指標
    requires: [specs]

  - id: tasks
    generates: tasks.md
    template: tasks.md
    requires: [pipeline-design]
```

### 9.3 跨部門引用場景

```
後端團隊                          前端團隊
openspec/specs/                   openspec/specs/
  user-api/spec.md                  user-profile/spec.md
  ┌─────────────────┐              ┌─────────────────────┐
  │ Requirement:     │              │ Requirement:         │
  │ User Creation    │◄─── 引用 ───│ Profile Form Submit  │
  │                  │              │                      │
  │ Scenario: Valid  │              │ Scenario: Success    │
  │ - GIVEN valid    │              │ - GIVEN form filled  │
  │   payload        │              │ - WHEN submit clicked│
  │ - WHEN POST      │              │ - THEN calls POST    │
  │   /users         │              │   /users (see        │
  │ - THEN 201       │              │   user-api spec)     │
  │   + JWT token    │              │ - AND shows success  │
  └─────────────────┘              └─────────────────────┘
```

---

## 十、結論與建議

### 10.1 核心結論

1. **OpenSpec 與現有 Plugin 是互補關係，不是競爭關係。** OpenSpec 管理「做什麼」，Plugin 管理「怎麼做」。兩者在架構上分處不同層級，不會衝突。

2. **統一的可能性存在，且不需要各部門放棄現有工具。** OpenSpec 的 Custom Schema 機制允許每個部門定義自己的流程，同時共享統一的規格結構（Proposal → Spec → Design → Tasks）。

3. **最大的價值不在單一部門內，而在跨部門。** 統一的行為規格語言讓不同團隊能用共同基準討論變更影響。前端可以引用後端的行為 Spec，而不是猜測 API 行為。

4. **導入風險可控。** OpenSpec 是純規格層工具，不執行程式碼、不修改現有 Plugin 流程，可漸進式導入。

5. **關鍵限制需正視。** OpenSpec 目前不支援 CLI 擴展和外部工具 Hook。與 Plugin 的銜接透過 instruction → AI Agent → Skill 機制完成，AI Agent 是 runtime，Schema 本身不直接呼叫 Skill。

### 10.2 行動建議

| 優先級 | 行動 | 負責人 |
|--------|------|--------|
| **P0** | 定義 enterprise-standard schema 並取得跨部門共識 | 架構師 |
| **P0** | 選定試點團隊，一個新功能完整走 OpenSpec + Plugin 流程 | 試點團隊 Lead |
| **P1** | 根據試點回饋，建立部門級 schema（fork enterprise-standard） | 各部門 Lead |
| **P1** | 將 `openspec verify` 納入 PR Review checklist | 各部門 Lead |
| **P2** | 建立 Global Override schema，統一分發到所有開發機 | IT / 架構師 |
| **P2** | 評估 Plugin Skill 讀取 OpenSpec artifact 的可行性（深度整合） | Plugin 維護者 |
| **P3** | 行為規格驅動測試案例自動生成 | QA + 架構師 |

### 10.3 成功指標

| 指標 | 衡量方式 | 目標 |
|------|---------|------|
| 規格覆蓋率 | 新功能有 OpenSpec change 的比例 | 試點期 > 50%，推廣期 > 80% |
| 驗收通過率 | `openspec verify` 首次通過的比例 | > 70% |
| 跨部門引用 | 一個部門的 Spec 被其他部門引用的次數 | 每季 > 5 次 |
| 返工減少 | 因需求理解不一致導致的返工次數 | 下降 30% |

---

*本報告基於 OpenSpec 現有架構（v1.2.0）和 Spring Boot Scaffolds Plugin v3.0.0 分析。隨著兩個工具的演進，整合策略可能需要調整。*
