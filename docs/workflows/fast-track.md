# 新功能（快速路徑）

> 適用：需求明確、scope 清楚的功能開發。使用 Core Profile。

## 流程概覽

```
/opsx:propose ──► 審核 ──► /opsx:apply ──► /opsx:archive ──► git commit
```

## Step 1: 提案 + 生成全部 Artifacts

在 AI 聊天介面中：

```
/opsx:propose add-dark-mode
```

**預期結果：** AI 自動建立：
- `openspec/changes/add-dark-mode/proposal.md`
- `openspec/changes/add-dark-mode/specs/*/spec.md`
- `openspec/changes/add-dark-mode/design.md`
- `openspec/changes/add-dark-mode/tasks.md`

## Step 2: 審核 Artifacts

::: warning 必做
閱讀 AI 生成的 artifacts，確認：
- [ ] proposal 的 scope 正確
- [ ] specs 的 scenarios 覆蓋 happy path 和 error cases
- [ ] design 的技術方案合理
- [ ] tasks 的粒度適當、順序正確

如果需要修改：直接編輯檔案或告訴 AI 修改。
:::

## Step 3: 檢查狀態

```bash
openspec status --change add-dark-mode
```

確認所有 artifacts 狀態為 `done`。

## Step 4: 實作

```
/opsx:apply
```

AI 會逐項完成 tasks.md 中的 checkbox。中途如果需要修改 artifacts，隨時可以回去改。

## Step 5: 歸檔

```
/opsx:archive
```

**預期結果：**
- Delta specs 合併到 `openspec/specs/`
- Change 移到 `openspec/changes/archive/YYYY-MM-DD-add-dark-mode/`

## Step 6: Commit

```bash
git add .
git commit -m "feat: add dark mode support"
```

## 完成確認

- [ ] `openspec list` 不再顯示此 change
- [ ] `openspec/specs/` 中有更新的 spec
- [ ] `openspec/changes/archive/` 中有歸檔的 change
- [ ] 所有程式碼已 commit

## 完整 End-to-End 範例

場景：為 Spring Boot 專案新增使用者 2FA 功能。

### 設定 config

```yaml
# openspec/config.yaml
schema: spec-driven

context: |
  Tech stack: Java 17, Spring Boot 3.x, PostgreSQL, Redis
  Architecture: Controller → Service → Repository
  Testing: JUnit 5, Mockito, Testcontainers

rules:
  proposal:
    - Must include rollback plan
  specs:
    - Use Given/When/Then format
    - Must include error scenarios
  design:
    - Must include sequence diagram (Mermaid)
  tasks:
    - Each task under 4 hours
```

### 執行

```
You: /opsx:propose add-two-factor-auth
AI:  ✓ proposal.md ✓ specs/auth/spec.md ✓ design.md ✓ tasks.md

You: /opsx:apply
AI:  Working on 1.1... ✓ 1.1 Complete ...

You: /opsx:archive
AI:  ✓ Synced specs ✓ Moved to archive/
```
