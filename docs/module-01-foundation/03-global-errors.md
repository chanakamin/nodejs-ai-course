# 1.3 ניהול שגיאות מרכזי (Global Error Middleware)

## נושאי תת-היחידה
* הבעיה בבלוקי `try / catch` חוזרים בכל פונקציה ב-Controller
* יצירת מחלקת שגיאה מותאמת אישית (`AppError`)
* מנגנון Error Handling Middleware ב-Express

---

## למה לא לכתוב `try / catch` בכל פונקציה?
בשיעור 8 עטפנו כל פונקציה ב-`controller` בבלוק `try / catch`, ובתוך ה-`catch` החזרנו תשובת שגיאה עם סטטוס 500.
כאשר הפרויקט גדל לעשרות קריאות שרת, נוצרות שתי בעיות קשות:
1. **שכפול קוד מיותר:** בכל פונקציה חוזר אותו קוד של תפיסת שגיאה והדפסה ללוג.
2. **חוסר אחידות וערבוב שכבות:** לפעמים שגיאה נוצרת עמוק בתוך שכבת ה-`service` (למשל: ניסיון לפתוח פנייה בקטגוריה שאינה קיימת — שגיאת `404`, או כותרת ריקה — שגיאת `400`). איך ה-`service` יודיע איזה סטטוס HTTP להחזיר בלי להכיר את `res`?

הפתרון המקצועי ב-Express מורכב משני חלקים: **שגיאה מותאמת אישית (`AppError`)** ו-**Middleware מרכזי לטיפול בשגיאות**.

---

## חלק א': אובייקט שגיאה עם קוד סטטוס (`AppError`)
בשפת JavaScript קיים אובייקט מובנה בשם `Error`, אך הוא מכיל רק הודעת טקסט (`message`) ואינו מכיל קוד סטטוס HTTP (כמו `400` או `404`).
לכן ניצור בתיקיית `utils/` מחלקה קטנה בשם `AppError` שיורשת מ-`Error` ומוסיפה לה מאפיין של `statusCode`.

כך, אם בשכבת ה-`service` מתגלה שהפנייה המבוקשת לא קיימת, הפונקציה פשוט "זורקת" שגיאה:
```javascript
throw new AppError('Ticket not found', 404);
```
שימי לב: שכבת ה-`service` עדיין נקייה לחלוטין מ-`req` ומ-`res`!

::: tip בקשי מה-AI שיסביר לך עוד על מחלקת `AppError`
**פרומפט לדוגמא:**
```text
Explain why backend developers create a custom AppError class that extends JavaScript's built-in Error class.
Show a minimal example of AppError with message and statusCode, and explain how a service function throws it when an item is not found.
```
:::

---

## חלק ב': Global Error Handling Middleware
בשיעור 5 למדנו שפונקציית Middleware רגילה מקבלת **3 פרמטרים**: `(req, res, next)`.
ל-Express יש מנגנון מיוחד עבור שגיאות: פונקציית Middleware שמקבלת **4 פרמטרים בדיוק**:
```javascript
function errorHandler(err, req, res, next) { ... }
```
כאשר מחברים את הפונקציה הזו ב-`app.js` **אחרי כל הגדרות ה-routes**, היא הופכת ל"רשת הביטחון" של כל השרת!

איך שגיאה מגיעה אליה?
* בגרסה העדכנית של Express (גרסה 5), כל שגיאה שנזרקת (`throw`) בתוך פונקציית `async` מועברת **אוטומטית** אל ה-Error Middleware! (וגם ניתן להעביר שגיאה ידנית באמצעות קריאה ל-`next(err)`).
* פונקציית ה-`errorHandler` בודקת: האם השגיאה כוללת `statusCode` מוגדר (כמו 400 או 404)? אם כן — היא תחזיר אותו. אם זו שגיאה לא צפויה בקוד — היא תחזיר סטטוס `500`, ותמיד בפורמט JSON קבוע ואחיד:
```json
{
  "success": false,
  "error": {
    "message": "Ticket not found"
  }
}
```

::: warning שימי לב למיקום ב-`app.js`!
חובה להגדיר את `app.use(errorHandler)` **בסוף קובץ `app.js`**, אחרי כל שורות ה-`app.use('/tickets', ...)`! אם תגדירי אותו לפני ה-routes, הוא לא יתפוס שגיאות שקורות בתוכם.
:::

::: tip בקשי מה-AI שיסביר לך עוד על Error Middleware ב-Express 5
**פרומפט לדוגמא:**
```text
Explain how Express error-handling middleware with 4 parameters (err, req, res, next) works.
Explain why it must be registered after all routes in app.js, and how Express 5 handles errors thrown inside async route handlers.
Show a clean beginner-friendly example.
```
:::
