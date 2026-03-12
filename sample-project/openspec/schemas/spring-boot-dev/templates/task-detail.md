# TASKFILE: {{task-name}}

> **Task ID**: {{task-id}}
> **Generated from**: design.md
> **Version**: v1.0
> **Created**: {{date}}
> **Status**: pending

---

## 1. Background

### 1.1 功能概述
<!-- 此 task 要實作什麼，涉及哪些元件 -->

### 1.2 關聯文件
| 類型 | 文件路徑 | 章節 |
|------|---------|------|
| Design | `design.md` | <!-- 對應的 design.md 章節 --> |
| Spec | `specs/xxx.md` | <!-- 對應的 spec 章節 --> |

### 1.3 依賴關係
- **前置任務**: <!-- 例如 TASK-XXX-001 -->
- **被依賴任務**: <!-- 例如 TASK-XXX-002 -->

---

## 2. Solution

### 2.1 目標產出物
```json
{
  "files": [
    {
      "path": "src/main/java/com/.../Xxx.java",
      "type": "entity|repository|service|controller|dto|mapper",
      "operation": "create|modify",
      "note": ""
    }
  ]
}
```

### 2.2 實作規格

#### 類別設計 (來源: Design 5.x)
<!-- 從 design.md 提取的欄位定義、方法簽名 -->

```
ClassName
├── field1: Type
├── field2: Type
└── method()
```

#### 資料庫對應 (來源: Design 3.x)
<!-- 僅 Entity 層需要，其他層可移除此區塊 -->

| Entity 欄位 | DB 欄位 | 型別 | 約束 |
|------------|--------|------|------|
|            |        |      |      |

---

## 3. Reference Code

### 3.1 專案結構參照
```
src/main/java/com/...
└── package/
    ├── Existing.java    # 現有，可參照
    └── NewFile.java     # 新增
```

### 3.2 模式參照

#### 模式名稱
**參照檔案**: `path/to/reference.java`
```java
// 從現有程式碼提取的 annotation 慣例、命名慣例
```
**說明**: <!-- 為什麼要遵循此模式 -->

---

## 4. Acceptance Criteria

### 4.1 測試案例
<!-- 列出需要的測試，或標註「純 POJO 無需單元測試」 -->

### 4.2 驗收檢查清單

#### 程式碼規範
- [ ] <!-- 例如：所有 Entity 使用 @Data, @Builder -->
- [ ] <!-- 例如：遵循專案命名慣例 -->

#### 功能驗證
- [ ] <!-- 例如：新增欄位對應正確 -->
- [ ] <!-- 例如：商業邏輯符合 spec scenario -->

#### 編譯驗證
- [ ] `mvn compile` 通過
- [ ] 無 IDE 警告

---

## 5. Metadata

```json
{
  "taskId": "{{task-id}}",
  "module": "{{module}}",
  "priority": "P0",
  "tags": [],
  "status": "pending"
}
```
