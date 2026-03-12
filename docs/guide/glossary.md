# 名詞對照表

| 英文 | 中文 | 說明 |
|------|------|------|
| Artifact | 骨架零件 / 產出物 | change 中的文件（proposal、design、tasks、specs） |
| Schema | 骨架定義 | 定義 artifacts 類型和依賴關係的 workflow 配置 |
| Change | 變更提案 | 對系統的一次修改，打包為資料夾 |
| Delta Spec | 差異規格 | 描述 ADDED/MODIFIED/REMOVED 的規格變更 |
| Spec | 規格 | 描述系統行為的文件，含 requirements 和 scenarios |
| Archive | 歸檔 | 完成 change 並 merge delta specs 到 main specs |
| Domain | 領域 | specs 的邏輯分群（如 auth/、payments/） |
| Requirement | 需求 | 系統必須具備的特定行為 |
| Scenario | 情境 | 需求的具體範例，通常用 Given/When/Then |
| Source of Truth | 真相之源 | `openspec/specs/` 目錄，包含當前已確認的行為 |
| Profile | 配置檔 | 決定啟用哪些 workflow commands（core / custom） |
| Delivery | 交付方式 | skills only / commands only / both |
| DAG | 有向無環圖 | Artifact 的依賴關係圖，決定建置順序 |
| Apply | 實作 | AI 根據 tasks.md 逐項實作的階段 |
