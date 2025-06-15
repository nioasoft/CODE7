# העברת האתר ל-FastComet

## 📋 הכנות נדרשות

1. **Node.js Application** ב-FastComet
2. **SSH Access** מופעל
3. **דומיין** מחובר

## 🚀 שלבי ההעלאה

### 1️⃣ העלאת הקבצים
העלה את כל הקבצים לתיקיית האפליקציה שלך (בדרך כלל `/home/username/nodejs/appname/`):

```
├── server.js          ← Application startup file
├── package.json
├── index.html
├── styles.css
├── script.js
├── admin/
│   ├── index.html
│   ├── dashboard.html
│   ├── admin-styles.css
│   ├── admin-script.js
│   └── components/
└── uploads/          ← יצור את התיקייה הזו

```

### 2️⃣ יצירת תיקיית uploads
```bash
mkdir uploads
chmod 755 uploads
```

### 3️⃣ התקנת תלויות
```bash
npm install
```

### 4️⃣ הגדרות FastComet

**Application root:** /
**Application URL:** http://yourdomain.com
**Application startup file:** server.js
**Node.js version:** 18.x
**Environment:** production
**Port:** יוגדר אוטומטית

### 5️⃣ משתני סביבה (אופציונלי)
בלוח הבקרה של FastComet, הוסף:
```
NODE_ENV=production
PORT=auto
```

### 6️⃣ הפעלה
לחץ על "Start" באפליקציה בלוח הבקרה.

## ✅ בדיקות

1. **בדוק שהאתר עובד:** http://yourdomain.com
2. **בדוק מערכת ניהול:** http://yourdomain.com/admin
3. **בדוק העלאת תמונה** בממשק הניהול

## 🔧 פתרון בעיות

### אם התמונות לא נשמרות:
```bash
# בדוק הרשאות
ls -la uploads/

# תקן הרשאות אם צריך
chmod 755 uploads
```

### אם יש שגיאות 404:
- ודא שה-Application root מוגדר ל-`/`
- ודא שכל הקבצים הועלו

### לוגים:
בדוק בלוח הבקרה של FastComet את הלוגים של האפליקציה.

## 📝 הערות חשובות

1. **גיבוי תמונות:** תיקיית `/uploads/` תשמר גם אחרי עדכונים!
2. **SSL:** הפעל SSL certificate בלוח הבקרה
3. **דומיין:** חבר את הדומיין לאפליקציה

## 🎉 זהו! האתר שלך עובד על FastComet

**יתרונות:**
- ✅ תמונות נשמרות לתמיד
- ✅ ביצועים מהירים יותר
- ✅ אין צורך בשירותים חיצוניים
- ✅ גיבוי קל של התמונות