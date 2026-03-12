# Schema 系統

Schema = 可替換的骨架定義，決定你的 workflow 有哪些 artifacts、什麼順序組裝。

## 內建 Schema

**spec-driven**（預設且唯一的內建 schema）：

```
proposal → specs + design → tasks → implement
```

## Schema 來源優先順序

| 優先順序 | 來源 | 路徑 |
|----------|------|------|
| 1 (最高) | Project | `openspec/schemas/<name>/` |
| 2 | User | `~/.local/share/openspec/schemas/<name>/` |
| 3 (最低) | Package | 內建 schemas |

Project-level schema 推薦，因為可以跟 code 一起 version control。

## Schema 結構

```
openspec/schemas/<name>/
├── schema.yaml        # 骨架定義
└── templates/         # Artifact 模板
    ├── proposal.md
    ├── spec.md
    ├── design.md
    └── tasks.md
```

## `schema.yaml` 完整欄位

```yaml
name: my-workflow              # Schema 名稱（kebab-case）
version: 1                     # 版本號
description: My team's workflow

artifacts:
  - id: proposal               # 唯一識別碼
    generates: proposal.md      # 輸出檔名（支援 glob）
    description: Change proposal
    template: proposal.md       # templates/ 下的模板檔
    instruction: |              # AI 生成指示
      Create a proposal...
    requires: []                # 依賴的 artifact ids

  - id: specs
    generates: specs/**/*.md
    template: spec.md
    requires:
      - proposal

apply:
  requires: [tasks]             # 進入實作需要的 artifacts
  tracks: tasks.md              # 追蹤進度的檔案
```

| 欄位 | 必填 | 說明 |
|------|------|------|
| `name` | Yes | Schema 名稱，kebab-case |
| `version` | Yes | 版本號 |
| `description` | No | 描述文字 |
| `artifacts` | Yes | Artifact 定義陣列 |
| `artifacts[].id` | Yes | 唯一識別碼，用在 `requires`、`rules` key |
| `artifacts[].generates` | Yes | 輸出檔名，支援 glob |
| `artifacts[].template` | Yes | `templates/` 下的模板檔名 |
| `artifacts[].instruction` | No | AI 生成指示 |
| `artifacts[].requires` | Yes | 依賴的 artifact id 陣列 |
| `apply.requires` | Yes | 進入 apply 前必須完成的 artifacts |
| `apply.tracks` | Yes | 追蹤實作進度的檔案 |

## Schema CLI 指令

| 指令 | 用途 |
|------|------|
| `openspec schema init <name>` | 建立新 schema |
| `openspec schema fork <source> [name]` | Fork 現有 schema |
| `openspec schema validate [name]` | 驗證 schema 結構 |
| `openspec schema which [name] [--all]` | 查看 schema 來源 |
| `openspec schemas` | 列出所有可用 schemas |
| `openspec templates [--schema <name>]` | 查看 template 路徑 |
