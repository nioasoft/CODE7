const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || process.env.NODEJS_PORT || 5000;

// Admin credentials (in production, use environment variables and proper hashing)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Session storage (in production, use Redis or database)
const sessions = new Map();

// Security middleware - CSP disabled temporarily for Cloudinary testing
app.use(helmet({
    contentSecurityPolicy: false
}));

// Enable CORS
app.use(cors());

// Enable compression
app.use(compression());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
function generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
}

function createSession(userId) {
    const sessionId = generateSessionId();
    const session = {
        id: sessionId,
        userId,
        createdAt: new Date(),
        lastActivity: new Date()
    };
    sessions.set(sessionId, session);
    return sessionId;
}

function validateSession(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return null;
    
    // Check if session expired (24 hours)
    const now = new Date();
    const sessionAge = now - session.lastActivity;
    if (sessionAge > 24 * 60 * 60 * 1000) {
        sessions.delete(sessionId);
        return null;
    }
    
    // Update last activity
    session.lastActivity = now;
    return session;
}

function requireAuth(req, res, next) {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    const session = validateSession(sessionId);
    
    if (!session) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }
    
    req.session = session;
    next();
}

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

// Authentication endpoints
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'חסרים פרטי התחברות' 
        });
    }
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const sessionId = createSession('admin');
        
        res.json({ 
            success: true, 
            sessionId,
            message: 'התחברות בוצעה בהצלחה' 
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'שם משתמש או סיסמה שגויים' 
        });
    }
});

app.post('/admin/logout', requireAuth, (req, res) => {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    if (sessionId) {
        sessions.delete(sessionId);
    }
    
    res.json({ 
        success: true, 
        message: 'התנתקות בוצעה בהצלחה' 
    });
});

app.get('/admin/auth/verify', (req, res) => {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    const session = validateSession(sessionId);
    
    if (session) {
        res.json({ 
            success: true, 
            authenticated: true 
        });
    } else {
        res.status(401).json({ 
            success: false, 
            authenticated: false 
        });
    }
});

// Services endpoints
app.post('/admin/services', requireAuth, async (req, res) => {
    try {
        const serviceData = req.body;
        
        if (!serviceData.name || !serviceData.description) {
            return res.status(400).json({ 
                success: false, 
                message: 'חסרים שדות חובה' 
            });
        }
        
        const dataPath = path.join(__dirname, 'data', 'siteData.json');
        const siteData = JSON.parse(await fs.readFile(dataPath, 'utf8'));
        
        if (!siteData.services) {
            siteData.services = [];
        }
        
        // Add new service
        const newService = {
            id: Date.now(),
            name: serviceData.name,
            description: serviceData.description,
            icon: serviceData.icon || 'default',
            active: true,
            order: siteData.services.length,
            ...serviceData
        };
        
        siteData.services.push(newService);
        
        await fs.writeFile(dataPath, JSON.stringify(siteData, null, 2));
        
        res.json({ 
            success: true, 
            service: newService,
            message: 'השירות נוסף בהצלחה' 
        });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ 
            success: false, 
            message: 'שגיאה בהוספת השירות' 
        });
    }
});

app.put('/admin/services/:id', requireAuth, async (req, res) => {
    try {
        const serviceId = parseInt(req.params.id);
        const serviceData = req.body;
        
        const dataPath = path.join(__dirname, 'data', 'siteData.json');
        const siteData = JSON.parse(await fs.readFile(dataPath, 'utf8'));
        
        const serviceIndex = siteData.services?.findIndex(s => s.id === serviceId);
        if (serviceIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'השירות לא נמצא' 
            });
        }
        
        siteData.services[serviceIndex] = { ...siteData.services[serviceIndex], ...serviceData };
        
        await fs.writeFile(dataPath, JSON.stringify(siteData, null, 2));
        
        res.json({ 
            success: true, 
            service: siteData.services[serviceIndex],
            message: 'השירות עודכן בהצלחה' 
        });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ 
            success: false, 
            message: 'שגיאה בעדכון השירות' 
        });
    }
});

