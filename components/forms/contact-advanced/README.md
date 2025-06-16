# 📧 Contact Advanced Form

טופס יצירת קשר מתקדם עם ולידציות, אנימציות ושליחה לשרת.

## ✨ תכונות
- 📝 שדות מתקדמים (תקציב, לוח זמנים, סוג פרויקט)
- ✅ ולידציות מתקדמות בזמן אמת
- 📱 Responsive design מלא
- 🎨 עיצוב מודרני וקלין
- 🔄 אנימציות loading
- 🇮🇱 תמיכה מלאה ב-RTL
- 🚀 שליחה AJAX

## 🛠️ התקנה

### 1. העתק הקבצים
```bash
cp -r components/forms/contact-advanced your-project/components/
```

### 2. כלול ב-HTML
```html
<!-- CSS -->
<link rel="stylesheet" href="components/forms/contact-advanced/contact.css">

<!-- HTML -->
<section class="contact" id="contact">
    <div class="container">
        <h2 class="section-title">צור קשר</h2>
        <form class="contact-form" id="contactForm">
            <div class="form-grid">
                <div class="form-group">
                    <label for="name">שם מלא</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">אימייל</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="phone">טלפון</label>
                    <input type="tel" id="phone" name="phone" required>
                </div>
                <div class="form-group">
                    <label for="projectType">סוג הפרויקט</label>
                    <select id="projectType" name="projectType" required>
                        <option value="">בחר סוג פרויקט</option>
                        <option value="website">אתר תדמית</option>
                        <option value="ecommerce">חנות מקוונת</option>
                        <option value="app">אפליקציה מותאמת</option>
                        <option value="system">מערכת ניהול</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="budget">תקציב משוער</label>
                    <select id="budget" name="budget" required>
                        <option value="">בחר תקציב</option>
                        <option value="2000-5000">2,000-5,000 ₪</option>
                        <option value="5000-10000">5,000-10,000 ₪</option>
                        <option value="10000-20000">10,000-20,000 ₪</option>
                        <option value="20000+">20,000+ ₪</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="timeline">לוח זמנים רצוי</label>
                    <select id="timeline" name="timeline" required>
                        <option value="">בחר לוח זמנים</option>
                        <option value="urgent">דחוף (עד שבועיים)</option>
                        <option value="normal">רגיל (חודש)</option>
                        <option value="flexible">גמיש (חודש-שלושה)</option>
                    </select>
                </div>
                <div class="form-group form-group-full">
                    <label for="description">תיאור הפרויקט</label>
                    <textarea id="description" name="description" rows="5" required></textarea>
                </div>
            </div>
            <button type="submit" class="submit-button">שלח פנייה</button>
        </form>
    </div>
</section>

<!-- JavaScript -->
<script src="components/forms/contact-advanced/contact.js"></script>
```

## ⚙️ אפשרויות התאמה

### צבעים
```css
:root {
    --form-bg: #F2F2F7;
    --form-card-bg: #FFFFFF;
    --form-primary: #007AFF;
    --form-text: #1D1D1F;
    --form-border: #d2d2d7;
    --form-error: #FF3B30;
    --form-success: #30D158;
}
```

### שדות נוספים
הוסף שדות חדשים לטופס:
```html
<div class="form-group">
    <label for="company">שם חברה</label>
    <input type="text" id="company" name="company">
</div>
```

### אפשרויות Select
עדכן את האפשרויות ב-select:
```html
<option value="newType">סוג פרויקט חדש</option>
```

### Endpoint
שנה את כתובת השרת:
```javascript
const contactForm = new AdvancedContactForm({
    endpoint: '/your-api/contact',
    successMessage: 'ההודעה נשלחה בהצלחה!'
});
```

## 🔧 שרת Backend
הטופס שולח POST request ל-`/contact` עם הנתונים הבאים:
```json
{
    "name": "שם המשתמש",
    "email": "user@example.com", 
    "phone": "05X-XXXXXXX",
    "projectType": "website",
    "budget": "5000-10000",
    "timeline": "normal",
    "description": "תיאור הפרויקט..."
}
```

### תגובה צפויה
```json
{
    "success": true,
    "message": "הפנייה נקלטה בהצלחה"
}
```

## ✅ ולידציות
- **שם**: נדרש, לפחות 2 תווים
- **אימייל**: פורמט אימייל תקין
- **טלפון**: מספרים בלבד, פורמט ישראלי
- **שדות נדרשים**: כל השדות חובה

## 📱 Mobile Support
- Layout מותאם לכל הגדלים
- כפתורי submit נגישים
- אנימציות מותאמות למובייל

## 🎨 אנימציות
- Focus states מותאמות
- Loading spinner בזמן שליחה
- הודעות הצלחה/שגיאה מונפשות

## 🚀 דוגמאות שימוש
- אתרי תדמית עסקיים
- חברות פיתוח
- סטודיו עיצוב
- יועצים עצמאיים