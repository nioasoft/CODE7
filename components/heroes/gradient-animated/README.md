# 🌟 Gradient Animated Hero

Hero section מרשים עם רקע גרדיאנט מונפש ואלמנטים גיאומטריים.

## ✨ תכונות
- 🎨 רקע גרדיאנט כהה מעוצב
- ✨ אלמנטים גיאומטריים מונפשים
- 📱 Responsive מלא
- 🎭 אנימציות parallax
- 🇮🇱 תמיכה מלאה ב-RTL
- ⚡ אופטימיזציה לביצועים

## 🛠️ התקנה

### 1. העתק הקבצים
```bash
cp -r components/heroes/gradient-animated your-project/components/
```

### 2. כלול ב-HTML
```html
<!-- CSS -->
<link rel="stylesheet" href="components/heroes/gradient-animated/hero.css">

<!-- HTML -->
<section class="hero" id="home">
    <div class="hero-content">
        <h1 class="hero-title">הכותרת הראשית שלכם</h1>
        <p class="hero-subtitle">תיאור קצר ומושך על העסק או השירות</p>
        <a href="#contact" class="cta-button">בואו נתחיל</a>
    </div>
    <div class="hero-background">
        <div class="geometric-shape shape-1"></div>
        <div class="geometric-shape shape-2"></div>
        <div class="geometric-shape shape-3"></div>
    </div>
</section>

<!-- JavaScript -->
<script src="components/heroes/gradient-animated/hero.js"></script>
```

## ⚙️ אפשרויות התאמה

### צבעי הגרדיאנט
```css
.hero {
    background: linear-gradient(135deg, #1D1D1F 0%, #2C2C2E 100%);
}
```

### צבעי האלמנטים הגיאומטריים
```css
.shape-1 {
    background: linear-gradient(135deg, #007AFF, #00C7BE);
}

.shape-2 {
    background: linear-gradient(135deg, #FF2D55, #FF6000);
}

.shape-3 {
    background: linear-gradient(135deg, #5856D6, #AF52DE);
}
```

### מהירות האנימציות
```css
.geometric-shape {
    animation: float 20s infinite ease-in-out; /* שנה ל-10s למהירות יותר */
}
```

### גובה Hero
```css
.hero {
    min-height: 100vh; /* או כל גובה אחר */
}
```

## 🎨 סגנון העיצוב
- **רקע**: גרדיאנט כהה עם טקסטורה
- **אנימציות**: floating shapes עם blur effect
- **טיפוגרפיה**: Heebo Bold למקסימום impact
- **כפתור CTA**: עיצוב מודרני עם shadow

## 📱 Mobile Support
- טקסטים מותאמים בגדלים שונים
- אנימציות מופחתות למובייל
- מיקום אלמנטים מותאם

## ⚡ ביצועים
- CSS-only animations לביצועים מיטביים
- GPU acceleration עם transform3d
- אופטימיזציה לסוללה במובייל

## 🚀 דוגמה מלאה
ראה את `/examples/gradient-hero-example.html` לדוגמה מלאה.