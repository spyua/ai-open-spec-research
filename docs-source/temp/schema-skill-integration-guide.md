# OpenSpec Schema × Skill Plugin 整合實戰指南

> 文件性質：技術整合指南
> 案例：以 Spring Boot Scaffolds Plugin 的 `generate-api-code` Flow 為實例
> 前置知識：了解 OpenSpec Schema 基礎概念、了解 Skill Plugin 運作方式

---

## 核心觀念：Schema 和 Skill 各管什麼

在開始之前，先釐清一個根本問題：

```
OpenSpec Schema 定義的是「產出什麼文件、什麼順序」
Skill Plugin  定義的是「怎麼執行、用什麼工具」

Schema 不執行程式碼，也不直接呼叫 Skill。
Skill 不管為什麼要做這件事。

AI Agent 是 runtime —— Schema 的 instruction 告訴 AI 該用哪個 Skill，
AI 在同一 Session 中呼叫 Skill 執行。
```

具體來說：

| 層級 | 負責者 | 產出 | 生命週期 |
|------|--------|------|---------|
| 為什麼做、做什麼 | Schema 的 `proposal` + `specs` | 提案、行為規格 | 持久化，可歸檔追溯 |
| 怎麼執行 | Skill Plugin 的 `/openapi-gen`、`/impl-api` | 程式碼 | 進入版控 |
| 執行記錄 | Schema 的 Skill 執行型 artifact | 結果摘要 | 持久化，可追蹤 |
| 做完了沒 | `openspec verify` | 驗收報告 | 持久化 |

---

## 第一部分：整合原理

### 1.1 instruction → AI Agent → Skill 的運作機制

Schema 與 Skill 的整合透過 AI Agent 作為 runtime 間接完成：

```
Schema artifact 的 instruction
        │
        │  「使用 /openapi-gen skill...」
        │
        ▼
   AI Agent（runtime）
        │
        │  讀取 instruction，理解要呼叫哪個 Skill
        │  AI 已在同一 Session 載入 Skill Plugin
        │
        ▼
   Skill Plugin 執行
        │
        │  /openapi-gen 執行其完整邏輯：
        │  解析 OpenAPI Spec、生成 API Interface + DTO、
        │  智能分類、更新 import...
        │  （所有領域知識封裝在 Skill 內部）
        │
        ▼
   AI Agent 將結果記錄到 artifact 文件
```

**關鍵原則：instruction 只放 Skill 指令名稱，不放 Skill 的領域知識。**

- 正確：`使用 /openapi-gen skill 從 OpenAPI Spec 生成 API Interface 和 DTO。`
- 錯誤：`生成 DTO 並分類到 request/response/common 目錄，使用 Java Record 格式...`（這些是 Skill 內部知識）

### 1.2 兩類 Artifact

Schema 的 artifact 分為兩類：

| 類型 | 用途 | 範例 | 產出內容 |
|------|------|------|---------|
| **文件型** | 人工 + AI 協作產出的規格文件 | `proposal`, `specs` | 結構化文件，人類需要閱讀和審查 |
| **Skill 執行型** | 引導 AI 呼叫 Skill 並記錄結果 | `openapi-gen`, `impl-api` | Skill 執行結果摘要，用於追蹤 |

文件型 artifact 的 instruction 描述「產出什麼內容、遵守什麼結構」。
Skill 執行型 artifact 的 instruction 只說「用哪個 Skill、完成後記錄什麼」。

### 1.3 DAG 依賴圖定義 Skill 執行順序

```
proposal (文件型)
    │
    ▼
  specs (文件型)
    │
    ▼
openapi-gen (Skill 執行型)  ← 依賴 specs，因為需要行為契約指導 API 設計
    │
    ▼
 impl-api (Skill 執行型)    ← 依賴 openapi-gen，因為需要生成的 API Interface
    │
    ▼
implementation (文件型)      ← 依賴 impl-api，因為需要生成的 Service stub
```

