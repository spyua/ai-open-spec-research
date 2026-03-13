# OpenSpec 架構分析報告：上下文自動化與 Prompt Engineering 內化

> 分析日期：2026-03-13
> 分析對象：OpenSpec — spec-driven development framework for AI coding assistants

---

## 摘要

本報告深入分析 OpenSpec 的架構設計，驗證一個核心假設：

> **「未來的 AI 開發流程中，上下文管理將自動化處理，而 Prompt Engineering 將內化為規格撰寫的一部分。」**

分析結果：**OpenSpec 的設計完全體現了這個理念。** 它透過 Schema-driven 依賴圖、5 層自動注入機制、以及結構化的 Spec 格式，將原本需要人工處理的 prompt engineering 工作，轉化為可配置、可版控、可複用的規格撰寫流程。

---

## 第一章：問題定義 — 為什麼需要內化？

### 1.1 傳統 AI 輔助開發的痛點

| 問題 | 傳統做法 | 後果 |
|------|----------|------|
| 上下文遺失 | 靠 chat history 傳遞 | 跨對話時資訊斷裂，AI「失憶」 |
| Prompt 品質不穩定 | 每次手寫 prompt | 輸出品質因人而異、因次而異 |
| 需求模糊 | 自然語言描述 | AI 自由發揮、範圍蔓延 |
| 不可重現 | 一次性對話 | 無法 review、audit、或重新生成 |
| 團隊不一致 | 各自 prompt 風格 | 產出格式混亂、無法標準化 |
| 約束重複 | 每次對話重述規則 | 遺漏約束、認知負擔高 |

### 1.2 內化的願景

```
今天:   開發者 = 需求撰寫者 + Prompt Engineer + 上下文管理員
未來:   開發者 = 規格撰寫者（其餘自動處理）
```

OpenSpec 的回答是：**把 prompt engineering 變成 spec engineering，把上下文管理變成 config management。**

---

## 第二章：上下文自動處理機制

### 2.1 五層自動注入架構

OpenSpec 透過 `instruction-loader.ts` 的 `generateInstructions()` 函數自動組裝完整的 AI 指令。開發者**完全不需要手動管理上下文**：

```
┌─────────────────────────────────────────────────────────┐
│                     最終 XML Prompt                      │
├─────────────────────────────────────────────────────────┤
│ Layer 1: Artifact Metadata                              │
│   來源：schema.yaml                                     │
│   內容：changeName, artifactId, schemaName, outputPath   │
│   注入方式：自動從 schema 解析                            │
├─────────────────────────────────────────────────────────┤
│ Layer 2: Project Context                                │
│   來源：openspec/config.yaml → context 欄位              │
│   內容：專案技術棧、架構約定、跨平台需求等                  │
│   注入方式：自動注入到「所有」artifact                     │
│   限制：上限 50KB                                        │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Artifact-Specific Rules                        │
│   來源：openspec/config.yaml → rules[artifactId]         │
│   內容：該 artifact 特有的約束條件                        │
│   注入方式：僅注入「對應」的 artifact                      │
├─────────────────────────────────────────────────────────┤
│ Layer 4: Schema Instructions                            │
│   來源：schema.yaml → artifact.instruction               │
│   內容：如何思考和建構這個 artifact                        │
│   注入方式：從 schema 定義中自動讀取                      │
├─────────────────────────────────────────────────────────┤
│ Layer 5: Template Structure                             │
│   來源：schemas/<name>/templates/<artifact>.md            │
│   內容：輸出檔案的結構骨架                                │
│   注入方式：從 templates 目錄自動載入                      │
└─────────────────────────────────────────────────────────┘
```

### 2.2 依賴圖驅動的上下文傳遞

Schema 定義了 artifact 之間的依賴關係（DAG），系統自動將已完成的前置 artifact 路徑注入 `<dependencies>`：

