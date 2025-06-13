# Digital Craft - Professional Website

## 🚀 Live Website
**Production:** https://asisoft.herokuapp.com  
**Admin Panel:** https://asisoft.herokuapp.com/admin

## 📋 Project Description
Professional Hebrew website for Digital Craft - a premium web development and app creation company. Features a complete content management system with real-time preview capabilities.

## ✨ Features

### 🌐 Main Website
- **Responsive Design:** Mobile-first approach with Apple-inspired aesthetics
- **RTL Support:** Fully optimized for Hebrew content
- **Modern UI:** Clean, professional interface with smooth animations
- **Contact Form:** Interactive form with validation
- **Portfolio Showcase:** Projects and testimonials display
- **FAQ Section:** Expandable accordion with common questions

### ⚙️ Admin Panel
- **Complete CMS:** Manage all website content
- **Real-time Preview:** See changes instantly
- **Content Management:** Hero, Services, Projects, Testimonials, FAQ
- **Design Customization:** Colors, typography, layout controls
- **Media Management:** File uploads with drag & drop
- **Contact Management:** View and export form submissions
- **SEO Tools:** Meta tags and analytics
- **Data Export/Import:** Backup and restore functionality

## 🔐 Admin Access
- **URL:** `/admin`
- **Username:** `admin`
- **Password:** `admin123`

## 🛠️ Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Styling:** Modern CSS with CSS Grid and Flexbox
- **Fonts:** Google Fonts (Heebo)
- **Storage:** LocalStorage for client-side data persistence
- **Security:** Helmet.js, CORS, Input validation

## 📱 Responsive Breakpoints
- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+

## 🎨 Design System

### Colors
- **Primary:** #007AFF (Apple Blue)
- **Dark:** #1D1D1F (Space Gray)
- **Light:** #F2F2F7 (Light Gray)
- **Success:** #34C759
- **Warning:** #FF9500
- **Danger:** #FF3B30

### Typography
- **Font Family:** Heebo (Google Fonts)
- **Weights:** 300, 400, 500, 700, 900
- **RTL Support:** Full right-to-left text support

## 📂 Project Structure
```
├── index.html              # Main website
├── styles.css              # Main website styles
├── script.js               # Main website functionality
├── admin/                  # Admin panel
│   ├── index.html         # Admin login
│   ├── dashboard.html     # Admin dashboard
│   ├── admin-styles.css   # Admin styling
│   ├── admin-script.js    # Admin functionality
│   ├── components/        # Reusable components
│   └── data/              # Data management
├── server.js              # Express server
├── package.json           # Dependencies
├── Procfile              # Heroku deployment
└── README.md             # Documentation
```

## 🚀 Local Development

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone repository
git clone [repository-url]
cd asisoft

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Points
- **Website:** http://localhost:5000
- **Admin Panel:** http://localhost:5000/admin

## 🌐 Deployment

### Heroku Deployment
```bash
# Login to Heroku
heroku login

# Create app (if not exists)
heroku create asisoft

# Set environment variables (if needed)
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Open app
heroku open
```

## 📊 Performance
- **Lighthouse Score:** 90+ (Performance, Accessibility, Best Practices, SEO)
- **Load Time:** < 3 seconds on 3G
- **File Sizes:** Optimized CSS/JS, compressed images
- **Caching:** Static asset caching enabled

## 🔒 Security Features
- **Content Security Policy (CSP)**
- **CORS Protection**
- **Input Validation and Sanitization**
- **XSS Protection**
- **Secure Headers**

## 🧪 Testing
```bash
# Run tests (when implemented)
npm test

# Health check
curl https://asisoft.herokuapp.com/health
```

## 📈 Analytics & SEO
- **Meta Tags:** Comprehensive SEO optimization
- **Open Graph:** Social media sharing
- **Analytics Ready:** Google Analytics integration ready
- **Sitemap:** Auto-generated sitemap support

## 🛡️ Browser Support
- **Chrome:** 90+
- **Firefox:** 88+
- **Safari:** 14+
- **Edge:** 90+
- **Mobile Browsers:** iOS Safari 14+, Chrome Mobile 90+

## 📝 Content Management
All content is manageable through the admin panel:
- Hero section text and background
- Services (add/edit/delete/reorder)
- Projects portfolio
- Client testimonials
- FAQ questions and answers
- Contact form fields
- Design settings (colors, fonts, layout)
- SEO meta tags

## 🔧 Configuration
Key settings can be modified in:
- `/admin/data/admin-data.js` - Default data structure
- `server.js` - Server configuration
- Environment variables for production settings

## 🆘 Support
For technical support or questions:
- **Email:** benatia.asaf@gmail.com
- **Phone:** 055-2882839

## 📄 License
© 2025 Digital Craft. All rights reserved.

---

**Built with ❤️ by Digital Craft**  
Professional web development and app creation services.