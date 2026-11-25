# 1.4 אימות נתוני קלט בשער השרת עם Zod

## נושאי תת-היחידה
* כלל הברזל של פיתוח צד שרת: Never Trust the Client
* הבחנה ארכיטקטונית בין **ולידציית מבנה (Schema Validation)** לבין **ולידציה עסקית (Business Validation)**
* הגדרת סכמות קלט בספריית `zod`
* יצירת Middleware גנרי לאימות אוטומטי ושילובו עם ה-Global Error Middleware

---

## כלל ברזל בצד שרת: לעולם אל תסמכי על הקלט מהלקוח!
כאשר מפתחים אתר ב-React, נהוג להוסיף בדיקות בטופס בדפדפן (למשל: שדה חובה, או בחירה מתוך רשימה סגורה של רמות דחיפות).
אבל האם צד השרת יכול לסמוך על כך שהמידע שיגיע אליו תמיד יהיה תקין? **בשום אופן לא!**

כל אדם יכול לעקוף את הדפדפן ולשלוח קריאת `POST /tickets` ישירות דרך Postman (או קוד חיצוני) עם מידע חסר, טיפוסים שגויים (מספר במקום מחרוזת), ערכים לא חוקיים (`priority: "super-urgent"` במקום `high`), או שדות זדוניים שלא אמורים להישלח כלל (למשל ניסיון לשתול שדה `isAdmin: true`).

אם לא נעצור מידע שגוי כבר בכניסה לשרת, הוא יחדור לתוך ה-`services` ולמסד הנתונים, ויגרום לבאגים קשים או לפרצות אבטחה.

::: tip בקשי מה-AI שיסביר לך עוד על חשיבות ולידציה בצד השרת
**פרומפט לדוגמא:**
```text
Why must backend servers always validate incoming request data even if the frontend form already validates user input?
Give 3 concrete examples of bad or dangerous payloads a client could send to a POST /tickets endpoint.
```
:::

---

## מה זו ספריית Zod?
כדי לבדוק ידנית כל שדה ב-`req.body`, היינו צריכים לכתוב עשרות תנאי `if` מסורבלים בכל קריאה: האם `title` קיים? האם הוא מסוג `string`? האם אורכו לפחות 3 תווים? האם `priority` הוא אחד מ-3 הערכים המותרים?

ספריית **Zod** היא הספרייה הפופולרית והמודרנית ביותר בעולם ה-Node.js להגדרת **סכמות ולידציה (Schemas)**.
במקום לכתוב משפטי `if`, אנו מגדירים בתיקיית `src/schemas/` מעין "תבנית דרישות" ברורה וקריאה עבור כל ישות.

דוגמא לסכמת יצירת פנייה ב-Zod:
```javascript
import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description is too short'),
  categoryId: z.string().min(1, 'Category ID is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});
```

מה Zod נותנת לנו בחינם?
1. **בדיקת טיפוסים וחוקים:** מוודאת שכל שדה עומד בדרישות המדויקות (אורך מינימלי, רשימת ערכים מותרת `enum`, ערכי ברירת מחדל `default`).
2. **סינון שדות זרים:** כברירת מחדל, Zod מנקה מהאובייקט כל שדה שלא הוגדר בסכמה! אם לקוח שלח שדה מיותר — הוא פשוט ייזרק החוצה ולא ייכנס לשרת.
3. **הודעות שגיאה מפורטות:** אם הקלט שגוי, הפונקציה `schema.safeParse(req.body)` מחזירה פירוט מדויק של כל השדות שנכשלו והסיבה לכך, כדי שנוכל להחזיר ללקוח שגיאת `400 Bad Request` ברורה.

::: tip בקשי מה-AI שיסביר לך עוד על עבודה עם Zod
**פרומפט לדוגמא:**
```text
Explain how Zod works in a Node.js Express backend to a beginner.
Explain z.object(), z.string().min(), z.enum(), .optional(), and the difference between schema.parse() and schema.safeParse().
Show small examples without Express code first.
```
:::

---

