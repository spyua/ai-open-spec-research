import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'OpenSpec',
  description: 'AI 原生的 Spec 驅動開發框架',
  lang: 'zh-TW',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '快速開始', link: '/guide/introduction' },
      { text: '核心概念', link: '/concepts/architecture' },
      { text: '工作流', link: '/workflows/fast-track' },
      { text: '客製化', link: '/customization/config' },
      {
        text: '參考',
        items: [
          { text: 'Slash Commands', link: '/reference/slash-commands' },
          { text: 'CLI 指令', link: '/reference/cli' },
          { text: '完整技術參考', link: '/reference/complete-guide' },
        ],
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '🚀 快速開始',
          items: [
            { text: '簡介與核心概念', link: '/guide/introduction' },
            { text: '安裝與初始化', link: '/guide/installation' },
            { text: '名詞對照表', link: '/guide/glossary' },
          ],
        },
      ],
      '/concepts/': [
        {
          text: '📖 核心概念',
          items: [
            { text: '系統架構', link: '/concepts/architecture' },
            { text: 'DAG 依賴圖', link: '/concepts/dag' },
            { text: 'Artifacts 詳解', link: '/concepts/artifacts' },
            { text: 'Delta Specs', link: '/concepts/delta-specs' },
            { text: 'Prompt 組裝機制', link: '/concepts/prompt-assembly' },
          ],
        },
      ],
      '/workflows/': [
        {
          text: '🔧 日常工作流',
          items: [
            { text: '新功能（快速）', link: '/workflows/fast-track' },
            { text: '新功能（逐步）', link: '/workflows/step-by-step' },
            { text: 'Bug 修復', link: '/workflows/bug-fix' },
            { text: '探索性調查', link: '/workflows/exploration' },
            { text: '平行開發', link: '/workflows/parallel' },
            { text: '批量歸檔與升級', link: '/workflows/bulk-ops' },
          ],
        },
      ],
      '/customization/': [
        {
          text: '⚙️ 客製化',
          items: [
            { text: 'Project Config', link: '/customization/config' },
            { text: 'Schema 系統', link: '/customization/schemas' },
            { text: 'Custom Schema 教學', link: '/customization/custom-schema' },
            { text: 'Template 撰寫', link: '/customization/templates' },
            { text: '範例 Schemas', link: '/customization/examples' },
            { text: '多語言支援', link: '/customization/i18n' },
          ],
        },
      ],
      '/advanced/': [
        {
          text: '🔌 進階主題',
          items: [
            { text: 'Pipeline 串接', link: '/advanced/pipeline' },
            { text: 'Plugin 整合', link: '/advanced/plugin-integration' },
            { text: 'Profile 系統', link: '/advanced/profiles' },
            { text: 'CI/CD 整合', link: '/advanced/cicd' },
          ],
        },
      ],
      '/reference/': [
        {
          text: '📋 參考手冊',
          items: [
            { text: 'Slash Commands', link: '/reference/slash-commands' },
            { text: 'CLI 指令', link: '/reference/cli' },
            { text: '支援的 AI 工具', link: '/reference/ai-tools' },
            { text: 'Troubleshooting', link: '/reference/troubleshooting' },
            { text: '完整技術參考', link: '/reference/complete-guide' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Fission-AI/OpenSpec' },
    ],
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 3],
      label: '目錄',
    },
    footer: {
      message: 'OpenSpec — AI 原生的 Spec 驅動開發框架',
      copyright: 'MIT License © Fission AI',
    },
    docFooter: {
      prev: '上一頁',
      next: '下一頁',
    },
  },
})
