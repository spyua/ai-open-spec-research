# Slash Commands 參考

> 這些指令在 AI 聊天介面中使用（Claude Code、Cursor、Windsurf 等）

## Core Profile 指令

### `/opsx:propose [change-name]`

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

### `/opsx:explore [topic]`

探索問題空間，不建立任何 artifact。適合需求不明確時使用。

```
You: /opsx:explore how should we handle rate limiting?

AI:  I see three approaches:
     1. Middleware-based (simple)
     2. Redis-backed (scalable)
     3. Token bucket per user (fair)
```

### `/opsx:apply [change-name]`

根據 tasks.md 逐項實作，自動勾選 checkbox。

```
You: /opsx:apply

AI:  Working on 1.1: Create ThemeContext...
     ✓ 1.1 Complete
     Working on 1.2: Add CSS custom properties...
     ✓ 1.2 Complete
```

### `/opsx:archive [change-name]`

歸檔完成的 change，merge delta specs 到 specs/。

```
You: /opsx:archive

AI:  ✓ Synced specs to openspec/specs/ui/spec.md
     ✓ Moved to openspec/changes/archive/2025-01-24-add-dark-mode/
```

## Custom Profile 額外指令

| 指令 | 說明 |
|------|------|
| `/opsx:new [name] [--schema <name>]` | 只建立 change scaffold，不生成 artifacts |
| `/opsx:continue [name]` | 依 DAG 順序，一次建立一個 artifact |
| `/opsx:ff [name]` | Fast-forward：一次建立所有 planning artifacts |
| `/opsx:verify [name]` | 驗證實作（Completeness / Correctness / Coherence） |
| `/opsx:sync [name]` | 手動 merge delta specs 到 main specs |
| `/opsx:bulk-archive [names...]` | 批量歸檔多個完成的 changes |
| `/opsx:onboard` | 互動式教學（約 15-30 分鐘） |

## 不同 AI 工具的語法差異

| 工具 | 語法 |
|------|------|
| Claude Code | `/opsx:propose` |
| Cursor | `/opsx-propose` |
| Windsurf | `/opsx-propose` |
| Copilot (IDE) | `/opsx-propose` |
| Trae | `/openspec-propose`（skill-based） |
