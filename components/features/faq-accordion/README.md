# ❓ FAQ Accordion

אקורדיון שאלות ותשובות מעוצב עם אנימציות חלקות.

## ✨ תכונות
- 🎭 אנימציות פתיחה/סגירה חלקות
- 🔄 ניהול מצב אוטומטי
- 📱 Mobile-friendly design
- 🔍 מנוע חיפוש מובנה
- 🗂️ קטגוריזציה של שאלות
- 🇮🇱 תמיכה מלאה ב-RTL
- ⚡ טעינה דינמית מ-JSON

## 🛠️ התקנה

### 1. העתק הקבצים
```bash
cp -r components/features/faq-accordion your-project/components/
```

### 2. כלול ב-HTML
```html
<!-- CSS -->
<link rel="stylesheet" href="components/features/faq-accordion/faq.css">

<!-- HTML -->
<section class="faq">
    <div class="container">
        <h2 class="section-title">שאלות נפוצות</h2>
        <div class="faq-search">
            <input type="text" placeholder="חפש שאלה..." id="faqSearch">
        </div>
        <div class="faq-list">
            <div class="faq-item">
                <button class="faq-question">
                    <span>כמה זמן לוקח לבנות אתר?</span>
                    <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div class="faq-answer">
                    <p>זמן הפיתוח תלוי במורכבות הפרויקט. אתר תדמית בסיסי יכול להיות מוכן תוך 2-3 שבועות.</p>
                </div>
            </div>
            <!-- עוד שאלות... -->
        </div>
    </div>
</section>

<!-- JavaScript -->
<script src="components/features/faq-accordion/faq.js"></script>
```

## ⚙️ אפשרויות התאמה

### צבעים
```css
:root {
    --faq-bg: #FFFFFF;
    --faq-text: #1D1D1F;
    --faq-text-secondary: #6e6e73;
    --faq-border: #d2d2d7;
    --faq-accent: #007AFF;
    --faq-hover-bg: #F2F2F7;
}
```

### אנימציות
```css
.faq-answer {
    transition: max-height 0.3s ease; /* מהירות פתיחה */
}

.faq-icon {
    transition: transform 0.3s ease; /* מהירות סיבוב */
}
```

### מראה הכפתור
```css
.faq-question {
    padding: 1.5rem 0; /* ריפוד פנימי */
    font-size: 1.125rem; /* גודל טקסט */
    font-weight: 500; /* עובי טקסט */
}
```

### גובה מקסימלי
```css
.faq-item.active .faq-answer {
    max-height: 500px; /* שנה לפי התוכן */
}
```

## 🎨 ווריאציות עיצוב

### עם רקע צבעוני:
```html
<div class="faq-item featured">
    <!-- תוכן השאלה -->
</div>
```

### עם מסגרת:
```html
<div class="faq-item bordered">
    <!-- תוכן השאלה -->
</div>
```

### קומפקטי:
```html
<div class="faq-item compact">
    <!-- תוכן השאלה -->
</div>
```

## 🔍 חיפוש ופילוטר

### עם חיפוש:
```html
<div class="faq-search">
    <input type="text" placeholder="חפש שאלה..." id="faqSearch">
    <svg class="search-icon" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="M21 21l-4.35-4.35"></path>
    </svg>
</div>
```

### עם קטגוריות:
```html
<div class="faq-categories">
    <button class="category-btn active" data-category="all">הכל</button>
    <button class="category-btn" data-category="pricing">תמחור</button>
    <button class="category-btn" data-category="technical">טכני</button>
</div>
```

## 📱 Mobile Support
- אנימציות מותאמות למובייל
- מגע ידידותי
- גדלי טקסט responsive

## 🚀 JavaScript Features
- פתיחה/סגירה של פריטים בודדים
- חיפוש בזמן אמת
- סינון לפי קטגוריות
- אוטומטיק scroll לפריט פתוח
- זיכרון מצב (localStorage)

## 📋 JSON Structure
```json
{
  "faq": [
    {
      "id": 1,
      "question": "כמה זמן לוקח לבנות אתר?",
      "answer": "זמן הפיתוח תלוי במורכבות הפרויקט...",
      "category": "general",
      "featured": false,
      "keywords": ["זמן", "בניית אתר", "פיתוח"]
    }
  ]
}
```

## 🎯 התנהגויות

### פתיחת פריט יחיד:
רק שאלה אחת פתוחה בכל פעם

### פתיחת מספר פריטים:
מספר שאלות יכולות להיות פתוחות

### אוטומטיק קפיצה:
גלילה אוטומטית לשאלה שנפתחה

## 💡 טיפים לשימוש
- שמור שאלות קצרות ולעניין
- השתמש במילות מפתח לחיפוש
- ארגן בקטגוריות הגיוניות
- בדוק נגישות עם מקלדת

## 🎯 דוגמאות שימוש
- אתרי עסקים
- דפי מוצר
- מרכזי תמיכה
- אתרי שירותים