```yaml
# schemas/spec-driven/schema.yaml
artifacts:
  - id: proposal
    requires: []              # 無前置依賴 → 第一個開始

  - id: specs
    requires: [proposal]      # 系統自動帶入 proposal.md 的路徑

  - id: design
    requires: [proposal]      # 系統自動帶入 proposal.md 的路徑

  - id: tasks
    requires: [specs, design] # 系統自動帶入 specs + design 的路徑
```

**關鍵觀察**：開發者不需要告訴 AI「請先看 proposal 再寫 specs」。依賴圖（使用 Kahn's 演算法進行拓撲排序）自動處理這件事。AI 收到的指令中已包含前置 artifact 的完整路徑和完成狀態。

### 2.3 自動組裝的 XML 輸出

`instructions.ts` 中的 `printInstructionsText()` 將五層組裝成結構化 XML，以 OpenSpec 自身專案為例：

```xml
<artifact id="specs" change="add-2fa" schema="spec-driven">

  <task>
    Create the specs artifact for change "add-2fa".
    Specification files defining what the system should do
  </task>

  <project_context>
    <!-- This is background information for you. Do NOT include this in your output. -->
    Tech stack: TypeScript, Node.js (≥20.19.0), ESM modules
    Package manager: pnpm
    CLI framework: Commander.js
    Cross-platform requirements:
    - Always use path.join() or path.resolve() for file paths
    - Never hardcode slashes
    - Tests must use path.join() for expected path values
  </project_context>

  <rules>
    <!-- These are constraints for you to follow. Do NOT include this in your output. -->
    - Include scenarios for Windows path handling when dealing with file paths
    - Requirements involving paths must specify cross-platform behavior
    - Be explicit about mechanisms, not just outcomes (say HOW, not just WHAT)
    - If we generate artifacts, specify deletion/modification by explicit list lookup
  </rules>

  <dependencies>
    Read these files for context before creating this artifact:
    <dependency id="proposal" status="done">
      <path>openspec/changes/add-2fa/proposal.md</path>
      <description>Initial proposal document outlining the change</description>
    </dependency>
  </dependencies>

  <output>
    Write to: openspec/changes/add-2fa/specs/auth.md
  </output>

  <instruction>
    Create specification files that define WHAT the system should do.
    Create one spec file per capability listed in the proposal...
    ...
  </instruction>

  <template>
    <!-- Use this as the structure for your output file. Fill in the sections. -->
    ## ADDED Requirements
    ### Requirement: <name>
    #### Scenario: <name>
    ...
  </template>

  <unlocks>
    Completing this artifact enables: tasks
  </unlocks>

</artifact>
```

### 2.4 上下文隔離的精心設計

系統刻意將不同類型的上下文**分離為獨立的 XML 元素**，而非串接成一個字串：

```typescript
// instruction-loader.ts — ArtifactInstructions 介面
export interface ArtifactInstructions {
  context: string | undefined;       // 專案背景（不應出現在輸出中）
  rules: string[] | undefined;       // Artifact 約束（不應出現在輸出中）
  template: string;                  // 輸出結構（這才是輸出格式）
  instruction: string | undefined;   // 操作指引（如何思考）
  dependencies: DependencyInfo[];    // 前置依賴（要先讀什麼）
}
```

XML 輸出中的關鍵標注：

- `<project_context>` → `<!-- This is background information for you. Do NOT include this in your output. -->`
- `<rules>` → `<!-- These are constraints for you to follow. Do NOT include this in your output. -->`
- `<template>` → `<!-- Use this as the structure for your output file. Fill in the sections. -->`

這種設計防止 AI 把背景約束混入生成的文件內容中——一個經典的 prompt engineering 問題，在這裡被**架構化地解決**了。

### 2.5 Config 即時生效，無快取

