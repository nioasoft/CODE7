// Admin Data Management System
class AdminDataManager {
    constructor() {
        this.dataKey = 'code7Data';
        this.backupKey = 'code7Backup';
        this.settingsKey = 'code7Settings';
        
        this.initialize();
    }
    
    initialize() {
        // Initialize with default data if none exists
        if (!this.getData()) {
            this.resetToDefaults();
        }
        
        // Setup auto-backup
        this.setupAutoBackup();
    }
    
    // Get all site data
    getData() {
        try {
            const data = localStorage.getItem(this.dataKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading site data:', error);
            return null;
        }
    }
    
    // Set all site data
    setData(data) {
        try {
            localStorage.setItem(this.dataKey, JSON.stringify(data));
            this.triggerDataChange();
            return true;
        } catch (error) {
            console.error('Error saving site data:', error);
            return false;
        }
    }
    
    // Get specific section data
    getSection(section) {
        const data = this.getData();
        return data ? data[section] : null;
    }
    
    // Update specific section
    updateSection(section, sectionData) {
        const data = this.getData() || {};
        data[section] = sectionData;
        return this.setData(data);
    }
    
    // Get default data structure
    getDefaultData() {
        return {
            hero: {
                headline: 'יוצרים עבורך נוכחות דיגיטלית מושלמת',
                subtitle: 'פתרונות מותאמים אישית לאתרים, אפליקציות ומערכות ניהול עסקיות',
                background: 'gradient',
                animations: true,
                ctaButton: {
                    text: 'בואו נתחיל',
                    link: '#contact',
                    visible: false
                }
            },
            services: [
                {
                    id: 1,
                    name: 'בניית אתרי תדמית',
                    description: 'אתרים מקצועיים המציגים את העסק שלכם בצורה המושלמת',
                    icon: 'website',
                    active: true,
                    order: 0
                },
                {
                    id: 2,
                    name: 'פיתוח אפליקציות מותאמות',
                    description: 'אפליקציות ייעודיות לנייד ולאינטרנט הבנויות לפי הצרכים שלכם',
                    icon: 'mobile',
                    active: true,
                    order: 1
                },
                {
                    id: 3,
                    name: 'מערכות ניהול עסקיות',
                    description: 'כלים דיגיטליים לניהול יעיל של העסק והעובדים',
                    icon: 'system',
                    active: true,
                    order: 2
                },
                {
                    id: 4,
                    name: 'חנויות מקוונות',
                    description: 'פלטפורמות מכירה מתקדמות עם מערכות תשלום ומלאי',
                    icon: 'shop',
                    active: true,
                    order: 3
                },
                {
                    id: 5,
                    name: 'אחזקה ושיפור אתרים',
                    description: 'שירותי תחזוקה שוטפת ושדרוגים טכנולוגיים',
                    icon: 'maintenance',
                    active: true,
                    order: 4
                }
            ],
            projects: [
                {
                    id: 1,
                    name: 'אתר תדמית עורך דין',
                    description: 'עיצוב מינימליסטי ומקצועי המעביר אמינות ויוקרה',
                    type: 'website',
                    image: null,
                    url: null,
                    featured: false,
                    active: true,
                    order: 0
                },
                {
                    id: 2,
                    name: 'אתר חברת ניקיון',
                    description: 'עיצוב נקי ומזמין המדגיש אמינות ומקצועיות',
                    type: 'website',
                    image: null,
                    url: null,
                    featured: false,
                    active: true,
                    order: 1
                },
                {
                    id: 3,
                    name: 'אפליקציית ניהול מלצרים וטיפים',
                    description: 'מערכת ניהול מתקדמת לחלוקת משמרות וטיפים',
                    type: 'app',
                    image: null,
                    url: null,
                    featured: true,
                    active: true,
                    order: 2
                },
                {
                    id: 4,
                    name: 'אפליקציית חימום מספרי WhatsApp',
                    description: 'כלי אוטומטי לחימום מספרי WhatsApp עסקיים',
                    type: 'app',
                    image: null,
                    url: null,
                    featured: false,
                    active: true,
                    order: 3
                },
                {
                    id: 5,
                    name: 'אפליקציית ניהול קבוצות WhatsApp',
                    description: 'פלטפורמה לניהול יעיל של קבוצות WhatsApp מרובות',
                    type: 'app',
                    image: null,
                    url: null,
                    featured: false,
                    active: true,
                    order: 4
                },
                {
                    id: 6,
                    name: 'מערכת ניהול מלאי לחנות קטנה',
                    description: 'פתרון דיגיטלי לניהול מלאי והזמנות',
                    type: 'system',
                    image: null,
                    url: null,
                    featured: false,
                    active: true,
                    order: 5
                },
                {
                    id: 7,
                    name: 'אתר תדמית סטודיו צילום',
                    description: 'גלריה מתקדמת להצגת עבודות צילום',
                    type: 'website',
                    image: null,
                    url: null,
                    featured: false,
                    active: true,
                    order: 6
                },
                {
                    id: 8,
                    name: 'אפליקציית ניהול תורים למספרה',
                    description: 'מערכת הזמנת תורים חכמה עם התראות אוטומטיות',
                    type: 'app',
                    image: null,
                    url: null,
                    featured: false,
                    active: true,
                    order: 7
                }
            ],
            testimonials: [
                {
                    id: 1,
                    clientName: 'שרה כהן',
                    clientTitle: 'עורכת דין',
                    content: 'אסף בנה לי אתר מקצועי שהעלה את מספר הלקוחות שלי ב-40%. שירות מעולה ותמיכה מלאה.',
                    rating: 5,
                    photo: null,
                    active: true,
                    order: 0
                },
                {
                    id: 2,
                    clientName: 'דני לוי',
                    clientTitle: 'בעל חנות ספרים',
                    content: 'החנות המקוונת שבנה עבורי פשוט מושלמת. קל לניהול והכנסות גדלו משמעותית.',
                    rating: 5,
                    photo: null,
                    active: true,
                    order: 1
                },
                {
                    id: 3,
                    clientName: 'מיכל אברהם',
                    clientTitle: 'בעלת מספרה',
                    content: 'אפליקציית התורים חסכה לי שעות עבודה בשבוע. הלקוחות מאוד מרוצים.',
                    rating: 5,
                    photo: null,
                    active: true,
                    order: 2
                },
                {
                    id: 4,
                    clientName: 'יוסי גרין',
                    clientTitle: 'חברת ניקיון',
                    content: 'האתר נראה יוקרתי ומקצועי. קיבלתי הרבה לקוחות חדשים דרכו.',
                    rating: 5,
                    photo: null,
                    active: true,
                    order: 3
                }
            ],
            faq: [
                {
                    id: 1,
                    question: 'כמה זמן לוקח לבנות אתר?',
                    answer: 'תלוי בסוג ומורכבות הפרויקט. אתר תדמית בסיסי - 1-2 שבועות, אתר מתקדם עם תכונות מיוחדות - 3-6 שבועות, אפליקציות מותאמות - 4-12 שבועות.',
                    category: 'general',
                    active: true,
                    order: 0
                },
                {
                    id: 2,
                    question: 'מה ההבדל בין אתר תדמית לחנות מקוונת?',
                    answer: 'אתר תדמית מציג את העסק ושירותיו ללא מכירה ישירה. חנות מקוונת כוללת מערכת תשלומים, עגלת קניות, ניהול מלאי ויכולות מכירה מלאות.',
                    category: 'services',
                    active: true,
                    order: 1
                },
                {
                    id: 3,
                    question: 'האם אתם מספקים אחזקה שוטפת?',
                    answer: 'כן, אנו מציעים חבילות אחזקה החל מ-200₪ לחודש הכוללות עדכוני אבטחה, גיבויים, מעקב ביצועים ותמיכה טכנית.',
                    category: 'maintenance',
                    active: true,
                    order: 2
                },
                {
                    id: 4,
                    question: 'איך המחיר נקבע?',
                    answer: 'המחיר נקבע לפי היקף הפרויקט, מספר עמודים, תכונות מיוחדות ומורכבות העיצוב. נעריך הצעת מחיר בחינם לאחר הגדרת הדרישות.',
                    category: 'pricing',
                    active: true,
                    order: 3
                },
                {
                    id: 5,
                    question: 'האם האתר יהיה מותאם לנייד?',
                    answer: 'בהחלט! כל האתרים שאנו בונים מותאמים מלא לכל המכשירים - נייד, טאבלט ומחשב. זה תקן בכל הפרויקטים שלנו.',
                    category: 'technical',
                    active: true,
                    order: 4
                }
            ],
            contact: {
                form: {
                    fields: [
                        { id: 'name', type: 'text', label: 'שם מלא', required: true, placeholder: 'הזן שם מלא' },
                        { id: 'email', type: 'email', label: 'אימייל', required: true, placeholder: 'example@email.com' },
                        { id: 'phone', type: 'tel', label: 'טלפון', required: true, placeholder: '050-1234567' },
                        { id: 'projectType', type: 'select', label: 'סוג הפרויקט', required: true, options: [
                            'אתר תדמית',
                            'חנות מקוונת',
                            'אפליקציה מותאמת',
                            'מערכת ניהול',
                            'שיפור אתר קיים'
                        ]},
                        { id: 'budget', type: 'select', label: 'תקציב משוער', required: true, options: [
                            '2,000-5,000 ₪',
                            '5,000-10,000 ₪',
                            '10,000-20,000 ₪',
                            '20,000+ ₪'
                        ]},
                        { id: 'timeline', type: 'select', label: 'לוח זמנים רצוי', required: true, options: [
                            'דחוף (עד שבועיים)',
                            'רגיל (חודש)',
                            'גמיש (חודש-שלושה)'
                        ]},
                        { id: 'description', type: 'textarea', label: 'תיאור הפרויקט', required: true, placeholder: 'תאר את הפרויקט שלך...' }
                    ]
                },
                submissions: []
            },
            design: {
                colors: {
                    primary: '#007AFF',
                    secondary: '#5856D6',
                    dark: '#1D1D1F',
                    gray: '#2C2C2E',
                    light: '#F2F2F7',
                    white: '#FFFFFF',
                    success: '#34C759',
                    warning: '#FF9500',
                    danger: '#FF3B30'
                },
                typography: {
                    fontFamily: 'Heebo',
                    sizes: {
                        h1: 48,
                        h2: 36,
                        h3: 24,
                        body: 16,
                        small: 14
                    },
                    weights: {
                        light: 300,
                        normal: 400,
                        medium: 500,
                        bold: 700,
                        black: 900
                    }
                },
                layout: {
                    maxWidth: 1200,
                    sectionPadding: 80,
                    sectionOrder: ['hero', 'services', 'projects', 'testimonials', 'contact', 'faq'],
                    sectionVisibility: {
                        hero: true,
                        services: true,
                        projects: true,
                        testimonials: true,
                        contact: true,
                        faq: true
                    },
                    animations: true
                }
            },
            seo: {
                title: 'CODE7 - יוצרים עבורך נוכחות דיגיטלית מושלמת',
                description: 'CODE7 - פתרונות מותאמים אישית לאתרים, אפליקציות ומערכות ניהול עסקיות. בניית אתרי תדמית, פיתוח אפליקציות וחנויות מקוונות.',
                keywords: 'בניית אתרים, פיתוח אפליקציות, עיצוב אתרים, חנויות מקוונות, מערכות ניהול, CODE7',
                author: 'CODE7',
                language: 'he',
                robots: 'index, follow',
                openGraph: {
                    title: 'CODE7 - יוצרים עבורך נוכחות דיגיטלית מושלמת',
                    description: 'פתרונות מותאמים אישית לאתרים, אפליקציות ומערכות ניהול עסקיות',
                    image: null,
                    url: ''
                }
            },
            settings: {
                business: {
                    name: 'CODE7',
                    phone: '055-2882839',
                    email: 'benatia.asaf@gmail.com',
                    address: '',
                    website: '',
                    logo: null
                },
                social: {
                    facebook: '',
                    instagram: '',
                    linkedin: '',
                    twitter: '',
                    youtube: ''
                },
                features: {
                    maintenance: false,
                    analytics: true,
                    cache: true,
                    compression: true
                },
                backup: {
                    auto: true,
                    frequency: 'daily',
                    retention: 30
                }
            },
            media: {
                images: [],
                files: [],
                storage: {
                    used: 0,
                    limit: 100 * 1024 * 1024 // 100MB
                }
            },
            analytics: {
                visits: this.generateMockAnalytics(),
                conversions: {
                    contactForm: 0,
                    phoneClicks: 0,
                    emailClicks: 0
                },
                topPages: [
                    { page: 'דף הבית', visits: 1234 },
                    { page: 'שירותים', visits: 567 },
                    { page: 'פרויקטים', visits: 432 },
                    { page: 'צור קשר', visits: 234 }
                ]
            }
        };
    }
    
    // Generate mock analytics data
    generateMockAnalytics() {
        const visits = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            visits.push({
                date: date.toISOString().split('T')[0],
                visits: Math.floor(Math.random() * 100) + 20,
                uniqueVisitors: Math.floor(Math.random() * 80) + 15,
                pageViews: Math.floor(Math.random() * 150) + 30
            });
        }
        
        return visits;
    }
    
