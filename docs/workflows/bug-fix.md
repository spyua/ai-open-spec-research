# Bug 修復

> Bug 修復通常 scope 小、需要快速處理。

## 流程概覽

```
/opsx:propose ──► 快速審核 ──► /opsx:apply ──► /opsx:archive ──► git commit
```

## Step 1: 提案

```
/opsx:propose fix-login-redirect-loop
```

提供 bug 的具體描述，AI 會自動生成較精簡的 artifacts。

## Step 2: 快速審核

Bug fix 的 artifacts 通常較簡短，快速確認：
- [ ] proposal 準確描述了 bug 和修復方向
- [ ] specs 包含了 bug 的 regression scenario
- [ ] tasks 合理

## Step 3: 實作

```
/opsx:apply
```

## Step 4: 歸檔

```
/opsx:archive
```

## Step 5: Commit

```bash
git add .
git commit -m "fix: resolve login redirect loop"
```