```typescript
// project-config.ts — 每次都直接讀取，不做快取
export function readProjectConfig(projectRoot: string): ProjectConfig | null {
  // 直接讀取 config.yaml，不使用快取
  // 確保配置修改立即反映在下一次 instruction 生成中
}
```

開發者修改 `config.yaml` 後，下一次執行 `openspec instructions` 就會使用新的 context 和 rules——不需要重啟、不需要清除快取。

---

## 第三章：Prompt Engineering 內化為 Spec 撰寫

### 3.1 核心觀點

OpenSpec 的 spec 格式本身就是精心設計的 prompt engineering 產物。當開發者「寫 spec」時，他們其實在做的是「structured prompting」——只是他們不需要知道這一點。

### 3.2 RFC 2119 關鍵字 → 需求強度的自動編碼

```markdown
### Requirement: Session Management
The system SHALL invalidate sessions after 15 minutes of inactivity.
The system SHOULD warn users 2 minutes before timeout.
The system MAY allow users to extend sessions.
```

| 關鍵字 | 語義 | 對 AI 的隱含 Prompt |
|--------|------|---------------------|
| SHALL / MUST | 強制要求 | 「這個一定要實作，測試一定要覆蓋」 |
| SHOULD | 建議要求 | 「優先實作，但允許有理由的例外」 |
| MAY | 可選要求 | 「時間允許才做，不做不影響驗收」 |

**傳統做法**：在 prompt 中寫「這個功能一定要做」vs「這個功能可以先跳過」。
**OpenSpec 做法**：用 RFC 2119 關鍵字直接編碼進 spec 語法。AI 不需要額外提示就能理解優先級和強制性。

### 3.3 Given/When/Then → 可測試性的自動編碼

```markdown
#### Scenario: Session timeout
- GIVEN an authenticated user idle for 15 minutes
- WHEN the timeout period expires
- THEN the session SHALL be invalidated
- AND the user SHALL be redirected to login page
```

**為什麼這是 prompt engineering 內化？**

1. **BDD 格式本身就是結構化 prompt**：它精確定義了前置條件、觸發動作、預期結果
2. **AI 能直接從場景生成測試案例**，不需要額外的「請寫出測試」prompt
3. **場景即合約**：明確到可以機器解析的程度

Schema instruction 還強制要求場景使用 `####`（四個 hashtag），確保解析的確定性：

```yaml
# schema.yaml 中的 specs instruction
instruction: |
  IMPORTANT: Use exactly #### (four hashtags) for Scenario headers.
  DO NOT use ### (three hashtags) — that level is reserved for Requirement headers.
```

### 3.4 Delta 操作 → 變更意圖的自動編碼

```markdown
## ADDED Requirements
### Requirement: Two-Factor Authentication
（完整的新需求描述...）

## MODIFIED Requirements
### Requirement: Session Timeout
（必須包含完整的更新後內容，不是 diff 或摘要）

## REMOVED Requirements
### Requirement: Remember Me
**Reason**: Replaced by 2FA
**Migration**: Guide users to setup 2FA

## RENAMED Requirements
FROM: Old Name
TO: New Name
```

**這解決了 LLM 的一個核心問題——部分內容幻覺。** Schema instruction 中明確警告：

> "MODIFIED requirements workflow:
> 1. Locate existing requirement in specs/
> 2. Copy ENTIRE requirement block (header, body, all scenarios)
> 3. Paste under MODIFIED and edit
>
> Common pitfall: Using MODIFIED with partial content loses detail at archive time."

強制「完整複製再修改」，而非讓 AI「描述差異」，從根本上防止資訊遺失。

### 3.5 Template 即 Prompt Structure

每個 artifact 的 template 不只是格式範本，它定義了 AI 的**思考框架**：

**Proposal Template — 「為什麼」的思考框架：**
```markdown
## Why
<!-- 1-2 句話描述問題或機會 -->

## What Changes
<!-- 高層次描述會改什麼 -->

## Capabilities
### New Capabilities
- `<name>`: <brief description>
### Modified Capabilities
- `<existing-name>`: <what is changing>

## Impact
<!-- 影響範圍 -->
```

