# 🎯 Services Cards

קומפוננט כרטיסי שירותים מעוצב עם אייקונים והאפקטי hover.

## ✨ תכונות
- 🎨 עיצוב מודרני וקלין
- 🎭 אפקטי hover חלקים
- 📱 Responsive grid layout
- 🖼️ תמיכה באייקונים SVG
- 🇮🇱 תמיכה מלאה ב-RTL
- ⚡ אנימציות מותאמות לביצועים

## 🛠️ התקנה

### 1. העתק הקבצים
```bash
cp -r components/features/services-cards your-project/components/
```

### 2. כלול ב-HTML
```html
<!-- CSS -->
<link rel="stylesheet" href="components/features/services-cards/services.css">

<!-- HTML -->
<section class="services" id="services">
    <div class="container">
        <h2 class="section-title">השירותים שלנו</h2>
        <div class="services-grid">
            <div class="service-card">
                <div class="service-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="9"></line>
                        <line x1="9" y1="13" x2="15" y2="13"></line>
                    </svg>
                </div>
                <h3>כותרת השירות</h3>
                <p>תיאור השירות ומה שהוא כולל</p>
            </div>
            <!-- עוד כרטיסים... -->
        </div>
    </div>
</section>

<!-- JavaScript (אופציונלי) -->
<script src="components/features/services-cards/services.js"></script>
```

## ⚙️ אפשרויות התאמה

### צבעים
```css
:root {
    --services-bg: #F2F2F7;
    --services-card-bg: #FFFFFF;
    --services-icon-color: #007AFF;
    --services-text-primary: #1D1D1F;
    --services-text-secondary: #6e6e73;
}
```

### גריד Layout
```css
.services-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* מספר עמודות */
    gap: 2rem; /* מרווח בין כרטיסים */
}
```

### אייקונים
החלף את ה-SVG בתוך `.service-icon`:
```html
<div class="service-icon">
    <!-- אייקון בהתאמה אישית -->
    <svg viewBox="0 0 24 24">...</svg>
</div>
```

### אפקט Hover
```css
.service-card:hover {
    transform: translateY(-5px); /* שנה את הגובה */
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08); /* שנה את הצל */
}
```

## 🎨 אייקונים מומלצים
- **בניית אתרים**: `<rect>` + `<line>` (דף)
- **אפליקציות**: `<rect>` (טלפון)
- **מערכות ניהול**: `<path>` (ברק)
- **חנויות**: `<circle>` + `<path>` (עגלה)
- **אחזקה**: `<circle>` + `<path>` (הגדרות)

## 📱 Mobile Support
- Grid אוטומטי לעמודה אחת ב-768px ומטה
- Padding מותאם למסכים קטנים
- גדלי טקסט responsive

## 🚀 JavaScript Features (אופציונלי)
- טעינת שירותים מ-JSON
- אנימציות scroll-based
- מערכת פילטרים
- לחיצה על כרטיס להרחבה

## 🎯 דוגמאות שימוש
- אתרי שירותים מקצועיים
- חברות טכנולוגיה
- סטודיו עיצוב
- חברות יעוץ