    // Reset to default data
    resetToDefaults() {
        return this.setData(this.getDefaultData());
    }
    
    // Backup current data
    createBackup() {
        const currentData = this.getData();
        if (currentData) {
            const backup = {
                data: currentData,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            
            try {
                localStorage.setItem(this.backupKey, JSON.stringify(backup));
                return true;
            } catch (error) {
                // Error creating backup
                return false;
            }
        }
        return false;
    }
    
    // Restore from backup
    restoreFromBackup() {
        try {
            const backup = localStorage.getItem(this.backupKey);
            if (backup) {
                const backupData = JSON.parse(backup);
                return this.setData(backupData.data);
            }
        } catch (error) {
            // Error restoring backup
        }
        return false;
    }
    
    // Export data as JSON
    exportData() {
        const data = this.getData();
        if (data) {
            const exportData = {
                data,
                exportDate: new Date().toISOString(),
                version: '1.0',
                site: 'CODE7'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `code7-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            return true;
        }
        return false;
    }
    
    // Import data from JSON
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // Validate import data structure
                    if (this.validateImportData(importData)) {
                        const success = this.setData(importData.data);
                        resolve(success);
                    } else {
                        reject(new Error('Invalid import data format'));
                    }
                } catch (error) {
                    reject(new Error('Error parsing import file: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error reading import file'));
            };
            
            reader.readAsText(file);
        });
    }
    
    // Validate import data structure
    validateImportData(importData) {
        if (!importData || typeof importData !== 'object') return false;
        if (!importData.data || typeof importData.data !== 'object') return false;
        
        // Check for required sections
        const requiredSections = ['hero', 'services', 'projects', 'design', 'settings'];
        return requiredSections.every(section => importData.data.hasOwnProperty(section));
    }
    
    // Setup automatic backup
    setupAutoBackup() {
        // Create backup every time data changes
        this.onDataChange(() => {
            this.createBackup();
        });
        
        // Clean old backups (keep last 10)
        this.cleanOldBackups();
    }
    
    // Clean old backups
    cleanOldBackups() {
        try {
            const keys = Object.keys(localStorage);
            const backupKeys = keys.filter(key => key.startsWith(this.backupKey + '_'));
            
            if (backupKeys.length > 10) {
                // Sort by timestamp and remove oldest
                backupKeys.sort();
                const toRemove = backupKeys.slice(0, backupKeys.length - 10);
                toRemove.forEach(key => localStorage.removeItem(key));
            }
        } catch (error) {
            // Error cleaning old backups
        }
    }
    
    // Data change event system
    onDataChange(callback) {
        if (!this.dataChangeCallbacks) {
            this.dataChangeCallbacks = [];
        }
        this.dataChangeCallbacks.push(callback);
    }
    
    triggerDataChange() {
        if (this.dataChangeCallbacks) {
            this.dataChangeCallbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    // Error in data change callback
                }
            });
        }
        
        // Trigger storage event for cross-tab communication
        window.dispatchEvent(new StorageEvent('storage', {
            key: this.dataKey,
            newValue: localStorage.getItem(this.dataKey),
            url: window.location.href
        }));
    }
    
    // Statistics and analytics
    getStats() {
        const data = this.getData();
        if (!data) return null;
        
        return {
            services: {
                total: data.services?.length || 0,
                active: data.services?.filter(s => s.active)?.length || 0
            },
            projects: {
                total: data.projects?.length || 0,
                active: data.projects?.filter(p => p.active)?.length || 0,
                featured: data.projects?.filter(p => p.featured)?.length || 0
            },
            testimonials: {
                total: data.testimonials?.length || 0,
                active: data.testimonials?.filter(t => t.active)?.length || 0
            },
            faq: {
                total: data.faq?.length || 0,
                active: data.faq?.filter(f => f.active)?.length || 0
            },
            contact: {
                submissions: data.contact?.submissions?.length || 0,
                unread: data.contact?.submissions?.filter(s => !s.read)?.length || 0
            }
        };
    }
    
    // Search functionality
    search(query, sections = ['services', 'projects', 'testimonials', 'faq']) {
        const data = this.getData();
        if (!data || !query) return [];
        
        const results = [];
        const searchQuery = query.toLowerCase();
        
        sections.forEach(section => {
            if (data[section] && Array.isArray(data[section])) {
                data[section].forEach((item, index) => {
                    const searchableText = Object.values(item)
                        .filter(value => typeof value === 'string')
                        .join(' ')
                        .toLowerCase();
                    
                    if (searchableText.includes(searchQuery)) {
                        results.push({
                            section,
                            index,
                            item,
                            relevance: this.calculateRelevance(searchableText, searchQuery)
                        });
                    }
                });
            }
        });
        
        // Sort by relevance
        return results.sort((a, b) => b.relevance - a.relevance);
    }
    
    calculateRelevance(text, query) {
        const queryWords = query.split(' ');
        let relevance = 0;
        
        queryWords.forEach(word => {
            const count = (text.match(new RegExp(word, 'g')) || []).length;
            relevance += count;
        });
        
        return relevance;
    }
}

// Initialize data manager
const adminData = new AdminDataManager();

// Global functions for backward compatibility
function getSiteData() {
    return adminData.getData();
}

function updateSiteData(section, data) {
    return adminData.updateSection(section, data);
}

function getDefaultSiteData() {
    return adminData.getDefaultData();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDataManager;
}

// Export for global access
window.AdminDataManager = AdminDataManager;
window.adminData = adminData;
window.getSiteData = getSiteData;
window.updateSiteData = updateSiteData;
window.getDefaultSiteData = getDefaultSiteData;