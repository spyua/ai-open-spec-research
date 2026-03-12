# OpenSpec 與 Spring Boot Plugin 整合說明

> **一句話總結**：OpenSpec 不呼叫 Plugin，OpenSpec 產出的文件（design.md、tasks.md）裡「寫著」要 AI 去呼叫哪些 Plugin 的 slash command。整合是透過 AI prompt instruction 實現的「文字層串接」，不是程式碼層的 API 呼叫。

---

## 兩個專案的角色

| 專案 | 角色 | 管什麼 |
|------|------|--------|
| **OpenSpec** | 流程控制層 | 管「做事的順序」— 透過 Schema 定義 Artifact DAG，決定先產 proposal、再寫 spec、再出 design、最後列 tasks |
| **tool-spring-boot-code-ai-plugin** | 執行層 | 管「怎麼做事」— 提供具體的 slash command（`/scaffold-jpa`、`/generate-sd` 等），AI 呼叫後自動生成程式碼 |

---

## 整合架構圖

```
┌─────────────────────────────────────────────────────────┐
│              你的 Spring Boot 專案                        │
│              (例如某個業務系統)                           │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ openspec/                  ← OpenSpec 管「流程」    │  │
│  │ ├── config.yaml                                   │  │
│  │ ├── schemas/                                      │  │
│  │ │   ├── spring-boot-analysis/  ← 自訂 schema     │  │
│  │ │   ├── spring-boot-dev/       ← 自訂 schema     │  │
│  │ │   └── spring-boot-workflow/  ← 自訂 schema     │  │
│  │ └── changes/                                      │  │
│  │     └── add-2fa/                                  │  │
│  │         ├── proposal.md                           │  │
│  │         ├── design.md     ← 裡面「寫」要用哪些    │  │
│  │         │                    plugin skills        │  │
│  │         └── tasks.md      ← 裡面「列」要跑哪些    │  │
│  │                              slash commands       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ .claude/                  ← Plugin 管「執行」      │  │
│  │ ├── commands/                                     │  │
│  │ │   ├── scaffold-jpa.md      ← 來自 plugin       │  │
│  │ │   ├── generate-sd.md       ← 來自 plugin       │  │
│  │ │   └── gen-api-task.md      ← 來自 plugin       │  │
│  │ └── rules/                                        │  │
│  │     └── coding-standards.md  ← 來自 plugin       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 整合方式：Schema 的 instruction 引用 Plugin 的 Skills

它們之間**沒有程式碼層級的整合**。整合完全發生在 **AI Prompt 的文字指令層**。

### 1. `spring-boot-analysis` schema 引用 `/generate-sd`

`system-design` artifact 的 instruction 中寫著：

```yaml
instruction: |
  根據前面三個 artifacts 的分析結果，執行 /generate-sd 產出完整的 SD 文件。
  - Phase 1（輸入解析）：引用 requirements.md，跳過重複解析
  - Phase 2（程式碼掃描）：引用 codebase-scan.md，跳過重複掃描
  - Phase 3（互動確認）：引用 design-decisions.md 作為預設方案
  - Phase 4-6：正常執行（生成 SD → 品質驗證 → 輸出確認）
```

這段 instruction 會被注入 AI Prompt，AI 讀到後就會去呼叫 `/generate-sd` 這個來自 plugin 的 slash command。

### 2. `spring-boot-dev` schema 引用 `/scaffold-jpa`、`/gen-api-task`、`/refactor`

`design` artifact 的 instruction：

```yaml
instruction: |
  在「可自動化元件」章節中，標註哪些部分可用以下 skills 自動生成：
  - /scaffold-jpa：新增 Entity 時，生成 Entity/Repository/Service/Controller/DTO/Mapper
  - /gen-api-task：有 OpenAPI spec 時，生成 API Interface + DTO
  - /scaffold-gcp-secret：需要 GCP Secret Manager 整合時
```

`tasks` artifact 的 instruction：

```yaml
instruction: |
  每個 task 須標註類型標籤：
  - 🤖 [自動] — 使用 skill 自動生成
  - ✋ [手動] — 需要手動撰寫

  任務順序：
  1. 前置準備（確認 /scaffold-rules 和 /scaffold-static-analysis 已部署）
  3. 程式碼骨架生成（/scaffold-jpa 三步驟流程 或 /gen-api-task）
  6. 品質檢查（/refactor）
