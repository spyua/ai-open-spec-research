# Custom Schema 建立教學

## 決策：Fork vs 從零建立

```
你需要的 workflow 跟 spec-driven 差異大嗎？
├── 差異小（只想改 template 或加一個 artifact）→ Fork
└── 完全不同的流程                              → 從零建立
```

## 方式 A: Fork 現有 Schema（推薦）

```bash
openspec schema fork spec-driven my-workflow
```

產出：

```
openspec/schemas/my-workflow/
├── schema.yaml           # 完整的 spec-driven 副本
└── templates/
    ├── proposal.md
    ├── spec.md
    ├── design.md
    └── tasks.md
```

然後你可以：
- 修改 `schema.yaml` 增刪 artifacts、改依賴關係
- 修改 `templates/` 改 artifact 的結構和引導
- 修改 `instruction` 欄位改 AI 的生成指示

## 方式 B: 從零建立

```bash
# 互動式
openspec schema init my-workflow

# 非互動式
openspec schema init rapid \
  --description "Rapid iteration workflow" \
  --artifacts "proposal,tasks" \
  --default
```

| 選項 | 說明 |
|------|------|
| `--description <text>` | Schema 描述 |
| `--artifacts <list>` | 逗號分隔的 artifact IDs |
| `--default` | 設為專案預設 schema |
| `--force` | 覆蓋已存在的 schema |

## 共同步驟

### 驗證

```bash
openspec schema validate my-workflow
```

檢查項目：
- `schema.yaml` 語法正確
- 所有 template 檔案存在
- 無循環依賴
- Artifact IDs 合法

### 設為預設

```yaml
# openspec/config.yaml
schema: my-workflow
```

### 設定對應的 Rules

```yaml
# openspec/config.yaml
rules:
  # key 必須對應 schema.yaml 中的 artifact id
  proposal:
    - ...
  design:
    - ...
```

### 測試

```bash
openspec schemas                    # 列出所有
openspec schema which my-workflow    # 確認來源是 project
openspec templates --schema my-workflow
openspec instructions proposal --change test --schema my-workflow
```

### Commit

```bash
git add openspec/schemas/ openspec/config.yaml
git commit -m "feat: add custom schema my-workflow"
```

## 完成確認

- [ ] `openspec schema validate` 通過
- [ ] `openspec schemas` 列表中有你的 schema
- [ ] `openspec schema which` 顯示 Source: project
- [ ] config.yaml 的 `schema` 已更新
- [ ] config.yaml 的 `rules` key 對應 artifact id
- [ ] 已 commit