DAG 的 `requires` 欄位自然地定義了 Skill 的執行順序，不需要額外的編排機制。

### 1.4 與 /gen-api-task 的關係

`/gen-api-task` command 是一個硬編碼的 `/openapi-gen → /impl-api` 編排。
Schema 提供了一個更靈活、可追蹤的替代方案：

| 面向 | /gen-api-task | Schema + Skill |
|------|--------------|----------------|
| 流程定義 | 寫死在 command 中 | DAG 依賴圖，可客製 |
| 上游輸入 | 無（直接從 OpenAPI Spec 開始） | proposal → specs 提供行為契約 |
| 執行追蹤 | Session 結束即消失 | artifact 文件持久化 |
| 下游驗收 | 無 | `openspec verify` 對照 specs |
| 彈性 | 固定 openapi-gen → impl-api | 可插入其他 artifact（如測試、文件） |

兩者可共存：小變更用 `/gen-api-task` 快速完成，大功能用 Schema 走完整流程。

---

## 第二部分：解剖現有 Skill Flow

### generate-api-code 的完整流程

先看 `/gen-api-task` command 做了什麼：

```
/gen-api-task [--dry-run] [--models-only] [--skip-classify]
    │
    ├── Phase 1: /openapi-gen
    │   ├── 讀取 spec-docs/gen-config/generator-config.yaml
    │   ├── 解析 OpenAPI Spec YAML
    │   ├── 執行 npx openapi-generator-cli generate
    │   ├── 智能分類 DTO → request/ response/ common/
    │   └── 更新 import 語句
    │
    ├── Phase 2: /impl-api (對每個 *Api.java)
    │   ├── 讀取 API Interface（方法、參數、回傳型別）
    │   ├── 分析所有 DTO 依賴
    │   ├── 推導命名（Api → Service → ServiceImpl → Controller）
    │   ├── 生成 Service Interface + Implementation (stub)
    │   └── 生成 Controller（implements Api interface）
    │
    └── Phase 3: JavaDoc 補完
```

### 這個 Flow 的隱含前提

```
         誰決定的？        決定了什麼？              記錄在哪？
         ─────────        ──────────              ─────────
  Q1:    某人              要加哪些 API             口頭/JIRA/腦中
  Q2:    某人              每個 API 的行為是什麼     OpenAPI Spec YAML
  Q3:    某人              錯誤處理邏輯是什麼        沒有記錄
  Q4:    某人              跨 API 的業務流程        沒有記錄
  Q5:    /gen-api-task     程式碼骨架               生成的 .java 檔案
```

Q1-Q4 就是 OpenSpec Schema 要補的缺口。

---

## 第三部分：設計整合 Schema

### 3.1 Schema 設計原則

```
原則 1: instruction 只放 Skill 指令名稱，不放 Skill 的領域知識
        → 「使用 /openapi-gen」，不要寫「DTO 分類到 request/response/common」

原則 2: 區分文件型和 Skill 執行型 artifact
        → 前者是人類要讀的規格，後者是 Skill 執行記錄

原則 3: AI Agent 是 runtime，Schema 不直接呼叫 Skill
        → instruction 引導 AI，AI 負責呼叫 Skill

原則 4: config.yaml 的 context 只做輕量橋接
        → 告訴 AI「有哪些工具存在」，不重複工具的規則內容
```

### 3.2 完整 Schema 定義

