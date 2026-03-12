# 支援的 AI 工具

OpenSpec 支援 25+ 工具，`openspec init` 時選擇。

## 主要工具

| 工具 | Skills 路徑 | Commands 路徑 |
|------|-------------|---------------|
| Claude Code | `.claude/skills/openspec-*/SKILL.md` | `.claude/commands/opsx/<id>.md` |
| Cursor | `.cursor/skills/openspec-*/SKILL.md` | `.cursor/commands/opsx-<id>.md` |
| Windsurf | `.windsurf/skills/openspec-*/SKILL.md` | `.windsurf/workflows/opsx-<id>.md` |
| GitHub Copilot | `.github/skills/openspec-*/SKILL.md` | `.github/prompts/opsx-<id>.prompt.md` |
| Cline | `.cline/skills/openspec-*/SKILL.md` | `.clinerules/workflows/opsx-<id>.md` |
| Kiro | `.kiro/skills/openspec-*/SKILL.md` | `.kiro/prompts/opsx-<id>.prompt.md` |
| Codex | `.codex/skills/openspec-*/SKILL.md` | `$CODEX_HOME/prompts/opsx-<id>.md` |
| RooCode | `.roo/skills/openspec-*/SKILL.md` | `.roo/commands/opsx-<id>.md` |
| Gemini CLI | `.gemini/skills/openspec-*/SKILL.md` | `.gemini/commands/opsx/<id>.toml` |

## 其他支援工具

Amazon Q、Antigravity、Auggie、CodeBuddy、Continue、CoStrict、Crush、Factory、iFlow、Kilo Code、OpenCode、Pi、Qoder、Qwen、Trae

## 完整工具 ID 列表

```
amazon-q, antigravity, auggie, claude, cline, codex, codebuddy,
continue, costrict, crush, cursor, factory, gemini, github-copilot,
iflow, kilocode, kiro, opencode, pi, qoder, qwen, roocode, trae, windsurf
```

## 初始化時指定

```bash
# 指定特定工具
openspec init --tools claude,cursor

# 所有工具
openspec init --tools all
```
