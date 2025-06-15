const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || process.env.NODEJS_PORT || 5000;

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
            connectSrc: ["'self'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
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
const fsSync = require('fs');

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

// Serve static files with proper headers
app.use(express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Serve admin static files
app.use('/admin', express.static(path.join(__dirname, 'admin'), {
    maxAge: '1h',
    etag: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Explicit routes for CSS files
app.get('/styles.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/admin/admin-styles.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, 'admin', 'admin-styles.css'));
});

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
            const randomString = Math.random().toString(36).substring(7);
            const filename = `project_${timestamp}_${randomString}.webp`;
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

// API endpoint to get site data
app.get('/api/site-data', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'data', 'siteData.json');
        
        // Create data directory if it doesn't exist
        await fs.mkdir(path.dirname(dataPath), { recursive: true });
        
        // Check if file exists, if not create it with default data
        if (!fsSync.existsSync(dataPath)) {
            const defaultDataPath = path.join(__dirname, 'data', 'siteData.json');
            try {
                const defaultData = JSON.parse(await fs.readFile(defaultDataPath, 'utf8'));
                await fs.writeFile(dataPath, JSON.stringify(defaultData, null, 2));
            } catch (error) {
                console.error('Error reading default data file:', error);
                // If can't read default file, just copy the existing data file
                if (fsSync.existsSync(defaultDataPath)) {
                    await fs.copyFile(defaultDataPath, dataPath);
                }
            }
        }
        
        const data = await fs.readFile(dataPath, 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData);
    } catch (error) {
        console.error('Error reading site data:', error);
        
        // Try to return the original data file as fallback
        try {
            const fallbackPath = path.join(__dirname, 'data', 'siteData.json');
            const fallbackData = await fs.readFile(fallbackPath, 'utf8');
            const jsonData = JSON.parse(fallbackData);
            res.json(jsonData);
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            res.status(500).json({ 
                success: false, 
                message: 'שגיאה בטעינת הנתונים' 
            });
        }
    }
});

// API endpoint to update site data
app.post('/api/site-data', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'data', 'siteData.json');
        const updatedData = req.body;
        
        // Validate data structure
        if (!updatedData || typeof updatedData !== 'object') {
            return res.status(400).json({ 
                success: false, 
                message: 'נתונים לא תקינים' 
            });
        }
        
        // Write data to file
        await fs.writeFile(dataPath, JSON.stringify(updatedData, null, 2));
        
        res.json({ 
            success: true, 
            message: 'הנתונים נשמרו בהצלחה' 
        });
    } catch (error) {
        console.error('Error saving site data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'שגיאה בשמירת הנתונים' 
        });
    }
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