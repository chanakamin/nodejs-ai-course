# 1.4 תיעוד ובדיקת השרת עם Swagger (OpenAPI)

## נושאי תת-היחידה
* מימוש "החוזה" של השרת בצורה חיה ואינטראקטיבית
* מהו תקן OpenAPI ומהי ספריית `swagger-ui-express`?
* בדיקת השרת מתוך הדפדפן במקום ניחוש כתובות ושדות

---

## למה צריך תיעוד API חי?
בשיעור 2 למדנו שה-API של השרת הוא **"חוזה"** בין צד השרת לצד הלקוח (למשל, אפליקציית ה-React שתתחבר לשרת שלנו).
עד כה, כדי לדעת אילו קריאות קיימות בשרת, אילו שדות צריך לשלוח ב-`body` של `POST`, ואילו סטטוסים חוזרים — מתכנתת צד הלקוח הייתה צריכה לנחש או לפתוח את קוד השרת ולקרוא קובץ אחרי קובץ.

בעולם התעשייה משתמשים בתקן אחיד לתיעוד שרתים שנקרא **OpenAPI** (המוכר בשם **Swagger**).
בעזרת ספריית `swagger-ui-express`, השרת שלנו יחשוף כתובת מיוחדת:
`http://localhost:3000/api-docs`

כשפותחים כתובת זו בדפדפן, מקבלים אתר אינטראקטיבי שמרכז את כל ה-routes של השרת, מציג איזה JSON בדיוק צריך לשלוח בכל קריאה, ומאפשר אפילו ללחוץ על כפתור **"Try it out"** ולשלוח קריאות בדיקה לשרת ישירות מהדפדפן (בדיוק כמו ב-Postman)!

::: tip בקשי מה-AI שיסביר לך עוד על Swagger ו-OpenAPI
**פרומפט לדוגמא:**
```text
Explain what OpenAPI and Swagger UI are to a beginner backend developer.
Why is having a /api-docs page useful when a frontend developer (like a React developer) needs to connect to my Node.js API?
Keep the explanation simple without YAML code.
```
:::

---

## איך משלבים Swagger ב-Express בצורה פשוטה?
אפשר לכתוב תיעוד Swagger בדרכים שונות. הדרך הנקייה והברורה ביותר עבורנו בשלב זה היא שמירת קובץ הגדרות בפורמט JSON (למשל `src/docs/openapi.json`), וחיבורו ל-`app.js` בשתי שורות קוד בלבד בעזרת `swagger-ui-express`.

כאן ה-AI הופך לכלי עבודה אדיר:
במקום לכתוב ידנית מאות שורות של הגדרות JSON, אנו נבנה תחילה את ה-`routes` וה-`controllers` שלנו בצורה נקייה, ואז נבקש מ-Claude לקרוא את הקוד הקיים שלנו ולייצר עבורנו קובץ `openapi.json` מדויק שתואם ב-100% לקוד שכתבנו!

כל שינוי שנבצע בעתיד בקריאות ה-API של השרת — נעדכן מולו גם את קובץ התיעוד ונוודא בדפדפן בכתובת `/api-docs` שהתיעוד עובד ומדויק.

::: tip בקשי מה-AI להראות לך חיבור בסיסי של `swagger-ui-express`
**פרומפט לדוגמא:**
```text
Show the minimal code needed in an Express ES Modules (import/export) project to serve an openapi.json file at /api-docs using swagger-ui-express.
Explain every line.
```
:::
