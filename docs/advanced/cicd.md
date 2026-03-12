# CI/CD 整合

## GitHub Actions 範例

```yaml
# .github/workflows/openspec-validate.yml
name: OpenSpec Validation

on:
  pull_request:
    paths:
      - 'openspec/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install OpenSpec
        run: npm install -g @fission-ai/openspec@latest

      - name: Validate all specs and changes
        run: openspec validate --all --strict --json
```

## 驗證指令

```bash
# 驗證所有 changes 和 specs
openspec validate --all --strict --json

# 只驗證 changes
openspec validate --changes --json

# 只驗證 specs
openspec validate --specs --json

# 驗證 custom schemas
openspec schema validate --json
```
