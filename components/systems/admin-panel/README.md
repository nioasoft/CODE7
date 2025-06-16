# 🛠️ Admin Panel System

מערכת ניהול מלאה עם פאנל ניהול מתקדם, Kanban board ועורך תמונות.

## ✨ תכונות

### 🔐 אבטחה ואימות
- מערכת התחברות מאובטחת
- ניהול sessions
- הגנה מפני CSRF
- הגבלת הרשאות

### 📊 לוח משימות Kanban
- גרירה ושחרור של פניות
- עדכון סטטוס בזמן אמת
- עריכת פרטי פנייה
- מחירים ותאריכי יעד
- הערות פנימיות

### 🖼️ עורך תמונות מתקדם
- חיתוך תמונות עם Cropper.js
- זיהוי אספקט רציו אוטומטי
- שמירת שקיפות PNG
- העלאה לחשת Cloudinary
- המלצות גדלים

### 📝 ניהול תוכן דינמי
- עריכת המלצות לקוחות
- ניהול שאלות ותשובות
- עדכון פרטי עמוד הבית
- ניהול גלריית פרויקטים
- הגדרות כלליות

### 📈 דוחות וסטטיסטיקות
- מעקב פניות חדשות
- אנליטיקס בסיסי
- יצוא נתונים
- גיבויים אוטומטיים

## 🛠️ התקנה

### 1. העתק את המערכת המלאה
```bash
cp -r components/systems/admin-panel your-project/
cp -r admin/ your-project/admin/
```

### 2. הגדר את השרת
```javascript
// הוסף את הקווים האלה ל-server.js
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Admin routes
app.use('/admin', express.static('admin'));
app.use('/admin/*', requireAuth); // הגנת אימות
```

### 3. קבצי ההגדרה הנדרשים
```env
# .env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your_session_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📁 מבנה הקבצים

```
admin/
├── index.html              # דף התחברות
├── dashboard.html           # לוח הבקרה הראשי
├── admin-styles.css         # עיצוב הניהול
├── admin-script.js          # לוגיקת הניהול
├── submission-styles.css    # עיצוב לוח המשימות
└── components/
    └── image-editor.js      # עורך התמונות
```

## 🚀 קומפוננטים עיקריים

### 1. מערכת אימות
```javascript
// התחברות
const authResult = await adminAuth.login(username, password);

// בדיקת הרשאות
if (adminAuth.isAuthenticated()) {
    // גישה למערכת
}
```

### 2. ניהול פניות - Kanban
```javascript
// טעינת פניות
const submissions = await contactManager.getSubmissions();

// עדכון סטטוס
await contactManager.updateStatus(submissionId, 'in_progress');

// הוספת הערות
await contactManager.addNote(submissionId, 'הערה חשובה');
```

### 3. עורך תמונות
```javascript
// פתיחת עורך
imageEditor.open(imageFile, {
    aspectRatio: '16:9',
    format: 'png',
    quality: 0.9
});

// שמירה לשרת
const uploadedUrl = await imageEditor.save();
```

### 4. ניהול תוכן
```javascript
// עדכון המלצות
await contentManager.updateTestimonials(testimonialsData);

// עדכון שאלות ותשובות
await contentManager.updateFAQ(faqData);

// עדכון הגדרות אתר
await contentManager.updateSiteSettings(settings);
```

## ⚙️ הגדרות והתאמות

### אבטחה
```javascript
// הגדרות session
const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 שעות
        secure: process.env.NODE_ENV === 'production'
    }
};
```

### Cloudinary
```javascript
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
```

### התאמת נושא
```css
:root {
    --admin-primary: #007AFF;
    --admin-secondary: #5856D6;
    --admin-success: #30D158;
    --admin-warning: #FF9500;
    --admin-error: #FF3B30;
    --admin-bg: #F2F2F7;
    --admin-sidebar: #1D1D1F;
}
```

## 🔧 API Endpoints

### אימות
- `POST /admin/login` - התחברות
- `POST /admin/logout` - יציאה
- `GET /admin/check-auth` - בדיקת אימות

### ניהול פניות
- `GET /admin/submissions` - טעינת פניות
- `PATCH /admin/submissions/:id` - עדכון פנייה
- `DELETE /admin/submissions/:id` - מחיקת פנייה

### ניהול תוכן
- `GET /admin/site-data` - טעינת נתוני אתר
- `PUT /admin/site-data` - עדכון נתוני אתר
- `POST /admin/upload` - העלאת קבצים

### דוחות
- `GET /admin/stats` - סטטיסטיקות
- `GET /admin/export` - יצוא נתונים
- `POST /admin/backup` - יצירת גיבוי

## 📱 רספונסיביות

המערכת מותאמת לכל הגדלי מסך:
- 💻 Desktop - תצוגה מלאה
- 📱 Tablet - תפריט מתקפל  
- 📱 Mobile - ניווט drawer

## 🔒 אבטחת מידע

- 🔐 הצפנת סיסמאות
- 🛡️ הגנה מפני XSS
- 🔒 HTTPS בייצור
- 📝 לוגים מפורטים
- 🚫 הגבלת קצב בקשות

## 🎯 דוגמאות שימוש

### עיסקים קטנים:
- ניהול פניות לקוחות
- עדכון תוכן אתר
- העלאת תמונות

### סוכנויות:
- ניהול מספר לקוחות
- דוחות התקדמות
- גיבויים אוטומטיים

### פרילנסרים:
- מעקב פרויקטים
- ניהול portפוליו
- תקשורת עם לקוחות

## 🚨 דרישות מערכת

### שרת
- Node.js 14+
- 512MB RAM מינימום
- 5GB שטח אחסון
- HTTPS תעודה

### תלויות
```json
{
  "express": "^4.18.0",
  "express-session": "^1.17.0",
  "multer": "^1.4.0",
  "cloudinary": "^1.32.0",
  "bcrypt": "^5.0.0"
}
```

## 📖 תיעוד מפורט

ראה בתיקיות הבאות:
- `/docs/admin-setup.md` - מדריך התקנה
- `/docs/api-reference.md` - תיעוד API
- `/docs/troubleshooting.md` - פתרון בעיות
- `/examples/` - דוגמאות שימוש

## 🔄 עדכונים ותחזוקה

המערכת מתעדכנת אוטומטית ותומכת ב:
- גיבויים יומיים
- עדכוני אבטחה
- ניטור ביצועים
- התראות שגיאות

---

**הערה**: זהו קומפוננט מתקדם הדורש ידע טכני להתקנה מלאה. מומלץ לפנות לתמיכה טכנית עבור הטמעה ראשונית.