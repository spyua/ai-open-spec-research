# Artifacts 詳解

Artifacts 就是「可插拔的骨架零件」— schema 定義要哪些零件、什麼順序組裝。

## Artifact 流程

```
proposal ──────► specs ──────► design ──────► tasks ──────► implement
    │               │             │              │
   why            what           how          steps
 + scope        changes       approach      to take
```

## 各 Artifact 詳解

### Proposal (`proposal.md`) — 為什麼 + 做什麼

```markdown
# Proposal: Add Dark Mode

## Intent
Users have requested a dark mode option to reduce eye strain.

## Scope
In scope:
- Theme toggle in settings
- System preference detection

Out of scope:
- Custom color themes (future work)

## Approach
Use CSS custom properties + React context.
```

**何時更新：** scope 變了、intent 更清楚了、approach 根本性改變

### Specs (`specs/**/*.md`) — Delta 差異規格

描述「什麼在變」，不是整份 spec 重寫。詳見 [Delta Specs](/concepts/delta-specs)。

### Design (`design.md`) — 怎麼做

```markdown
# Design: Add Dark Mode

## Architecture Decisions

### Decision: Context over Redux
Using React Context because:
- Simple binary state
- No complex transitions
- Avoids Redux dependency

## Data Flow
ThemeProvider (context) → ThemeToggle ↔ localStorage → CSS Variables (:root)

## File Changes
- src/contexts/ThemeContext.tsx (new)
- src/components/ThemeToggle.tsx (new)
- src/styles/globals.css (modified)
```

**何時更新：** 實作發現行不通、找到更好的方案、dependency 變了

### Tasks (`tasks.md`) — 實作清單

```markdown
# Tasks

## 1. Theme Infrastructure
- [ ] 1.1 Create ThemeContext with light/dark state
- [ ] 1.2 Add CSS custom properties for colors
- [ ] 1.3 Implement localStorage persistence

## 2. UI Components
- [ ] 2.1 Create ThemeToggle component
- [ ] 2.2 Add toggle to settings page
```

**最佳實踐：**
- 分群組、用階層編號（1.1, 1.2）
- 每個 task 可在一次 session 內完成
- 完成就打勾 `[x]`

## Spec 的格式規範

```markdown
# Auth Specification

## Purpose
Authentication and session management.

## Requirements

### Requirement: User Authentication
The system SHALL issue a JWT token upon successful login.

#### Scenario: Valid credentials
- GIVEN a user with valid credentials
- WHEN the user submits login form
- THEN a JWT token is returned
- AND the user is redirected to dashboard

#### Scenario: Invalid credentials
- GIVEN invalid credentials
- WHEN the user submits login form
- THEN an error message is displayed
```

::: info RFC 2119 關鍵字
- **MUST / SHALL** — 絕對要求
- **SHOULD** — 建議，有例外
- **MAY** — 選用

Spec 是行為契約，不是實作計畫：寫可觀察的行為、input/output、error condition，不寫 class name、library 選擇。
:::
