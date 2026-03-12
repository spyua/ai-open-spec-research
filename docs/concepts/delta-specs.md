# Delta Specs

Delta Specs 是 OpenSpec 支援 Brownfield 開發的核心機制。變更提案中的規格檔案不是完整規格，而是描述**與現有規格的差異**。

## 四種操作語義

| 操作 | 語法 | 說明 |
|------|------|------|
| **ADDED** | `## ADDED Requirements` | 新增需求，Archive 時插入至目標規格 |
| **MODIFIED** | `## MODIFIED Requirements` | 修改既有需求，必須包含完整替換內容 |
| **REMOVED** | `## REMOVED Requirements` | 移除需求，必須包含 `Reason` 與 `Migration` |
| **RENAMED** | `## RENAMED Requirements` | 重新命名，使用 `FROM:` / `TO:` 格式 |

## Delta Spec 範例

```markdown
## ADDED Requirements

### Requirement: User can enable 2FA
The system SHALL allow users to enable two-factor authentication.

#### Scenario: Enable 2FA
- WHEN user navigates to security settings
- THEN system displays 2FA setup wizard

## MODIFIED Requirements

### Requirement: User login
The system SHALL require 2FA verification after password authentication
when 2FA is enabled on the account.

#### Scenario: Login with 2FA
- WHEN user enters correct password AND 2FA is enabled
- THEN system prompts for 2FA code

## REMOVED Requirements

### Requirement: Security question verification
**Reason**: Replaced by 2FA
**Migration**: Users will be prompted to set up 2FA on next login
```

## Archive 時的合併規則

合併按固定順序執行，確保操作一致性：

```
1. RENAMED  → 在需求映射中重新命名 key
       ▼
2. REMOVED  → 從映射中刪除
       ▼
3. MODIFIED → 以新內容完整替換
       ▼
4. ADDED    → 插入映射（若已存在則報錯）
       ▼
   重組輸出：保持原始順序，新增項附加在尾端
```

## 為什麼用 Delta 而非整份 Spec

| 優勢 | 說明 |
|------|------|
| **增量描述** | 只需描述「什麼變了」，不需重寫整份規格 |
| **衝突可見** | MODIFIED 和 REMOVED 明確標示受影響的需求 |
| **可審查** | Delta 格式讓 reviewer 一眼看出變更範圍 |
| **可逆** | Archive 前隨時可調整 Delta 內容 |

::: tip 兩個 change 可以改同一個 spec
因為 Delta 只描述差異，不同 change 可以修改同一份 spec 的不同 requirement，不會互相衝突。
:::