```yaml
# openspec/schemas/spring-boot-api-flow/schema.yaml
name: spring-boot-api-flow
version: 1
description: Spring Boot API 開發流程

artifacts:
  # ── 文件型：人工 + AI 協作產出 ──

  - id: proposal
    generates: proposal.md
    template: proposal.md
    instruction: |
      建立 API 變更提案，包含變更動機、API 範圍、影響分析。
    requires: []

  - id: specs
    generates: specs/**/*.md
    template: specs/spec.md
    instruction: |
      定義 API 行為規格，使用 Given/When/Then 格式。
      每個 API endpoint 至少一個成功場景和一個失敗場景。
    requires: [proposal]

  # ── Skill 執行型：instruction 引導 AI 呼叫 Skill ──

  - id: openapi-gen
    generates: openapi-gen-result.md
    instruction: |
      使用 /openapi-gen skill 從 OpenAPI Spec 生成 API Interface 和 DTO。
      執行完成後，將生成結果摘要記錄到此文件。
    requires: [specs]

  - id: impl-api
    generates: impl-api-result.md
    instruction: |
      掃描生成的 *Api.java 檔案，對每個檔案使用 /impl-api skill
      生成對應的 Controller + Service 實作。
      執行完成後，記錄生成的檔案清單。
    requires: [openapi-gen]

  - id: implementation
    generates: implementation.md
    instruction: |
      根據 specs/ 的行為場景，填充 ServiceImpl 中的業務邏輯。
      每完成一個方法，記錄對應的 Scenario 覆蓋情況。
    requires: [impl-api]
```

### 3.3 模板檔案

建立 `openspec/schemas/spring-boot-api-flow/templates/` 目錄下的模板：

**templates/proposal.md：**

```markdown
## 變更動機

<!-- 連結需求單號，說明業務背景 -->

## API 範圍

| Method | Path | 說明 | 新增/修改/刪除 |
|--------|------|------|---------------|
| | | | |

## 影響範圍

- **微服務**:
- **前端頁面**:
- **資料庫異動**:
- **需通知的團隊**:

## 風險評估

- **安全性**:
- **效能**:
- **向後相容**:
```

**templates/specs/spec.md：**

```markdown
# <Domain> Specification

## Purpose

<!-- 此 Spec 涵蓋的業務領域 -->

## Requirements

### Requirement: <API 行為名稱>

<!-- 行為描述，使用 MUST/SHOULD/MAY -->

#### Scenario: 成功情境

- GIVEN <前置條件>
- WHEN <HTTP Method> <Path>
- THEN 回傳 HTTP <Status Code>
- AND returnCode = <code>
- AND data 包含 <Response 結構>

#### Scenario: 失敗情境

- GIVEN <前置條件>
- WHEN <HTTP Method> <Path>
- THEN 回傳 HTTP <Status Code>
- AND returnCode = <error code>
- AND msg = "<錯誤訊息>"
```

---

## 第四部分：整合流程全景圖

### 4.1 完整生命週期

```
                    OpenSpec Schema 管轄範圍
  ┌───────────────────────────────────────────────────────┐
  │                                                       │
  │   openspec new change add-user-api                    │
  │   --schema spring-boot-api-flow                       │
  │        │                                              │
  │        ▼                                              │
  │   ┌─────────────┐                                    │
  │   │  proposal.md │  ← 為什麼做？影響什麼？             │
  │   └──────┬──────┘                                    │
  │          │                                            │
  │          ▼                                            │
  │   ┌─────────────────────┐                            │
  │   │ specs/user-api/     │  ← 行為契約                 │
  │   │   spec.md           │    Given/When/Then          │
  │   └──────┬──────────────┘                            │
  │          │                                            │
  │          ▼                                            │
  │   ┌─────────────────────┐                            │
  │   │ openapi-gen-result  │  ← AI 呼叫 /openapi-gen    │
  │   │   .md               │    記錄生成結果              │
  │   └──────┬──────────────┘                            │
  │          │                                            │
  │          ▼                                            │
  │   ┌─────────────────────┐                            │
  │   │ impl-api-result.md  │  ← AI 呼叫 /impl-api       │
  │   │                     │    記錄生成的檔案清單         │
  │   └──────┬──────────────┘                            │
  │          │                                            │
  │          ▼                                            │
  │   ┌─────────────────────┐                            │
  │   │ implementation.md   │  ← 業務邏輯實作記錄          │
  │   │                     │    Scenario 覆蓋追蹤         │
  │   └──────┬──────────────┘                            │
  │          │                                            │
  └──────────┼────────────────────────────────────────────┘
             │
             ▼
  ┌────────────────────────────────────────────────────────┐
  │   openspec verify add-user-api                         │
  │   ├── 完整性：所有 artifact 都產出了嗎？                 │
  │   ├── 正確性：程式碼行為對應 specs/ 的場景嗎？           │
  │   └── 一致性：Skill 執行結果與 specs 一致嗎？            │
  │                  │                                     │
  │                  ▼                                     │
  │   openspec archive add-user-api                        │
  │   ├── specs/ 的 delta 合併到 openspec/specs/            │
  │   └── change 移到 archive/                              │
  │                                                        │
  │   → 行為規格成為系統的 Source of Truth                   │
  └────────────────────────────────────────────────────────┘
```