**Design Template — 「怎麼做」的思考框架：**
```markdown
## Context
## Goals and Non-Goals
### Goals
### Non-Goals
## Decisions
### Decision: <title>
**Options considered:** ...
**Chosen:** ...
**Rationale:** ...
## Risks and Trade-offs
```

**Tasks Template — 「做什麼」的思考框架：**
```markdown
## 1. <Group Name>
- [ ] Task description
- [ ] Task description
```

**關鍵設計**：Tasks 的 checkbox 格式有嚴格的 regex 約束：

```typescript
// 只有符合此 regex 的行才會被解析為 task
const checkboxMatch = line.match(/^[-*]\s*\[([ xX])\]\s*(.+)\s*$/);
```

不符合格式的任務會被靜默忽略。這是**透過格式約束來實現確定性解析**——prompt engineering 的「output formatting」技巧被內化為解析器規則。

### 3.6 Capability 宣告即合約綁定

Proposal 的 Capabilities 區段建立了 proposal 與 specs 之間的**合約**：

```markdown
### New Capabilities
- `two-factor-auth`: Two-factor authentication for user accounts
- `session-hardening`: Enhanced session security

### Modified Capabilities
- `login-flow`: Updated to support 2FA verification step
```

Schema instruction 明確強調：

> "IMPORTANT: The Capabilities section is critical. It creates the contract between proposal and specs phases."

**這防止了 LLM 的 scope creep 問題**——AI 在 specs 階段不能「自作主張」添加 proposal 未列出的 capability。合約綁定取代了手動 prompt 中的「請不要添加額外功能」。

### 3.7 Rules 即可複用的 Prompt 約束

OpenSpec 自身專案的真實配置：

```yaml
# openspec/config.yaml
rules:
  specs:
    - Include scenarios for Windows path handling when dealing with file paths
    - Requirements involving paths must specify cross-platform behavior
    - Be explicit about mechanisms, not just outcomes (say HOW, not just WHAT)
    - If we generate artifacts, specify deletion/modification by explicit list lookup,
      not pattern matching
  tasks:
    - Add Windows CI verification as a task when changes involve file paths
    - Include cross-platform testing considerations
  design:
    - Document any platform-specific behavior or limitations
    - Prefer Node.js path module over string manipulation for paths
    - Use existing constants and lists — don't invent detection mechanisms
    - Prefer explicit lookups over pattern matching or regex
    - If we generate it, we track it by name in a constant
```

**為什麼這是 prompt engineering 內化？**

| 傳統做法 | OpenSpec 做法 |
|----------|---------------|
| 每次對話重述「記得處理 Windows 路徑」 | rules 配置一次，永久自動注入 |
| 約束藏在 chat history 中 | 約束在 YAML 中，可 review、可 diff |
| 只有寫 prompt 的人知道約束 | 團隊都能看到、修改、討論 |
| 約束可能被遺忘 | 系統自動注入，不可能遺漏 |

### 3.8 Schema 即可客製化的 Prompt 流程

Schema 系統讓「如何引導 AI」變成了可版控的配置：

```
openspec/schemas/my-workflow/
├── schema.yaml           # 定義 artifact 類型、依賴、instruction
└── templates/
    ├── rfc.md             # 自定義 template
    ├── adr.md             # 架構決策記錄
    └── implementation.md  # 實作計畫
```

透過 `openspec schema fork spec-driven my-workflow`，團隊可以：
- 新增/移除 artifact 類型（改變思考步驟）
- 修改依賴圖（改變資訊流）
- 客製化 instruction（改變 AI 的推理方式）
- 客製化 template（改變輸出結構）

**Prompt engineering 變成了 configuration management。**

---

## 第四章：Prompt Engineering 技巧的對應關係

