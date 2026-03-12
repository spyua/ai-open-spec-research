# 專案結構說明

OpenSpec 研究專案：OpenSpec 工具的完整教學、架構分析與操作指南。

---

## 目錄樹

```
open-spec研究/
├── README.md                          # 入口文件：OpenSpec 完整教學指南
├── STRUCTURE.md                       # 本文件：專案結構說明
├── docs/                              # 文件目錄
│   ├── architecture.md                # 架構分析：OpenSpec 內部設計與運作原理
│   ├── customization-guide.md         # 客製化指南：Config / Schema / Template 設定
│   └── sop.md                         # 操作 SOP：12 個具體流程（含指令和 checklist）
├── examples/                          # 範例：各種 config 和 schema 設定範例
│   ├── configs/                       # config.yaml 範例集
│   └── schemas/                       # 自訂 schema 範例集
├── sample-project/                    # Spring Boot 範例專案（可直接複製使用）
│   └── openspec/                      # 範例專案的 OpenSpec 設定
│       ├── config.yaml
│       ├── schemas/                   # 自訂 schemas
│       ├── specs/                     # 行為規格
│       └── changes/                   # 變更提案
└── .claude/                           # Claude Code 設定
    └── settings.local.json
```

---

## 各文件簡述

| 文件 | 說明 |
|------|------|
| `README.md` | OpenSpec 完整教學：核心概念、安裝、指令參考、Artifacts 詳解、工作流程範例 |
| `docs/architecture.md` | OpenSpec 內部架構分析：目錄結構、Schema 引擎、Skill/Command 系統設計 |
| `docs/customization-guide.md` | 客製化設定完整指南：config.yaml、自訂 Schema、Template 撰寫、實戰範例 |
| `docs/sop.md` | 12 個操作 SOP：從初始化到歸檔的具體步驟、指令與 checklist |
| `examples/` | 各種 config 和 schema 範例，可直接參考或複製 |
| `sample-project/` | Spring Boot 範例專案，展示 OpenSpec 在真實專案中的使用方式 |

---

## 建議閱讀順序

1. **[README.md](README.md)** — 先建立整體概念（核心概念、安裝、指令參考）
2. **[docs/sop.md](docs/sop.md)** — 掌握具體操作流程（12 個 SOP）
3. **[docs/architecture.md](docs/architecture.md)** — 深入了解內部設計原理
4. **[docs/customization-guide.md](docs/customization-guide.md)** — 學會客製化設定
