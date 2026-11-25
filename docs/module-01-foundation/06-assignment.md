# משימה מסכמת ליחידה 1: תשתית Smart Helpdesk, ולידציית Zod ו-Swagger 🔨

ביחידה זו נקים מאפס את הפרויקט החדש שילווה אותנו בהמשך הקורס, תוך יישום ארכיטקטורת שכבות מלאה, אימות קלט עם Zod, ניהול שגיאות מרכזי ותיעוד Swagger מסונכרן.

## דרישות הפרויקט הפונקציונליות
יש ליצור ריפוזיטורי **חדש** בגיטהאב בשם `smart-helpdesk-api` ולבנות שרת Node.js + Express (`"type": "module"` ב-`package.json`) המנהל שתי ישויות בזיכרון (מערכים התחלתיים בתוך שכבת ה-`repositories`):

1. **קטגוריות (`categories`)** — מאפיינים: `id`, `name`, `description`.
   * תמיכה בכל פעולות ה-CRUD (`GET /categories`, `GET /categories/:id`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`).
2. **פניות (`tickets`)** — מאפיינים: `id`, `title`, `description`, `categoryId`, `priority` (`low` / `medium` / `high`), `status` (`open` / `in_progress` / `resolved`), `createdAt`.
   * תמיכה בכל פעולות ה-CRUD (`GET /tickets`, `GET /tickets/:id`, `POST /tickets`, `PUT /tickets/:id`, `DELETE /tickets/:id`).

---

## דרישות ולידציה: הפרדה בין Zod לבין Service (חובה!)

### א. ולידציית מבנה בשער השרת (`src/schemas/` + `src/middlewares/validate.js`)
יש להתקין את ספריית `zod` וליצור סכמות נפרדות ליצירה (`POST`) ולעדכון (`PUT`) עבור שתי הישויות:
* **בקטגוריות (`categories.schema.js`):**
  * `name`: מחרוזת חובה, אורך מינימלי 2 תווים ומקסימלי 50 תווים.
  * `description`: מחרוזת אופציונלית עד 200 תווים.
* **בפניות (`tickets.schema.js`):**
  * ביצירה (`POST`): `title` (מחרוזת, לפחות 3 תווים), `description` (מחרוזת, לפחות 10 תווים), `categoryId` (מחרוזת לא ריקה), `priority` (`enum` מתוך `low` / `medium` / `high` עם ערך ברירת מחדל `medium`). ביצירת פנייה חדשה הסטטוס ההתחלתי ייקבע אוטומטית בשרת ל-`open`!
  * בעדכון (`PUT`): שדות אופציונליים כולל אפשרות לעדכן `status` (`open` / `in_progress` / `resolved`), תוך וידוא שנשלח לפחות שדה אחד לעדכון!
* אם נשלח קלט שאינו עומד בסכמה — ה-Middleware יחזיר שגיאת `400` מפורטת דרך ה-`errorHandler` **מבלי שהבקשה תיכנס ל-Controller**.

### ב. ולידציה עסקית בשכבת ה-Service (`src/services/`)
* ביצירת פנייה (`POST /tickets`) או בעדכון קטגוריה של פנייה: שכבת ה-`tickets.service` תבדוק מול `categories.repository` האם הקטגוריה (`categoryId`) באמת קיימת במערכת. אם לא — תיזרק `AppError` עם סטטוס `404` (או `400`) והודעה ברורה.
* ניסיון למחוק קטגוריה שעדיין משויכות אליה פניות קיימות — ייחסם ב-`categories.service` עם `AppError` מתאימה (סטטוס `400` או `409 Conflict`).

---

## דרישות ארכיטקטורה, שגיאות ו-Swagger
* קובץ **`CLAUDE.md`** בתיקייה הראשית המגדיר ל-AI את מבנה השכבות, חובת הולידציה ב-Zod, וחובת הסנכרון של `src/docs/openapi.json` בכל שינוי ב-routes או ב-schemas.
* הפרדה מלאה בין `src/app.js` לבין `src/server.js`, ושימוש ב-`.env` עבור `PORT` (וקובץ `.env.example` בגיט).
* **ללא `try / catch` בקונטרולרים!** כל השגיאות (גם שגיאות `AppError` וגם שגיאות ולידציה של `Zod`) יתפסו ב-**Global Error Middleware** (`errorHandler.js`) שמחזיר JSON אחיד וברור, כולל טיפול בניתוב לא קיים (404 כללי).
* **Swagger מסונכרן ופעיל (`/api-docs`):** קובץ `src/docs/openapi.json` ייווצר ויסונכרן על ידי ה-AI ישירות מתוך קבצי ה-`routes` וסכמות ה-`Zod` (כולל הצגת השדות, ערכי ה-`enum`, ותשובות שגיאה `400` ו-`404`).

---

## הוראות ביצוע ועבודה עם AI 📐
* כל שורת קוד שנכתבה על ידי ה-AI — **חובה להבין היטב!**
* **אין לבנות את הפרויקט בפרומפט אחד!** חובה לחלק את העבודה מול Claude ל-**7 שלבים מתועדים לפחות**:
  1. אתחול הפרויקט וניסוח קובץ `CLAUDE.md` מקיף (כולל חוקי השכבות, Zod וסנכרון Swagger).
  2. הקמת שלד הפרויקט (`app.js`, `server.js`, `.env`), מחלקת `AppError` ו-`errorHandler.js`.
  3. מימוש השכבות עבור `categories` (`repository`, `service`, `controller`, `routes`).
  4. מימוש השכבות עבור `tickets` (כולל הבדיקות העסקיות מול הקטגוריות).
  5. התקנת `zod`, כתיבת הסכמות ב-`src/schemas/` ויצירת ה-Middleware הגנרי `validate.js` + חיבורו ל-routes ול-`errorHandler`.
  6. יצירת `src/docs/openapi.json` בעזרת ה-AI על בסיס סכמות ה-Zod וה-routes הקיימים, וחיבור `swagger-ui-express` בכתובת `/api-docs`.
  7. **תרגיל בדיקת סנכרון:** בצעי שינוי קטן באחת מסכמות ה-Zod (למשל הוסיפי שדה אופציונלי `reporterEmail: z.string().email().optional()` ליצירת פנייה), ובדקי שה-AI מסנכרן אוטומטית גם את ה-Swagger בהתאם לחוק ב-`CLAUDE.md`!
* **ביקורת קוד בסיום:** לאחר שהכל עובד ונבדק דרך מסך ה-Swagger ("Try it out" לקריאות תקינות ולקריאות שגויות שמחזירות 400 ו-404), שאלי את ה-AI:
  * *"עבור על כל הפרויקט ובדוק: האם קיים חוסר התאמה כלשהו בין חוקי ה-Zod בקוד לבין מה שמופיע ב-openapi.json?"*
  * *"האם נשארה לוגיקה עסקית בתוך הקונטרולרים או ולידציית מבנה בתוך ה-Services שהייתה צריכה להיות ב-Zod?"*
* **הגשה:** יש להעלות את הפרויקט לריפו החדש ב-GitHub (לוודא ש-`node_modules` ו-`.env` נמצאים ב-`.gitignore`!), לצרף תיעוד של שלבי העבודה בתיקיית `ai-log/`, ולשתף אותי כשותפת עריכה (`chanakamin`).
