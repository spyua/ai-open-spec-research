# 平行開發

> 適用：同時進行多個功能、被 urgent bug 打斷時。

## 場景：正在做 Feature A，被 Bug B 打斷

### Step 1: 暫停 Feature A

Feature A 的 tasks.md 中已完成的 task 會保留 `[x]`，不需要特別操作。

### Step 2: 開始 Bug B

```
/opsx:propose fix-critical-login-bug
```

### Step 3: 完成 Bug B

```
/opsx:apply
/opsx:archive
```

### Step 4: 回到 Feature A

```
/opsx:apply add-dark-mode
```

AI 會從上次未完成的 task 繼續。

## 查看所有進行中的 Changes

```bash
openspec list
```

```
Active changes:
  add-dark-mode         UI theme switching support
  optimize-query        Database query optimization
```

## 判斷：更新 vs 開新 Change

```
是同一個工作嗎？
├── 同樣的 intent？同樣的問題？     → YES → UPDATE
├── > 50% 重疊？同樣 scope？       → YES → UPDATE
└── 原本的可以獨立「完成」嗎？       → YES → NEW CHANGE
```