### 4.2 資訊流向圖：AI Agent 作為 Runtime

```
  proposal.md (文件型)           specs/**/*.md (文件型)
  ┌──────────────┐               ┌──────────────────┐
  │ API 範圍表    │──────────────▶│ 行為場景           │
  │ Method+Path  │               │ HTTP Status Code  │
  │ 影響範圍      │               │ 錯誤處理           │
  └──────────────┘               └────────┬─────────┘
                                          │
                                          ▼
                                 AI Agent (runtime)
                                 ┌──────────────────┐
                                 │ 讀取 instruction   │
                                 │ 「使用 /openapi-gen │
                                 │   skill...」       │
                                 │                    │
                                 │ 呼叫 Skill Plugin  │
                                 └────────┬─────────┘
                                          │
                              ┌───────────┴──────────┐
                              │                      │
                              ▼                      ▼
                   /openapi-gen               /impl-api
                   ┌──────────────┐           ┌──────────────┐
                   │ 解析 Spec     │           │ 生成 Controller│
                   │ 生成 Interface│           │ 生成 Service   │
                   │ 分類 DTO      │           │ (stub + TODO) │
                   │ 更新 import   │           └───────┬──────┘
                   └───────┬──────┘                   │
                           │                          │
                           ▼                          ▼
                   openapi-gen-result.md      impl-api-result.md
                   (Skill 執行記錄)           (Skill 執行記錄)
                                                     │
                                                     ▼
                                          implementation.md
                                          (業務邏輯 + Scenario 覆蓋)
                                                     │
                                                     ▼
                                          openspec verify
                                          (對照 specs 驗收)
```

**關鍵：AI Agent 是整合的 runtime。** Schema 的 instruction 不直接呼叫 Skill，而是告訴 AI「用哪個 Skill」，AI 在同一 Session 中完成呼叫和結果記錄。

---

## 第五部分：Config 整合

### 5.1 Project Config

```yaml
# openspec/config.yaml
schema: spring-boot-api-flow

context: |
  技術棧：Java 17, Spring Boot 3.x, PostgreSQL
  架構：分層架構 (Controller → Service → Repository)
  回應格式：ResponseEntity<ReturnMsg<T>>
  API 路徑風格：RPC-style（/users/createUser, 非 RESTful）

  可用的 Skill Plugin：
  - /openapi-gen：從 OpenAPI Spec 生成 API Interface + DTO
  - /impl-api：從 API Interface 生成 Controller + Service
  - /commit：標準化提交（Checkstyle + PMD + Emoji Conventional Commits）

rules:
  proposal:
    - API 範圍表必須列出所有預計的 endpoint
    - 標明每個 endpoint 是 新增/修改/刪除
    - 安全性相關 API 需標注 Security Review
  specs:
    - 每個 API endpoint 至少有一個成功場景和一個失敗場景
    - 場景必須標明 HTTP Status Code
    - 錯誤場景需包含具體的錯誤訊息
```

