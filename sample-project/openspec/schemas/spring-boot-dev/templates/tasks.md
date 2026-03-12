# 實作任務

## 0. 前置準備
- [ ] 0.1 🤖 [自動] 確認 coding standards 已部署（若無，執行 `/scaffold-rules`）
- [ ] 0.2 🤖 [自動] 確認 static analysis 已部署（若無，執行 `/scaffold-static-analysis`）

## 1. Database Migration
- [ ] 1.1 ✋ [手動] 建立 Flyway migration script
- [ ] 1.2 ✋ [手動] 本地測試 migration
- [ ] 1.3 ✋ [手動] 準備 rollback migration script

## 2. 程式碼骨架生成
<!-- 根據 design.md「可自動化元件」章節決定使用哪些 skills -->
- [ ] 2.1 🤖 [自動] 執行 `/scaffold-jpa <entity-name>` 生成 Entity/Repo/Service/Controller/DTO/Mapper
- [ ] 2.2 🤖 [自動] 執行 `/gen-api-task` 從 OpenAPI spec 生成 API Interface + DTO（若適用）

## 3. 商業邏輯實作
- [ ] 3.1 ✋ [手動] 實作 Service 商業邏輯
- [ ] 3.2 ✋ [手動] 實作 Domain methods（Entity 內）
- [ ] 3.3 ✋ [手動] 設定 Transaction 管理

## 4. API Layer 調整
- [ ] 4.1 ✋ [手動] 調整 Controller（若骨架不符需求）
- [ ] 4.2 ✋ [手動] 調整 DTO validation（Jakarta Validation）
- [ ] 4.3 ✋ [手動] 補充 Swagger annotations

## 5. 測試
- [ ] 5.1 ✋ [手動] Service 單元測試
- [ ] 5.2 ✋ [手動] Domain logic 單元測試
- [ ] 5.3 ✋ [手動] 整合測試（Testcontainers）
- [ ] 5.4 ✋ [手動] API 測試（MockMvc）

## 6. 品質檢查
- [ ] 6.1 🤖 [自動] 執行 `/refactor` 進行程式碼品質檢查
- [ ] 6.2 ✋ [手動] 修復 Checkstyle / PMD violations（若有）

## 7. 文件更新
- [ ] 7.1 ✋ [手動] 更新 OpenAPI spec
- [ ] 7.2 ✋ [手動] 更新 README（若需要）
