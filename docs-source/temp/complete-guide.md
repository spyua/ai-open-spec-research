# OpenSpec 完整技術說明文件

> **版本**: 1.2.0 | **授權**: MIT | **發布者**: Fission AI
> **npm**: `@fission-ai/openspec` | **Node.js**: >= 20.19.0

---

## 目錄

1. [專案概述](#1-專案概述)
2. [設計哲學](#2-設計哲學)
3. [核心概念](#3-核心概念)
4. [系統架構](#4-系統架構)
5. [安裝與初始化：完整設定流程](#5-安裝與初始化完整設定流程)
   - [5.1 安裝](#51-安裝)
   - [5.2 初始化專案（互動式完整流程）](#52-初始化專案互動式完整流程)
   - [5.3 非互動式初始化（CI/自動化）](#53-非互動式初始化ci自動化)
   - [5.4 升級與更新流程](#54-升級與更新流程)
   - [5.5 設定 Profile 完整流程](#55-設定-profile-完整流程)
   - [5.6 完整設定流程圖](#56-完整設定流程圖)
   - [5.7 Shell Completions 設定](#57-shell-completions-設定)
6. [目錄結構](#6-目錄結構)
7. [工作流程 (OPSX)](#7-工作流程-opsx)
8. [Slash Commands 參考](#8-slash-commands-參考)
9. [CLI 命令參考](#9-cli-命令參考)
10. [Schema 系統](#10-schema-系統)
11. [Delta Spec 機制](#11-delta-spec-機制)
12. [設定與客製化](#12-設定與客製化)
    - [12.1 全域設定（Global Config）](#121-全域設定global-config)
    - [12.2 專案設定](#122-專案設定-openspecconfigyaml)
    - [12.3 Change 元資料](#123-change-元資料-openspecyaml)
    - [12.4 Instruction 注入機制](#124-instruction-注入機制)
    - [12.5 自訂 Schema 完整流程](#125-自訂-schema-完整流程)
    - [12.6 Verify 的三維驗證](#126-verify-的三維驗證)
    - [12.7 Validation 設定](#127-validation-設定)
13. [支援的 AI 工具](#13-支援的-ai-工具)
14. [原始碼架構](#14-原始碼架構)
15. [測試](#15-測試)
16. [建置與發布](#16-建置與發布)
17. [遙測與隱私](#17-遙測與隱私)
18. [名詞對照表](#18-名詞對照表)

---

## 1. 專案概述

OpenSpec 是一個 **AI 原生的 Spec 驅動開發框架**。它解決了一個核心問題：當需求只存在於聊天記錄中時，AI 編碼助手的輸出不可預測且不可重現。

OpenSpec 在人類與 AI 之間加入一個輕量級的規格層 (spec layer)，確保雙方在寫程式碼之前先達成共識。

### 核心價值

- **先對齊再開發** — 人類與 AI 在動手前先就規格達成一致
- **保持有組織** — 每個變更都有自己的資料夾，包含 proposal、specs、design 和 tasks
- **流動式工作** — 隨時更新任何 artifact，不存在嚴格的階段閘門
- **工具無關** — 透過 slash commands 支援 24+ 種 AI 編碼助手

### 與競品的差異

| 對比對象 | 差異 |
|----------|------|
| **Spec Kit** (GitHub) | Spec Kit 較為笨重、有嚴格的階段閘門。OpenSpec 更輕量且允許自由迭代 |
| **Kiro** (AWS) | Kiro 綁定自家 IDE 和 Claude 模型。OpenSpec 與你現有的工具搭配使用 |
| **無規格開發** | 沒有規格的 AI 編碼意味著模糊的 prompt 和不可預測的結果 |

---

## 2. 設計哲學

```
→ fluid not rigid          流動而非僵硬 — 沒有階段閘門，做當下有意義的事
→ iterative not waterfall   迭代而非瀑布 — 邊做邊學，持續精進
→ easy not complex          簡單而非複雜 — 輕量設定，最少的儀式
→ brownfield-first          棕地優先 — 適用於既有的程式碼庫，而非只是全新專案
→ scalable                  可擴展 — 從個人專案到企業級都適用
```

**為什麼是「流動」？** 傳統的規格系統將你鎖在階段中。OpenSpec 讓你可以按照任何有意義的順序建立 artifacts。

**為什麼是「棕地優先」？** 大多數軟體工作是修改既有系統。OpenSpec 的 delta 機制使修改規格成為一等公民。

---

## 3. 核心概念

### 3.1 Specs（規格）

Specs 是**事實來源**，描述系統目前的行為。存放在 `openspec/specs/` 中，按照領域分組：

```
openspec/specs/
├── auth/
│   └── spec.md           # 認證行為規格
├── payments/
│   └── spec.md           # 支付處理規格
└── ui/
    └── spec.md           # UI 行為規格
```

#### Spec 格式

```markdown
# Auth Specification

## Purpose
Authentication and session management for the application.

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
- AND no token is issued
```

**關鍵元素：**

| 元素 | 用途 |
|------|------|
| `## Purpose` | 此規格領域的高階描述 |
| `### Requirement:` | 系統必須具備的特定行為 |
| `#### Scenario:` | 需求的具體範例（可測試） |
| SHALL/MUST/SHOULD/MAY | RFC 2119 關鍵字，表示需求強度 |

**Spec 是行為契約**，不是實作計畫。好的 spec 內容：使用者或下游系統依賴的可觀察行為、輸入輸出、錯誤條件。避免放入：類別名稱、框架選擇、逐步實作細節。

### 3.2 Changes（變更）

Change 是一個提議的系統修改，打包為一個資料夾：

```
openspec/changes/add-dark-mode/
├── proposal.md           # 為什麼要做、改什麼
├── design.md             # 怎麼做（技術方案）
├── tasks.md              # 實作清單
├── .openspec.yaml        # 變更元資料
└── specs/                # Delta specs
    └── ui/
        └── spec.md       # UI spec 的變更
```

**為什麼以資料夾組織？**
1. 所有相關文件集中在一起
2. 多個 changes 可以平行存在不衝突
3. 歸檔後保留完整歷史脈絡
4. 方便審查

### 3.3 Artifacts（工件）

Artifacts 是 change 資料夾中引導工作的文件，按照依賴鏈逐步建立：

```
proposal ──────► specs ──────► design ──────► tasks ──────► implement
    │               │             │              │
   why            what           how          steps
 + scope        changes       approach      to take
```

| Artifact | 角色 | 內容 |
|----------|------|------|
| **proposal.md** | 意圖與範圍 | Why（動機）、What Changes（變更項目）、Capabilities（能力清單）、Impact（影響） |
| **specs/** | 行為規格（delta） | ADDED/MODIFIED/REMOVED/RENAMED Requirements |
| **design.md** | 技術設計 | Context、Goals/Non-Goals、Decisions、Risks、Migration Plan |
| **tasks.md** | 實作清單 | 分組的 checkbox 清單，格式 `- [ ] X.Y 任務描述` |

### 3.4 Delta Specs

Delta specs 是讓 OpenSpec 適用於棕地開發的核心機制。它們描述**正在改變什麼**，而非重述整份規格：

```markdown
## ADDED Requirements

### Requirement: Two-Factor Authentication
The system MUST support TOTP-based two-factor authentication.

#### Scenario: 2FA enrollment
- GIVEN a user without 2FA enabled
- WHEN the user enables 2FA in settings
- THEN a QR code is displayed

## MODIFIED Requirements

### Requirement: Session Expiration
The system MUST expire sessions after 15 minutes of inactivity.
(Previously: 30 minutes)

## REMOVED Requirements

### Requirement: Remember Me
**Reason**: Replaced by 2FA
**Migration**: Use new auth endpoint
```

| Delta 操作 | 歸檔時的行為 |
|------------|-------------|
| `## ADDED Requirements` | 附加到主 spec |
| `## MODIFIED Requirements` | 替換既有 requirement |
| `## REMOVED Requirements` | 從主 spec 刪除 |
| `## RENAMED Requirements` | 使用 FROM:/TO: 格式更名 |

### 3.5 Archive（歸檔）

歸檔完成一個 change 的生命週期：

1. **合併 delta** — 將 ADDED/MODIFIED/REMOVED 應用到主 specs
2. **搬移到歸檔** — change 資料夾移至 `changes/archive/YYYY-MM-DD-<name>/`
3. **保留脈絡** — 所有 artifacts 完整保存於歸檔

```
歸檔前:
openspec/changes/add-2fa/specs/auth/spec.md ──merge──► openspec/specs/auth/spec.md

歸檔後:
openspec/changes/archive/2025-01-24-add-2fa/  (完整保留)
openspec/specs/auth/spec.md                    (已包含 2FA requirements)
```

---

## 4. 系統架構

### 4.1 架構總覽

```
┌─────────────────────────────────────────────────────────────┐
│                        OpenSpec CLI                          │
│                                                              │
│  ┌──────────┐  ┌───────────────┐  ┌───────────────────────┐│
│  │ Commander│  │  Commands     │  │  Workflow Commands     ││
│  │ (CLI     │──│  (init, list, │──│  (status, instructions,││
│  │  Router) │  │   validate...) │  │   templates, schemas) ││
│  └──────────┘  └───────────────┘  └───────────────────────┘│
│                        │                     │               │
│  ┌─────────────────────┴─────────────────────┴─────────────┐│
│  │                     Core Layer                           ││
│  │                                                          ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ ││
│  │  │ Artifact     │ │ Command      │ │  Validation      │ ││
│  │  │ Graph System │ │ Generation   │ │  Engine          │ ││
│  │  │ (schema,     │ │ (24 tool     │ │  (Zod schemas,   │ ││
│  │  │  resolver,   │ │  adapters,   │ │   markdown       │ ││
│  │  │  state)      │ │  factory)    │ │   parsing)       │ ││
│  │  └──────────────┘ └──────────────┘ └──────────────────┘ ││
│  │                                                          ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ ││
│  │  │ Profiles     │ │ Templates    │ │  Parsers         │ ││
│  │  │ (core,       │ │ (12 workflow │ │  (markdown,      │ ││
│  │  │  custom)     │ │  templates)  │ │   change, YAML)  │ ││
│  │  └──────────────┘ └──────────────┘ └──────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Utils & Infrastructure                      ││
│  │  file-system, telemetry, config, shell-detection, UI     ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 4.2 關鍵設計模式

| 模式 | 位置 | 用途 |
|------|------|------|
| **Adapter Pattern** | `command-generation/adapters/` | 抽象化 24 種 AI 工具的差異 |
| **Dependency Graph** | `artifact-graph/` | 追蹤 artifact 之間的相依關係與完成狀態 |
| **Factory Pattern** | `command-generation/factory.ts` | 根據工具 ID 建立對應的 adapter |
| **Strategy Pattern** | `parsers/` | 針對不同格式的可插拔解析器 |
| **Zod Schemas** | `schemas/`, `artifact-graph/types.ts` | 單一事實來源的型別定義與驗證 |

### 4.3 資料流

```
使用者輸入 (slash command)
      │
      ▼
AI 工具讀取 skill/command 檔案
      │
      ▼
呼叫 openspec CLI 取得 instructions/status
      │
      ▼
Artifact Graph 判斷下一步 (依賴解析)
      │
      ▼
Instruction Loader 組裝 prompt (template + context + rules)
      │
      ▼
AI 產生 artifact 文件
      │
      ▼
Validator 驗證結構正確性
      │
      ▼
歸檔時 specs-apply 合併 delta specs
```

---

## 5. 安裝與初始化：完整設定流程

### 5.1 安裝

**前提條件：** Node.js >= 20.19.0（執行 `node --version` 確認）

```bash
# npm（推薦）
npm install -g @fission-ai/openspec@latest

# pnpm
pnpm add -g @fission-ai/openspec@latest

# yarn
yarn global add @fission-ai/openspec@latest

# bun
bun add -g @fission-ai/openspec@latest

# nix（免安裝直接執行）
nix run github:Fission-AI/OpenSpec -- init

# nix（安裝到 profile）
nix profile install github:Fission-AI/OpenSpec

# nix（加入 flake.nix 開發環境）
# inputs.openspec.url = "github:Fission-AI/OpenSpec";
# buildInputs = [ openspec.packages.x86_64-linux.default ];
```

驗證安裝：
```bash
openspec --version   # 應顯示 1.2.0 或更新版本
```

### 5.2 初始化專案（互動式完整流程）

```bash
cd your-project
openspec init
```

`openspec init` 會執行以下步驟：

#### Step 1: 驗證與權限檢查

```
內部流程:
1. 檢查目標路徑是否有寫入權限
2. 判斷是否為 extend mode（openspec/ 已存在）
3. 如果 extend mode，進行遷移檢查（migration）
```

#### Step 2: 舊版遺留清理（Legacy Cleanup）

如果偵測到舊版 OpenSpec 的檔案（如舊的 slash commands 或設定標記），系統會：

```
Found legacy OpenSpec artifacts:
  • 3 legacy slash command files in .claude/
  • 1 config marker in .cursor/

? Upgrade and clean up legacy files? (Y/n)
```

- **互動模式**：詢問是否清理
- **`--force` 模式**：自動清理（legacy 檔案皆為 OpenSpec 管理，安全刪除）
- **非互動無 `--force`**：取消初始化

#### Step 3: 歡迎畫面

互動模式下顯示 ASCII 動畫歡迎畫面。

#### Step 4: 自動偵測已存在的 AI 工具

系統掃描專案目錄中的工具目錄（如 `.claude/`、`.cursor/`、`.windsurf/` 等），自動識別已安裝的工具：

```
OpenSpec configured: Claude Code, Cursor (pre-selected)
Detected tool directories: Windsurf (pre-selected for first-time setup)
```

**偵測邏輯（`available-tools.ts`）：**
- 掃描所有 24 種工具的目錄路徑
- 已設定的工具（有 skill 檔案）自動預選
- 首次設定時，偵測到的工具也會預選

#### Step 5: 工具選擇（Interactive Multi-Select）

```
? Select tools to set up (24 available)
  [x] Claude Code          (pre-selected)
  [x] Cursor               (pre-selected)
  [x] Windsurf             (detected)
  [ ] Cline
  [ ] GitHub Copilot
  [ ] Continue
  ... (共 24 個工具)

  ↑/↓ Navigate  Space Toggle  Type to search  Enter Confirm
```

特點：
- 可搜尋的多選介面
- 已設定的工具排在最前面
- 偵測到的工具排第二
- 至少需選擇一個工具

#### Step 6: 建立目錄結構

```
▌ OpenSpec structure created

建立的目錄:
openspec/
├── specs/              # 規格（事實來源）
├── changes/            # 進行中的變更
│   └── archive/        # 已歸檔的變更
└── config.yaml         # 專案設定（schema: spec-driven）
```

#### Step 7: 產生 Skills 和 Commands

根據全域設定的 **profile** 和 **delivery** 模式，為每個選擇的工具產生檔案：

```
✓ Setup complete for Claude Code
✓ Setup complete for Cursor
✓ Setup complete for Windsurf
```

**產生的檔案取決於三個設定維度：**

| 設定 | 預設值 | 影響 |
|------|--------|------|
| **Profile** | `core` | 決定**哪些** workflows 可用 |
| **Delivery** | `both` | 決定**怎樣**安裝（skills、commands 或兩者） |
| **Workflows** | `propose, explore, apply, archive` | 具體的 workflow 清單 |

**Core profile (預設) 產生的檔案：**

```
.claude/
├── skills/
│   ├── openspec-propose/SKILL.md
│   ├── openspec-explore/SKILL.md
│   ├── openspec-apply-change/SKILL.md
│   └── openspec-archive-change/SKILL.md
└── commands/
    └── opsx/
        ├── propose.md
        ├── explore.md
        ├── apply.md
        └── archive.md
```

**Custom profile (選擇所有 workflows) 額外產生：**

```
.claude/
├── skills/
│   ├── openspec-new-change/SKILL.md
│   ├── openspec-continue-change/SKILL.md
│   ├── openspec-ff-change/SKILL.md
│   ├── openspec-verify-change/SKILL.md
│   ├── openspec-sync-specs/SKILL.md
│   ├── openspec-bulk-archive-change/SKILL.md
│   └── openspec-onboard/SKILL.md
└── commands/opsx/
    ├── new.md, continue.md, ff.md, verify.md
    ├── sync.md, bulk-archive.md, onboard.md
    └── ...
```

#### Step 8: 建立專案設定

```yaml
# openspec/config.yaml（自動建立）
schema: spec-driven
```

#### Step 9: 顯示成功訊息

```
OpenSpec Setup Complete

Created: Claude Code, Cursor, Windsurf
4 skills and 4 commands in .claude/, .cursor/, .windsurf/
Config: openspec/config.yaml (schema: spec-driven)

Getting started:
  Start your first change: /opsx:propose "your idea"

Learn more: https://github.com/Fission-AI/OpenSpec
Feedback:   https://github.com/Fission-AI/OpenSpec/issues

Restart your IDE for slash commands to take effect.
```

### 5.3 非互動式初始化（CI/自動化）

```bash
# 指定特定工具
openspec init --tools claude,cursor

# 所有支援的工具
openspec init --tools all

# 跳過工具設定（僅建立 openspec/ 目錄）
openspec init --tools none

# 指定 profile（覆蓋全域設定）
openspec init --profile core
openspec init --profile custom

# 自動清理 + 所有工具
openspec init --tools all --force

# 指定路徑
openspec init ./my-project --tools claude
```

**`--tools` 可用的 ID：**
`amazon-q`, `antigravity`, `auggie`, `claude`, `cline`, `codex`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `iflow`, `kilocode`, `kiro`, `opencode`, `pi`, `qoder`, `qwen`, `roocode`, `trae`, `windsurf`

**非互動時的 fallback 行為：**
- 有 `--tools` → 使用指定的工具
- 無 `--tools` 但偵測到工具目錄 → 自動使用偵測到的工具
- 無 `--tools` 且無偵測到工具 → 報錯

### 5.4 升級與更新流程

#### 升級 CLI

```bash
npm install -g @fission-ai/openspec@latest
```

#### 更新專案的 instruction 檔案

```bash
cd your-project
openspec update
```

`openspec update` 的完整流程：

```
1. 檢查 openspec/ 目錄是否存在（不存在則報錯，要求先 init）
2. 執行遷移檢查（migration）
3. 讀取全域 profile/delivery 設定
4. 偵測並清理 legacy 檔案（如有）
5. 找到所有已設定的工具
6. 智慧更新偵測：
   a. 版本比對（skill 中的 generatedBy 版本 vs 當前版本）
   b. Profile 同步漂移偵測（是否有工具需要 sync）
7. 若全部已是最新 → 顯示 "All tools up to date" 並提示 --force
8. 若需要更新：
   a. 重新產生 skill/command 檔案
   b. 刪除已取消選擇的 workflow 檔案
   c. 刪除 delivery 模式變更後不需要的檔案
9. 偵測新的工具目錄（提示 run init）
10. 顯示不在 profile 中的額外 workflow 提示
```

**Smart update detection 範例：**

```bash
$ openspec update
Updating 2 tool(s): claude (1.1.0 → 1.2.0), cursor (config sync)
Already up to date: windsurf

✓ Updated Claude Code
✓ Updated Cursor

✓ Updated: Claude Code, Cursor (v1.2.0)
Removed: 3 skill directories (deselected workflows)
Tools: Claude Code, Cursor

Restart your IDE for changes to take effect.
```

**Profile 同步漂移偵測（`profile-sync-drift.ts`）：**

系統會逐一檢查每個已設定工具的檔案狀態：
- 所選 workflow 的 skill/command 檔案是否都存在？
- 是否有已取消選擇的 workflow 的殘留檔案？
- delivery 模式是否匹配（如切換到 skills-only 後，command 檔案是否仍存在）？

任何不匹配都會觸發該工具的更新。

### 5.5 設定 Profile 完整流程

```bash
openspec config profile
```

**互動式流程：**

```
Current profile settings
  Delivery: both
  Workflows: 4 selected (core)
  Delivery = where workflows are installed (skills, commands, or both)
  Workflows = which actions are available (propose, explore, apply, etc.)

? What do you want to configure?
  > Delivery and workflows      Update install mode and available actions together
    Delivery only               Change where workflows are installed
    Workflows only              Change which workflow actions are available
    Keep current settings (exit) Leave configuration unchanged and exit
```

#### 選擇 "Delivery and workflows"

**Step 1: 選擇 Delivery 模式**

```
? Delivery mode (how workflows are installed):
  > Both (skills + commands) [current]
    Skills only
    Commands only
```

| 模式 | 說明 | 產生的檔案 |
|------|------|-----------|
| **Both** | Skills（AI 讀取用）+ Commands（使用者 slash command 用）| `skills/` + `commands/` |
| **Skills only** | 僅產生 skill 檔案 | 只有 `skills/` |
| **Commands only** | 僅產生 command 檔案 | 只有 `commands/` |

**Step 2: 選擇 Workflows**

```
? Select workflows to make available:
  Space to toggle, Enter to confirm
  [x] Propose change          Create proposal, design, and tasks from a request
  [x] Explore ideas           Investigate a problem before implementation
  [ ] New change              Create a new change scaffold quickly
  [ ] Continue change         Resume work on an existing change
  [x] Apply tasks             Implement tasks from the current change
  [ ] Fast-forward            Run a faster implementation workflow
  [ ] Sync specs              Sync change artifacts with specs
  [x] Archive change          Finalize and archive a completed change
  [ ] Bulk archive            Archive multiple completed changes together
  [ ] Verify change           Run verification checks against a change
  [ ] Onboard                 Guided onboarding flow for OpenSpec
```

**Step 3: 確認變更**

```
Config changes:
  delivery: both -> skills
  profile: core -> custom
  workflows: added new, continue, ff, verify; removed explore

? Apply changes to this project now? (Y/n)
```

如果確認套用，系統會自動執行 `openspec update`。

**快速 Preset：**

```bash
# 快速切回 core profile（保留 delivery 設定）
openspec config profile core
# 輸出: Config updated. Run `openspec update` in your projects to apply.
```

**Profile 類型自動推導：**
- 如果選擇的 workflows 恰好等於 `[propose, explore, apply, archive]` → `core`
- 其他任何組合 → `custom`

### 5.6 完整設定流程圖

```
┌─────────────────────────────────────────────────────────────────┐
│                    OPENSPEC 完整設定流程                          │
│                                                                  │
│  ┌──────────────┐                                                │
│  │ 1. 安裝 CLI  │  npm install -g @fission-ai/openspec@latest   │
│  └──────┬───────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                                │
│  │ 2. 初始化    │  openspec init                                 │
│  │    專案      │  → 選擇工具 → 產生 skills/commands              │
│  └──────┬───────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐     可選                                       │
│  │ 3. 設定      │  openspec config profile                       │
│  │    Profile   │  → 選擇 delivery + workflows                   │
│  └──────┬───────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐     如果改了 profile                           │
│  │ 4. 套用更新  │  openspec update                               │
│  │              │  → 重新產生/刪除 skills/commands                 │
│  └──────┬───────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐     可選                                       │
│  │ 5. 客製化    │  編輯 openspec/config.yaml                     │
│  │    專案設定  │  → 加入 context、rules                          │
│  └──────┬───────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐     可選                                       │
│  │ 6. 自訂      │  openspec schema init/fork                     │
│  │    Schema    │  → 建立自訂 workflow 定義                       │
│  └──────┬───────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                                │
│  │ 7. 開始使用  │  /opsx:propose "your idea"                     │
│  │              │  → 重啟 IDE 以載入 slash commands               │
│  └──────────────┘                                                │
│                                                                  │
│  ┌──────────────┐     持續維護                                   │
│  │ 版本升級     │  npm update → openspec update                   │
│  │              │  → 自動偵測版本差異，智慧更新                     │
│  └──────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 5.7 Shell Completions 設定

```bash
# 自動偵測 shell 並安裝
openspec completion install

# 指定 shell
openspec completion install bash
openspec completion install zsh
openspec completion install fish
openspec completion install powershell

# 手動產生腳本
openspec completion generate bash > ~/.bash_completion.d/openspec

# 移除
openspec completion uninstall
```

支援的 shell：Bash、Zsh、Fish、PowerShell

---

## 6. 目錄結構

### 6.1 專案結構（使用者端）

```
your-project/
├── openspec/
│   ├── config.yaml              # 專案設定（schema、context、rules）
│   ├── specs/                   # 事實來源的規格
│   │   ├── auth/
│   │   │   └── spec.md
│   │   └── payments/
│   │       └── spec.md
│   ├── changes/                 # 進行中的變更
│   │   ├── add-dark-mode/
│   │   │   ├── .openspec.yaml   # 變更元資料
│   │   │   ├── proposal.md
│   │   │   ├── design.md
│   │   │   ├── tasks.md
│   │   │   └── specs/
│   │   │       └── ui/
│   │   │           └── spec.md  # delta spec
│   │   └── archive/             # 已歸檔的變更
│   │       └── 2025-01-23-add-auth/
│   ├── schemas/                 # 自訂 schema（可選）
│   │   └── my-workflow/
│   │       ├── schema.yaml
│   │       └── templates/
│   └── explorations/            # 探索紀錄（可選）
├── .claude/                     # Claude Code 整合
│   ├── skills/openspec-*/SKILL.md
│   └── commands/opsx/*.md
├── .cursor/                     # Cursor 整合
│   ├── skills/openspec-*/SKILL.md
│   └── commands/opsx-*.md
└── ... (其他 AI 工具目錄)
```

### 6.2 原始碼結構

```
OpenSpec/
├── src/
│   ├── cli/index.ts                 # CLI 進入點與路由（Commander.js）
│   ├── commands/                    # CLI 命令實作
│   │   ├── change.ts                # 變更管理（legacy）
│   │   ├── config.ts                # 設定管理
│   │   ├── spec.ts                  # Spec 操作
│   │   ├── validate.ts              # 驗證命令
│   │   ├── show.ts                  # 顯示 artifacts
│   │   ├── feedback.ts              # 回饋提交
│   │   ├── completion.ts            # Shell completions
│   │   ├── schema.ts                # Schema 管理
│   │   └── workflow/                # OPSX 工作流程命令
│   │       ├── status.ts            # 完成狀態
│   │       ├── instructions.ts      # 產生 artifact 指令
│   │       ├── templates.ts         # 模板路徑解析
│   │       ├── schemas.ts           # Schema 列表
│   │       ├── new-change.ts        # 建立新 change
│   │       └── shared.ts            # 共享邏輯
│   ├── core/                        # 核心商業邏輯
│   │   ├── init.ts                  # 專案初始化（~800 行）
│   │   ├── update.ts                # 工作流程更新
│   │   ├── archive.ts               # 變更歸檔
│   │   ├── list.ts                  # 列出 changes/specs
│   │   ├── view.ts                  # 互動式看板
│   │   ├── project-config.ts        # 專案設定解析（Zod）
│   │   ├── global-config.ts         # 全域使用者設定（XDG 相容）
│   │   ├── config.ts                # 設定常數（24 工具定義）
│   │   ├── profiles.ts              # 工作流程 profiles
│   │   ├── available-tools.ts       # 工具可用性偵測
│   │   ├── specs-apply.ts           # Delta spec 合併邏輯
│   │   ├── migration.ts             # 版本遷移
│   │   ├── legacy-cleanup.ts        # 舊格式清理
│   │   ├── artifact-graph/          # Artifact 依賴追蹤
│   │   │   ├── types.ts             # Zod schemas（artifacts, phases）
│   │   │   ├── graph.ts             # 依賴圖操作
│   │   │   ├── schema.ts            # Schema YAML 載入與驗證
│   │   │   ├── resolver.ts          # Schema 解析（built-in + user）
│   │   │   ├── instruction-loader.ts # 模板 + 指令產生
│   │   │   └── state.ts             # 完成狀態偵測
│   │   ├── command-generation/      # 多工具命令產生
│   │   │   ├── adapters/            # 24 個工具特定 adapter
│   │   │   ├── factory.ts           # Adapter 工廠
│   │   │   ├── generator.ts         # 命令產生器
│   │   │   ├── registry.ts          # Adapter 註冊表
│   │   │   └── types.ts             # 介面定義
│   │   ├── templates/workflows/     # 12 個工作流程模板
│   │   ├── schemas/                 # Zod 驗證 schemas
│   │   ├── parsers/                 # Markdown/YAML 解析器
│   │   ├── validation/              # 驗證器實作
│   │   └── completions/             # Shell completion 產生器
│   ├── utils/                       # 工具函數
│   ├── telemetry/                   # 匿名使用追蹤（PostHog）
│   └── ui/                          # UI 元件（ASCII patterns, welcome）
├── bin/openspec.js                  # 可執行檔進入點
├── schemas/spec-driven/             # 內建的預設 schema
│   ├── schema.yaml
│   └── templates/
├── test/                            # 測試套件
├── docs/                            # 文件
├── scripts/                         # 建置腳本
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── eslint.config.js
```

---

## 7. 工作流程 (OPSX)

### 7.1 兩種模式

#### Core Profile（預設）

提供最簡化的路徑：

```
/opsx:propose ──► /opsx:apply ──► /opsx:archive
```

可用命令：`propose`、`explore`、`apply`、`archive`

#### Custom Profile（擴展）

啟用所有命令，提供更細粒度的控制：

```bash
openspec config profile   # 選擇 workflows
openspec update           # 套用到專案
```

額外命令：`new`、`continue`、`ff`、`verify`、`sync`、`bulk-archive`、`onboard`

### 7.2 常見工作流程模式

#### 快速功能（Core Profile）

```
/opsx:propose add-dark-mode
   AI 一次性建立: proposal → specs → design → tasks
/opsx:apply
   AI 逐步實作 tasks
/opsx:archive
   合併 specs、歸檔 change
```

#### 快速功能（Custom Profile）

```
/opsx:new add-dark-mode          # 建立 change 骨架
/opsx:ff                         # 一次建立所有 planning artifacts
/opsx:apply                      # 實作
/opsx:verify                     # 驗證實作與 specs 一致
/opsx:archive                    # 歸檔
```

#### 探索式開發

```
/opsx:explore                    # 調查問題、比較方案
   （釐清需求後）
/opsx:propose optimize-queries   # 建立 change
/opsx:apply                      # 實作
/opsx:archive                    # 歸檔
```

#### 漸進式（需要逐步審查）

```
/opsx:new add-auth               # 建立骨架
/opsx:continue                   # 建立 proposal → 審查
/opsx:continue                   # 建立 specs → 審查
/opsx:continue                   # 建立 design → 審查
/opsx:continue                   # 建立 tasks → 審查
/opsx:apply                      # 實作
/opsx:archive                    # 歸檔
```

#### 平行開發

```
Change A: /opsx:propose feature-a ──► /opsx:apply ──► (暫停)
Change B: /opsx:propose fix-bug ──► /opsx:apply ──► /opsx:archive
Change A: /opsx:apply feature-a ──► /opsx:archive    (繼續)
```

完成後可以用 `/opsx:bulk-archive` 批次歸檔。

### 7.3 完整流程圖

```
┌──────────────────────────────────────────────────────────┐
│                      OPENSPEC FLOW                        │
│                                                           │
│  1. START     /opsx:propose 或 /opsx:new                 │
│       │                                                   │
│       ▼                                                   │
│  2. PLAN      proposal → specs → design → tasks          │
│       │       (/opsx:ff 或 /opsx:continue)               │
│       ▼                                                   │
│  3. BUILD     /opsx:apply                                │
│       │       逐步實作 tasks，標記完成                      │
│       ▼                                                   │
│  4. VERIFY    /opsx:verify（可選）                         │
│       │       驗證 completeness, correctness, coherence   │
│       ▼                                                   │
│  5. ARCHIVE   /opsx:archive                              │
│               delta specs 合併到主 specs                   │
│               change 搬到 archive/                        │
└──────────────────────────────────────────────────────────┘
```

**良性循環：**
Specs 描述當前行為 → Changes 提議修改（delta）→ 實作使修改成真 → 歸檔將 delta 合併回 specs → Specs 現在描述新行為 → 下一個 change 基於更新後的 specs

---

## 8. Slash Commands 參考

這些命令在 AI 編碼助手的聊天介面中使用。

### Core Profile 命令

| 命令 | 用途 | 語法 |
|------|------|------|
| `/opsx:propose` | 建立 change + 所有 planning artifacts | `/opsx:propose [name-or-description]` |
| `/opsx:explore` | 探索想法、調查問題 | `/opsx:explore [topic]` |
| `/opsx:apply` | 實作 tasks | `/opsx:apply [change-name]` |
| `/opsx:archive` | 歸檔完成的 change | `/opsx:archive [change-name]` |

### 擴展命令

| 命令 | 用途 | 語法 |
|------|------|------|
| `/opsx:new` | 建立 change 骨架 | `/opsx:new [name] [--schema <name>]` |
| `/opsx:continue` | 建立下一個 artifact | `/opsx:continue [change-name]` |
| `/opsx:ff` | 一次建立所有 planning artifacts | `/opsx:ff [change-name]` |
| `/opsx:verify` | 驗證實作與 artifacts 的一致性 | `/opsx:verify [change-name]` |
| `/opsx:sync` | 手動合併 delta specs 到主 specs | `/opsx:sync [change-name]` |
| `/opsx:bulk-archive` | 批次歸檔多個 changes | `/opsx:bulk-archive [names...]` |
| `/opsx:onboard` | 互動式教學 | `/opsx:onboard` |

### 不同工具的語法差異

| 工具 | 語法範例 |
|------|---------|
| Claude Code | `/opsx:propose`、`/opsx:apply` |
| Cursor | `/opsx-propose`、`/opsx-apply` |
| Windsurf | `/opsx-propose`、`/opsx-apply` |
| GitHub Copilot (IDE) | `/opsx-propose`、`/opsx-apply` |
| Trae | `/openspec-propose`、`/openspec-apply-change`（使用 skill 名稱） |

---

## 9. CLI 命令參考

### 全域選項

| 選項 | 說明 |
|------|------|
| `--version`, `-V` | 顯示版本 |
| `--no-color` | 停用彩色輸出 |
| `--help`, `-h` | 顯示說明 |

### 設定類

```bash
openspec init [path]                    # 初始化專案
openspec init --tools claude,cursor     # 非互動式初始化
openspec update [path]                  # 升級後更新 instruction 檔案
openspec config list                    # 列出設定
openspec config edit                    # 編輯設定
openspec config profile                 # 設定 workflow profile
openspec config get <key>               # 取得設定值
openspec config set <key> <value>       # 設定值
```

### 瀏覽類

```bash
openspec list                           # 列出 changes
openspec list --specs                   # 列出 specs
openspec list --json                    # JSON 輸出
openspec view                           # 互動式看板
openspec show <item>                    # 顯示 artifact 內容
openspec show <item> --json             # JSON 輸出
```

### 驗證類

```bash
openspec validate <item>                # 驗證特定項目
openspec validate --all                 # 驗證所有
openspec validate --changes             # 驗證所有 changes
openspec validate --specs               # 驗證所有 specs
openspec validate --all --strict --json # 嚴格模式 + JSON（適合 CI）
```

### 生命週期類

```bash
openspec archive <change>               # 歸檔 change
openspec archive <change> --yes         # 跳過確認
openspec archive <change> --skip-specs  # 跳過 spec 更新
```

### 工作流程類

```bash
openspec status --change <name>         # 顯示 artifact 完成狀態
openspec instructions <artifact> --change <name>  # 取得建立指令
openspec templates                      # 顯示模板路徑
openspec schemas                        # 列出可用 schemas
openspec new change <name>              # 建立新 change
```

### Schema 管理

```bash
openspec schema init <name>             # 建立新 schema
openspec schema fork <source> [name]    # 複製 schema 進行客製化
openspec schema validate [name]         # 驗證 schema 結構
openspec schema which [name]            # 顯示 schema 來源
openspec schema which --all             # 列出所有 schema 及其來源
```

### 工具類

```bash
openspec feedback <message>             # 提交回饋（建立 GitHub issue）
openspec completion install [shell]     # 安裝 shell completions
openspec completion generate [shell]    # 產生 completion 腳本
openspec completion uninstall [shell]   # 移除 completions
```

### 環境變數

| 變數 | 說明 |
|------|------|
| `OPENSPEC_TELEMETRY=0` | 停用遙測 |
| `DO_NOT_TRACK=1` | 停用遙測（標準） |
| `OPENSPEC_CONCURRENCY` | 批次驗證的並行數（預設 6） |
| `NO_COLOR` | 停用彩色輸出 |
| `EDITOR` / `VISUAL` | `config edit` 使用的編輯器 |

---

## 10. Schema 系統

### 10.1 概念

Schema 定義了工作流程中的 artifact 類型及其依賴關係。它是工作流程的「藍圖」。

### 10.2 預設 Schema：spec-driven

```yaml
name: spec-driven
version: 1
description: Default OpenSpec workflow - proposal → specs → design → tasks

artifacts:
  - id: proposal
    generates: proposal.md
    requires: []              # 無依賴，可以第一個建立

  - id: specs
    generates: "specs/**/*.md"
    requires: [proposal]      # 需要 proposal 才能建立

  - id: design
    generates: design.md
    requires: [proposal]      # 可以與 specs 平行建立

  - id: tasks
    generates: tasks.md
    requires: [specs, design] # 需要 specs 和 design

apply:
  requires: [tasks]           # 所有 tasks 完成才能 apply
  tracks: tasks.md            # 追蹤 tasks.md 中的 checkboxes
```

**依賴圖：**
```
         proposal
            │
     ┌──────┴──────┐
     ▼              ▼
   specs          design
     │              │
     └──────┬──────┘
            ▼
          tasks
```

### 10.3 Schema 解析順序

1. CLI flag: `--schema <name>`
2. Change metadata: `.openspec.yaml`
3. Project config: `openspec/config.yaml`
4. 預設: `spec-driven`

**來源優先順序：**
1. Project: `openspec/schemas/<name>/`
2. User: `~/.local/share/openspec/schemas/<name>/`
3. Package: 內建 schemas

### 10.4 自訂 Schema

```bash
# 從頭建立
openspec schema init research-first

# 或 fork 既有的
openspec schema fork spec-driven my-workflow
```

自訂 schema 範例：

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
    requires: []

  - id: tasks
    generates: tasks.md
    template: tasks.md
    requires: [proposal]

apply:
  requires: [tasks]
  tracks: tasks.md
```

---

## 11. Delta Spec 機制

### 11.1 合併邏輯

`specs-apply.ts` 處理 delta spec 到主 spec 的合併：

1. 解析 change 的 delta spec 檔案
2. 識別 ADDED/MODIFIED/REMOVED/RENAMED 區段
3. 對主 spec 進行對應操作
4. 偵測合併衝突
5. 重建 spec 檔案

### 11.2 操作細節

**ADDED**：整個 requirement block（含 scenarios）附加到主 spec 的 Requirements 區段末尾。

**MODIFIED**：requirement 標題必須完全匹配（忽略空白）。匹配後，用 delta 中的完整內容替換原始 requirement。

**REMOVED**：requirement 標題匹配後從主 spec 刪除。必須包含 `**Reason**` 和 `**Migration**` 欄位。

**RENAMED**：使用 `FROM:` / `TO:` 格式，僅更改 requirement 名稱，不影響內容。

### 11.3 常見陷阱

- **MODIFIED 用不完整內容**：歸檔時會丟失細節。必須複製整個 requirement block 再修改。
- **`####` vs `###`**：Scenario 必須使用 `####`（四個 `#`）。用三個 `#` 或 bullets 會 silently fail。
- **新增行為用 MODIFIED**：如果只是新增考量而不改變既有行為，應該用 ADDED。

---

## 12. 設定與客製化

OpenSpec 提供三層設定架構：

| 層級 | 檔案 | 作用範圍 | 用途 |
|------|------|---------|------|
| **全域設定** | `config.json` | 所有專案 | Profile、delivery、workflows |
| **專案設定** | `openspec/config.yaml` | 單一專案 | Schema、context、rules |
| **Change 元資料** | `.openspec.yaml` | 單一 change | Schema 覆寫 |

### 12.1 全域設定（Global Config）

#### 位置

遵循 XDG Base Directory Specification：

| 平台 | 設定路徑 | 資料路徑 |
|------|---------|---------|
| **Unix/macOS** | `~/.config/openspec/config.json` | `~/.local/share/openspec/` |
| **Windows** | `%APPDATA%/openspec/config.json` | `%LOCALAPPDATA%/openspec/` |
| **自訂** | `$XDG_CONFIG_HOME/openspec/config.json` | `$XDG_DATA_HOME/openspec/` |

#### 結構

```json
{
  "profile": "core",
  "delivery": "both",
  "workflows": ["propose", "explore", "apply", "archive"],
  "featureFlags": {}
}
```

#### 欄位說明

| 欄位 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `profile` | `"core"` \| `"custom"` | `"core"` | 工作流程 profile |
| `delivery` | `"both"` \| `"skills"` \| `"commands"` | `"both"` | 檔案交付方式 |
| `workflows` | `string[]` | (由 profile 決定) | custom profile 時的 workflow 清單 |
| `featureFlags` | `Record<string, boolean>` | `{}` | 功能旗標 |

#### Profile 系統

**`core` profile（預設）：**
- 固定包含 4 個 workflows：`propose`、`explore`、`apply`、`archive`
- `workflows` 欄位被忽略（core 永遠使用固定清單）
- 最簡化的使用體驗

**`custom` profile：**
- 使用 `workflows` 欄位中的自選清單
- 可以從 11 個 workflow 中任意選擇子集
- 完整控制

**所有可用的 Workflows：**

| ID | 命令 | 說明 |
|----|------|------|
| `propose` | `/opsx:propose` | 建立 change + 所有 planning artifacts |
| `explore` | `/opsx:explore` | 探索想法 |
| `new` | `/opsx:new` | 建立 change 骨架 |
| `continue` | `/opsx:continue` | 建立下一個 artifact |
| `apply` | `/opsx:apply` | 實作 tasks |
| `ff` | `/opsx:ff` | 一次建立所有 planning artifacts |
| `sync` | `/opsx:sync` | 合併 delta specs |
| `archive` | `/opsx:archive` | 歸檔 change |
| `bulk-archive` | `/opsx:bulk-archive` | 批次歸檔 |
| `verify` | `/opsx:verify` | 驗證實作 |
| `onboard` | `/opsx:onboard` | 互動式教學 |

#### Delivery 模式

| 模式 | 產生的檔案 | 使用情境 |
|------|-----------|---------|
| `both` | Skills (`SKILL.md`) + Commands (`opsx-*.md`) | 預設，大多數情境 |
| `skills` | 僅 Skills | 工具不支援 commands，或偏好 skill-based 呼叫 |
| `commands` | 僅 Commands | 偏好純 slash command 呼叫 |

切換 delivery 後執行 `openspec update`，系統會：
- 產生新模式的檔案
- **刪除**舊模式的檔案（如切到 skills-only 會刪除 command 檔案）

#### 管理全域設定的所有方式

```bash
# 查看設定檔路徑
openspec config path

# 列出所有設定（含 default 標註）
openspec config list

# JSON 輸出
openspec config list --json

# 取得特定值
openspec config get profile
openspec config get delivery
openspec config get featureFlags.someFlag

# 設定值（自動型別轉換）
openspec config set delivery skills
openspec config set featureFlags.beta true

# 強制為字串
openspec config set user.name "My Name" --string

# 設定未知的 key（需要 flag）
openspec config set custom.key value --allow-unknown

# 移除設定（回復預設）
openspec config unset delivery

# 重設所有設定
openspec config reset --all --yes

# 用編輯器開啟
openspec config edit
# 需要設定 $EDITOR 或 $VISUAL 環境變數

# 互動式 profile 設定
openspec config profile

# 快速切回 core
openspec config profile core
```

#### 設定值型別轉換（coercion）

`config set` 會自動轉換：
- `"true"` / `"false"` → boolean
- 純數字字串 → number
- 其他 → string
- 使用 `--string` 強制保持為字串

#### 設定驗證

每次設定變更後，系統會驗證整體設定結構。無效的設定會被拒絕：

```bash
$ openspec config set profile invalid
Error: Invalid configuration - ...
```

### 12.2 專案設定 (`openspec/config.yaml`)

#### 完整範例

```yaml
# 使用的 workflow schema（必填）
schema: spec-driven

# 專案脈絡（注入到所有 artifact 的 prompt 中）
# 上限 50KB，超過會被忽略並警告
context: |
  Tech stack: TypeScript, React 18, Node.js 20, PostgreSQL 16
  API style: RESTful with OpenAPI specs in docs/api.md
  Testing: Vitest + React Testing Library + Playwright for E2E
  Deployment: Docker containers on AWS ECS
  We value backwards compatibility for all public APIs.
  Breaking changes require a migration guide.

# 每個 artifact 的自訂規則
# 規則僅注入到對應 artifact 的 prompt 中（不影響其他 artifact）
rules:
  proposal:
    - Include rollback plan for any destructive changes
    - Identify affected teams and notify them
    - Estimate scope: S (< 1 day), M (1-3 days), L (> 3 days)
  specs:
    - Use Given/When/Then format for all scenarios
    - Reference existing patterns before inventing new ones
    - Include error scenarios for every requirement
  design:
    - Include performance considerations and benchmarks
    - Document security implications
    - Add sequence diagrams for cross-service interactions
  tasks:
    - Keep each task under 2 hours of work
    - Include test writing as explicit tasks
    - Group by component, not by type
```

#### 欄位詳解

**`schema`（必填）**
- 指定使用的 workflow schema
- 預設值：`spec-driven`
- 可以指向自訂 schema：`schema: my-workflow`
- 解析順序：CLI flag → change metadata → project config → 預設

**`context`（可選）**
- 以 `<context>` XML tag 包裝注入到所有 artifact 的 AI prompt 中
- 上限 50KB（`Buffer.byteLength` 計算）
- 超過上限會被完整忽略並顯示警告
- 適合放：技術棧、架構決策、團隊慣例、API 風格

**`rules`（可選）**
- key 是 artifact ID（如 `proposal`、`specs`、`design`、`tasks`）
- value 是字串陣列
- 以 `<rules>` XML tag 包裝注入到**對應 artifact** 的 prompt 中
- 空字串會被過濾掉
- 未知的 artifact ID 會在 instruction loading 時警告

#### 解析行為（Resilient Parsing）

`project-config.ts` 使用 Zod 的 `safeParse` 進行欄位級驗證：
- 每個欄位獨立驗證
- 某個欄位無效不影響其他欄位
- 無效欄位會顯示警告但不阻斷操作
- 完全無法解析時返回 `null`

```
# 範例警告
Invalid 'schema' field in config (must be non-empty string)
Context too large (62.3KB, limit: 50KB)
Rules for 'deployment' must be an array of strings, ignoring this artifact's rules
```

#### 支援的檔名

- `openspec/config.yaml`（優先）
- `openspec/config.yml`（fallback）

### 12.3 Change 元資料 (`.openspec.yaml`)

每個 change 可以有自己的元資料：

```yaml
# openspec/changes/add-dark-mode/.openspec.yaml
schema: spec-driven       # 可覆寫專案設定的 schema
created: 2025-01-20       # 建立日期
```

**Schema 覆寫優先順序：**
1. CLI flag: `--schema <name>`
2. Change metadata: `.openspec.yaml` 中的 `schema`
3. Project config: `openspec/config.yaml` 中的 `schema`
4. 預設: `spec-driven`

### 12.4 Instruction 注入機制

當 AI 建立一個 artifact 時，prompt 的組裝順序：

```xml
<!-- 1. Schema 中定義的 instruction -->
<instruction>
Create the proposal document that establishes WHY this change is needed.
...
</instruction>

<!-- 2. 專案 context（來自 config.yaml） -->
<context>
Tech stack: TypeScript, React 18, Node.js 20, PostgreSQL 16
...
</context>

<!-- 3. 對應 artifact 的 rules（來自 config.yaml） -->
<rules>
- Include rollback plan for any destructive changes
- Identify affected teams and notify them
</rules>

<!-- 4. 依賴 artifact 的內容（如建立 specs 時注入 proposal 內容） -->
<dependency id="proposal">
[proposal.md 的完整內容]
</dependency>

<!-- 5. Schema 中定義的 template -->
<template>
## Why
## What Changes
## Capabilities
## Impact
</template>
```

### 12.5 自訂 Schema 完整流程

#### 從頭建立

```bash
openspec schema init research-first \
  --description "Research-first workflow" \
  --artifacts "research,proposal,tasks" \
  --default
```

建立的檔案：
```
openspec/schemas/research-first/
├── schema.yaml
└── templates/
    ├── research.md
    ├── proposal.md
    └── tasks.md
```

#### Fork 既有 Schema

```bash
openspec schema fork spec-driven my-workflow
```

複製到 `openspec/schemas/my-workflow/`，可自由編輯。

#### Schema YAML 結構

```yaml
name: my-workflow
version: 1
description: My team's custom workflow

artifacts:
  - id: research           # 唯一 ID
    generates: research.md  # 產生的檔案名
    description: Research document
    template: research.md   # templates/ 中的模板檔
    instruction: |          # AI 建立此 artifact 時的指令
      Investigate the problem space.
      Document findings and options.
    requires: []            # 依賴的 artifact（空 = 無依賴）

  - id: proposal
    generates: proposal.md
    description: Proposal based on research
    template: proposal.md
    instruction: |
      Create a proposal informed by the research.
    requires:
      - research            # 需要 research 完成才能建立

  - id: tasks
    generates: tasks.md
    description: Implementation checklist
    template: tasks.md
    instruction: |
      Break down the work into tasks.
    requires:
      - proposal

apply:
  requires: [tasks]         # apply 階段需要 tasks 完成
  tracks: tasks.md          # 追蹤 tasks.md 中的 checkboxes
  instruction: |            # apply 階段的 AI 指令
    Read context files, work through pending tasks.
```

#### Schema 解析來源

```bash
# 查看某個 schema 從哪裡解析
openspec schema which spec-driven
# 輸出: spec-driven resolves from: package

openspec schema which my-workflow
# 輸出: my-workflow resolves from: project (openspec/schemas/my-workflow)

# 列出所有 schema 及其來源
openspec schema which --all
```

**解析優先順序：**
1. **Project**: `openspec/schemas/<name>/`
2. **User**: `~/.local/share/openspec/schemas/<name>/`
3. **Package**: 內建 schemas（隨 npm 套件分發）

#### 驗證 Schema

```bash
openspec schema validate my-workflow
```

檢查項目：
- `schema.yaml` 語法正確
- 所有 `template` 引用的檔案都存在
- 無循環依賴
- Artifact ID 合法

### 12.6 Verify 的三維驗證

`/opsx:verify` 從三個維度檢查實作品質：

| 維度 | 驗證內容 |
|------|---------|
| **Completeness** | 所有 tasks 是否完成、所有 requirements 是否有對應程式碼、scenarios 是否覆蓋 |
| **Correctness** | 實作是否符合 spec 意圖、邊界案例是否處理 |
| **Coherence** | 設計決策是否反映在程式碼中、命名慣例是否一致 |

### 12.7 Validation 設定

```bash
# 驗證特定 change
openspec validate add-dark-mode

# 驗證所有 changes + specs
openspec validate --all

# 嚴格模式（適合 CI）
openspec validate --all --strict --json

# 調整並行數（預設 6）
openspec validate --all --concurrency 12

# 透過環境變數設定預設並行數
export OPENSPEC_CONCURRENCY=12
```

**Strict mode** 會將警告視為錯誤，適合 CI pipeline 中使用。

---

## 13. 支援的 AI 工具

OpenSpec 支援 24 種 AI 編碼工具，每個工具有專屬的 adapter：

| 工具 | ID | Skills 路徑 | Commands 路徑 |
|------|-----|-------------|---------------|
| Amazon Q Developer | `amazon-q` | `.amazonq/skills/` | `.amazonq/prompts/` |
| Antigravity | `antigravity` | `.agent/skills/` | `.agent/workflows/` |
| Auggie | `auggie` | `.augment/skills/` | `.augment/commands/` |
| Claude Code | `claude` | `.claude/skills/` | `.claude/commands/` |
| Cline | `cline` | `.cline/skills/` | `.clinerules/workflows/` |
| CodeBuddy | `codebuddy` | `.codebuddy/skills/` | `.codebuddy/commands/` |
| Codex | `codex` | `.codex/skills/` | `$CODEX_HOME/prompts/` |
| Continue | `continue` | `.continue/skills/` | `.continue/prompts/` |
| CoStrict | `costrict` | `.cospec/skills/` | `.cospec/openspec/commands/` |
| Crush | `crush` | `.crush/skills/` | `.crush/commands/` |
| Cursor | `cursor` | `.cursor/skills/` | `.cursor/commands/` |
| Factory Droid | `factory` | `.factory/skills/` | `.factory/commands/` |
| Gemini CLI | `gemini` | `.gemini/skills/` | `.gemini/commands/` |
| GitHub Copilot | `github-copilot` | `.github/skills/` | `.github/prompts/` |
| iFlow | `iflow` | `.iflow/skills/` | `.iflow/commands/` |
| Kilo Code | `kilocode` | `.kilocode/skills/` | `.kilocode/workflows/` |
| Kiro | `kiro` | `.kiro/skills/` | `.kiro/prompts/` |
| OpenCode | `opencode` | `.opencode/skills/` | `.opencode/commands/` |
| Pi | `pi` | `.pi/skills/` | `.pi/prompts/` |
| Qoder | `qoder` | `.qoder/skills/` | `.qoder/commands/` |
| Qwen Code | `qwen` | `.qwen/skills/` | `.qwen/commands/` |
| RooCode | `roocode` | `.roo/skills/` | `.roo/commands/` |
| Trae | `trae` | `.trae/skills/` | (無 command adapter) |
| Windsurf | `windsurf` | `.windsurf/skills/` | `.windsurf/workflows/` |

每個 adapter 處理：
- 檔案路徑格式
- 內容格式化（YAML、JSON、Markdown）
- 變數插值（工具特定語法）

---

## 14. 原始碼架構

### 14.1 進入點

**`bin/openspec.js`** — Shebang wrapper，載入 `dist/cli/index.js`

**`src/cli/index.ts`**（~510 行）— Commander.js CLI 路由器：
- 註冊所有命令和子命令
- Telemetry hooks
- 色彩處理
- 全域選項

### 14.2 核心模組

#### Artifact Graph (`src/core/artifact-graph/`)

處理 artifact 的依賴關係和狀態追蹤：

- **`types.ts`** — Zod schemas 定義 artifact、apply phase、change metadata
- **`graph.ts`** — 依賴圖操作（哪些 artifact ready、哪些 blocked）
- **`schema.ts`** — Schema YAML 載入與驗證
- **`resolver.ts`** — Schema 解析（project → user → package）
- **`instruction-loader.ts`** — 模板載入、context/rules 注入、指令組裝
- **`state.ts`** — 檔案系統偵測 artifact 完成狀態

#### Command Generation (`src/core/command-generation/`)

為 24 種 AI 工具產生 skill/command 檔案：

- **`types.ts`** — `ToolCommandAdapter` 介面定義
- **`adapters/`** — 24 個工具特定 adapter 實作
- **`factory.ts`** — 根據工具 ID 建立 adapter
- **`registry.ts`** — Adapter 註冊表
- **`generator.ts`** — 命令內容產生

#### Templates (`src/core/templates/workflows/`)

12 個工作流程模板，產生提供給 AI 的 enriched instructions：

| 模板 | 對應命令 |
|------|---------|
| `propose.ts` | `/opsx:propose` |
| `explore.ts` | `/opsx:explore` |
| `new-change.ts` | `/opsx:new` |
| `continue-change.ts` | `/opsx:continue` |
| `ff-change.ts` | `/opsx:ff` |
| `apply-change.ts` | `/opsx:apply` |
| `verify-change.ts` | `/opsx:verify` |
| `sync-specs.ts` | `/opsx:sync` |
| `archive-change.ts` | `/opsx:archive` |
| `bulk-archive-change.ts` | `/opsx:bulk-archive` |
| `onboard.ts` | `/opsx:onboard` |
| `feedback.ts` | feedback 提交 |

#### Validation (`src/core/validation/`)

- **`validator.ts`** — 使用 Zod schemas 驗證 specs 和 changes
- 支援自訂 rules（從 project config）
- 嚴格模式（CI 用）
- 將 Zod 錯誤轉為人類可讀格式

#### Parsers (`src/core/parsers/`)

- **`markdown-parser.ts`** — 從 markdown 提取 Purpose、Requirements、Scenarios
- **`change-parser.ts`** — 解析 delta spec 語法
- **`requirement-blocks.ts`** — Requirement 區段正規化

### 14.3 設定系統

**Project Config (`project-config.ts`)**
- Zod schema 定義 `openspec/config.yaml`
- 欄位：`schema`（必填）、`context`（上限 50KB）、`rules`（per-artifact）
- 具彈性的欄位級驗證（field-level resilient parsing）

**Global Config (`global-config.ts`)**
- XDG Base Directory 相容
- 欄位：`profile`、`delivery`、`workflows`、`featureFlags`

### 14.4 關鍵技術選擇

| 技術 | 版本 | 用途 |
|------|------|------|
| TypeScript | 5.9.3 | 主要語言，ES2022 target，NodeNext modules |
| Commander.js | 14.0.0 | CLI 框架 |
| Zod | 4.0.17 | Schema 驗證與型別定義 |
| Chalk | 5.5.0 | 彩色輸出 |
| Ora | 8.2.0 | 進度指示器 |
| YAML | 2.8.2 | YAML 解析 |
| @inquirer/prompts | 7.8.0 | 互動式 prompts（動態 import） |
| fast-glob | 3.3.3 | 檔案 globbing |
| PostHog | 5.20.0 | 匿名遙測 |

---

## 15. 測試

### 15.1 框架

使用 **Vitest** 作為測試框架：

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    pool: "forks",        // 程序隔離
    poolOptions: {
      forks: { maxForks: 4 }  // 限制最大 worker 數
    },
    include: ["test/**/*.test.ts"],
    testTimeout: 10000
  }
})
```

### 15.2 測試結構

```
test/
├── cli-e2e/              # 端對端 CLI 測試
├── commands/             # 命令特定測試
├── core/                 # 核心邏輯測試
│   ├── archive.test.ts
│   ├── artifact-graph/
│   └── ...
├── utils/                # 工具函數測試
├── fixtures/             # 測試資料
├── helpers/              # 測試輔助函數
└── specs/                # Spec fixture 檔案
```

### 15.3 執行測試

```bash
pnpm test                 # 執行所有測試
pnpm run test:watch       # 監聽模式
pnpm run test:ui          # 互動式 UI
pnpm run test:coverage    # 覆蓋率報告
```

---

## 16. 建置與發布

### 16.1 建置

```bash
pnpm run build            # 執行 build.js
```

`build.js` 會清理 `dist/` 目錄並執行 TypeScript 編譯器。

### 16.2 開發

```bash
pnpm install              # 安裝依賴
pnpm run dev              # TypeScript watch mode
pnpm run dev:cli          # 建置並執行 CLI
```

### 16.3 發布

使用 [Changesets](https://github.com/changesets/changesets) 管理版本：

```bash
pnpm changeset            # 建立 changeset
pnpm run release          # 發布到 npm
```

發布內容包含：`dist/`、`bin/`、`schemas/`、`scripts/postinstall.js`

### 16.4 Commit 慣例

使用 Conventional Commits（一行式）：
```
type(scope): subject
```

---

## 17. 遙測與隱私

OpenSpec 使用 PostHog 收集匿名使用統計：

- **收集內容**：僅命令名稱和版本號
- **不收集**：參數、路徑、檔案內容、任何 PII
- **自動停用**：CI 環境中自動停用
- **使用者識別**：隨機 UUID，無法反推個人身分

**停用方式：**
```bash
export OPENSPEC_TELEMETRY=0
# 或
export DO_NOT_TRACK=1
```

---

## 18. 名詞對照表

| 英文 | 中文 | 說明 |
|------|------|------|
| Artifact | 工件 | Change 中的文件（proposal、specs、design、tasks） |
| Archive | 歸檔 | 完成 change 並合併 delta specs 到主 specs |
| Change | 變更 | 對系統的提議修改，打包為一個資料夾 |
| Delta Spec | 差異規格 | 描述 ADDED/MODIFIED/REMOVED 的相對規格 |
| Domain | 領域 | Specs 的邏輯分組（如 `auth/`、`payments/`） |
| Requirement | 需求 | 系統必須具備的特定行為 |
| Scenario | 情境 | 需求的具體範例，通常用 Given/When/Then |
| Schema | 綱要 | Artifact 類型及其依賴的定義 |
| Spec | 規格 | 描述系統行為的文件，包含 requirements 和 scenarios |
| Source of truth | 事實來源 | `openspec/specs/` 目錄，包含當前合意的行為 |
| Profile | 配置檔 | 工作流程模式（core 或 custom） |
| Delivery | 交付方式 | 產生 skills、commands 或兩者 |
| Adapter | 轉接器 | 處理特定 AI 工具差異的模組 |
| Brownfield | 棕地 | 在既有程式碼基礎上開發（對比 greenfield 綠地） |

---

*本文件基於 OpenSpec v1.2.0 原始碼撰寫。最後更新：2026-03-12。*
