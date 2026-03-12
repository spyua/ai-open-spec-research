# Project Config

`openspec/config.yaml` 是最重要的客製化入口，控制 AI 生成 artifacts 的品質。

## 三個設定項

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

### 差異比較

| 設定項 | 注入範圍 | 用途 | 建議 |
|--------|----------|------|------|
| `schema` | — | 預設 schema | 建議設定 |
| `context` | **所有** artifacts | 描述技術棧、架構、慣例 | **強烈建議** |
| `rules.<artifact>` | 只有**對應** artifact | 針對性生成規則 | 視團隊需求 |

## `schema` 設定

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

**解析優先順序：**
1. CLI flag: `--schema <name>`（最高）
2. Change metadata: `.openspec.yaml`
3. Project config: `openspec/config.yaml`
4. 預設值: `spec-driven`（兜底）

## `context` 設定

Context 會被注入到**所有** artifact 的 AI prompt 中。

### 最小版本

```yaml
context: |
  Tech stack: Java 17, Spring Boot 3.x, PostgreSQL
```

### 完整版本

```yaml
context: |
  ## Tech Stack
  - Language: Java 17
  - Framework: Spring Boot 3.x
  - Build Tool: Gradle (Kotlin DSL)
  - Database: PostgreSQL 15 + Flyway migration
  - Cache: Redis
  - API Style: RESTful, OpenAPI 3.0 documented

  ## Architecture
  - Layered architecture: Controller → Service → Repository
  - DDD for core business logic

  ## Conventions
  - Package naming: com.company.project.{domain}.{layer}
  - DTO suffix for data transfer objects
  - Integration tests use Testcontainers

  ## Team
  - Backend team: 5 developers
  - CI/CD: GitHub Actions → AWS ECS
```

::: tip Context 寫作原則
- 寫 AI 需要知道但無法從 code 推斷的資訊
- 保持在 20-30 行以內
- 可以用 Markdown 格式化
:::

## `rules` 設定

Rules 只注入到**對應** artifact 的 prompt：

```yaml
rules:
  proposal:
    - 必須包含 rollback plan（回滾計畫）
    - 必須識別受影響的微服務
  specs:
    - 使用 Given/When/Then (GWT) 格式撰寫 scenario
    - 必須包含 error scenario（異常情境）
  design:
    - 必須包含 sequence diagram（Mermaid）
    - 必須說明 DB schema 變更（如有）
  tasks:
    - 每個 task 必須可在 4 小時內完成
    - 必須包含單元測試和整合測試的 task
```

::: warning Rules 的 key 必須對應 schema 中的 artifact id
內建 `spec-driven` 的 id：`proposal`、`specs`、`design`、`tasks`。
Custom schema 要用你自己定義的 artifact id。
:::
