# 安裝與初始化

## 前置條件

- Node.js 20.19.0+（`node --version` 確認）
- 專案已用 git 管理

## Step 1: 安裝 CLI

```bash
# npm
npm install -g @fission-ai/openspec@latest

# pnpm / yarn / bun
pnpm add -g @fission-ai/openspec@latest

# 驗證
openspec --version
# 預期輸出：1.x.x
```

## Step 2: 初始化

```bash
cd your-project

# 互動式（會問你要配置哪些 AI 工具）
openspec init

# 非互動式（直接指定工具）
openspec init --tools claude,cursor

# 指定所有工具
openspec init --tools all
```

**預期結果：**

```
openspec/
├── config.yaml
├── specs/
└── changes/
.claude/skills/          # 如果選了 claude
.cursor/skills/          # 如果選了 cursor
```

## Step 3: 選擇 Profile

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

## Step 4: Commit

```bash
git add openspec/ .claude/ .cursor/   # 依你選的工具調整
git commit -m "chore: initialize OpenSpec"
```

::: tip OpenSpec 的檔案應該 commit
`openspec/` 全部都應該 commit，因為它們是專案的一部分。
:::

## 升級

```bash
npm install -g @fission-ai/openspec@latest
openspec update    # 重新生成 AI 工具設定檔
```

## 完成確認

- [ ] `openspec --version` 有輸出
- [ ] `openspec/config.yaml` 存在
- [ ] `openspec/specs/` 目錄存在
- [ ] `openspec/changes/` 目錄存在
- [ ] AI 工具的 skills 目錄存在
- [ ] 已 commit 到 git

## 目錄結構

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
│   │       ├── .openspec.yaml    # 變更 metadata
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
├── .claude/skills/           # Claude Code skills
├── .cursor/skills/           # Cursor skills
└── src/                      # 你的原始碼
```
