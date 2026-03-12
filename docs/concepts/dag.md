# DAG 依賴圖

OpenSpec 將工作流建模為**有向無環圖（DAG）**。每個 Artifact 透過 `requires` 宣告依賴，系統自動推導建置順序。

## 內建 `spec-driven` 依賴圖

```
                 ┌──────────┐
                 │ proposal │
                 └────┬─────┘
                      │
            ┌─────────┼──────────┐
            ▼                    ▼
      ┌──────────┐        ┌──────────┐
      │  specs   │        │  design  │
      └────┬─────┘        └────┬─────┘
           │                   │
           └─────────┬─────────┘
                     ▼
               ┌──────────┐
               │  tasks   │
               └────┬─────┘
                    │
                    ▼
              ┌───────────┐
              │   apply   │  （實作階段）
              └───────────┘
```

::: tip Dependencies 是 enablers，不是 gates
它們表示「什麼可以做」，不是「什麼必須做」。你可以跳過 design 如果不需要。specs 和 design 可以平行建立（都只依賴 proposal）。
:::

## DAG 運作機制

系統使用 **Kahn's 演算法**進行拓撲排序，提供三個核心查詢：

| 方法 | 功能 |
|------|------|
| `getNextArtifacts(completed)` | 返回所有依賴已滿足、可以開始的 Artifact |
| `getBlocked(completed)` | 返回尚在等待依賴的 Artifact 及其未完成的依賴 |
| `getBuildOrder()` | 返回完整的拓撲排序建置順序 |

**完成偵測**透過檔案系統：如果 `generates` 指定的檔案存在（支援 glob 匹配），該 Artifact 即為「已完成」。

## 自訂 Schema 範例

```yaml
# schemas/spring-boot-analysis/schema.yaml
name: spring-boot-analysis
artifacts:
  - id: analysis
    generates: analysis.md
    requires: []

  - id: specs
    generates: "specs/**/*.md"
    requires: [analysis]

  - id: design
    generates: design.md
    requires: [analysis]

  - id: tasks
    generates: tasks.md
    requires: [specs, design]
```

## Apply 與進度追蹤

Schema 的 `apply.tracks` 指向一個 Markdown 檔案（通常是 `tasks.md`），系統解析 checkbox 追蹤進度：

```markdown
## 1. Setup
- [x] 1.1 Create new module structure        ← 已完成
- [x] 1.2 Add dependencies to package.json   ← 已完成

## 2. Core Implementation
- [ ] 2.1 Implement 2FA verification logic    ← 待完成
- [ ] 2.2 Add TOTP library integration        ← 待完成
```

### Apply 狀態機

```
                    ┌─────────────────────┐
                    │ 檢查 apply.requires │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                                 ▼
     requires 未滿足                    requires 已滿足
     ┌──────────┐                              │
     │ blocked  │               ┌──────────────┼──────────────┐
     └──────────┘               ▼                             ▼
                        tracks 檔案存在              tracks 未設定
                               │                    ┌─────────┐
                    ┌──────────┼──────────┐         │  ready  │
                    ▼                     ▼         └─────────┘
              有未完成任務          全部完成
              ┌─────────┐     ┌──────────┐
              │  ready  │     │ all_done │
              └─────────┘     └──────────┘
```