```

---

## 流程圖：兩層如何串接

```
OpenSpec 流程控制層                        Plugin 執行層
═══════════════════                        ═══════════════

                                      tool-spring-boot-code-ai-plugin
                                      ┌─────────────────────────────┐
                                      │ /generate-sd     (6 階段)   │
                                      │ /scaffold-jpa    (JPA 骨架) │
┌──────────────────┐                  │ /gen-api-task    (API 生成)  │
│ spring-boot-     │   instruction    │ /refactor        (重構)     │
│ analysis schema  │   裡寫著         │ /scaffold-rules  (規範)     │
│                  │   「請執行        │ /scaffold-static-analysis   │
│ requirements ──┐ │    /generate-sd」 │ /scaffold-gcp-secret       │
│ codebase-scan  │ │ ──────────────▶  └─────────────────────────────┘
│ design-decisions│ │                         ▲
│ system-design ─┘ │                         │
└──────────────────┘                         │
                                             │
┌──────────────────┐   tasks.md 裡寫著       │
│ spring-boot-dev  │   「🤖 執行              │
│ schema           │    /scaffold-jpa」       │
│                  │ ────────────────────────┘
│ proposal ──────┐ │
│ specs          │ │
│ design         │ │
│ tasks ─────────┘ │
│ task-details     │
└──────────────────┘
```

---

## Sample Project 的三個 Schema 對比

| Schema | 用途 | 引用的 Plugin Skills |
|--------|------|---------------------|
| `spring-boot-analysis` | 分析既有系統，產出 System Design 文件 | `/generate-sd` |
| `spring-boot-dev` | 開發新功能，含自動化程式碼生成 | `/scaffold-jpa`、`/gen-api-task`、`/scaffold-gcp-secret`、`/scaffold-rules`、`/scaffold-static-analysis`、`/refactor` |
| `spring-boot-workflow` | 精簡版開發流程（config.yaml 的預設 schema） | 無直接引用（通用型） |

---

## 兩條 Pipeline 串接情境

```
Pipeline 1: spring-boot-analysis
┌────────────────┐   ┌───────────────┐   ┌──────────────────┐   ┌────────────────┐
│ requirements   │──▶│ codebase-scan │──▶│ design-decisions │──▶│ system-design  │
│ (解析 PRD)     │   │ (掃描程式碼)  │   │ (設計決策)       │   │ (呼叫          │
│                │   │               │   │                  │   │  /generate-sd) │
└────────────────┘   └───────────────┘   └──────────────────┘   └───────┬────────┘
                                                                        │
                                                                  Archive 後
                                                                  specs 合併至 SoT
                                                                        │
Pipeline 2: spring-boot-dev                                             ▼
┌──────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌──────────────┐
│ proposal │──▶│ specs  │──▶│ design │──▶│ tasks  │──▶│ task-details │
│          │   │        │   │ (標註   │   │ (標註   │   │ (展開手動    │
│          │   │        │   │  可自動 │   │  🤖/✋) │   │  task 明細)  │
│          │   │        │   │  化元件)│   │        │   │              │
└──────────┘   └────────┘   └────────┘   └────┬───┘   └──────────────┘
                                              │
                                        Apply 階段
                                              │
                                    ┌─────────▼──────────┐
                                    │ 🤖 /scaffold-jpa   │
                                    │ 🤖 /gen-api-task   │
                                    │ ✋ 手動寫商業邏輯   │
                                    │ 🤖 /refactor       │
                                    └────────────────────┘
```

---

## 關鍵理解

1. **OpenSpec 是「編排者」**：它定義做事的順序和每步該產出什麼文件，但不實際生成程式碼
2. **Plugin 是「執行者」**：它提供具體的程式碼生成能力（JPA 骨架、API 代碼、SD 文件等）
3. **串接靠 AI 理解自然語言**：Schema 的 `instruction` 欄位用自然語言告訴 AI「到這一步請呼叫 /scaffold-jpa」，AI 讀懂後自行呼叫
4. **不需要任何程式碼整合**：只要目標專案同時安裝了 OpenSpec 和 Plugin，AI 就能在 OpenSpec 流程中呼叫 Plugin 的 skills
