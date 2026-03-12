# System Design：{{change-name}}

<!--
此 artifact 由 /generate-sd skill 產出。
執行時將前面三個 artifacts 作為輸入，減少重複工作：
- requirements.md → Phase 1（輸入解析）
- codebase-scan.md → Phase 2（程式碼掃描）
- design-decisions.md → Phase 3（互動確認）
-->

## 執行指引

請執行以下指令產出完整 SD 文件：

```
/generate-sd <PRD文件路徑> <程式碼庫根路徑>
```

執行時參考：
1. **Phase 1**：需求已解析於 `requirements.md`，直接引用
2. **Phase 2**：程式碼已掃描於 `codebase-scan.md`，直接引用
3. **Phase 3**：設計決策已記錄於 `design-decisions.md`，作為預設方案
4. **Phase 4-6**：正常執行生成、驗證、輸出

## SD 文件預期內容

產出的 SD 文件須包含以下章節：

1. 文件資訊（版本、日期、相關 PRD）
2. 後端架構設計（Component Architecture Diagram）
3. 資料庫設計（ERD + 資料表規格 + Migration Script）
4. API 設計（Endpoint 總覽 + 詳細規格，Response 使用 ReturnMsg<T>）
5. Class 設計（Entity Class Diagram + Service Class Diagram）
6. Sequence Diagram（每個 API 的主要流程，使用 autonumber）
7. 測試規格（測試案例表，ID 格式 T-NNN）
8. 附錄：需求追溯矩陣（PRD 需求 ID → SD 章節，100% 覆蓋率）
