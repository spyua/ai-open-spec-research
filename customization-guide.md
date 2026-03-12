# OpenSpec 客製化設定完整指南

> 本文件從主教學指南獨立出來，涵蓋 OpenSpec 所有客製化相關的設定。

---

## 目錄

1. [客製化層級總覽](#1-客製化層級總覽)
2. [Project Config（專案設定）](#2-project-config)
3. [Schemas（可替換的骨架定義）](#3-schemas)
4. [Custom Schema 建立教學](#4-custom-schema-建立教學)
5. [Template 撰寫教學](#5-template-撰寫教學)
6. [多語言支援](#6-多語言支援)
7. [Schema CLI 指令參考](#7-schema-cli-指令參考)
8. [實戰範例 Schemas](#8-實戰範例-schemas)
9. [設定檢查與除錯](#9-設定檢查與除錯)

---

## 1. 客製化層級總覽

OpenSpec 提供三個層級的客製化，由淺到深：

| 層級 | 設定位置 | 用途 | 適合誰 |
|------|----------|------|--------|
| **Project Config** | `openspec/config.yaml` | 設定預設 schema、注入上下文與規則 | 大部分團隊 |
| **Custom Schema** | `openspec/schemas/<name>/` | 定義自己的 workflow artifacts | 有獨特流程的團隊 |
| **Global Overrides** | `~/.local/share/openspec/schemas/`（Linux/macOS）或 `%LOCALAPPDATA%/openspec/`（Windows） | 跨專案共用 schema | Power users |

**大部分情況只需要設定 Project Config 就夠了。** Custom Schema 是當內建的 `spec-driven` 骨架不符合你的流程時才需要。

---

## 2. Project Config

`openspec/config.yaml` 是最重要的客製化入口，控制 AI 生成 artifacts 的品質。

### 2.1 三個設定項

```yaml
# openspec/config.yaml

# ① schema — 預設使用的骨架定義
schema: spec-driven

# ② context — 注入到「所有」artifact 的 AI prompt
context: |
  ...

# ③ rules — 針對「特定」artifact 的規則
rules:
  proposal:
    - ...
  specs:
    - ...
```

#### 差異比較

| 設定項 | 注入範圍 | 用途 | 是否必填 |
|--------|----------|------|----------|
| `schema` | — | 預設 schema，省去每次打 `--schema` | 建議設定 |
| `context` | **所有** artifacts | 描述技術棧、架構、團隊慣例 | **強烈建議** |
| `rules.<artifact>` | 只有**對應** artifact | 針對性的生成規則 | 視團隊需求 |

### 2.2 `schema` 設定

設定後，所有指令自動使用此 schema：

```yaml
schema: spec-driven
```

```bash
# 有設定 → 不用指定
openspec new change my-feature

# 沒設定 → 每次都要指定
openspec new change my-feature --schema spec-driven
```

**Schema 解析優先順序：**

1. CLI flag: `--schema <name>`（最高優先）
2. Change metadata: `.openspec.yaml`（每個 change 可覆寫）
3. Project config: `openspec/config.yaml`（專案預設）
4. 預設值: `spec-driven`（兜底）

### 2.3 `context` 設定

Context 會被注入到**所有** artifact 的 AI prompt 中，讓 AI 了解你的專案背景。

#### 最小化版本

```yaml
context: |
  Tech stack: Java 17, Spring Boot 3.x, PostgreSQL
```

#### 完整版本

```yaml
context: |
  ## Tech Stack
  - Language: Java 17
  - Framework: Spring Boot 3.x
  - Build Tool: Gradle (Kotlin DSL)
  - Database: PostgreSQL 15 + Flyway migration
  - Cache: Redis
  - Message Queue: RabbitMQ
  - API Style: RESTful, OpenAPI 3.0 documented

  ## Architecture
  - Layered architecture: Controller → Service → Repository
  - Domain-Driven Design (DDD) for core business logic
  - CQRS pattern for read-heavy modules

  ## Conventions
  - Package naming: com.company.project.{domain}.{layer}
  - DTO suffix for data transfer objects
  - All public APIs must have Swagger annotations
  - Integration tests use Testcontainers

  ## Team
  - Backend team: 5 developers
  - Code review required before merge
  - CI/CD: GitHub Actions → AWS ECS
```

#### Context 寫作原則

- 寫 AI 需要知道但無法從 code 推斷的資訊
- 技術棧、架構風格、命名慣例、團隊流程
- 不要寫太長，保持在 20-30 行以內
- 可以用 Markdown 格式化

### 2.4 `rules` 設定

Rules 只注入到**對應** artifact 的 prompt，用來控制特定 artifact 的生成品質。

```yaml
rules:
  # proposal 專屬規則
  proposal:
    - 必須包含 rollback plan（回滾計畫）
    - 必須識別受影響的微服務
    - 必須評估對現有 API 的向後相容性影響
    - 如果涉及 DB schema 變更，必須說明 migration 策略

  # specs 專屬規則
  specs:
    - 使用 Given/When/Then (GWT) 格式撰寫 scenario
    - 必須包含 error scenario（異常情境）
    - API spec 必須包含 HTTP method、path、request/response 範例
    - 參考現有 specs 中的模式，避免發明新模式

  # design 專屬規則
  design:
    - 必須包含 sequence diagram 或 flow chart（可用 Mermaid）
    - 必須說明 DB schema 變更（如有）
    - 必須考慮 concurrency 和 thread safety
    - 必須評估 performance impact

  # tasks 專屬規則
  tasks:
    - 每個 task 必須可在 4 小時內完成
    - 必須包含單元測試和整合測試的 task
    - 必須包含 API 文件更新的 task（如果有 API 變更）
    - Task 順序應反映實際開發順序
```

#### Rules 的 key 必須對應 schema 中的 artifact id

如果你用的是內建 `spec-driven` schema，artifact id 為：`proposal`、`specs`、`design`、`tasks`。

如果你用 custom schema，key 要對應你自己定義的 artifact id。例如：

```yaml
# schema.yaml 中的 artifact id 是 "research"
artifacts:
  - id: research
    ...

# config.yaml 的 rules key 也要是 "research"
rules:
  research:
    - Must include at least 3 alternative approaches
```

### 2.5 AI Prompt 組裝方式

當 AI 生成某個 artifact 時，OpenSpec 會這樣組裝 prompt：

```xml
<context>
<!-- config.yaml 的 context，注入到所有 artifacts -->
Tech stack: Java 17, Spring Boot 3.x, PostgreSQL
Architecture: Controller → Service → Repository
...
</context>

<rules>
<!-- config.yaml 的 rules.<artifact>，只注入到對應 artifact -->
- 必須包含 rollback plan
- 必須識別受影響的微服務
</rules>

<dependencies>
<!-- 前置 artifact 的內容，由 schema 依賴關係決定 -->
[proposal.md 的內容]
</dependencies>

<template>
<!-- schema 的 template，定義 artifact 的結構 -->
[templates/proposal.md 的內容]
</template>

<instruction>
<!-- schema 中 artifact 的 instruction 欄位 -->
Create a proposal that explains WHY this change is needed.
</instruction>
```

---

## 3. Schemas

Schema = 可替換的骨架定義，決定你的 workflow 有哪些 artifacts、什麼順序組裝。

### 3.1 內建 Schema

**spec-driven**（預設且唯一的內建 schema）：

```
proposal → specs → design → tasks → implement
```

依賴圖：

```
              proposal
             (root node)
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
    specs               design
 (requires:           (requires:
  proposal)            proposal)
       │                   │
       └─────────┬─────────┘
                 ▼
              tasks
          (requires:
          specs, design)
```

**重要概念：Dependencies 是 enablers，不是 gates。**

- 它們表示「什麼可以做」，不是「什麼必須做」
- 你可以跳過 design 如果不需要
- specs 和 design 可以平行建立（都只依賴 proposal）

### 3.2 Schema 來源優先順序

| 優先順序 | 來源 | 路徑 |
|----------|------|------|
| 1 (最高) | Project | `openspec/schemas/<name>/` |
| 2 | User | `~/.local/share/openspec/schemas/<name>/` |
| 3 (最低) | Package | 內建 schemas |

Project-level schema 推薦，因為可以跟 code 一起 version control。

### 3.3 Schema 結構

一個 schema 由兩部分組成：

```
openspec/schemas/<name>/
├── schema.yaml        # 骨架定義（artifacts、依賴、指示）
└── templates/         # Artifact 模板
    ├── proposal.md
    ├── spec.md
    ├── design.md
    └── tasks.md
```

#### `schema.yaml` 完整欄位

```yaml
name: my-workflow              # Schema 名稱（kebab-case）
version: 1                     # 版本號
description: My team's workflow  # 描述

artifacts:
  - id: proposal               # 唯一識別碼
    generates: proposal.md      # 輸出檔名
    description: Change proposal  # 描述
    template: proposal.md       # templates/ 下的模板檔
    instruction: |              # AI 生成指示
      Create a proposal...
    requires: []                # 依賴的 artifact ids

  - id: specs
    generates: specs/**/*.md    # 支援 glob pattern
    description: Delta specs
    template: spec.md
    instruction: |
      Create delta specs...
    requires:
      - proposal               # 必須有 proposal 才能建立

apply:
  requires: [tasks]             # 進入實作階段需要的 artifacts
  tracks: tasks.md              # 追蹤進度的檔案
```

#### 欄位說明

| 欄位 | 必填 | 說明 |
|------|------|------|
| `name` | Yes | Schema 名稱，kebab-case |
| `version` | Yes | 版本號 |
| `description` | No | 描述文字 |
| `artifacts` | Yes | Artifact 定義陣列 |
| `artifacts[].id` | Yes | 唯一識別碼，用在 `requires`、`rules` key、CLI |
| `artifacts[].generates` | Yes | 輸出檔名，支援 glob（如 `specs/**/*.md`） |
| `artifacts[].description` | No | 描述文字 |
| `artifacts[].template` | Yes | `templates/` 目錄下的模板檔名 |
| `artifacts[].instruction` | No | AI 生成此 artifact 時的額外指示 |
| `artifacts[].requires` | Yes | 依賴的 artifact id 陣列（空陣列 `[]` 表示無依賴） |
| `apply.requires` | Yes | 進入 `/opsx:apply` 前必須完成的 artifacts |
| `apply.tracks` | Yes | 追蹤實作進度的檔案 |

---

## 4. Custom Schema 建立教學

### 4.1 方式 A: Fork 現有 Schema（推薦）

最快的方式是 fork 內建 schema 再修改：

```bash
openspec schema fork spec-driven my-workflow
```

產出：

```
openspec/schemas/my-workflow/
├── schema.yaml           # 完整的 spec-driven 副本
└── templates/
    ├── proposal.md       # 可自由修改
    ├── spec.md
    ├── design.md
    └── tasks.md
```

然後你可以：
- 修改 `schema.yaml` 增刪 artifacts、改依賴關係
- 修改 `templates/` 改 artifact 的結構和引導
- 修改 `instruction` 欄位改 AI 的生成指示

### 4.2 方式 B: 從零建立

```bash
# 互動式（會問你問題）
openspec schema init my-workflow

# 非互動式（一行搞定）
openspec schema init rapid \
  --description "Rapid iteration workflow" \
  --artifacts "proposal,tasks" \
  --default
```

**Options：**

| 選項 | 說明 |
|------|------|
| `--description <text>` | Schema 描述 |
| `--artifacts <list>` | 逗號分隔的 artifact IDs（預設：`proposal,specs,design,tasks`） |
| `--default` | 設為專案預設 schema |
| `--no-default` | 不詢問是否設為預設 |
| `--force` | 覆蓋已存在的 schema |

### 4.3 設為預設

建立完 custom schema 後，有兩種方式設為預設：

```bash
# 方式 1: 建立時加 --default
openspec schema init my-workflow --default

# 方式 2: 手動編輯 config.yaml
```

```yaml
# openspec/config.yaml
schema: my-workflow
```

### 4.4 驗證 Schema

使用前務必驗證：

```bash
openspec schema validate my-workflow
```

檢查項目：
- `schema.yaml` 語法正確
- 所有 template 檔案存在
- 無循環依賴（A requires B, B requires A）
- Artifact IDs 合法

### 4.5 查看 Schema 解析結果

```bash
# 查看特定 schema 來自哪裡
openspec schema which my-workflow

# 輸出：
# Schema: my-workflow
# Source: project
# Path: /path/to/project/openspec/schemas/my-workflow

# 列出所有可用 schemas
openspec schema which --all
```

---

## 5. Template 撰寫教學

Templates 是 markdown 文件，引導 AI 生成 artifact 的結構。

### 5.1 基本原則

- 用 section headers 定義 AI 需要填寫的區塊
- 用 HTML comments 給 AI 指引（不會出現在最終輸出）
- 可以包含範例格式

### 5.2 Proposal Template 範例

```markdown
# Proposal: {{change-name}}

## Intent

<!-- 為什麼要做這個變更？解決什麼業務問題？ -->

## Scope

<!-- 這次變更包含什麼？不包含什麼？ -->

### In Scope
-

### Out of Scope
-

## Approach

<!-- 高層次的實作方向，不需要太細節 -->

## Impact Analysis

### Affected Services
<!-- 列出受影響的微服務 -->

### API Changes
<!-- 是否有新增/修改/廢棄的 API？是否向後相容？ -->

### Database Changes
<!-- 是否有 schema 變更？migration 策略？ -->

## Rollback Plan

<!-- 如果上線後出問題，如何回滾？ -->

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
|      |           |        |            |
```

### 5.3 Spec Template 範例

```markdown
# Delta for {{domain}}

## ADDED Requirements

### Requirement: {{requirement-name}}

<!-- 用一句話描述這個需求 -->

#### API Contract

```
METHOD /api/v1/resource
```

**Request:**
```json
{}
```

**Response (200):**
```json
{}
```

#### Scenario: Happy path
- GIVEN
- WHEN
- THEN

#### Scenario: Error case
- GIVEN
- WHEN
- THEN the system returns an appropriate error response

## MODIFIED Requirements

## REMOVED Requirements
```

### 5.4 Design Template 範例

```markdown
# Design: {{change-name}}

## Architecture Overview

## Detailed Design

### Database Schema

```sql
-- V{version}__{description}.sql
```

### Domain Model

### Service Layer

### API Layer

```yaml
# OpenAPI snippet
paths:
  /api/v1/resource:
    post:
      summary:
      requestBody:
      responses:
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant Repository
    participant DB
```

## Performance Considerations

## Concurrency Considerations

## Dependencies

| Dependency | Version | Purpose |
|-----------|---------|---------|
```

### 5.5 Tasks Template 範例

```markdown
# Tasks

## 1. Database Migration
- [ ] 1.1 Create Flyway migration script
- [ ] 1.2 Test migration on local DB

## 2. Domain Layer
- [ ] 2.1 Create/update Entity classes
- [ ] 2.2 Create/update Value Objects

## 3. Service Layer
- [ ] 3.1 Create/update Service classes
- [ ] 3.2 Implement business logic

## 4. API Layer
- [ ] 4.1 Create/update DTOs
- [ ] 4.2 Create/update Controller
- [ ] 4.3 Add Swagger annotations

## 5. Testing
- [ ] 5.1 Unit tests for Service layer
- [ ] 5.2 Integration tests with Testcontainers
- [ ] 5.3 API tests (MockMvc)

## 6. Documentation
- [ ] 6.1 Update OpenAPI spec
```

---

## 6. 多語言支援

在 `config.yaml` 的 `context` 中加入語言指示即可，不需要額外設定。

### 繁體中文

```yaml
context: |
  語言：繁體中文（zh-TW）
  所有產出物必須用繁體中文撰寫。
  技術術語（API、REST、GraphQL）保留英文。
  程式碼和檔案路徑保留英文。
```

### 日文

```yaml
context: |
  言語：日本語
  すべての成果物は日本語で作成してください。
```

### 簡體中文

```yaml
context: |
  语言：中文（简体）
  所有产出物必须用简体中文撰写。
```

### 西班牙文

```yaml
context: |
  Idioma: Español
  Todos los artefactos deben escribirse en español.
```

### 技術術語處理

```yaml
context: |
  Language: Japanese
  Write in Japanese, but:
  - Keep technical terms like "API", "REST", "GraphQL" in English
  - Code examples and file paths remain in English
```

### 驗證語言設定

```bash
openspec instructions proposal --change my-change
# 輸出中會包含你的語言 context
```

---

## 7. Schema CLI 指令參考

### `openspec schema init <name>`

建立新 schema。

```bash
openspec schema init research-first
openspec schema init rapid --description "Fast workflow" --artifacts "proposal,tasks" --default
```

### `openspec schema fork <source> [name]`

Fork 現有 schema。

```bash
openspec schema fork spec-driven my-workflow
openspec schema fork spec-driven my-workflow --force  # 覆蓋已存在
```

### `openspec schema validate [name]`

驗證 schema 結構。

```bash
openspec schema validate my-workflow    # 驗證特定
openspec schema validate                # 驗證全部
openspec schema validate --verbose      # 詳細輸出
```

### `openspec schema which [name]`

查看 schema 來源。

```bash
openspec schema which spec-driven
openspec schema which --all
```

### `openspec schemas`

列出所有可用 schemas。

```bash
openspec schemas
openspec schemas --json
```

### `openspec templates`

查看 template 路徑。

```bash
openspec templates                      # 預設 schema
openspec templates --schema my-workflow  # 指定 schema
```

### `openspec instructions`

取得 artifact 生成指示（含 context + rules + template + dependencies）。

```bash
openspec instructions proposal --change add-dark-mode
openspec instructions design --change add-dark-mode --json
```

---

## 8. 實戰範例 Schemas

### 8.1 Rapid — 快速迭代

最少 overhead，適合小功能或 hotfix。跳過 specs 和 design。

```yaml
name: rapid
version: 1
description: Fast iteration with minimal overhead

artifacts:
  - id: proposal
    generates: proposal.md
    description: Quick proposal
    template: proposal.md
    instruction: |
      Create a brief proposal. Focus on what and why.
      Skip detailed specs — keep it under 1 page.
    requires: []

  - id: tasks
    generates: tasks.md
    description: Implementation checklist
    template: tasks.md
    instruction: |
      Create a concise task list. Each task should be actionable.
    requires: [proposal]

apply:
  requires: [tasks]
  tracks: tasks.md
```

```
流程：proposal → tasks → implement
```

### 8.2 With-Review — 含審核步驟

在 design 之後、tasks 之前加入 review 步驟。

```yaml
name: with-review
version: 1
description: Full workflow with mandatory review step

artifacts:
  - id: proposal
    generates: proposal.md
    template: proposal.md
    requires: []

  - id: specs
    generates: specs/**/*.md
    template: spec.md
    requires: [proposal]

  - id: design
    generates: design.md
    template: design.md
    requires: [specs]

  - id: review
    generates: review.md
    description: Pre-implementation review checklist
    template: review.md
    instruction: |
      Create a review checklist based on the design.
      Evaluate:
      - Security implications
      - Performance impact
      - Test coverage plan
      - Backward compatibility
      - Deployment considerations
      Flag any concerns that need resolution before implementation.
    requires: [design]

  - id: tasks
    generates: tasks.md
    template: tasks.md
    requires: [design, review]

apply:
  requires: [tasks]
  tracks: tasks.md
```

```
流程：proposal → specs → design → review → tasks → implement
```

### 8.3 Research-First — 先研究再提案

適合技術選型或複雜問題。

```yaml
name: research-first
version: 1
description: Research before committing to an approach

artifacts:
  - id: research
    generates: research.md
    description: Technical research and options analysis
    template: research.md
    instruction: |
      Research the problem space. List at least 3 approaches.
      Compare pros/cons of each. Recommend one with justification.
    requires: []

  - id: proposal
    generates: proposal.md
    template: proposal.md
    instruction: |
      Create a proposal based on the research findings.
      Reference the chosen approach from research.md.
    requires: [research]

  - id: tasks
    generates: tasks.md
    template: tasks.md
    requires: [proposal]

apply:
  requires: [tasks]
  tracks: tasks.md
```

```
流程：research → proposal → tasks → implement
```

### 8.4 Spring Boot Backend — 後端團隊專用

針對 Spring Boot 分層架構設計的完整 workflow。

```yaml
name: spring-boot-workflow
version: 1
description: Spring Boot backend team workflow with API-first design

artifacts:
  - id: proposal
    generates: proposal.md
    description: 變更提案
    template: proposal.md
    instruction: |
      Create a proposal. Focus on:
      - WHY this change is needed (business value)
      - WHAT will change (scope)
      - Impact on existing APIs and services
      - Rollback strategy
      - Affected microservices
    requires: []

  - id: specs
    generates: specs/**/*.md
    description: Delta specs
    template: spec.md
    instruction: |
      Create delta specs. Use Given/When/Then format.
      Include happy path and error scenarios.
      Include API contract (method, path, request/response).
    requires: [proposal]

  - id: design
    generates: design.md
    description: 技術設計
    template: design.md
    instruction: |
      Create a technical design. Include:
      - Which layers are affected (Controller/Service/Repository)
      - Database schema changes with Flyway migration plan
      - API design with OpenAPI snippets
      - Sequence diagrams (Mermaid format)
      - Performance and concurrency considerations
    requires: [specs]

  - id: tasks
    generates: tasks.md
    description: 實作清單
    template: tasks.md
    instruction: |
      Create implementation tasks. Each task under 4 hours.
      Include: DB migration, domain layer, repository, service,
      controller, unit tests, integration tests (Testcontainers),
      API documentation update.
    requires: [design]

apply:
  requires: [tasks]
  tracks: tasks.md
```

---

## 9. 設定檢查與除錯

### 確認目前使用哪個 Schema

```bash
openspec schema which --all
```

### 確認 Schema 是否合法

```bash
openspec schema validate my-workflow --verbose
```

### 確認 AI 看到的完整 Prompt

```bash
openspec instructions proposal --change my-change --json
```

這會輸出包含 context、rules、template、dependencies 的完整指示。

### 常見問題

| 問題 | 原因 | 解法 |
|------|------|------|
| Schema not found | 拼字錯誤或路徑不對 | `openspec schemas` 列出所有 |
| Template not found | schema.yaml 中的 template 欄位指向不存在的檔案 | `openspec schema validate` |
| Rules 沒生效 | rules key 跟 artifact id 不一致 | 確認 `rules.<key>` 對應 schema 中的 `artifacts[].id` |
| Context 沒生效 | config.yaml 語法錯誤（YAML indentation） | `openspec config list` 確認讀取正確 |
| Circular dependency | A requires B, B requires A | `openspec schema validate` 會偵測 |
| Artifacts 品質差 | context 和 rules 不夠具體 | 加入更多專案資訊和規則 |

### 檢查清單

設定 Custom Schema 前的完整 checklist：

- [ ] **config.yaml** — `schema` 設為你的 custom schema 名稱
- [ ] **config.yaml** — `context` 描述了技術棧和架構
- [ ] **config.yaml** — `rules` 針對每個 artifact 設了規則
- [ ] **schema.yaml** — 定義了所有需要的 artifacts
- [ ] **schema.yaml** — 依賴關係正確（無循環）
- [ ] **schema.yaml** — `apply.requires` 和 `apply.tracks` 正確
- [ ] **templates/** — 每個 artifact 都有對應的模板檔
- [ ] **驗證** — `openspec schema validate` 通過
- [ ] **測試** — 用 `openspec instructions` 確認 AI 看到的 prompt 正確

---

## 參考

- [主教學指南](README.md) — OpenSpec 完整教學
- [sample-project/](sample-project/) — 可直接複製使用的 Spring Boot 範例
- [examples/](examples/) — 各種 config 和 schema 範例
- [官方文件](https://github.com/Fission-AI/OpenSpec)
