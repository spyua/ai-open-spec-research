# 範例 Schemas

## 如何選擇 Schema？

| 場景 | 推薦 Schema | 流程 |
|------|-------------|------|
| 小功能、hotfix | `rapid` | proposal → tasks → implement |
| 一般開發 | `spec-driven` | proposal → specs + design → tasks |
| 需要審核 | `with-review` | proposal → specs → design → review → tasks |
| 技術選型 | `research-first` | research → proposal → tasks |
| Spring Boot（有 skills） | `spring-boot-dev` | proposal → specs → design → tasks（含 🤖/✋） |
| 先分析再設計 | `spring-boot-analysis` | requirements → codebase-scan → design-decisions → SD |

## Rapid — 快速迭代

最少 overhead，適合小功能或 hotfix。跳過 specs 和 design。

```
流程：proposal → tasks → implement
```

```yaml
name: rapid
version: 1
description: Fast iteration with minimal overhead

artifacts:
  - id: proposal
    generates: proposal.md
    template: proposal.md
    instruction: |
      Create a brief proposal. Focus on what and why.
      Skip detailed specs — keep it under 1 page.
    requires: []

  - id: tasks
    generates: tasks.md
    template: tasks.md
    requires: [proposal]

apply:
  requires: [tasks]
  tracks: tasks.md
```

## With-Review — 含審核步驟

在 design 之後、tasks 之前加入 review 步驟。

```
流程：proposal → specs → design → review → tasks → implement
```

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
      Evaluate: Security, Performance, Test coverage,
      Backward compatibility, Deployment considerations.
    requires: [design]

  - id: tasks
    generates: tasks.md
    template: tasks.md
    requires: [design, review]

apply:
  requires: [tasks]
  tracks: tasks.md
```

## Research-First — 先研究再提案

適合技術選型或複雜問題。

```
流程：research → proposal → tasks → implement
```

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
      Compare pros/cons. Recommend one with justification.
    requires: []

  - id: proposal
    generates: proposal.md
    template: proposal.md
    instruction: |
      Create a proposal based on research findings.
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

## Spring Boot Dev — 開發流程（整合 Skills）

整合 plugin 的 skills，在 tasks 中混合自動化與手動步驟。

```
流程：proposal → specs → design → tasks → apply
                                  ↑            ↑
                         含「可自動化元件」  按 🤖/✋ 標籤執行
```

tasks 標註：
- 🤖 **[自動]** — 使用 skill 自動生成（如 `/scaffold-jpa`）
- ✋ **[手動]** — 需要手動撰寫

搭配的 `config.yaml`：

```yaml
schema: spring-boot-dev

context: |
  ## Available Skills (spring-boot-scaffolds plugin)
  - /scaffold-jpa — JPA Entity/Repository/Service/Controller/DTO/Mapper
  - /gen-api-task — OpenAPI spec → Java API Interface + DTO
  - /refactor — 7 階段系統化重構

rules:
  tasks:
    - 若涉及新增 Entity，必須包含「🤖 執行 /scaffold-jpa」步驟
    - 最後一個功能性 task 必須是「🤖 執行 /refactor 品質檢查」
```

## Spring Boot Analysis — 分析流程

從 PRD 出發，經過程式碼掃描和設計決策，產出 System Design 文件。

```
流程：requirements → codebase-scan → design-decisions → system-design
                                                              ↑
                                                        呼叫 /generate-sd
```

Codebase Scan 的三種分類：
- ♻️ **Reuse** — 完全可重用，無需修改
- ✏️ **Modify** — 部分符合，需新增欄位或方法
- 🆕 **Create** — 無現有元件，需全新建立

搭配的 `config.yaml`：

```yaml
schema: spring-boot-analysis

context: |
  ## Available Skills
  - /generate-sd — PRD → System Design 文件（6 階段互動式流程）

rules:
  requirements:
    - 需求 ID 格式必須為 FR-xxx、BE-xxx、NFR-xxx 或 FEATURE-xxx
  codebase-scan:
    - 掃描順序必須為 Entity → Repository → Service → Controller → DTO → Mapper → Config
  system-design:
    - 需求追溯矩陣必須達 100% 覆蓋率
```
