# Plugin 整合

> **一句話總結**：OpenSpec 不呼叫 Plugin，OpenSpec 產出的文件（design.md、tasks.md）裡「寫著」要 AI 去呼叫哪些 Plugin 的 slash command。整合是透過 AI prompt instruction 實現的「文字層串接」，不是程式碼層的 API 呼叫。

## 兩個專案的角色

| 專案 | 角色 | 管什麼 |
|------|------|--------|
| **OpenSpec** | 流程控制層（編排者） | 管「做事的順序」— 透過 Schema 定義 Artifact DAG |
| **Plugin** | 執行層（執行者） | 管「怎麼做事」— 提供 slash command 自動生成程式碼 |

## 整合架構

```
┌─────────────────────────────────────────────────────┐
│              你的 Spring Boot 專案                    │
│                                                      │
│  openspec/              ← OpenSpec 管「流程」        │
│  ├── config.yaml                                     │
│  ├── schemas/spring-boot-dev/                        │
│  └── changes/add-2fa/                                │
│      ├── design.md  ← 裡面「寫」要用哪些 skills     │
│      └── tasks.md   ← 裡面「列」要跑哪些 commands   │
│                                                      │
│  .claude/               ← Plugin 管「執行」          │
│  ├── commands/                                       │
│  │   ├── scaffold-jpa.md     ← 來自 plugin          │
│  │   ├── generate-sd.md      ← 來自 plugin          │
│  │   └── gen-api-task.md     ← 來自 plugin          │
│  └── rules/coding-standards.md                       │
└─────────────────────────────────────────────────────┘
```

## 整合方式：instruction 引用 Plugin Skills

### `spring-boot-analysis` 引用 `/generate-sd`

```yaml
# system-design artifact 的 instruction
instruction: |
  根據前面三個 artifacts 的分析結果，執行 /generate-sd 產出完整的 SD 文件。
  - Phase 1（輸入解析）：引用 requirements.md
  - Phase 2（程式碼掃描）：引用 codebase-scan.md
  - Phase 3（互動確認）：引用 design-decisions.md
  - Phase 4-6：正常執行
```

### `spring-boot-dev` 引用 `/scaffold-jpa`

```yaml
# design artifact 的 instruction
instruction: |
  在「可自動化元件」章節中，標註哪些部分可用以下 skills 自動生成：
  - /scaffold-jpa：新增 Entity 時
  - /gen-api-task：有 OpenAPI spec 時
  - /scaffold-gcp-secret：需要 GCP Secret Manager 時
```

```yaml
# tasks artifact 的 instruction
instruction: |
  每個 task 須標註類型標籤：
  - 🤖 [自動] — 使用 skill 自動生成
  - ✋ [手動] — 需要手動撰寫
```

## Schema 對比

| Schema | 用途 | 引用的 Plugin Skills |
|--------|------|---------------------|
| `spring-boot-analysis` | 分析系統，產出 SD | `/generate-sd` |
| `spring-boot-dev` | 開發新功能 | `/scaffold-jpa`、`/gen-api-task`、`/refactor` 等 |
| `spring-boot-workflow` | 精簡版（預設） | 無直接引用 |

## 關鍵理解

1. **OpenSpec 是「編排者」**：定義做事順序和每步產出什麼文件
2. **Plugin 是「執行者」**：提供具體的程式碼生成能力
3. **串接靠 AI 理解自然語言**：instruction 用自然語言告訴 AI 去呼叫 skill
4. **不需要任何程式碼整合**：只要目標專案同時安裝了 OpenSpec 和 Plugin，AI 就能在流程中呼叫 skills
