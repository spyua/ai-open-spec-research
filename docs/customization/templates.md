# Template 撰寫教學

Templates 是 markdown 文件，引導 AI 生成 artifact 的結構。

## 基本原則

- 用 section headers 定義 AI 需要填寫的區塊
- 用 HTML comments 給 AI 指引（不會出現在最終輸出）
- 可以包含範例格式

## Proposal Template

```markdown
# Proposal: {{change-name}}

## Intent

<!-- 為什麼要做這個變更？解決什麼業務問題？ -->

## Scope

### In Scope
-

### Out of Scope
-

## Approach

<!-- 高層次的實作方向，不需要太細節 -->

## Impact Analysis

### Affected Services
### API Changes
### Database Changes

## Rollback Plan

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
```

## Spec Template

```markdown
# Delta for {{domain}}

## ADDED Requirements

### Requirement: {{requirement-name}}

<!-- 用一句話描述這個需求 -->

#### API Contract

\`\`\`
METHOD /api/v1/resource
\`\`\`

#### Scenario: Happy path
- GIVEN
- WHEN
- THEN

#### Scenario: Error case
- GIVEN
- WHEN
- THEN the system returns an appropriate error response

## MODIFIED Requirements

## REMOVED Requirements
```

## Design Template

```markdown
# Design: {{change-name}}

## Architecture Overview

## Detailed Design

### Database Schema

\`\`\`sql
-- V{version}__{description}.sql
\`\`\`

### Domain Model

### Service Layer

### API Layer

## Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant Repository
    participant DB
\`\`\`

## Performance Considerations

## Dependencies

| Dependency | Version | Purpose |
|-----------|---------|---------|
```

## Tasks Template

```markdown
# Tasks

## 1. Database Migration
- [ ] 1.1 Create Flyway migration script
- [ ] 1.2 Test migration on local DB

## 2. Domain Layer
- [ ] 2.1 Create/update Entity classes
- [ ] 2.2 Create/update Value Objects

## 3. Service Layer
- [ ] 3.1 Create/update Service classes
- [ ] 3.2 Implement business logic

## 4. API Layer
- [ ] 4.1 Create/update DTOs
- [ ] 4.2 Create/update Controller

## 5. Testing
- [ ] 5.1 Unit tests for Service layer
- [ ] 5.2 Integration tests with Testcontainers

## 6. Documentation
- [ ] 6.1 Update OpenAPI spec
```
