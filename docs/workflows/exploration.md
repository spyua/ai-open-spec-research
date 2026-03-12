# 探索性調查

> 適用：需求不明確、需要先調查再決定做什麼。

## Step 1: 開始探索

```
/opsx:explore
```

AI 會問你想探索什麼。

## Step 2: 描述問題

```
我想改善 API 的 response time，但不確定瓶頸在哪。
```

AI 會分析 codebase、列出可能的方向。

## Step 3: 深入討論

跟 AI 來回討論，直到確定方向。

## Step 4: 轉入正式流程

確定方向後：

```
/opsx:propose optimize-product-query
```

接下來按照[新功能（快速路徑）](/workflows/fast-track) Step 2 繼續。

::: info explore 不會建立任何 artifact
它純粹是探索和討論，不產出文件。適合在不確定要做什麼的時候先釐清方向。
:::