### 4.1 經典技巧 vs OpenSpec 機制

| Prompt Engineering 技巧 | 目的 | OpenSpec 對應機制 | 所在位置 |
|-------------------------|------|-------------------|----------|
| **System Prompt** | 設定 AI 角色和背景 | Project Context | `config.yaml → context` |
| **Few-shot Examples** | 示範輸出格式 | Template Structure | `schemas/*/templates/*.md` |
| **Chain-of-Thought** | 分步推理 | Dependency Graph (DAG) | `schema.yaml → requires` |
| **Output Formatting** | 控制輸出格式 | Template + Parser | template + `requirement-blocks.ts` |
| **Constraint Prompting** | 設定約束條件 | Rules | `config.yaml → rules` |
| **Role Prompting** | 指定任務角色 | Artifact Instruction | `schema.yaml → instruction` |
| **Structured Output** | 結構化回應 | XML Tags | `instructions.ts` |
| **Guardrails** | 防止偏離 | Capability Contract | proposal → specs 合約 |
| **Context Window Management** | 管理上下文 | Dependency Injection | 自動注入依賴路徑 |
| **Decomposition** | 拆解複雜任務 | Artifact DAG | 多步驟自動排序 |

### 4.2 三個關鍵轉變

```
轉變 1：手動 → 自動
  Before: 開發者手動複製貼上上下文到 prompt
  After:  config.yaml + dependency graph 自動注入

轉變 2：隱性 → 顯性
  Before: Prompt 技巧藏在個人經驗中
  After:  Schema/Template/Rules 都是可 review 的檔案

轉變 3：一次性 → 可複用
  Before: 每次對話重新寫 prompt
  After:  配置一次，跨所有 change 自動套用
```

---

## 第五章：技術實作深度分析

### 5.1 核心資料流

```
openspec/config.yaml                    schemas/spec-driven/schema.yaml
┌──────────────────┐                    ┌──────────────────────┐
│ schema: spec-driven│                   │ artifacts:           │
│ context: "..."   │                    │   - id: proposal     │
│ rules:           │                    │     requires: []     │
│   specs: [...]   │                    │     instruction: "..."│
│   tasks: [...]   │                    │     template: ...    │
└────────┬─────────┘                    │   - id: specs        │
         │                              │     requires: [proposal]│
         │                              └──────────┬───────────┘
         │                                         │
         └──────────────┬──────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  instruction-loader.ts │
            │  generateInstructions()│
            │                       │
            │  1. 解析 schema       │
            │  2. 讀取 template     │
            │  3. 讀取 config       │
            │  4. 驗證 rules IDs    │
            │  5. 組裝 instructions │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │ ArtifactInstructions  │
            │ {                     │
            │   context,            │ ← Layer 2
            │   rules,              │ ← Layer 3
            │   instruction,        │ ← Layer 4
            │   template,           │ ← Layer 5
            │   dependencies,       │ ← DAG 解析
            │ }                     │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   instructions.ts     │
            │ printInstructionsText()│
            │                       │
            │  → <artifact>         │
            │    <task>              │
            │    <project_context>  │
            │    <rules>            │
            │    <dependencies>     │
            │    <output>           │
            │    <instruction>      │
            │    <template>         │
            │    <unlocks>          │
            │  → </artifact>        │
            └───────────────────────┘
```

### 5.2 關鍵程式碼路徑

| 檔案 | 職責 |
|------|------|
| `src/core/project-config.ts` | 解析 config.yaml，Zod 驗證，50KB 限制 |
| `src/core/artifact-graph/instruction-loader.ts` | 組裝 5 層指令，驗證 rules artifact ID |
| `src/commands/workflow/instructions.ts` | 輸出 XML 結構化 prompt |
| `src/core/parsers/requirement-blocks.ts` | 解析 delta spec 結構化格式 |
| `src/core/specs-apply.ts` | 將 delta spec 合併回主 spec |
| `schemas/spec-driven/schema.yaml` | 預設 schema 定義（4 artifacts + apply） |
| `schemas/spec-driven/templates/*.md` | 各 artifact 的輸出結構範本 |

