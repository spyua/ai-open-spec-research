# 新功能（逐步控制）

> 適用：需求複雜、需要逐步審核。需要 Custom Profile。

## 前置條件

```bash
# 確認已啟用 custom workflow
openspec config list
# 如果沒有：
openspec config profile
# → 選擇包含 new, continue, ff 的 workflows
openspec update
```

## 流程概覽

```
/opsx:new ──► /opsx:continue (×4, 逐步審核) ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

## Step 1: 建立 Change Scaffold

```
/opsx:new add-user-2fa
```

只建立空的 change 資料夾和 metadata，不生成 artifacts。

## Step 2: 建立 Proposal

```
/opsx:continue
```

AI 建立 `proposal.md`。

**審核：** 閱讀 proposal，確認 intent 和 scope。如果不對，告訴 AI 修改。

## Step 3: 建立 Specs

```
/opsx:continue
```

AI 建立 delta specs。

**審核：** 確認 scenarios 覆蓋完整、API contract 正確。

## Step 4: 建立 Design

```
/opsx:continue
```

AI 建立 `design.md`。

**審核：** 確認技術方案、DB migration、sequence diagram。

## Step 5: 建立 Tasks

```
/opsx:continue
```

AI 建立 `tasks.md`。

**審核：** 確認 task 粒度和順序。

## Step 6: 實作

```
/opsx:apply
```

## Step 7: 驗證

```
/opsx:verify
```

檢查三個維度：

| 維度 | 檢查內容 |
|------|----------|
| Completeness | 所有 task 完成、所有 requirement 有對應 code |
| Correctness | 實作符合 spec intent、edge case 有處理 |
| Coherence | design 決策反映在 code 中、命名一致 |

## Step 8: 歸檔

```
/opsx:archive
```

::: tip 也可以用 /opsx:ff 跳過逐步流程
如果到一半覺得不需要逐步審核，可以用 `/opsx:ff` 一次建立所有剩餘的 planning artifacts。
:::
