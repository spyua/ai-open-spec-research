# 專案結構說明

OpenSpec 研究專案：OpenSpec 工具的完整教學、架構分析與操作指南。

---

## 目錄樹

```
open-spec研究/
├── README.md                          # 入口文件：OpenSpec 完整教學指南
├── STRUCTURE.md                       # 本文件：專案結構說明
├── docs/                              # 文件目錄
│   ├── architecture.md                # 設計概念：系統架構全景圖、DAG、Delta Specs、Prompt 組裝
│   ├── customization-guide.md         # 客製化指南：Config / Schema / Template 設定
│   ├── plugin-integration.md          # 整合說明：OpenSpec 如何與 Spring Boot Plugin 串接
│   └── sop.md                         # 操作 SOP：12 個具體流程（含指令和 checklist）
├── examples/                          # 範例：各種 config 和 schema 設定範例
│   ├── config-full.yaml               # 完整 config 範例（含 context + rules）
│   ├── config-minimal.yaml            # 最小 config 範例
│   ├── schema-rapid.yaml              # 快速流程 schema 範例
│   └── schema-with-review.yaml        # 含 review 階段的 schema 範例
├── sample-project/                    # Spring Boot 範例專案（可直接複製使用）
│   └── openspec/                      # 範例專案的 OpenSpec 設定
│       ├── config.yaml                # 專案設定（預設 spring-boot-workflow schema）
│       └── schemas/                   # 三套自訂 schema
│           ├── spring-boot-analysis/  #   分析流程（整合 /generate-sd）
│           ├── spring-boot-dev/       #   開發流程（整合 /scaffold-jpa 等 skills）
│           └── spring-boot-workflow/  #   精簡版開發流程
└── .claude/                           # Claude Code 設定
    └── settings.local.json
```

---

## 各文件簡述

| 文件 | 類型 | 說明 |
|------|------|------|
| `README.md` | 教學 | OpenSpec 完整教學：核心概念、安裝、指令參考、Artifacts 詳解、工作流程範例 |
| `docs/architecture.md` | 概念 | OpenSpec 設計概念：設計哲學、系統架構圖、DAG、Delta Specs、Prompt 組裝機制、Profile 系統 |
| `docs/customization-guide.md` | 指南 | 客製化設定完整指南：config.yaml、自訂 Schema、Template 撰寫、實戰範例 |
| `docs/plugin-integration.md` | 說明 | OpenSpec 與 Spring Boot Plugin 的整合方式：文字層串接、兩條 Pipeline 串接 |
| `docs/sop.md` | 操作 | 12 個操作 SOP：從初始化到歸檔的具體步驟、指令與 checklist |
| `examples/` | 範例 | 各種 config 和 schema 範例，可直接參考或複製 |
| `sample-project/` | 範例 | Spring Boot 範例專案，展示三套自訂 schema 與 plugin 整合 |

---

## 建議閱讀順序

1. **[README.md](README.md)** — 先建立整體概念（核心概念、安裝、指令參考）
2. **[docs/architecture.md](docs/architecture.md)** — 理解設計哲學與系統架構全貌
3. **[docs/sop.md](docs/sop.md)** — 掌握具體操作流程（12 個 SOP）
4. **[docs/customization-guide.md](docs/customization-guide.md)** — 學會客製化設定
5. **[docs/plugin-integration.md](docs/plugin-integration.md)** — 了解如何與外部 Plugin 串接