app.delete('/admin/services/:id', requireAuth, async (req, res) => {
    try {
        const serviceId = parseInt(req.params.id);
        
        const dataPath = path.join(__dirname, 'data', 'siteData.json');
        const siteData = JSON.parse(await fs.readFile(dataPath, 'utf8'));
        
        const originalLength = siteData.services?.length || 0;
        siteData.services = siteData.services?.filter(s => s.id !== serviceId) || [];
        
        if (siteData.services.length === originalLength) {
            return res.status(404).json({ 
                success: false, 
                message: 'השירות לא נמצא' 
            });
        }
        
        await fs.writeFile(dataPath, JSON.stringify(siteData, null, 2));
        
        res.json({ 
            success: true, 
            message: 'השירות נמחק בהצלחה' 
        });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ 
            success: false, 
            message: 'שגיאה במחיקת השירות' 
        });
    }
});

// Projects endpoints
app.delete('/admin/projects/:id', requireAuth, async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        
        const dataPath = path.join(__dirname, 'data', 'siteData.json');
        const siteData = JSON.parse(await fs.readFile(dataPath, 'utf8'));
        
        const originalLength = siteData.projects?.length || 0;
        siteData.projects = siteData.projects?.filter(p => p.id !== projectId) || [];
        
        if (siteData.projects.length === originalLength) {
            return res.status(404).json({ 
                success: false, 
                message: 'הפרויקט לא נמצא' 
            });
        }
        
        await fs.writeFile(dataPath, JSON.stringify(siteData, null, 2));
        
        res.json({ 
            success: true, 
            message: 'הפרויקט נמחק בהצלחה' 
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ 
            success: false, 
            message: 'שגיאה במחיקת הפרויקט' 
        });
    }
});

// Contact submissions endpoints
app.patch('/admin/submissions/:id', requireAuth, async (req, res) => {
    try {
        const submissionId = parseInt(req.params.id);
        const { status } = req.body;
        
        if (!status || !['new', 'read', 'replied'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'סטטוס לא תקין' 
            });
        }
        
        const dataPath = path.join(__dirname, 'data', 'siteData.json');
        const siteData = JSON.parse(await fs.readFile(dataPath, 'utf8'));
        
        const submission = siteData.contact?.submissions?.find(s => s.id === submissionId);
        if (!submission) {
            return res.status(404).json({ 
                success: false, 
                message: 'הפנייה לא נמצאה' 
            });
        }
        
        submission.status = status;
        
        await fs.writeFile(dataPath, JSON.stringify(siteData, null, 2));
        
        res.json({ 
            success: true, 
            submission,
            message: 'הסטטוס עודכן בהצלחה' 
        });
    } catch (error) {
        console.error('Error updating submission:', error);
        res.status(500).json({ 
            success: false, 
            message: 'שגיאה בעדכון הסטטוס' 
        });
    }
});

app.delete('/admin/submissions/:id', requireAuth, async (req, res) => {
    try {
        const submissionId = parseInt(req.params.id);
        
        const dataPath = path.join(__dirname, 'data', 'siteData.json');
        const siteData = JSON.parse(await fs.readFile(dataPath, 'utf8'));
        
        if (!siteData.contact?.submissions) {
            return res.status(404).json({ 
                success: false, 
                message: 'הפנייה לא נמצאה' 
            });
        }
        
        const originalLength = siteData.contact.submissions.length;
        siteData.contact.submissions = siteData.contact.submissions.filter(s => s.id !== submissionId);
        
        if (siteData.contact.submissions.length === originalLength) {
            return res.status(404).json({ 
                success: false, 
                message: 'הפנייה לא נמצאה' 
            });
        }
        
        await fs.writeFile(dataPath, JSON.stringify(siteData, null, 2));
        
        res.json({ 
            success: true, 
            message: 'הפנייה נמחקה בהצלחה' 
        });
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ 
            success: false, 
            message: 'שגיאה במחיקת הפנייה' 
        });
    }
});

