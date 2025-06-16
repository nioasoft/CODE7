# 💬 Testimonials Cards

כרטיסי המלצות מעוצבים עם עיצוב כהה ומרשים.

## ✨ תכונות
- 🌙 עיצוב כהה אלגנטי
- ⭐ תמיכה בדירוגים
- 📱 Responsive grid layout
- 🎭 אפקטי hover חלקים
- 🔄 טעינה דינמית מ-JSON
- 🇮🇱 תמיכה מלאה ב-RTL
- 🎨 קסטומיזציה גמישה

## 🛠️ התקנה

### 1. העתק הקבצים
```bash
cp -r components/features/testimonials-cards your-project/components/
```

### 2. כלול ב-HTML
```html
<!-- CSS -->
<link rel="stylesheet" href="components/features/testimonials-cards/testimonials.css">

<!-- HTML -->
<section class="testimonials">
    <div class="container">
        <h2 class="section-title">המלצות לקוחות</h2>
        <div class="testimonials-grid">
            <div class="testimonial-card">
                <div class="testimonial-rating">
                    <span class="stars">★★★★★</span>
                </div>
                <div class="testimonial-content">
                    <p>"המלצה מעולה על השירות המקצועי והיענות מהירה לכל בקשה."</p>
                    <div class="testimonial-author">
                        <strong>שם הלקוח</strong>
                        <span>תפקיד / חברה</span>
                    </div>
                </div>
            </div>
            <!-- עוד המלצות... -->
        </div>
    </div>
</section>

<!-- JavaScript -->
<script src="components/features/testimonials-cards/testimonials.js"></script>
```

## ⚙️ אפשרויות התאמה

### צבעים
```css
:root {
    --testimonials-bg: #1D1D1F;
    --testimonials-card-bg: #2C2C2E;
    --testimonials-text: #FFFFFF;
    --testimonials-text-secondary: rgba(255, 255, 255, 0.56);
    --testimonials-text-content: rgba(255, 255, 255, 0.86);
    --testimonials-accent: #FFD700;
}
```

### גריד Layout
```css
.testimonials-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* גודל כרטיסים */
    gap: 2rem; /* מרווח בין כרטיסים */
}
```

### אפקט Hover
```css
.testimonial-card:hover {
    transform: translateY(-3px); /* גובה הרחפה */
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}
```

### עיצוב כרטיס
```css
.testimonial-card {
    padding: 2rem; /* ריפוד פנימי */
    border-radius: 12px; /* עיגול פינות */
}
```

## ⭐ דירוגים
### עם כוכבים:
```html
<div class="testimonial-rating">
    <span class="stars">★★★★★</span>
    <span class="rating-number">(5.0)</span>
</div>
```

### עם מספרים:
```html
<div class="testimonial-rating">
    <span class="rating-score">9.5/10</span>
</div>
```

### ללא דירוג:
פשוט לא לכלול את `testimonial-rating`

## 👤 פרטי מחבר
### עם תמונה:
```html
<div class="testimonial-author">
    <div class="author-avatar">
        <img src="avatar.jpg" alt="שם הלקוח">
    </div>
    <div class="author-info">
        <strong>שם הלקוח</strong>
        <span>תפקיד / חברה</span>
    </div>
</div>
```

### ללא תמונה:
```html
<div class="testimonial-author">
    <strong>שם הלקוח</strong>
    <span>תפקיד / חברה</span>
</div>
```

## 🎨 ווריאציות עיצוב
### כרטיס מודגש:
```html
<div class="testimonial-card featured">
    <!-- תוכן הכרטיס -->
</div>
```

### כרטיס עם מסגרת:
```html
<div class="testimonial-card bordered">
    <!-- תוכן הכרטיס -->
</div>
```

### כרטיס קומפקטי:
```html
<div class="testimonial-card compact">
    <!-- תוכן הכרטיס -->
</div>
```

## 📱 Mobile Support
- Grid אוטומטי לעמודה אחת ב-768px ומטה
- Padding מותאם למסכים קטנים
- גדלי טקסט responsive

## 🚀 JavaScript Features
- טעינת המלצות מ-JSON
- אנימציות scroll-based
- מערכת פילטרים לפי דירוג
- Carousel mode (אופציונלי)
- אוטומטיק rotation

## 📋 JSON Structure
```json
{
  "testimonials": [
    {
      "id": 1,
      "name": "שרה כהן",
      "role": "עורכת דין",
      "company": "משרד עורכי דין כהן",
      "text": "שירות מעולה ומקצועי ברמה הגבוהה ביותר!",
      "rating": 5,
      "avatar": "https://example.com/avatar.jpg",
      "featured": true
    }
  ]
}
```

## 🎯 דוגמאות שימוש
- אתרי שירותים מקצועיים
- חברות טכנולוגיה
- יועצים עצמאיים
- חנויות מקוונות