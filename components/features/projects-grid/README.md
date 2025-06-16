# 🖼️ Projects Grid

גריד פרויקטים מעוצב עם תמונות, הוברים וטעינה דינמית.

## ✨ תכונות
- 🎨 גריד responsive אוטומטי
- 🖼️ תמיכה בתמונות + placeholder
- 🎭 אפקטי hover חלקים
- 📱 Mobile-first design
- 🔄 טעינה דינמית מ-JSON
- 🇮🇱 תמיכה מלאה ב-RTL
- ⚡ Lazy loading מובנה

## 🛠️ התקנה

### 1. העתק הקבצים
```bash
cp -r components/features/projects-grid your-project/components/
```

### 2. כלול ב-HTML
```html
<!-- CSS -->
<link rel="stylesheet" href="components/features/projects-grid/projects.css">

<!-- HTML -->
<section class="projects" id="projects">
    <div class="container">
        <h2 class="section-title">פרויקטים</h2>
        <div class="projects-grid">
            <div class="project-card">
                <div class="project-image">
                    <img src="path/to/image.jpg" alt="שם הפרויקט" loading="lazy">
                </div>
                <div class="project-content">
                    <h3>שם הפרויקט</h3>
                    <p>תיאור קצר של הפרויקט</p>
                </div>
            </div>
            <!-- עוד פרויקטים... -->
        </div>
    </div>
</section>

<!-- JavaScript -->
<script src="components/features/projects-grid/projects.js"></script>
```

## ⚙️ אפשרויות התאמה

### צבעים
```css
:root {
    --projects-bg: #FFFFFF;
    --projects-card-bg: #F2F2F7;
    --projects-text: #1D1D1F;
    --projects-text-secondary: #6e6e73;
    --projects-hover-shadow: rgba(0, 0, 0, 0.1);
}
```

### גריד Layout
```css
.projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* גודל מינימלי */
    gap: 2rem; /* מרווח בין כרטיסים */
}
```

### גובה תמונות
```css
.project-image {
    height: 200px; /* שנה לפי הצורך */
}
```

### אפקט Hover
```css
.project-card:hover {
    transform: translateY(-5px); /* גובה הרחפה */
    box-shadow: 0 10px 40px var(--projects-hover-shadow);
}
```

## 🎨 תמונות
### עם תמונה:
```html
<div class="project-image">
    <img src="project.jpg" alt="פרויקט מעולה" loading="lazy">
</div>
```

### ללא תמונה (Placeholder):
```html
<div class="project-image">
    <!-- יציג gradient ברירת מחדל -->
</div>
```

### עם קישור:
```html
<div class="project-card" data-url="https://example.com">
    <!-- התוכן של הכרטיס -->
</div>
```

## 📱 Mobile Support
- Grid אוטומטי לעמודות פחות ברזולוציות קטנות
- גדלי טקסט מותאמים
- מרווחים אופטימליים

## 🚀 JavaScript Features
- טעינת פרויקטים מ-JSON
- Lazy loading לתמונות
- מערכת פילטרים
- Modal לתצוגה מורחבת
- אנימציות scroll-based

## 🎯 דוגמאות שימוש
- פורטפוליו עיצוב
- גלריית עבודות
- תיק השקעות
- מוצרים/שירותים

## 📋 JSON Structure
```json
{
  "projects": [
    {
      "id": 1,
      "name": "אתר תדמית",
      "description": "עיצוב מודרני ומקצועי",
      "image": "https://example.com/image.jpg",
      "url": "https://project-url.com",
      "category": "website",
      "featured": true
    }
  ]
}
```