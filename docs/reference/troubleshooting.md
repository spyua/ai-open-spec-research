# Troubleshooting

## 常見問題

| 問題 | 原因 | 解法 |
|------|------|------|
| "Change not found" | 未指定名稱 | 指定：`/opsx:apply add-dark-mode`；`openspec list` 確認 |
| "No artifacts ready" | 前置 artifact 未完成 | `openspec status --change <name>` 看什麼 blocked |
| "Schema not found" | 拼字錯誤或路徑不對 | `openspec schemas` 列出所有；檢查拼字 |
| Commands not recognized | 設定檔未更新 | `openspec init` + `openspec update`；重啟 AI 工具 |
| Artifacts 品質差 | context/rules 不夠具體 | 在 config.yaml 加詳細的 [context 和 rules](/customization/config) |
| Template not found | schema.yaml template 指向不存在的檔案 | `openspec schema validate` |
| Rules 沒生效 | rules key 跟 artifact id 不一致 | 確認 key 對應 schema 中的 `artifacts[].id` |
| Context 沒生效 | config.yaml YAML indentation 錯誤 | `openspec config list` 確認讀取正確 |
| Circular dependency | A requires B, B requires A | `openspec schema validate` 會偵測 |

## 設定檢查指令

```bash
# 確認目前使用哪個 Schema
openspec schema which --all

# 確認 Schema 是否合法
openspec schema validate my-workflow --verbose

# 確認 AI 看到的完整 Prompt
openspec instructions proposal --change my-change --json
```

## Custom Schema 設定 Checklist

- [ ] config.yaml — `schema` 設為 custom schema 名稱
- [ ] config.yaml — `context` 描述了技術棧和架構
- [ ] config.yaml — `rules` 針對每個 artifact 設了規則
- [ ] schema.yaml — 定義了所有需要的 artifacts
- [ ] schema.yaml — 依賴關係正確（無循環）
- [ ] schema.yaml — `apply.requires` 和 `apply.tracks` 正確
- [ ] templates/ — 每個 artifact 都有對應的模板檔
- [ ] `openspec schema validate` 通過
- [ ] `openspec instructions` 確認 prompt 正確

## 決策樹：該用哪個流程？

```
你要做什麼？
│
├── 需求明確，要開始做 ──────────► 新功能（快速路徑）
├── 需求複雜，想逐步審核 ────────► 新功能（逐步控制）
├── 修 Bug ──────────────────────► Bug 修復
├── 不確定要做什麼，先調查 ───────► 探索性調查
├── 被其他事打斷 ────────────────► 平行開發
├── 多個 changes 要歸檔 ─────────► 批量歸檔
└── 第一次導入 ──────────────────► 安裝與初始化
```
