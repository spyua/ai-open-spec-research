# OpenSpec 操作 SOP

> 具體的操作步驟手冊，每個流程都有明確的指令和預期結果。

---

## 目錄

- [SOP-1: 首次導入 OpenSpec 到專案](#sop-1-首次導入-openspec-到專案)
- [SOP-2: 設定 Project Config](#sop-2-設定-project-config)
- [SOP-3: 建立 Custom Schema](#sop-3-建立-custom-schema)
- [SOP-4: 日常開發 — 新功能（快速路徑）](#sop-4-日常開發--新功能快速路徑)
- [SOP-5: 日常開發 — 新功能（逐步控制）](#sop-5-日常開發--新功能逐步控制)
- [SOP-6: 日常開發 — Bug 修復](#sop-6-日常開發--bug-修復)
- [SOP-7: 探索性調查](#sop-7-探索性調查)
- [SOP-8: 平行開發多個 Changes](#sop-8-平行開發多個-changes)
- [SOP-9: 批量歸檔](#sop-9-批量歸檔)
- [SOP-10: 升級 OpenSpec](#sop-10-升級-openspec)
- [SOP-11: 新人 Onboarding](#sop-11-新人-onboarding)
- [SOP-12: CI/CD 整合驗證](#sop-12-cicd-整合驗證)

---

## SOP-1: 首次導入 OpenSpec 到專案

### 前置條件

- Node.js 20.19.0+（`node --version` 確認）
- 專案已用 git 管理

### 步驟

#### Step 1: 安裝 CLI

```bash
npm install -g @fission-ai/openspec@latest
```

**驗證：**

```bash
openspec --version
# 預期輸出：1.x.x
```

#### Step 2: 初始化

```bash
cd your-project

# 互動式（會問你要配置哪些 AI 工具）
openspec init

# 或非互動式（直接指定工具）
openspec init --tools claude,cursor
```

**預期結果：** 產生以下結構

```
openspec/
├── config.yaml
├── specs/
└── changes/
.claude/skills/          # 如果選了 claude
.cursor/skills/          # 如果選了 cursor
```

#### Step 3: 選擇 Profile

```bash
# 查看目前 profile
openspec config list

# 如果要用 expanded workflow（new, continue, ff, verify 等）
openspec config profile
# → 選擇想要的 workflows
# → 選擇 delivery mode（skills / commands / both）

# 套用到專案
openspec update
```

**預設是 `core` profile**，包含 `propose`、`explore`、`apply`、`archive`。大部分情況用 core 就夠了。

#### Step 4: 加入 .gitignore（可選）

OpenSpec 的檔案**應該**被 commit，因為它們是專案的一部分。但如果有不想追蹤的：

```gitignore
# 通常不需要加任何 OpenSpec 相關的 gitignore
# openspec/ 全部都應該 commit
```

#### Step 5: Commit 初始化結果

```bash
git add openspec/ .claude/ .cursor/   # 依你選的工具調整
git commit -m "chore: initialize OpenSpec"
```

#### 完成確認

- [ ] `openspec --version` 有輸出
- [ ] `openspec/config.yaml` 存在
- [ ] `openspec/specs/` 目錄存在
- [ ] `openspec/changes/` 目錄存在
- [ ] AI 工具的 skills 目錄存在
- [ ] 已 commit 到 git

---

## SOP-2: 設定 Project Config

### 前置條件

- SOP-1 已完成

### 步驟

#### Step 1: 編輯 config.yaml

```bash
# 用編輯器開啟
openspec config edit

# 或直接編輯檔案
# 路徑：openspec/config.yaml
```

#### Step 2: 設定預設 Schema

```yaml
schema: spec-driven    # 或你的 custom schema 名稱
```

#### Step 3: 撰寫 Context

填入 AI 無法從 code 推斷但需要知道的資訊：

```yaml
context: |
  ## Tech Stack
  - Language: [你的語言和版本]
  - Framework: [你的框架和版本]
  - Database: [你的資料庫]
  - Build Tool: [你的建構工具]

  ## Architecture
  - [你的架構風格，例如：Layered / Microservices / Monolith]
  - [重要的設計模式]

  ## Conventions
  - [命名慣例]
  - [測試策略]
  - [API 風格]

  ## Team
  - [團隊規模]
  - [Review 流程]
  - [CI/CD 工具]
```

#### Step 4: 設定 Rules

根據你的團隊規範，針對每個 artifact 設規則：

```yaml
rules:
  proposal:
    - [你的 proposal 規則]
  specs:
    - [你的 spec 規則]
  design:
    - [你的 design 規則]
  tasks:
    - [你的 task 規則]
```

#### Step 5: 設定語言（可選）

如果要用非英文生成 artifacts：

```yaml
context: |
  語言：繁體中文（zh-TW）
  所有產出物必須用繁體中文撰寫。
  技術術語保留英文。

  ## Tech Stack
  ...（接原本的 context）
```

#### Step 6: 驗證

```bash
# 確認設定被正確讀取
openspec config list

# 確認 AI 看到的 prompt
openspec instructions proposal --change test 2>/dev/null || echo "OK - config is loaded"
```

#### Step 7: Commit

```bash
git add openspec/config.yaml
git commit -m "chore: configure OpenSpec project settings"
```

#### 完成確認

- [ ] `schema` 已設定
- [ ] `context` 包含技術棧和架構資訊
- [ ] `rules` 至少設定了 proposal 和 specs
- [ ] 已 commit

---

## SOP-3: 建立 Custom Schema

### 前置條件

- SOP-1、SOP-2 已完成
- 確認內建 `spec-driven` 不符合需求

### 決策：Fork vs 從零建立

```
你需要的 workflow 跟 spec-driven 差異大嗎？
├── 差異小（只想改 template 或加一個 artifact）→ Fork
└── 完全不同的流程                              → 從零建立
```

### 路徑 A: Fork 現有 Schema

#### Step 1: Fork

```bash
openspec schema fork spec-driven my-workflow
```

**預期結果：**

```
openspec/schemas/my-workflow/
├── schema.yaml
└── templates/
    ├── proposal.md
    ├── spec.md
    ├── design.md
    └── tasks.md
```

#### Step 2: 修改 schema.yaml

根據需要增刪 artifacts 或修改依賴關係。

#### Step 3: 修改 templates

編輯 `templates/` 下的模板檔，調整 AI 生成的結構。

### 路徑 B: 從零建立

#### Step 1: 初始化

```bash
# 互動式
openspec schema init my-workflow

# 非互動式
openspec schema init my-workflow \
  --description "My team workflow" \
  --artifacts "proposal,design,tasks"
```

#### Step 2: 編輯 schema.yaml

```bash
# 路徑：openspec/schemas/my-workflow/schema.yaml
```

填寫每個 artifact 的 `id`、`generates`、`template`、`instruction`、`requires`。

#### Step 3: 撰寫 Templates

為每個 artifact 在 `templates/` 下建立模板檔。

### 共同步驟（A 和 B 之後）

#### Step 4: 驗證

```bash
openspec schema validate my-workflow
```

**預期輸出：** 全部通過，無 error。

#### Step 5: 設為預設

```yaml
# openspec/config.yaml
schema: my-workflow
```

或建立時加 `--default`。

#### Step 6: 設定對應的 Rules

```yaml
# openspec/config.yaml
rules:
  # key 必須對應 schema.yaml 中的 artifact id
  proposal:
    - ...
  design:
    - ...
  tasks:
    - ...
```

#### Step 7: 測試

```bash
# 查看所有可用 schemas
openspec schemas

# 確認解析來源
openspec schema which my-workflow
# 預期輸出：Source: project

# 查看 template 路徑
openspec templates --schema my-workflow

# 查看 AI 會收到的完整 prompt
openspec instructions proposal --change test-change --schema my-workflow
```

#### Step 8: Commit

```bash
git add openspec/schemas/ openspec/config.yaml
git commit -m "feat: add custom schema my-workflow"
```

#### 完成確認

- [ ] `openspec schema validate` 通過
- [ ] `openspec schemas` 列表中有你的 schema
- [ ] `openspec schema which` 顯示 Source: project
- [ ] config.yaml 的 `schema` 已更新
- [ ] config.yaml 的 `rules` key 對應 artifact id
- [ ] 已 commit

---

## SOP-4: 日常開發 — 新功能（快速路徑）

> 適用：需求明確、scope 清楚的功能開發。使用 Core Profile。

### 步驟

#### Step 1: 提案 + 生成全部 Artifacts

在 AI 聊天介面中：

```
/opsx:propose add-dark-mode
```

**預期結果：** AI 自動建立：
- `openspec/changes/add-dark-mode/proposal.md`
- `openspec/changes/add-dark-mode/specs/*/spec.md`
- `openspec/changes/add-dark-mode/design.md`
- `openspec/changes/add-dark-mode/tasks.md`

#### Step 2: 審核 Artifacts

**必做：** 閱讀 AI 生成的 artifacts，確認：
- [ ] proposal 的 scope 正確
- [ ] specs 的 scenarios 覆蓋 happy path 和 error cases
- [ ] design 的技術方案合理
- [ ] tasks 的粒度適當、順序正確

**如果需要修改：** 直接編輯檔案或告訴 AI 修改。

#### Step 3: 檢查狀態

```bash
openspec status --change add-dark-mode
```

確認所有 artifacts 狀態為 `done`。

#### Step 4: 實作

```
/opsx:apply
```

AI 會逐項完成 tasks.md 中的 checkbox。

**中途如果需要修改 artifacts：** 隨時可以回去改 proposal、design 等，然後繼續 apply。

#### Step 5: 驗證（如果啟用了 custom profile 並包含 verify workflow）

```
/opsx:verify
```

檢查實作是否符合 specs。

#### Step 6: 歸檔

```
/opsx:archive
```

**預期結果：**
- Delta specs 合併到 `openspec/specs/`
- Change 移到 `openspec/changes/archive/YYYY-MM-DD-add-dark-mode/`

#### Step 7: Commit

```bash
git add .
git commit -m "feat: add dark mode support"
```

#### 完成確認

- [ ] `openspec list` 不再顯示此 change
- [ ] `openspec/specs/` 中有更新的 spec
- [ ] `openspec/changes/archive/` 中有歸檔的 change
- [ ] 所有程式碼已 commit

---

## SOP-5: 日常開發 — 新功能（逐步控制）

> 適用：需求複雜、需要逐步審核。需要 Custom Profile。

### 前置條件

```bash
# 確認已啟用 custom workflow
openspec config list
# 如果沒有，執行：
openspec config profile
# → 選擇包含 new, continue, ff 的 workflows
openspec update
```

### 步驟

#### Step 1: 建立 Change Scaffold

```
/opsx:new add-user-2fa
```

**預期結果：** 只建立空的 change 資料夾和 metadata。

#### Step 2: 建立 Proposal

```
/opsx:continue
```

AI 建立 `proposal.md`。

**審核：** 閱讀 proposal，確認 intent 和 scope。如果不對，告訴 AI 修改。

#### Step 3: 建立 Specs

```
/opsx:continue
```

AI 建立 delta specs。

**審核：** 確認 scenarios 覆蓋完整、API contract 正確。

#### Step 4: 建立 Design

```
/opsx:continue
```

AI 建立 `design.md`。

**審核：** 確認技術方案、DB migration、sequence diagram。

#### Step 5: 建立 Tasks

```
/opsx:continue
```

AI 建立 `tasks.md`。

**審核：** 確認 task 粒度和順序。

#### Step 6 ~ 8: 同 SOP-4 的 Step 4 ~ 6

Apply → Verify → Archive

---

## SOP-6: 日常開發 — Bug 修復

> Bug 修復通常 scope 小、需要快速處理。

### 步驟

#### Step 1: 提案

```
/opsx:propose fix-login-redirect-loop
```

提供 bug 的具體描述，AI 會自動生成較精簡的 artifacts。

#### Step 2: 快速審核

Bug fix 的 artifacts 通常較簡短，快速確認：
- [ ] proposal 準確描述了 bug 和修復方向
- [ ] specs 包含了 bug 的 regression scenario
- [ ] tasks 合理

#### Step 3: 實作

```
/opsx:apply
```

#### Step 4: 歸檔

```
/opsx:archive
```

#### Step 5: Commit

```bash
git add .
git commit -m "fix: resolve login redirect loop"
```

---

## SOP-7: 探索性調查

> 適用：需求不明確、需要先調查再決定做什麼。

### 步驟

#### Step 1: 開始探索

```
/opsx:explore
```

AI 會問你想探索什麼。

#### Step 2: 描述問題

```
我想改善 API 的 response time，但不確定瓶頸在哪。
```

AI 會分析 codebase、列出可能的方向。

#### Step 3: 深入討論

跟 AI 來回討論，直到確定方向。

#### Step 4: 轉入正式流程

確定方向後：

```
/opsx:propose optimize-product-query
```

從 SOP-4 Step 2 繼續。

---

## SOP-8: 平行開發多個 Changes

> 適用：同時進行多個功能、被 urgent bug 打斷時。

### 場景：正在做 Feature A，被 Bug B 打斷

#### Step 1: 暫停 Feature A

Feature A 的 tasks.md 中已完成的 task 會保留 `[x]`，不需要特別操作。

#### Step 2: 開始 Bug B

```
/opsx:propose fix-critical-login-bug
```

#### Step 3: 完成 Bug B

```
/opsx:apply
/opsx:archive
```

#### Step 4: 回到 Feature A

```
/opsx:apply add-dark-mode
```

AI 會從上次未完成的 task 繼續。

### 查看所有進行中的 Changes

```bash
openspec list
```

```
Active changes:
  add-dark-mode         UI theme switching support
  optimize-query        Database query optimization
```

---

## SOP-9: 批量歸檔

> 適用：多個 changes 都已完成，一次歸檔。需要 Custom Profile。

### 步驟

#### Step 1: 確認有哪些完成的 Changes

```bash
openspec list
```

#### Step 2: 批量歸檔

```
/opsx:bulk-archive
```

AI 會：
1. 列出所有已完成的 changes
2. 檢查 spec 衝突
3. 按建立時間順序歸檔
4. 請你確認

#### Step 3: 確認

```
Yes
```

#### Step 4: Commit

```bash
git add .
git commit -m "chore: archive completed changes"
```

---

## SOP-10: 升級 OpenSpec

### 步驟

#### Step 1: 升級 CLI

```bash
npm install -g @fission-ai/openspec@latest
```

#### Step 2: 確認版本

```bash
openspec --version
```

#### Step 3: 更新專案設定

```bash
cd your-project
openspec update
```

這會重新生成 AI 工具的 skills 和 commands。

#### Step 4: Commit 更新的檔案

```bash
git add .claude/ .cursor/ openspec/   # 依你的工具調整
git commit -m "chore: update OpenSpec to vX.X.X"
```

---

## SOP-11: 新人 Onboarding

> 適用：新成員加入團隊，需要學習 OpenSpec 流程。

### 步驟

#### Step 1: 安裝

```bash
npm install -g @fission-ai/openspec@latest
```

#### Step 2: 確認專案已初始化

專案 clone 下來後，OpenSpec 設定已經在 git 中。確認：

```bash
ls openspec/
# 應該看到 config.yaml, specs/, changes/
```

#### Step 3: 互動式教學

```
/opsx:onboard
```

AI 會用你的真實 codebase 帶新人走一遍完整流程（約 15-30 分鐘）：
1. 掃描 codebase 找改善機會
2. 建立一個真實的 change
3. 生成 artifacts
4. 實作
5. 歸檔

#### Step 4: 獨立練習

新人自己用 `/opsx:propose` 建立一個小功能或修復。

---

## SOP-12: CI/CD 整合驗證

> 適用：在 CI pipeline 中自動驗證 specs 和 changes 的結構。

### GitHub Actions 範例

```yaml
# .github/workflows/openspec-validate.yml
name: OpenSpec Validation

on:
  pull_request:
    paths:
      - 'openspec/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install OpenSpec
        run: npm install -g @fission-ai/openspec@latest

      - name: Validate all specs and changes
        run: openspec validate --all --strict --json
```

### 驗證的內容

```bash
# 驗證所有 changes 和 specs
openspec validate --all --strict --json

# 只驗證 changes
openspec validate --changes --json

# 只驗證 specs
openspec validate --specs --json

# 驗證 custom schemas
openspec schema validate --json
```

---

## 快速參考卡

### 日常最常用的指令

| 場景 | 指令 |
|------|------|
| 開始新功能 | `/opsx:propose feature-name` |
| 探索問題 | `/opsx:explore` |
| 開始實作 | `/opsx:apply` |
| 歸檔完成 | `/opsx:archive` |
| 查看進度 | `openspec status --change name` |
| 列出所有 changes | `openspec list` |
| 驗證結構 | `openspec validate --all` |

### 決策樹：該用哪個流程？

```
你要做什麼？
│
├── 需求明確，要開始做 ──────────────► SOP-4（快速路徑）
│
├── 需求複雜，想逐步審核 ───────────► SOP-5（逐步控制）
│
├── 修 Bug ─────────────────────────► SOP-6（Bug 修復）
│
├── 不確定要做什麼，先調查 ──────────► SOP-7（探索）
│
├── 被其他事打斷 ───────────────────► SOP-8（平行開發）
│
├── 多個 changes 要歸檔 ────────────► SOP-9（批量歸檔）
│
├── 新人加入 ───────────────────────► SOP-11（Onboarding）
│
└── 第一次導入 ─────────────────────► SOP-1 → SOP-2 → (SOP-3)
```
