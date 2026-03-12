# Pipeline 串接

在大型專案中，可以定義多個 Schema 並在不同階段使用，形成 Pipeline 串接。

## 範例：Spring Boot 分析 → 開發

```
┌──────────────────────────────────────────────────────────────┐
│                Pipeline 1: spring-boot-analysis               │
│                                                               │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐    ┌───────┐│
│  │ analysis │────▶│  specs   │────▶│  design  │───▶│ tasks ││
│  └──────────┘     └──────────┘     └──────────┘    └───┬───┘│
│                                                        │     │
│  目的：分析現有系統，產出理解文件與改善規格              │     │
└────────────────────────────────────────────────────────┼─────┘
                                                        │
                         產出的 specs 成為下一條 Pipeline 的輸入
                                                        │
┌────────────────────────────────────────────────────────▼─────┐
│                Pipeline 2: spring-boot-dev                    │
│                                                               │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐              │
│  │ proposal │────▶│  design  │────▶│  tasks   │              │
│  └──────────┘     └──────────┘     └──────────┘              │
│                                                               │
│  目的：基於分析結果，規劃並實作具體變更                        │
└───────────────────────────────────────────────────────────────┘
```

## 串接方式

1. 使用 `spring-boot-analysis` schema 建立第一個 Change，進行系統分析
2. Archive 後，分析產出的 specs 合併至 `specs/`（Source of Truth）
3. 使用 `spring-boot-dev` schema 建立第二個 Change，基於已有的 specs 進行開發
4. 第二條 Pipeline 的 proposal 可引用 `specs/` 中的分析結果

## 串接指令

```bash
# Phase 1: 分析（產出 SD）
openspec new change order-api --schema spring-boot-analysis
openspec propose order-api

# Phase 2: 開發（基於 SD 實作）
openspec new change order-api-impl --schema spring-boot-dev
openspec propose order-api-impl
openspec apply order-api-impl
```

::: tip 不同團隊角色可用不同 Schema
架構師用 `spring-boot-analysis` 做分析，開發者用 `spring-boot-dev` 做實作，透過 `specs/` 作為共享的 Source of Truth 保持一致性。
:::