**注意 config 的設計原則：**

- `context` 只列出 Skill Plugin 的名稱和用途，不重複 Skill 內部的規則（如 DTO 分類邏輯、命名規範）
- `rules` 只針對文件型 artifact（proposal、specs），Skill 執行型 artifact 不需要額外 rules（Skill 自帶邏輯）
- 編碼標準（類名長度、ReturnMsg 格式等）由 `.claude/rules/` 管理，不在此重複

### 5.2 Context 和 Rules 如何被消費

```
開發者執行 /opsx:continue add-user-api --artifact specs
                    │
                    ▼
       OpenSpec 組裝 AI Prompt
       ┌─────────────────────────────────────┐
       │                                     │
       │  <context>                          │
       │    技術棧：Java 17, Spring Boot...  │  ← config.yaml 的 context
       │    可用的 Skill Plugin：...          │
       │  </context>                         │
       │                                     │
       │  <rules>                            │
       │    - 每個 API endpoint 至少有一個    │  ← config.yaml 的 rules.specs
       │      成功場景和一個失敗場景           │
       │  </rules>                           │
       │                                     │
       │  <template>                         │
       │    # <Domain> Specification         │  ← templates/specs/spec.md
       │    ## Requirements                  │
       │  </template>                        │
       │                                     │
       │  <instruction>                      │
       │    定義 API 行為規格...              │  ← schema.yaml 的 instruction
       │  </instruction>                     │
       │                                     │
       │  <existing-artifacts>               │
       │    proposal.md 的內容               │  ← 已存在的上游 artifact
       │  </existing-artifacts>              │
       │                                     │
       └─────────────────────────────────────┘
                    │
                    ▼
            AI 生成 specs/user-api/spec.md
```

---

## 第六部分：實操演練

### 6.1 一次完整的整合流程

以「新增使用者管理 API」為例：

```bash
# ── Step 0: 初始化（僅首次）──

openspec init
openspec schema init spring-boot-api-flow \
  --description "Spring Boot API 開發流程" \
  --artifacts "proposal,specs,openapi-gen,impl-api,implementation"

# 設定預設 schema
# 編輯 openspec/config.yaml → schema: spring-boot-api-flow
```

```bash
# ── Step 1: 建立 Change ──

openspec new change add-user-api
# 自動使用 config.yaml 中設定的 spring-boot-api-flow schema
```

```bash
# ── Step 2: 撰寫 Proposal（文件型）──

/opsx:continue add-user-api --artifact proposal
# AI 基於 instruction + context + template 生成 proposal.md
# 開發者審查並調整
```

```bash
# ── Step 3: 定義行為規格（文件型）──

/opsx:continue add-user-api --artifact specs
# AI 基於 proposal 的 API 範圍表，為每個 endpoint 生成行為場景
# 開發者審查場景完整性
```

```bash
# ── Step 4: 執行 /openapi-gen（Skill 執行型）──

/opsx:continue add-user-api --artifact openapi-gen
# AI 讀取 instruction：「使用 /openapi-gen skill...」
# AI 在同一 Session 中呼叫 /openapi-gen
# AI 將生成結果摘要記錄到 openapi-gen-result.md
```

```bash
# ── Step 5: 執行 /impl-api（Skill 執行型）──

/opsx:continue add-user-api --artifact impl-api
# AI 讀取 instruction：「掃描 *Api.java，使用 /impl-api skill...」
# AI 對每個 API Interface 呼叫 /impl-api
# AI 將生成的檔案清單記錄到 impl-api-result.md
```

```bash
# ── Step 6: 實作業務邏輯（文件型）──

/opsx:continue add-user-api --artifact implementation
# AI 根據 specs 場景填充 ServiceImpl
# 記錄每個方法對應的 Scenario 覆蓋情況
```

