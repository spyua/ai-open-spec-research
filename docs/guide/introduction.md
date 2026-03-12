# 簡介與核心概念

> **OpenSpec = 可插拔的規格骨架 (Pluggable Spec Scaffold)**
> 它不是一個死板的流程框架，而是一套可組裝、可替換的「規格產出骨架」，讓 AI 在寫 code 之前先跟你對齊「要做什麼」。

## 設計哲學

```
fluid not rigid       — 沒有 phase gate，什麼有意義就做什麼
iterative not waterfall — 邊做邊學，邊學邊改
easy not complex      — 輕量設定，最少儀式
brownfield-first      — 為既有系統而生，不只是 greenfield
```

## 核心價值

- **先對齊再開發** — 人類與 AI 在動手前先就規格達成一致
- **保持有組織** — 每個變更都有自己的資料夾，包含 proposal、specs、design 和 tasks
- **流動式工作** — 隨時更新任何 artifact，不存在嚴格的階段閘門
- **工具無關** — 透過 slash commands 支援 24+ 種 AI 編碼助手

## 五大核心元素

| 元素 | 說明 |
|------|------|
| **Spec（規格）** | 描述系統行為的文件，含 Requirements 和 Scenarios。存放在 `specs/`，是 Source of Truth |
| **Change（變更提案）** | 對系統的一次修改，打包為獨立資料夾，含所有 Artifacts |
| **Artifact（產出物）** | Change 中的文件零件 — proposal、specs、design、tasks |
| **Delta Spec（差異規格）** | 描述 ADDED / MODIFIED / REMOVED 的規格變更 |
| **Archive（歸檔）** | 完成 Change 後，Delta Specs 合併到 specs/，Change 移入 archive/ |

## 兩大區域

```
openspec/
├── specs/       ← 🟢 Source of Truth：系統目前的行為規格
└── changes/     ← 🟡 提案區：每個變更一個資料夾，含所有 artifacts
```

- **specs/** — 永久的行為規格，隨著每次 archive 而成長
- **changes/** — 暫時的變更提案，完成後歸檔到 archive/

## 兩種工作模式

### Core Profile（預設）— 快速路徑

```
/opsx:propose ──► /opsx:apply ──► /opsx:archive
```

提供 4 個指令：`propose`、`explore`、`apply`、`archive`

### Custom Profile — 完整控制

```
/opsx:new ──► /opsx:ff 或 /opsx:continue ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

可自由選擇啟用：`new`、`continue`、`ff`、`verify`、`sync`、`bulk-archive`、`onboard`

切換方式：

```bash
openspec config profile     # 互動式選擇
openspec config profile core   # 快速切回 core
openspec update             # 套用到專案
```

## 下一步

- [安裝與初始化](/guide/installation) — 把 OpenSpec 跑起來
- [系統架構](/concepts/architecture) — 了解運作原理
- [新功能（快速路徑）](/workflows/fast-track) — 實際動手做