// Settings endpoint
app.post('/admin/settings', requireAuth, async (req, res) => {
    try {
        const settingsData = req.body;
        
        const dataPath = path.join(__dirname, 'data', 'siteData.json');
        const siteData = JSON.parse(await fs.readFile(dataPath, 'utf8'));
        
        siteData.settings = { ...siteData.settings, ...settingsData };
        
        await fs.writeFile(dataPath, JSON.stringify(siteData, null, 2));
        
        res.json({ 
            success: true, 
            settings: siteData.settings,
            message: 'ההגדרות נשמרו בהצלחה' 
        });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'שגיאה בשמירת ההגדרות' 
        });
    }
});

// Image upload endpoint
app.post('/upload-image', (req, res, next) => {
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

// Contact form endpoint
app.post('/contact', (req, res) => {
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
    
    try {
        // Save contact form submission to site data
        const dataPath = path.join(__dirname, 'data', 'siteData.json');
        const siteData = JSON.parse(await fs.readFile(dataPath, 'utf8'));
        
        // Initialize contact submissions if not exists
        if (!siteData.contact) {
            siteData.contact = { fields: [], submissions: [] };
        }
        if (!siteData.contact.submissions) {
            siteData.contact.submissions = [];
        }
        
        // Create new submission
        const newSubmission = {
            id: Date.now(),
            name,
            email,
            phone,
            projectType,
            budget,
            timeline,
            description,
            timestamp: new Date().toISOString(),
            status: 'new' // new, read, replied
        };
        
        // Add to submissions array
        siteData.contact.submissions.unshift(newSubmission); // Add to beginning
        
        // Keep only last 100 submissions
        if (siteData.contact.submissions.length > 100) {
            siteData.contact.submissions = siteData.contact.submissions.slice(0, 100);
        }
        
        // Save back to file
        await fs.writeFile(dataPath, JSON.stringify(siteData, null, 2));
        
        // Contact form submission processed successfully
        
        res.json({ 
            success: true, 
            message: 'תודה על פנייתך! נחזור אליך בהקדם.' 
        });
    } catch (error) {
        console.error('Error saving contact submission:', error);
        res.json({ 
            success: true, 
            message: 'תודה על פנייתך! נחזור אליך בהקדם.' 
        });
    }
});

// Site data endpoint
app.get('/site-data', async (req, res) => {
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

// Site data update endpoint
app.post('/site-data', async (req, res) => {
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
        
        // Preparing to save data to file
        
        // Check if directory exists and is writable
        try {
            await fs.access(path.dirname(dataPath), fsSync.constants.W_OK);
        } catch (accessError) {
            console.error('Directory not writable:', accessError);
            // Try to create directory
            await fs.mkdir(path.dirname(dataPath), { recursive: true });
        }
        
        // Write data to file with explicit encoding and mode
        await fs.writeFile(dataPath, JSON.stringify(updatedData, null, 2), {
            encoding: 'utf8',
            mode: 0o644
        });
        
        // Verify write was successful
        const savedData = await fs.readFile(dataPath, 'utf8');
        const parsedData = JSON.parse(savedData);
        
        // Data saved successfully to file
        
        res.json({ 
            success: true, 
            message: 'הנתונים נשמרו בהצלחה' 
        });
    } catch (error) {
        console.error('Error saving site data:', error);
        console.error('Error details:', error.message, error.code);
        res.status(500).json({ 
            success: false, 
            message: 'שגיאה בשמירת הנתונים: ' + error.message
        });
    }
});

// Alternative update endpoint for specific data
app.post('/update-project', async (req, res) => {
    try {
        const { projectId, projectData } = req.body;
        
        if (!projectId || !projectData) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing project data' 
            });
        }
        
        // Read current data
        const dataPath = path.join(__dirname, 'data', 'siteData.json');
        const currentData = JSON.parse(await fs.readFile(dataPath, 'utf8'));
        
        // Update specific project
        const projectIndex = currentData.projects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
            currentData.projects[projectIndex] = projectData;
        }
        
        // Save back
        await fs.writeFile(dataPath, JSON.stringify(currentData, null, 2));
        
        res.json({ 
            success: true, 
            message: 'Project updated successfully' 
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
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