### 5.3 防幻覺設計矩陣

| LLM 幻覺類型 | OpenSpec 防護機制 | 實作位置 |
|-------------|-----------------|----------|
| **格式偏離** | Template 強制輸出結構 | `templates/*.md` |
| **資訊遺失** | MODIFIED 要求完整複製再修改 | `schema.yaml → specs instruction` |
| **範圍蔓延** | Capability 合約綁定 proposal → specs | `schema.yaml → proposal instruction` |
| **任務格式錯誤** | Checkbox regex 嚴格匹配 | `requirement-blocks.ts` |
| **約束洩漏** | XML 註解標示「Do NOT include in output」 | `instructions.ts` |
| **依賴遺漏** | DAG 自動帶入前置 artifact | `instruction-loader.ts` |
| **上下文過期** | 無快取，每次直接讀取 config | `project-config.ts` |

### 5.4 Schema 解析優先順序

```
Schema 名稱來源（優先順序高 → 低）：
┌─────────────────────────────────────┐
│ 1. --schema CLI flag               │ ← 最高優先
│ 2. .openspec.yaml → schema 欄位    │
│ 3. config.yaml → schema 欄位       │
│ 4. 內建 fallback: "spec-driven"    │ ← 最低優先
└─────────────────────────────────────┘

Schema 檔案來源（三層查找）：
┌─────────────────────────────────────┐
│ 1. 專案本地: openspec/schemas/<name>/│ ← 最高優先
│ 2. 使用者全域: $XDG_DATA_HOME/...   │
│ 3. 套件內建: <package>/schemas/...  │ ← 最低優先
└─────────────────────────────────────┘
```

---

## 第六章：開發者體驗對比

### 6.1 工作流對比

```
┌─────────────────────────────────────────────────────────────────────┐
│ 傳統 AI 輔助開發                                                     │
│                                                                     │
│ 開發者 → 手寫 prompt → 手動貼上下文 → AI 生成 → 檢查 → 不滿意 → 重寫  │
│          ↑ 每次重寫     ↑ 容易遺漏      ↑ 品質不穩      ↑ 浪費時間    │
│                                                                     │
│ 問題：prompt 在 chat history 中，不可 review、不可重現、不可複用       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ OpenSpec 模式                                                        │
│                                                                     │
│ 開發者 → 設定 config → 寫 spec → 系統自動組裝 prompt → AI 生成        │
│          ↑ 一次設定     ↑ 結構化     ↑ 自動注入 context               │
│            可複用       可 review      + rules + deps                │
│                                                                     │
│ 結果：prompt engineering 被 spec 撰寫取代                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 維度對比表

| 維度 | 傳統 Prompt Engineering | OpenSpec Spec Engineering |
|------|------------------------|--------------------------|
| **上下文管理** | 手動複製貼上 | config.yaml 自動注入 |
| **約束傳遞** | 每次對話重寫 | rules 配置，自動套用 |
| **輸出格式** | 靠 prompt 描述 | template 結構化定義 |
| **流程控制** | 人工判斷順序 | dependency graph 自動排序 |
| **可重現性** | 不可重現 | schema + config + template 完全可重現 |
| **可版控** | chat history 不可版控 | 所有設定都是檔案，可 git 管理 |
| **團隊協作** | 個人 know-how | 配置化，可共享、可 review |
| **品質穩定性** | 因人而異 | 格式約束 + 規則注入，輸出穩定 |
| **迭代成本** | 修改 prompt 需重新對話 | 修改 YAML/template 即時生效 |
| **知識保存** | 散落在各處 chat | 集中在 config + schema |
| **錯誤防護** | 靠開發者記憶 | 系統化防幻覺設計 |

---

## 第七章：演進階段分析

### 7.1 AI 輔助開發的三階段模型

```
Phase 1（現在）：手動 Prompt Engineering
├── 開發者手動寫 prompt
├── 手動管理上下文（複製貼上）
├── 每次對話都是獨立的
├── Prompt 技巧是個人經驗
└── 無法標準化或規模化

