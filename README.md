# OpenSpec 完整教學指南

> **OpenSpec = 可插拔的規格骨架 (Pluggable Spec Scaffold)**
> 它不是一個死板的流程框架，而是一套可組裝、可替換的「規格產出骨架」，讓 AI 在寫 code 之前先跟你對齊「要做什麼」。

---

## 目錄

1. [核心概念：為什麼需要 OpenSpec](#1-核心概念)
2. [安裝與初始化](#2-安裝與初始化)
3. [目錄結構解析](#3-目錄結構解析)
4. [兩種工作模式](#4-兩種工作模式)
5. [Slash Commands 完整參考](#5-slash-commands-完整參考)
6. [CLI 終端指令完整參考](#6-cli-終端指令完整參考)
7. [Artifacts 詳解（可插拔的骨架零件）](#7-artifacts-詳解)
8. [Delta Specs（差異規格）](#8-delta-specs)
9. [客製化設定（獨立章節）](#9-客製化設定)
10. [支援的 AI 工具](#10-支援的-ai-工具)
11. [完整工作流程 End-to-End 範例](#11-完整工作流程範例)
12. [Troubleshooting](#12-troubleshooting)
13. [名詞對照表](#13-名詞對照表)

---

## 1. 核心概念

### 設計哲學

```
fluid not rigid       — 沒有 phase gate，什麼有意義就做什麼
iterative not waterfall — 邊做邊學，邊學邊改
easy not complex      — 輕量設定，最少儀式
brownfield-first      — 為既有系統而生，不只是 greenfield
```

### 一句話總結

OpenSpec 把「AI 幫你寫 code 之前應該產出的文件」拆成 **可插拔的骨架零件（artifacts）**，用 **可替換的骨架定義（schema）** 組裝起來，確保 AI 在動手前跟你對齊。

### 兩大區域

```
openspec/
├── specs/       ← Source of Truth：系統目前的行為規格
└── changes/     ← 提案區：每個變更一個資料夾，含所有 artifacts + delta specs
```

- **specs/** — 永久的行為規格，隨著每次 archive 而成長
- **changes/** — 暫時的變更提案，完成後歸檔到 archive/

---

## 2. 安裝與初始化

### 前置條件

- Node.js 20.19.0+

### 安裝

```bash
# npm
npm install -g @fission-ai/openspec@latest

# pnpm
pnpm add -g @fission-ai/openspec@latest

# yarn
yarn global add @fission-ai/openspec@latest

# bun
bun add -g @fission-ai/openspec@latest

# 驗證
openspec --version
```

### 初始化

```bash
cd your-project
openspec init

# 非互動式：指定工具
openspec init --tools claude,cursor

# 指定所有工具
openspec init --tools all

# 指定 profile
openspec init --profile core
```

### 升級

```bash
npm install -g @fission-ai/openspec@latest
openspec update    # 重新生成 AI 工具設定檔
```

---

## 3. 目錄結構解析

初始化後的完整結構：

```
your-project/
├── openspec/
│   ├── config.yaml           # 專案設定（預設 schema、context、rules）
│   ├── specs/                # Source of Truth — 系統行為規格
│   │   ├── auth/
│   │   │   └── spec.md
│   │   └── payments/
│   │       └── spec.md
│   ├── changes/              # 變更提案（進行中）
│   │   └── add-dark-mode/
│   │       ├── .openspec.yaml    # 變更 metadata（schema、建立日期）
│   │       ├── proposal.md       # 為什麼做、做什麼
│   │       ├── design.md         # 怎麼做（技術設計）
│   │       ├── tasks.md          # 實作清單（checkbox）
│   │       └── specs/            # Delta specs（差異規格）
│   │           └── ui/
│   │               └── spec.md
│   └── schemas/              # Custom schemas（可選）
│       └── my-workflow/
│           ├── schema.yaml
│           └── templates/
├── .claude/skills/           # Claude Code skills（如果選了 claude）
├── .cursor/skills/           # Cursor skills（如果選了 cursor）
└── src/                      # 你的原始碼
```

---

## 4. 兩種工作模式

### Core Profile（預設）— 快速路徑

```
/opsx:propose ──► /opsx:apply ──► /opsx:archive
```

提供 4 個指令：`propose`、`explore`、`apply`、`archive`

### Custom Profile — 完整控制

```
/opsx:new ──► /opsx:ff 或 /opsx:continue ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

可自由選擇啟用的 workflows：`new`、`continue`、`ff`、`verify`、`sync`、`bulk-archive`、`onboard`

**切換方式：**

```bash
openspec config profile     # 互動式選擇（可選任意 workflow 子集）
openspec config profile core   # 快速切回 core
openspec update             # 套用到專案
```

---

## 5. Slash Commands 完整參考

> 這些指令在 AI 聊天介面中使用（Claude Code、Cursor、Windsurf 等）

### Core Profile 指令

#### `/opsx:propose [change-name]`

一步到位：建立 change + 生成所有 planning artifacts。

```
You: /opsx:propose add-dark-mode

AI:  Created openspec/changes/add-dark-mode/
     ✓ proposal.md
     ✓ specs/ui/spec.md
     ✓ design.md
     ✓ tasks.md
     Ready for implementation. Run /opsx:apply.
```

#### `/opsx:explore [topic]`

探索問題空間，不建立任何 artifact。適合需求不明確時使用。

```
You: /opsx:explore how should we handle rate limiting?

AI:  Let me investigate your current setup...
     I see three approaches:
     1. Middleware-based (simple)
     2. Redis-backed (scalable)
     3. Token bucket per user (fair)
```

#### `/opsx:apply [change-name]`

根據 tasks.md 逐項實作，自動勾選 checkbox。

```
You: /opsx:apply

AI:  Working on 1.1: Create ThemeContext...
     ✓ 1.1 Complete
     Working on 1.2: Add CSS custom properties...
     ✓ 1.2 Complete
     ...
```

#### `/opsx:archive [change-name]`

歸檔完成的 change，merge delta specs 到 specs/。

```
You: /opsx:archive

AI:  ✓ Synced specs to openspec/specs/ui/spec.md
     ✓ Moved to openspec/changes/archive/2025-01-24-add-dark-mode/
```

### Custom Profile 額外指令

#### `/opsx:new [change-name] [--schema <name>]`

只建立 change scaffold（空資料夾 + metadata），不生成 artifacts。

#### `/opsx:continue [change-name]`

依照 dependency graph，一次建立一個 artifact。適合需要逐步審核的場景。

```
You: /opsx:continue

AI:  Artifact status:
     ✓ proposal    (done)
     ◆ specs       (ready)
     ◆ design      (ready)
     ○ tasks       (blocked - needs: specs)

     Creating specs...
     ✓ Created specs/ui/spec.md
```

#### `/opsx:ff [change-name]`

Fast-forward：一次建立所有 planning artifacts。

#### `/opsx:verify [change-name]`

驗證實作是否符合 artifacts，檢查三個維度：

| 維度 | 檢查內容 |
|------|----------|
| Completeness | 所有 task 完成、所有 requirement 有對應 code |
| Correctness | 實作符合 spec intent、edge case 有處理 |
| Coherence | design 決策反映在 code 中、命名一致 |

#### `/opsx:sync [change-name]`

手動將 delta specs merge 到 main specs（通常不需要，archive 會自動處理）。

#### `/opsx:bulk-archive [change-names...]`

批量歸檔多個完成的 changes，自動偵測 spec 衝突。

#### `/opsx:onboard`

互動式教學，用你的真實 codebase 走一遍完整流程（約 15-30 分鐘）。

### 不同 AI 工具的語法差異

| 工具 | 語法 |
|------|------|
| Claude Code | `/opsx:propose` |
| Cursor | `/opsx-propose` |
| Windsurf | `/opsx-propose` |
| Copilot (IDE) | `/opsx-propose` |
| Trae | `/openspec-propose`（skill-based） |

---

## 6. CLI 終端指令完整參考

> 這些指令在終端機（terminal）中使用

### Setup

| 指令 | 用途 |
|------|------|
| `openspec init [path]` | 初始化 OpenSpec |
| `openspec update [path]` | 升級後重新生成設定檔 |

### Browsing

| 指令 | 用途 |
|------|------|
| `openspec list [--specs\|--changes]` | 列出 changes 或 specs |
| `openspec view` | 互動式 dashboard |
| `openspec show <name> [--type change\|spec]` | 檢視 change 或 spec 詳情 |

### Validation

| 指令 | 用途 |
|------|------|
| `openspec validate [name]` | 驗證結構 |
| `openspec validate --all` | 驗證全部 |
| `openspec validate --all --strict --json` | CI 用嚴格驗證 |

### Lifecycle

| 指令 | 用途 |
|------|------|
| `openspec archive <name> [-y]` | 歸檔 change |
| `openspec archive <name> --skip-specs` | 歸檔但跳過 spec 更新 |

### Workflow

| 指令 | 用途 |
|------|------|
| `openspec status --change <name>` | 查看 artifact 完成狀態 |
| `openspec instructions [artifact] --change <name>` | 取得 artifact 生成指示 |
| `openspec templates [--schema <name>]` | 查看 template 路徑 |
| `openspec schemas` | 列出所有可用 schemas |

### Schema Management

| 指令 | 用途 |
|------|------|
| `openspec schema init <name>` | 建立新 schema |
| `openspec schema fork <source> [name]` | Fork 現有 schema |
| `openspec schema validate [name]` | 驗證 schema |
| `openspec schema which [name] [--all]` | 查看 schema 來源 |

### Config

| 指令 | 用途 |
|------|------|
| `openspec config list` | 列出所有設定 |
| `openspec config get <key>` | 取得特定設定 |
| `openspec config set <key> <value>` | 設定值 |
| `openspec config profile` | 互動式設定 profile |
| `openspec config edit` | 用編輯器開啟設定 |

### 全域選項

`--version` / `--no-color` / `--help` / `--json`（大部分指令支援）

### 環境變數

| 變數 | 用途 |
|------|------|
| `OPENSPEC_CONCURRENCY` | 批量驗證並發數（預設 6） |
| `OPENSPEC_TELEMETRY=0` | 關閉遙測 |
| `DO_NOT_TRACK=1` | 同上 |

---

## 7. Artifacts 詳解

Artifacts 就是「可插拔的骨架零件」— schema 定義要哪些零件、什麼順序組裝。

### Artifact 流程

```
proposal ──────► specs ──────► design ──────► tasks ──────► implement
    │               │             │              │
   why            what           how          steps
 + scope        changes       approach      to take
```

### 各 Artifact 詳解

#### Proposal (`proposal.md`) — 為什麼 + 做什麼

```markdown
# Proposal: Add Dark Mode

## Intent
Users have requested a dark mode option to reduce eye strain.

## Scope
In scope:
- Theme toggle in settings
- System preference detection

Out of scope:
- Custom color themes (future work)

## Approach
Use CSS custom properties + React context.
```

**何時更新：** scope 變了、intent 更清楚了、approach 根本性改變

#### Specs (`specs/**/*.md`) — Delta 差異規格

描述「什麼在變」，不是整份 spec 重寫。詳見 [第 8 節](#8-delta-specs)。

#### Design (`design.md`) — 怎麼做

```markdown
# Design: Add Dark Mode

## Architecture Decisions

### Decision: Context over Redux
Using React Context because:
- Simple binary state
- No complex transitions
- Avoids Redux dependency

## Data Flow
ThemeProvider (context) → ThemeToggle ↔ localStorage → CSS Variables (:root)

## File Changes
- src/contexts/ThemeContext.tsx (new)
- src/components/ThemeToggle.tsx (new)
- src/styles/globals.css (modified)
```

**何時更新：** 實作發現行不通、找到更好的方案、dependency 變了

#### Tasks (`tasks.md`) — 實作清單

```markdown
# Tasks

## 1. Theme Infrastructure
- [ ] 1.1 Create ThemeContext with light/dark state
- [ ] 1.2 Add CSS custom properties for colors
- [ ] 1.3 Implement localStorage persistence

## 2. UI Components
- [ ] 2.1 Create ThemeToggle component
- [ ] 2.2 Add toggle to settings page
```

**最佳實踐：**
- 分群組、用階層編號（1.1, 1.2）
- 每個 task 可在一次 session 內完成
- 完成就打勾 `[x]`

### Spec 的格式規範

```markdown
# Auth Specification

## Purpose
Authentication and session management.

## Requirements

### Requirement: User Authentication
The system SHALL issue a JWT token upon successful login.

#### Scenario: Valid credentials
- GIVEN a user with valid credentials
- WHEN the user submits login form
- THEN a JWT token is returned
- AND the user is redirected to dashboard

#### Scenario: Invalid credentials
- GIVEN invalid credentials
- WHEN the user submits login form
- THEN an error message is displayed
```

**RFC 2119 關鍵字：**
- **MUST / SHALL** — 絕對要求
- **SHOULD** — 建議，有例外
- **MAY** — 選用

**Spec 是行為契約，不是實作計畫：**
- 寫：可觀察的行為、input/output、error condition
- 不寫：class name、library 選擇、實作步驟

---

## 8. Delta Specs

Delta specs 是讓 OpenSpec 適用於 brownfield 的關鍵概念。

### 格式

```markdown
# Delta for Auth

## ADDED Requirements

### Requirement: Two-Factor Authentication
The system MUST support TOTP-based 2FA.

#### Scenario: 2FA login
- GIVEN a user with 2FA enabled
- WHEN the user submits valid credentials
- THEN an OTP challenge is presented

## MODIFIED Requirements

### Requirement: Session Expiration
The system MUST expire sessions after 15 minutes of inactivity.
(Previously: 30 minutes)

## REMOVED Requirements

### Requirement: Remember Me
(Deprecated in favor of 2FA.)
```

### Archive 時的行為

| 區塊 | 行為 |
|------|------|
| `## ADDED Requirements` | 附加到 main spec |
| `## MODIFIED Requirements` | 取代 main spec 中的對應 requirement |
| `## REMOVED Requirements` | 從 main spec 中刪除 |

### 為什麼用 Delta 而非整份 Spec

- **清晰** — 一眼看出改了什麼
- **避免衝突** — 兩個 change 可以改同一個 spec 的不同 requirement
- **Review 友善** — reviewer 只看變更，不看沒變的部分
- **Brownfield 適用** — 修改既有行為是一等公民

---

## 9. 客製化設定

客製化設定已獨立為完整章節文件，涵蓋：

- Project Config（`config.yaml` 的 `schema`、`context`、`rules`）
- Schemas 骨架定義與依賴圖
- Custom Schema 建立教學（Fork / 從零建立）
- Template 撰寫教學（含完整範例）
- 多語言支援
- Schema CLI 指令參考
- 4 個實戰範例 Schemas（rapid、with-review、research-first、spring-boot）
- 設定檢查與除錯

**詳見：[customization-guide.md](customization-guide.md)**

---

## 10. 支援的 AI 工具

OpenSpec 支援 25+ 工具，`openspec init` 時選擇：

| 工具 | Skills 路徑 | Commands 路徑 |
|------|-------------|---------------|
| Claude Code | `.claude/skills/openspec-*/SKILL.md` | `.claude/commands/opsx/<id>.md` |
| Cursor | `.cursor/skills/openspec-*/SKILL.md` | `.cursor/commands/opsx-<id>.md` |
| Windsurf | `.windsurf/skills/openspec-*/SKILL.md` | `.windsurf/workflows/opsx-<id>.md` |
| GitHub Copilot | `.github/skills/openspec-*/SKILL.md` | `.github/prompts/opsx-<id>.prompt.md` |
| Cline | `.cline/skills/openspec-*/SKILL.md` | `.clinerules/workflows/opsx-<id>.md` |
| Kiro | `.kiro/skills/openspec-*/SKILL.md` | `.kiro/prompts/opsx-<id>.prompt.md` |
| Codex | `.codex/skills/openspec-*/SKILL.md` | `$CODEX_HOME/prompts/opsx-<id>.md` |
| RooCode | `.roo/skills/openspec-*/SKILL.md` | `.roo/commands/opsx-<id>.md` |
| Gemini CLI | `.gemini/skills/openspec-*/SKILL.md` | `.gemini/commands/opsx/<id>.toml` |

（還有 Amazon Q、Antigravity、Auggie、CodeBuddy、Continue、CoStrict、Crush、Factory、iFlow、Kilo Code、OpenCode、Pi、Qoder、Qwen、Trae）

**完整工具 ID 列表：** `amazon-q`, `antigravity`, `auggie`, `claude`, `cline`, `codex`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `iflow`, `kilocode`, `kiro`, `opencode`, `pi`, `qoder`, `qwen`, `roocode`, `trae`, `windsurf`

---

## 11. 完整工作流程範例

### 場景：為 Spring Boot 專案新增使用者 2FA 功能

#### Step 1: 設定 config

```yaml
# openspec/config.yaml
schema: spec-driven

context: |
  Tech stack: Java 17, Spring Boot 3.x, PostgreSQL, Redis
  Architecture: Controller → Service → Repository
  Testing: JUnit 5, Mockito, Testcontainers
  API style: RESTful with OpenAPI 3.0

rules:
  proposal:
    - Must include rollback plan
    - Must identify affected microservices
  specs:
    - Use Given/When/Then format
    - Must include error scenarios
  design:
    - Must include sequence diagram (Mermaid)
    - Must describe DB migration plan
  tasks:
    - Each task under 4 hours
    - Must include test tasks
```

#### Step 2: 提案

```
You: /opsx:propose add-two-factor-auth
```

AI 自動建立：
- `openspec/changes/add-two-factor-auth/proposal.md`
- `openspec/changes/add-two-factor-auth/specs/auth/spec.md`
- `openspec/changes/add-two-factor-auth/design.md`
- `openspec/changes/add-two-factor-auth/tasks.md`

#### Step 3: 檢查狀態

```bash
openspec status --change add-two-factor-auth
```

```
Change: add-two-factor-auth
Schema: spec-driven
Progress: 4/4 artifacts complete

[x] proposal
[x] specs
[x] design
[x] tasks
```

#### Step 4: 實作

```
You: /opsx:apply
```

AI 逐項完成 tasks.md 中的 checkbox。

#### Step 5: 驗證

```
You: /opsx:verify
```

檢查 Completeness、Correctness、Coherence。

#### Step 6: 歸檔

```
You: /opsx:archive
```

- Delta specs merge 到 `openspec/specs/auth/spec.md`
- Change 移到 `openspec/changes/archive/2026-03-12-add-two-factor-auth/`

### 平行開發場景

```
Change A: /opsx:propose add-2fa → /opsx:apply（進行中）
                                      │
                                 context switch
                                      │
Change B: /opsx:propose fix-login-bug → /opsx:apply → /opsx:archive
                                      │
                                 切回 Change A
                                      │
Change A: /opsx:apply add-2fa → /opsx:archive
```

### 判斷：更新 vs 開新 Change

```
是同一個工作嗎？
├── 同樣的 intent？同樣的問題？     → YES → UPDATE
├── > 50% 重疊？同樣 scope？       → YES → UPDATE
└── 原本的可以獨立「完成」嗎？       → YES → NEW CHANGE
```

---

## 12. Troubleshooting

| 問題 | 解法 |
|------|------|
| "Change not found" | 指定名稱：`/opsx:apply add-dark-mode`；確認 `openspec list` |
| "No artifacts ready" | `openspec status --change <name>` 看什麼 blocked |
| "Schema not found" | `openspec schemas` 列出所有；檢查拼字 |
| Commands not recognized | `openspec init` + `openspec update`；重啟 AI 工具 |
| Artifacts 品質不好 | 在 config.yaml 加 `context` 和 `rules` |

---

## 13. 名詞對照表

| 英文 | 中文 | 說明 |
|------|------|------|
| Artifact | 骨架零件 / 產出物 | change 中的文件（proposal、design、tasks、specs） |
| Schema | 骨架定義 | 定義 artifacts 類型和依賴關係的 workflow 配置 |
| Change | 變更提案 | 對系統的一次修改，打包為資料夾 |
| Delta Spec | 差異規格 | 描述 ADDED/MODIFIED/REMOVED 的規格變更 |
| Spec | 規格 | 描述系統行為的文件，含 requirements 和 scenarios |
| Archive | 歸檔 | 完成 change 並 merge delta specs 到 main specs |
| Domain | 領域 | specs 的邏輯分群（如 auth/、payments/） |
| Requirement | 需求 | 系統必須具備的特定行為 |
| Scenario | 情境 | 需求的具體範例，通常用 Given/When/Then |
| Source of Truth | 真相之源 | `openspec/specs/` 目錄，包含當前已確認的行為 |
| Profile | 配置檔 | 決定啟用哪些 workflow commands（core / custom profile） |
| Delivery | 交付方式 | skills only / commands only / both |

---

---

## 相關文件

| 文件 | 內容 |
|------|------|
| [customization-guide.md](customization-guide.md) | 客製化設定完整指南（Config / Schema / Template） |
| [sop.md](sop.md) | 操作 SOP（12 個具體流程，含指令和 checklist） |
| [sample-project/](sample-project/) | Spring Boot 範例專案 |
| [examples/](examples/) | 各種 config 和 schema 範例 |

## 參考資源

- GitHub: https://github.com/Fission-AI/OpenSpec
- Discord: discord.gg/YctCnvvshC
- 推薦模型: Opus 4.5、GPT 5.2
- License: MIT
