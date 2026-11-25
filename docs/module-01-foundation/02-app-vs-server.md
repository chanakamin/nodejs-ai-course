# 1.2 ארכיטקטורה משודרגת: הפרדת `server.js` ושכבת `repositories`

## נושאי תת-היחידה
* למה מפרידים בין `app.js` לבין `server.js`?
* מעבר משם התיקייה `data` לתיקיית `repositories` כהכנה לעבודה עם מספר מסדי נתונים
* הכרת מבנה התיקיות המלא של הפרויקט

---

## הפרדת `app.js` מ-`server.js`
בחלק הראשון של הקורס, קובץ `app.js` עשה שני דברים:
1. הגדיר את אפליקציית ה-Express (חיבור `express.json()`, חיבור ה-`routes`, הגדרת `middlewares`).
2. הפעיל את השרת בפועל להאזנה לפורט באמצעות `app.listen(PORT)`.

בפרויקט מקצועי — ובמיוחד לקראת כתיבת **בדיקות אוטומטיות (Testing)** שנלמד בהמשך — מקובל להפריד את שתי הפעולות לשני קבצים נפרדים לפי עיקרון **אחריות יחידה לקובץ**:
* **`app.js`:** בונה ומגדיר את אפליקציית Express, חיבור הניווטים וה-middlewares, ובסוף **מייצא** את האובייקט `app` (בלי להפעיל `listen`!).
* **`server.js`:** הקובץ שאותו מריצים בפועל (`node src/server.js`). תפקידו היחיד: לטעון משתני סביבה (`dotenv`), לייבא את `app`, ולהפעיל את `app.listen(PORT)`.

::: tip בקשי מה-AI שיסביר לך עוד על הפרדת `app.js` ו-`server.js`
**פרומפט לדוגמא:**
```text
In a Node.js Express project, why is it considered best practice to separate app.js (Express configuration) from server.js (app.listen)?
Explain the benefit in simple terms for a junior developer, especially regarding testing and clean architecture.
```
:::

---

## משכבת `data` לשכבת `repositories`
בקורס זה נלמד עיקרון ארכיטקטוני חשוב מאוד: צד השרת אינו מחויב לסוג אחד של מסד נתונים! בהמשך נחבר את הפרויקט גם ל-SQL וגם ל-MongoDB, ונראה איך שאר הפרויקט ממשיך לעבוד בלי שינוי.

לשם כך, אנו משנים את שמה של תיקיית `data` לשם המקובל בתעשייה: **`repositories`** (שכבת הגישה לנתונים).
* שכבת ה-`services` תפנה אך ורק לפונקציות קבועות וברורות שמוגדרות ב-`repository` (לדוגמא: `findAll()`, `findById(id)`, `create(data)`, `update(id, data)`, `remove(id)`).
* כל הפונקציות ב-`repository` יוגדרו כבר מעכשיו כפונקציות `async` (גם כשהן עובדות מול מערך בזיכרון!), כדי שביחידה הבאה נחליף את המערך במסד נתונים אמיתי בלי לשנות שורת קוד אחת ב-`services` או ב-`controllers`!

### מבנה התיקיות החדש של הפרויקט
שימי לב להוספת תיקיות ייעודיות לולידציה (`schemas`) ולתיעוד (`docs`), אותן נלמד בתתי-היחידות הבאות:

```text
smart-helpdesk-api/
├── CLAUDE.md
├── .env
├── .env.example
├── .gitignore
├── package.json
└── src/
    ├── server.js
    ├── app.js
    ├── routes/
    │   ├── tickets.routes.js
    │   └── categories.routes.js
    ├── controllers/
    │   ├── tickets.controller.js
    │   └── categories.controller.js
    ├── services/
    │   ├── tickets.service.js
    │   └── categories.service.js
    ├── repositories/
    │   ├── tickets.repository.js
    │   └── categories.repository.js
    ├── schemas/
    │   ├── tickets.schema.js
    │   └── categories.schema.js
    ├── middlewares/
    │   ├── validate.js
    │   └── errorHandler.js
    ├── docs/
    │   └── openapi.json
    └── utils/
        └── AppError.js
```
