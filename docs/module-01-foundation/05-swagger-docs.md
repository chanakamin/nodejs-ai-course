# 1.5 תיעוד וסנכרון Swagger אוטומטי בעזרת Zod ו-AI

## נושאי תת-היחידה
* מימוש "החוזה" של השרת בצורה חיה ואינטראקטיבית (`/api-docs`)
* סכמות ה-Zod כ"מקור אמת יחיד" (Single Source of Truth) של השרת
* עבודה נכונה עם AI לסנכרון תיעוד ה-OpenAPI בכל שינוי בקוד

---

## למה צריך תיעוד API חי?
בשיעור 2 למדנו שה-API של השרת הוא **"חוזה"** בין צד השרת לצד הלקוח (למשל, אפליקציית ה-React שתתחבר לשרת שלנו).
עד כה, כדי לדעת אילו קריאות קיימות בשרת, אילו שדות חובה לשלוח ב-`POST`, מה הערכים המותרים של `priority`, ואילו סטטוסים חוזרים בשגיאה — מתכנתת צד הלקוח הייתה צריכה לנחש או לנבור בקבצי השרת.

בעולם התעשייה משתמשים בתקן אחיד לתיעוד שרתים שנקרא **OpenAPI** (המוכר בשם **Swagger**).
בעזרת ספריית `swagger-ui-express`, השרת שלנו יחשוף כתובת מיוחדת:
`http://localhost:3000/api-docs`

כשפותחים כתובת זו בדפדפן, מקבלים פורטל אינטראקטיבי שמרכז את כל ה-routes של השרת, מציג את מבנה ה-JSON המדויק של כל בקשה ותשובה, ומאפשר ללחוץ על **"Try it out"** ולשלוח קריאות בדיקה חיות לשרת ישירות מהדפדפן!

::: tip בקשי מה-AI שיסביר לך עוד על Swagger ו-OpenAPI
**פרומפט לדוגמא:**
```text
Explain what OpenAPI and Swagger UI are to a beginner backend developer.
Why is having a live /api-docs page so valuable when a React developer needs to integrate with a Node.js API?
Keep the explanation simple without YAML code.
```
:::

---

## הבעיה הקלאסית בתיעוד: כשהתיעוד משקר!
אחת הבעיות המוכרות ביותר בפיתוח תוכנה נקראת **Documentation Drift** (סטייה בתיעוד):
מתכנתת מוסיפה שדה חדש או משנה כלל ולידציה ב-Zod (למשל משנה את אורך הכותרת המינימלי מ-3 ל-5 תווים, או מוסיפה שדה `urgent`), אבל שוכחת לעדכן את קובץ התיעוד של Swagger.
התוצאה: מתכנתת ה-React קוראת את ה-Swagger, שולחת בקשה לפי מה שכתוב שם — ומקבלת שגיאת `400` מפתיעה מהשרת!

---

## הפתרון שלנו: סנכרון Swagger מתוך Zod ו-Routes בעזרת AI
שימי לב איזה יתרון עצום הרווחנו מכך שהגדרנו סכמות **Zod** מסודרות בתת-יחידה הקודמת:
כל הדרישות המדויקות של השרת שלנו מרוכזות כעת במקום ברור אחד (`src/schemas/` ו-`src/routes/`)!

כדי שתיעוד ה-Swagger שלנו (`src/docs/openapi.json`) יהיה **תמיד מסונכרן ב-100%** עם הקוד האמיתי:
1. אנו **לעולם לא ממציאים** את קובץ `openapi.json` ידנית או מתוך הזיכרון.
2. אנו מנחים את ה-AI לסרוק את תיקיות `src/routes/`, `src/schemas/` ו-`src/middlewares/errorHandler.js` ולייצר מתוכן את קובץ `src/docs/openapi.json` (כולל כל חוקי המינימום/מקסימום, ערכי ה-`enum`, ודוגמאות לתשובות שגיאה `400` ו-`404`!).
3. **כלל ברזל ב-`CLAUDE.md`:** נוסיף לקובץ ההנחיות של הפרויקט חוק קבוע עבור ה-AI:
   > *"בכל פעם שמשתנה route או סכמת Zod בפרויקט, חובה לעדכן מיד בהתאמה את הקובץ `src/docs/openapi.json` כדי לשמור על סנכרון מלא."*

*(הערת העשרה: בפרויקטים גדולים קיימות גם ספריות כמו `zod-to-openapi` שמייצרות את ה-JSON מתוך קוד ה-Zod בזמן ריצה; בשלב זה, ייצור וסנכרון מבוקר של `openapi.json` בעזרת ה-AI מתוך סכמות ה-Zod שומר על קוד נקי ופשוט להבנה תוך דיוק מלא!)*

::: tip בקשי מה-AI להראות לך חיבור `swagger-ui-express` וסנכרון מול Zod
**פרומפט לדוגמא:**
```text
1. Show the minimal code needed in an Express ES Modules (import/export) project to serve src/docs/openapi.json at /api-docs using swagger-ui-express.
2. Explain how you (as an AI assistant) can inspect my src/routes/ and src/schemas/ (Zod schemas) to keep openapi.json 100% synchronized with my validation rules and error responses.
```
:::