```bash
# ── Step 7: 驗收與歸檔 ──

openspec verify add-user-api
openspec archive add-user-api
```

---

## 第七部分：其他部門的 Schema 整合 Pattern

### 7.1 通用整合模式

不管什麼部門、什麼 Plugin，整合 pattern 都是一樣的：

```
┌──────────────────────────────────────────────────┐
│  Schema artifact 結構                             │
│                                                   │
│  proposal    → 文件型（所有部門一致）               │
│      ↓                                            │
│  specs       → 文件型（Given/When/Then）           │
│      ↓                                            │
│  <skill-1>   → Skill 執行型（instruction 引用 Skill）│
│      ↓                                            │
│  <skill-2>   → Skill 執行型（依賴上游 Skill 結果）   │
│      ↓                                            │
│  implementation → 文件型（業務邏輯 + 覆蓋追蹤）      │
│                                                   │
└──────────────────────────────────────────────────┘
```

**共同部分：** proposal 和 specs 的結構和模板所有部門一致，這是跨部門溝通的共同語言。

**差異部分：** Skill 執行型 artifact 的數量和順序各部門自訂，因為使用的 Skill Plugin 不同。

### 7.2 不同部門的 Skill 執行型 Artifact 範例

| 部門 | Skill 執行型 Artifact | 對應的 Skill | instruction 寫法 |
|------|---------------------|-------------|-----------------|
| 後端 API | `openapi-gen`, `impl-api` | /openapi-gen, /impl-api | 「使用 /openapi-gen skill...」 |
| 前端 | `component-scaffold` | /component-scaffold | 「使用 /component-scaffold skill...」 |
| 資料 | `pipeline-scaffold` | /pipeline-scaffold | 「使用 /pipeline-scaffold skill...」 |

---

## 第八部分：FAQ

### Q1: Schema 可以自動呼叫 Skill 嗎？

**不是 Schema 呼叫，是 AI Agent 呼叫。** Schema 的 instruction 告訴 AI「用哪個 Skill」，AI 作為 runtime 在同一 Session 中呼叫 Skill 執行。OpenSpec 本身不執行外部指令。

### Q2: 為什麼 instruction 不放 Skill 的領域知識？

**因為會重複維護。** Skill 的領域知識（DTO 分類規則、命名規範、ReturnMsg 格式等）已經封裝在 Skill Plugin 內部。如果 instruction 也寫一份，當 Skill 更新時就要同步修改兩處。讓 AI 呼叫 Skill 時，Skill 自帶的知識自然生效。

### Q3: 如果我的 Plugin 有新的 Skill，Schema 需要改嗎？

**看流程是否改變。** 如果新 Skill 是現有流程的一部分（如改進了 `/openapi-gen`），Schema 不需要改。如果新 Skill 引入了新的流程階段，才需要在 Schema 中新增 Skill 執行型 artifact。

### Q4: generate-sd 和 specs 的關係？

**不同層級。** `/generate-sd` 產出完整的 System Design 文件，`specs` 是精簡的行為契約（Given/When/Then）。兩者可以共存：先用 `/generate-sd` 產出 SD 文件，specs 的 instruction 可以提示 AI 參考 SD 文件中的行為描述。

### Q5: 已經在開發中的功能，需要補建 OpenSpec Change 嗎？

**不建議。** OpenSpec 的價值在於「先規格後實作」。已經在開發中的功能，補寫 Spec 的成本高且價值低。建議從下一個新功能開始使用。

### Q6: 這跟直接用 /gen-api-task 有什麼差別？

**Schema 加了上游和下游。** `/gen-api-task` 只管程式碼生成（Q5），Schema 補上了 Q1-Q4（提案、行為契約）和驗收（`openspec verify`）。小變更用 `/gen-api-task`，大功能用 Schema 走完整流程。

---

*本指南應與 Schema 定義（schema.yaml）和模板檔案一起版控，作為團隊的整合參考文件。*
