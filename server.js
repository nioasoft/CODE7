const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'"]
        }
    }
}));

// Enable CORS
app.use(cors());

// Enable compression
app.use(compression());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Try to load optional dependencies for file uploads
let multer, sharp;
try {
    multer = require('multer');
    sharp = require('sharp');
} catch (error) {
    console.log('Image upload dependencies not available. File upload will be disabled.');
}

const fs = require('fs').promises;
const path = require('path');

// Ensure uploads directory exists and configure multer only if available
let uploadsDir, upload;
if (multer && sharp) {
    uploadsDir = path.join(__dirname, 'uploads');
    fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

    // Configure multer for memory storage
    upload = multer({ 
        storage: multer.memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed'), false);
            }
        }
    });
}

// Serve uploads directory if it exists
if (uploadsDir) {
    app.use('/uploads', express.static(uploadsDir, {
        maxAge: '7d',
        etag: true
    }));
}

// Serve static files
app.use(express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true
}));

// Cache control for static assets
app.use('/admin', express.static(path.join(__dirname, 'admin'), {
    maxAge: '1h',
    etag: true
}));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.redirect('/admin/');
});

app.get('/admin/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// API endpoint for image upload
app.post('/api/upload-image', (req, res, next) => {
    // Check if upload functionality is available
    if (!upload || !sharp) {
        return res.status(503).json({ 
            success: false, 
            message: 'העלאת תמונות אינה זמינה כרגע' 
        });
    }
    
    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ 
                success: false, 
                message: err.message 
            });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'לא נמצא קובץ תמונה' 
                });
            }

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `image_${timestamp}.webp`;
            const filepath = path.join(uploadsDir, filename);

            // Process image with Sharp: resize, optimize, convert to WebP
            await sharp(req.file.buffer)
                .resize(600, 400, { 
                    fit: 'cover',
                    position: 'center'
                })
                .webp({ 
                    quality: 85,
                    effort: 6
                })
                .toFile(filepath);

            // Return the image URL
            const imageUrl = `/uploads/${filename}`;
            
            res.json({ 
                success: true, 
                imageUrl: imageUrl,
                message: 'התמונה הועלתה בהצלחה'
            });

        } catch (error) {
            console.error('Image upload error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'שגיאה בהעלאת התמונה'
            });
        }
    });
});

// API endpoints for contact form (basic implementation)
app.post('/api/contact', (req, res) => {
    const { name, email, phone, projectType, budget, timeline, description } = req.body;
    
    // Basic validation
    if (!name || !email || !phone || !description) {
        return res.status(400).json({ 
            success: false, 
            message: 'חסרים שדות חובה' 
        });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'כתובת אימייל לא תקינה' 
        });
    }
    
    // In a real application, you would save this to a database
    // For now, we'll just log it and return success
    console.log('New contact form submission:', {
        name,
        email,
        phone,
        projectType,
        budget,
        timeline,
        description,
        timestamp: new Date().toISOString()
    });
    
    res.json({ 
        success: true, 
        message: 'תודה על פנייתך! נחזור אליך בהקדם.' 
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'שגיאת שרת פנימית' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Website: http://localhost:${PORT}`);
    console.log(`⚙️ Admin Panel: http://localhost:${PORT}/admin`);
});

module.exports = app;