# AI Prompt 組裝機制

當使用者執行 `openspec instructions <artifact>` 時，系統將五層資訊組裝成結構化的 XML Prompt。

## 五層組裝

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: project_context                                    │
│ 來源：config.yaml → context                                 │
│ 作用：提供專案背景，讓 AI 理解技術棧與架構                  │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: rules                                              │
│ 來源：config.yaml → rules[artifactId]                       │
│ 作用：per-artifact 的約束條件（如品質標準、格式）            │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: dependencies                                       │
│ 來源：schema.yaml → artifact.requires                       │
│ 作用：列出依賴 artifact 的檔案路徑與完成狀態                │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: template                                           │
│ 來源：schemas/<name>/templates/<template>                   │
│ 作用：定義輸出檔案的結構骨架                                │
├─────────────────────────────────────────────────────────────┤
│ Layer 5: instruction                                        │
│ 來源：schema.yaml → artifact.instruction                    │
│ 作用：AI 產出的具體指引與注意事項                           │
└─────────────────────────────────────────────────────────────┘
```

## 組裝後的 Prompt 結構

```xml
<artifact id="proposal" change="add-2fa" schema="spec-driven">

<task>
Create the proposal artifact for change "add-2fa".
Initial proposal document outlining the change
</task>

<project_context>
<!-- 來自 config.yaml 的 context -->
這是一個使用 TypeScript 的專案...
</project_context>

<rules>
<!-- 來自 config.yaml 的 rules[proposal] -->
- 必須包含 rollback 章節
</rules>

<dependencies>
<!-- 來自 schema 的 requires + 檔案系統狀態 -->
Read these files for context before creating this artifact:
<dependency id="proposal" status="done">
  <path>openspec/changes/add-2fa/proposal.md</path>
</dependency>
</dependencies>

<output>
Write to: openspec/changes/add-2fa/proposal.md
</output>

<instruction>
<!-- 來自 schema.yaml 的 artifact.instruction -->
Create the proposal document that establishes WHY this change is needed...
</instruction>

<template>
<!-- 來自 templates/proposal.md 的模板內容 -->
# Proposal: {{change-name}}
...
</template>

<unlocks>
Completing this artifact enables: specs, design
</unlocks>

</artifact>
```

## 查看 AI 收到的完整 Prompt

```bash
# 查看特定 artifact 的完整指示
openspec instructions proposal --change add-dark-mode

# JSON 格式
openspec instructions design --change add-dark-mode --json
```
