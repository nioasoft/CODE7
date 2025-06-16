# 🎯 Modern RTL Header

Header מודרני עם תמיכה מלאה ב-RTL, מותאם לעברית.

## ✨ תכונות
- 🌙 רקע כהה מבוסס glass effect
- 📱 Responsive מלא עם תפריט המבורגר
- 🔗 ניווט חלק עם אנימציות
- 🎨 עיצוב מודרני בסגנון Apple
- 📲 Mobile-first design
- 🇮🇱 תמיכה מלאה ב-RTL

## 🛠️ התקנה

### 1. העתק הקבצים
```bash
cp -r components/headers/modern-rtl your-project/components/
```

### 2. כלול ב-HTML
```html
<!-- CSS -->
<link rel="stylesheet" href="components/headers/modern-rtl/header.css">

<!-- HTML -->
<header class="header" id="header">
    <nav class="nav-container">
        <ul class="nav-menu" id="navMenu">
            <li><a href="#home" class="nav-link active">דף הבית</a></li>
            <li><a href="#services" class="nav-link">השירותים שלנו</a></li>
            <li><a href="#projects" class="nav-link">פרויקטים</a></li>
            <li><a href="#contact" class="nav-link">צור קשר</a></li>
        </ul>
        <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="תפריט">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <div class="logo">
            <img id="siteLogo" src="" alt="לוגו" style="max-height: 60px; max-width: 200px; height: auto; display: none;">
            <span class="logo-text" id="siteTitle">שם האתר</span>
        </div>
    </nav>
</header>

<!-- JavaScript -->
<script src="components/headers/modern-rtl/header.js"></script>
```

## ⚙️ אפשרויות התאמה

### צבעים
```css
:root {
    --header-bg: rgba(29, 29, 31, 0.98);
    --header-text: rgba(255, 255, 255, 0.86);
    --header-active: #FFFFFF;
    --header-accent: #007AFF;
}
```

### גובה Header
```css
.nav-container {
    height: 80px; /* שנה לפי הצורך */
}
```

### תפריט
עדכן את הקישורים ב-HTML:
```html
<ul class="nav-menu" id="navMenu">
    <li><a href="#page1" class="nav-link">עמוד 1</a></li>
    <li><a href="#page2" class="nav-link">עמוד 2</a></li>
    <!-- הוסף עוד לפי הצורך -->
</ul>
```

## 📱 Mobile Support
- תפריט המבורגר אוטומטי ב-768px ומטה
- אנימציות חלקות
- תמיכה מלאה במגע

## 🎨 סגנון העיצוב
- **רקע**: Glass effect עם blur
- **טיפוגרפיה**: Heebo (מותאם לעברית)
- **אנימציות**: Smooth transitions
- **נגישות**: ARIA labels מלאים

## 🚀 דוגמה מלאה
ראה את `/examples/modern-rtl-header-example.html` לדוגמה מלאה.