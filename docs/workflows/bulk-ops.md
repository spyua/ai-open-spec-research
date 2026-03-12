# 批量歸檔與升級

## 批量歸檔

> 多個 changes 都已完成，一次歸檔。需要 Custom Profile。

### Step 1: 確認有哪些完成的 Changes

```bash
openspec list
```

### Step 2: 批量歸檔

```
/opsx:bulk-archive
```

AI 會：
1. 列出所有已完成的 changes
2. 檢查 spec 衝突
3. 按建立時間順序歸檔
4. 請你確認

### Step 3: Commit

```bash
git add .
git commit -m "chore: archive completed changes"
```

## 升級 OpenSpec

### Step 1: 升級 CLI

```bash
npm install -g @fission-ai/openspec@latest
```

### Step 2: 確認版本

```bash
openspec --version
```

### Step 3: 更新專案設定

```bash
cd your-project
openspec update
```

這會重新生成 AI 工具的 skills 和 commands。

### Step 4: Commit

```bash
git add .claude/ .cursor/ openspec/
git commit -m "chore: update OpenSpec to vX.X.X"
```

## 新人 Onboarding

```
/opsx:onboard
```

AI 會用你的真實 codebase 帶新人走一遍完整流程（約 15-30 分鐘）：
1. 掃描 codebase 找改善機會
2. 建立一個真實的 change
3. 生成 artifacts
4. 實作
5. 歸檔