Phase 2（過渡）：結構化框架輔助
├── 框架提供結構化格式（spec format）
├── 半自動管理上下文（config + dependency graph）
├── Prompt 技巧被編碼進 schema/template/rules
├── 團隊可以共享和迭代 prompt 策略
└── OpenSpec 處於這個階段 ◀

Phase 3（未來）：完全內化
├── Spec 格式即 prompt（開發者無需知道 prompt engineering）
├── 上下文完全自動化（零配置或自適應配置）
├── AI 自動選擇最佳推理策略
├── Schema 可能由 AI 根據專案特性自動生成
└── Prompt Engineering 作為獨立技能消失
```

### 7.2 OpenSpec 已實現的內化程度

| 面向 | Phase 1 做法 | OpenSpec 已實現 | Phase 3 願景 | 差距 |
|------|-------------|----------------|-------------|------|
| 上下文注入 | 手動 | 自動（config → XML） | 完全自動 | 仍需手動寫 config.yaml |
| 輸出格式控制 | prompt 描述 | template 定義 | AI 自適應 | 仍需手動維護 template |
| 約束管理 | 每次重述 | rules 配置 | AI 自動學習 | 仍需手動寫 rules |
| 流程排序 | 人工判斷 | DAG 自動 | AI 自動規劃 | **已完全自動** |
| 防幻覺 | 靠運氣 | 結構化防護 | AI 自校準 | 架構化解決，接近 Phase 3 |
| 可重現性 | 不可能 | 完全可重現 | 完全可重現 | **已達到 Phase 3** |

### 7.3 OpenSpec 尚未到達 Phase 3 的部分

1. **Config 仍需人工撰寫**：context 和 rules 需要開發者手動定義。未來可能由 AI 掃描 codebase 自動生成。
2. **Schema 選擇仍需人工決定**：雖然有 fallback，但客製 schema 需要人工設計。未來可能 AI 根據專案特性推薦或生成。
3. **Template 仍是靜態的**：template 定義了固定結構。未來可能根據需求動態調整輸出格式。

---

## 第八章：結論

### 8.1 核心發現

OpenSpec 的架構設計**完整驗證了以下假設**：

> **「未來上下文會改成自動處理，Prompt Engineering 會內化進 Spec 撰寫。」**

具體體現在三個維度：

**維度一：上下文自動化**
透過 `config.yaml → instruction-loader → XML assembly` 的管線，開發者只需設定一次 context 和 rules，系統在每次生成 artifact 時自動注入完整上下文。依賴圖確保前置資訊自動傳遞，無需人工干預。

**維度二：Prompt Engineering 內化**
RFC 2119 關鍵字、Given/When/Then 場景、Delta 操作、Template 結構、Rules 配置——這些都是將 prompt engineering 的最佳實踐**編碼進 spec 格式本身**。開發者不需要懂 prompt engineering，只需要按照 spec 格式撰寫需求。

**維度三：可配置化**
Schema 系統讓「如何引導 AI」變成了可版控、可共享、可迭代的配置檔，而非散落在 chat history 中的隱性知識。

### 8.2 一句話總結

> **OpenSpec 讓「寫好 spec = 寫好 prompt」，讓「配好 config = 管好上下文」。
> Prompt Engineering 作為一個獨立技能，正在被 Spec Engineering 取代。**

---

*本報告基於 OpenSpec 原始碼深度分析生成，涵蓋 instruction-loader、project-config、instructions command、schema system、delta parser 等核心模組的實作細節。*
