# 🧩 ספריית קומפוננטים - CODE7

## 📋 סקירה כללית
ספריית קומפוננטים מקיפה לבניית אתרים עברית RTL במהירות ובקלות.
כל קומפוננט בנוי עם התמיכה הטובה ביותר בעברית וכיוון RTL.

## 📁 מבנה התיקיות

### 🎯 Headers
קומפוננטי header/navbar מוכנים לשימוש:
- `modern-rtl` - הדר מודרני עם תמיכה ב-RTL (✅ זמין)
- `classic` - הדר קלאסי עם לוגו במרכז (🔄 בפיתוח)
- `minimal` - הדר מינימליסטי (🔄 בפיתוח)

### 🌟 Heroes
סקציות hero מרשימות:
- `gradient-animated` - Hero עם רקע גרדיאנט מונפש (✅ זמין)
- `image-bg` - Hero עם תמונת רקע (🔄 בפיתוח)
- `video-bg` - Hero עם וידאו ברקע (🔄 בפיתוח)
- `slider` - Hero עם סליידר תמונות (🔄 בפיתוח)

### 🎨 Features
קומפוננטי תוכן עיקריים:
- `services-cards` - כרטיסי שירותים עם אייקונים (✅ זמין)
- `projects-grid` - גריד פרויקטים עם תמונות (✅ זמין)
- `testimonials-cards` - כרטיסי המלצות (✅ זמין)
- `faq-accordion` - שאלות נפוצות באקורדיון (✅ זמין)
- `pricing-table` - טבלת מחירים (🔄 בפיתוח)
- `team-members` - הצגת צוות (🔄 בפיתוח)

### 📝 Forms
טפסים מתקדמים:
- `contact-advanced` - טופס קשר מתקדם (✅ זמין)
- `newsletter` - טופס רישום לניוזלטר (🔄 בפיתוח)
- `quote-request` - טופס בקשת הצעת מחיר (🔄 בפיתוח)

### ⚙️ Systems
מערכות ניהול מלאות:
- `admin-panel` - פאנל ניהול מלא (✅ זמין)
- `contact-manager` - מערכת ניהול פניות (✅ זמין)
- `booking-system` - מערכת הזמנת תורים (🔄 בפיתוח)
- `ecommerce` - מערכת מסחר אלקטרוני (🔄 בפיתוח)
- `blog` - מערכת בלוג (🔄 בפיתוח)
- `user-auth` - מערכת משתמשים (🔄 בפיתוח)

### 🏗️ Layouts
תבניות עמודים:
- `single-page` - עמוד יחיד עם sections מרובים (✅ זמין)
- `multi-page` - מבנה רב-עמודי (🔄 בפיתוח)

### 🔧 Common
קומפוננטים בסיסיים:
- `buttons` - כפתורים מעוצבים
- `cards` - כרטיסים גנריים
- `modals` - חלונות קופצים
- `alerts` - התראות

### 🛠️ Utilities
עזרים ופונקציות:
- `animations` - אנימציות CSS/JS
- `rtl-helpers` - עזרים לכיוון RTL
- `form-validation` - ולידציות טפסים
- `api-helpers` - עזרים לתקשורת עם שרת

## 🚀 איך להשתמש

### 1. העתקת קומפוננט
```bash
# העתק קומפוננט לפרויקט החדש
cp -r components/headers/modern-rtl new-project/components/
```

### 2. הכללה ב-HTML
```html
<!-- כלול את ה-CSS -->
<link rel="stylesheet" href="components/headers/modern-rtl/header.css">

<!-- הוסף את ה-HTML -->
<div id="header-container"></div>

<!-- כלול את ה-JS -->
<script src="components/headers/modern-rtl/header.js"></script>
```

### 3. אתחול
```javascript
// אתחל את הקומפוננט
const header = new ModernRTLHeader({
    logo: 'path/to/logo.png',
    menuItems: [...],
    rtl: true
});
```

## 📖 תיעוד מפורט
לתיעוד מפורט של כל קומפוננט, ראה את הקובץ README.md בתיקיית הקומפוננט.

## 🔄 עדכונים
- **גרסה**: 1.0.0
- **עדכון אחרון**: דצמבר 2024
- **תחזוקה**: פעילה

## 📞 תמיכה
- Issues: דווח בפרויקט הראשי
- Documentation: `/docs` בכל קומפוננט
- Examples: `/examples` לדוגמאות שימוש