## ארכיטקטורה נכונה: איפה יושבת כל בדיקה?
שאלה ארכיטקטונית חשובה מאוד שמתכנתות מתחילות מתבלבלות בה:
אם יש לנו סכמת Zod, האם כל הבדיקות עוברות לשם, או שעדיין צריך בדיקות בתוך שכבת ה-`services`?

התשובה היא שיש **שני סוגים שונים של ולידציה**, ולכל אחד מקום קבוע בארכיטקטורה:

### 1. ולידציית מבנה וצורה (Schema Validation) ← ב-Middleware עם Zod
בדיקות שבודקות את **מבנה הבקשה עצמה**, בלי שום צורך לגשת למסד הנתונים:
* האם נשלחה כותרת והיא מחרוזת באורך 3–100 תווים?
* האם שדה `priority` מכיל רק `low`, `medium` או `high`?
* בעדכון פנייה (`PUT`), האם לפחות שדה אחד תקין נשלח לעדכון?

בדיקות אלו מתבצעות **בשער השרת (Middleware)** עוד לפני שהקריאה מגיעה ל-`controller`! אם המבנה שגוי — הבקשה נחסמת מיד עם סטטוס `400`.

### 2. ולידציה עסקית (Business / Domain Validation) ← בשכבת ה-Service
בדיקות שדורשות **הבנה של נתוני המערכת או פנייה ל-Repository**:
* הלקוח שלח `categoryId: "cat-999"`. מבחינת Zod זו מחרוזת תקינה לחלוטין! אבל האם באמת קיימת קטגוריה כזו במערכת שלנו? את זה רק שכבת ה-`service` יכולה לבדוק מול `categories.repository` (ואם לא — לזרוק `AppError` עם סטטוס `404` או `400`).
* דוגמא נוספת: "אסור לשנות פרטים של פנייה שכבר נסגרה (`resolved`)". זו חוקיות עסקית ששייכת אך ורק ל-`service`.

::: tip בקשי מה-AI לחדד עבורך את ההבדל בין שני סוגי הולידציות
**פרומפט לדוגמא:**
```text
Explain the architectural difference between "Input/Schema Validation" (in middleware using Zod) and "Business Logic Validation" (inside the service layer).
Use a Helpdesk Ticket system to give 2 examples of checks that belong in Zod middleware and 2 checks that belong in tickets.service.js.
```
:::

---

## חיבור Zod ל-Routes ול-Error Handler שלנו
במקום להריץ את Zod ידנית בתוך כל פונקציה ב-Controller, ניצור קובץ Middleware גנרי אחד ויחיד: `src/middlewares/validate.js`.

הפונקציה `validate(schema)` מקבלת סכמה של Zod ומחזירה פונקציית Middleware של Express:
1. היא מריצה `schema.safeParse(req.body)`.
2. **אם הקלט תקין:** היא מחליפה את `req.body` בנתונים הנקיים שחזרו מ-Zod (כולל ערכי `default` והסרת שדות מיותרים!) וקוראת ל-`next()`.
3. **אם הקלט שגוי:** היא מעבירה את השגיאה הלאה (או זורקת שגיאה עם סטטוס `400` ורשימת השדות השגויים) ישירות אל ה-**Global Error Middleware** שלמדנו בתת-יחידה 1.3!

כך הקוד בקובץ ה-`routes` הופך לקריא, נקי ואלגנטי להפליא:
```javascript
router.post('/', validate(createTicketSchema), ticketsController.createTicket);
router.put('/:id', validate(updateTicketSchema), ticketsController.updateTicket);
```
ובתוך ה-`controller` וה-`service` אנו יודעים בוודאות של 100% ש-`req.body` כבר נבדק, נוקה ועומד בכל החוקים!

::: tip בקשי מה-AI להראות לך איך לבנות את `validate.js` ולחבר אותו ל-`errorHandler`
**פרומפט לדוגמא:**
```text
Show how to write a reusable Express middleware validate(schema) using Zod's safeParse().
If validation fails, format the field errors cleanly and pass a 400 error to my global errorHandler middleware.
If validation succeeds, assign the parsed data back to req.body and call next().
Explain every line of code.
```
:::
