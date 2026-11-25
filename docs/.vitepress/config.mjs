import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'פיתוח צד שרת ב-Node.js',
  description: 'ארכיטקטורה, בסיסי נתונים ופיתוח מונחה AI',
  lang: 'he-IL',
  dir: 'rtl',
  base: '/nodejs-ai-course/',

  themeConfig: {
    search: { provider: 'local' },
    outlineTitle: 'בעמוד זה',
    docFooter: {
      prev: 'השיעור הקודם',
      next: 'השיעור הבא'
    },
    nav: [
      { text: 'דף הבית', link: '/' },
      { text: 'יחידה 1: תשתית מקצועית', link: '/module-01-foundation/01-kickoff-and-ai' }
    ],
    sidebar: [
      {
        text: 'יחידה 1: תשתית פרויקט מקצועית',
        collapsed: false,
        items: [
          { text: '1.1 הכרת הפרויקט וכללי AI', link: '/module-01-foundation/01-kickoff-and-ai' },
          { text: '1.2 ארכיטקטורה והפרדת שכבות', link: '/module-01-foundation/02-app-vs-server' },
          { text: '1.3 ניהול שגיאות מרכזי', link: '/module-01-foundation/03-global-errors' },
          { text: '1.4 תיעוד שרת עם Swagger', link: '/module-01-foundation/04-swagger-docs' },
          { text: 'משימה מסכמת ליחידה 1 🔨', link: '/module-01-foundation/05-assignment' }
        ]
      }
    ]
  }
})
