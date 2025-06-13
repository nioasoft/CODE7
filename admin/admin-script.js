// Admin Panel JavaScript

// Check authentication
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const currentPage = window.location.pathname;
    
    if (!isLoggedIn && !currentPage.includes('index.html')) {
        window.location.href = 'index.html';
    } else if (isLoggedIn && currentPage.includes('index.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Initialize dashboard
    if (document.querySelector('.admin-page')) {
        initializeDashboard();
    }
});

// Login handler
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const errorMessage = document.getElementById('errorMessage');
    
    // Simple authentication (in real app, this would be server-side)
    if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        if (remember) {
            localStorage.setItem('rememberAdmin', 'true');
        }
        
        // Set session timeout (30 minutes)
        const timeout = new Date().getTime() + (30 * 60 * 1000);
        localStorage.setItem('adminTimeout', timeout);
        
        window.location.href = 'dashboard.html';
    } else {
        errorMessage.textContent = 'שם משתמש או סיסמה שגויים';
        errorMessage.classList.add('show');
    }
}

// Initialize Dashboard
function initializeDashboard() {
    // Check session timeout
    checkSessionTimeout();
    
    // Initialize components
    initializeSidebar();
    initializeUserMenu();
    initializePreview();
    initializeSectionNavigation();
    initializeContentEditors();
    initializeNotifications();
    
    // Load initial data
    loadDashboardData();
}

// Session timeout check
function checkSessionTimeout() {
    const timeout = localStorage.getItem('adminTimeout');
    if (timeout) {
        const now = new Date().getTime();
        if (now > parseInt(timeout)) {
            logout();
        } else {
            // Reset timeout on activity
            document.addEventListener('click', resetTimeout);
            document.addEventListener('keypress', resetTimeout);
        }
    }
}

function resetTimeout() {
    const timeout = new Date().getTime() + (30 * 60 * 1000);
    localStorage.setItem('adminTimeout', timeout);
}

// Sidebar functionality
function initializeSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('adminSidebar');
    
    menuToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
    
    // Handle navigation clicks
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', handleNavigation);
    });
    
    // Handle action cards
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

// User menu
function initializeUserMenu() {
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    
    userMenuToggle?.addEventListener('click', () => {
        userDropdown.classList.toggle('show');
    });
    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            userDropdown?.classList.remove('show');
        }
    });
    
    logoutBtn?.addEventListener('click', logout);
}

// Logout function
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminTimeout');
    window.location.href = 'index.html';
}

// Navigation handler
function handleNavigation(e) {
    e.preventDefault();
    const section = this.getAttribute('data-section');
    showSection(section);
}

// Show section
function showSection(sectionId) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Show active section
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Close mobile sidebar
    document.getElementById('adminSidebar')?.classList.remove('show');
}

// Initialize section navigation
function initializeSectionNavigation() {
    // Get initial section from hash or default to dashboard
    const initialSection = window.location.hash.substring(1) || 'dashboard';
    showSection(initialSection);
}

// Preview functionality
function initializePreview() {
    const previewToggle = document.getElementById('previewToggle');
    const previewPanel = document.getElementById('previewPanel');
    const closePreview = document.getElementById('closePreview');
    const deviceButtons = document.querySelectorAll('.preview-device');
    
    previewToggle?.addEventListener('click', () => {
        previewPanel.classList.toggle('show');
        updatePreview();
    });
    
    closePreview?.addEventListener('click', () => {
        previewPanel.classList.remove('show');
    });
    
    // Device preview switching
    deviceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            deviceButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const device = this.getAttribute('data-device');
            const iframe = document.getElementById('previewFrame');
            
            if (device === 'mobile') {
                iframe.style.width = '375px';
                iframe.style.margin = '0 auto';
            } else {
                iframe.style.width = '100%';
                iframe.style.margin = '0';
            }
        });
    });
}

// Update preview
function updatePreview() {
    const iframe = document.getElementById('previewFrame');
    if (iframe) {
        iframe.contentWindow.location.reload();
    }
}

// Initialize content editors
function initializeContentEditors() {
    // Hero section
    initializeHeroEditor();
    
    // Services
    initializeServicesManager();
    
    // Projects
    initializeProjectsManager();
    
    // Testimonials
    initializeTestimonialsManager();
    
    // FAQ
    initializeFAQManager();
    
    // Design settings
    initializeDesignSettings();
    
    // Contact form
    initializeContactManager();
    
    // Media
    initializeMediaManager();
    
    // SEO
    initializeSEOSettings();
    
    // Settings
    initializeGeneralSettings();
}

// Hero Editor
function initializeHeroEditor() {
    const heroSave = document.getElementById('heroSave');
    const heroReset = document.getElementById('heroReset');
    
    // Load current hero data
    const heroData = getSiteData().hero || {};
    document.getElementById('heroHeadline').value = heroData.headline || '';
    document.getElementById('heroSubtitle').value = heroData.subtitle || '';
    
    heroSave?.addEventListener('click', () => {
        const data = {
            headline: document.getElementById('heroHeadline').value,
            subtitle: document.getElementById('heroSubtitle').value,
            background: document.querySelector('input[name="heroBackground"]:checked').value,
            animations: document.getElementById('heroAnimations').checked
        };
        
        updateSiteData('hero', data);
        showNotification('הגדרות העמוד הראשי נשמרו בהצלחה', 'success');
        updatePreview();
    });
    
    heroReset?.addEventListener('click', () => {
        if (confirm('האם אתה בטוח שברצונך לאפס את ההגדרות?')) {
            document.getElementById('heroHeadline').value = 'יוצרים עבורך נוכחות דיגיטלית מושלמת';
            document.getElementById('heroSubtitle').value = 'פתרונות מותאמים אישית לאתרים, אפליקציות ומערכות ניהול עסקיות';
            document.querySelector('input[name="heroBackground"][value="gradient"]').checked = true;
            document.getElementById('heroAnimations').checked = true;
        }
    });
}

// Services Manager
function initializeServicesManager() {
    const addService = document.getElementById('addService');
    const servicesList = document.getElementById('servicesList');
    
    // Load services
    loadServices();
    
    addService?.addEventListener('click', () => {
        openServiceModal();
    });
}

// Load services
function loadServices() {
    const servicesList = document.getElementById('servicesList');
    const services = getSiteData().services || [];
    
    servicesList.innerHTML = services.map((service, index) => `
        <div class="service-item" data-id="${service.id}">
            <div class="service-handle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>
            <div class="service-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${getIconSVG(service.icon)}
                </svg>
            </div>
            <div class="service-content">
                <h4>${service.name}</h4>
                <p>${service.description}</p>
            </div>
            <div class="service-actions">
                <button onclick="editService(${service.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button onclick="deleteService(${service.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
                <label class="switch">
                    <input type="checkbox" ${service.active ? 'checked' : ''} onchange="toggleService(${service.id})">
                    <span class="slider"></span>
                </label>
            </div>
        </div>
    `).join('');
    
    // Initialize drag and drop
    initializeSortable(servicesList);
}

// Service modal
function openServiceModal(serviceId = null) {
    const modal = document.getElementById('serviceModal');
    const form = document.getElementById('serviceForm');
    
    if (serviceId) {
        const services = getSiteData().services || [];
        const service = services.find(s => s.id === serviceId);
        if (service) {
            document.getElementById('serviceName').value = service.name;
            document.getElementById('serviceDescription').value = service.description;
            // Set icon selection
        }
    } else {
        form.reset();
    }
    
    modal.classList.add('show');
    
    document.getElementById('saveService').onclick = () => {
        saveService(serviceId);
    };
}

// Save service
function saveService(serviceId) {
    const name = document.getElementById('serviceName').value;
    const description = document.getElementById('serviceDescription').value;
    
    if (!name || !description) {
        showNotification('נא למלא את כל השדות', 'error');
        return;
    }
    
    const services = getSiteData().services || [];
    
    if (serviceId) {
        // Edit existing
        const index = services.findIndex(s => s.id === serviceId);
        if (index !== -1) {
            services[index] = { ...services[index], name, description };
        }
    } else {
        // Add new
        services.push({
            id: Date.now(),
            name,
            description,
            icon: 'default',
            active: true,
            order: services.length
        });
    }
    
    updateSiteData('services', services);
    loadServices();
    closeModal('serviceModal');
    showNotification('השירות נשמר בהצלחה', 'success');
}

// Delete service
function deleteService(serviceId) {
    if (confirm('האם אתה בטוח שברצונך למחוק שירות זה?')) {
        const services = getSiteData().services || [];
        const filtered = services.filter(s => s.id !== serviceId);
        updateSiteData('services', filtered);
        loadServices();
        showNotification('השירות נמחק בהצלחה', 'success');
    }
}

// Toggle service
function toggleService(serviceId) {
    const services = getSiteData().services || [];
    const service = services.find(s => s.id === serviceId);
    if (service) {
        service.active = !service.active;
        updateSiteData('services', services);
        showNotification(`השירות ${service.active ? 'הופעל' : 'הושבת'} בהצלחה`, 'success');
    }
}

// Edit service
function editService(serviceId) {
    openServiceModal(serviceId);
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Initialize sortable
function initializeSortable(container) {
    // Simple drag and drop implementation
    let draggedElement = null;
    
    container.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('service-item')) {
            draggedElement = e.target;
            e.target.classList.add('dragging');
        }
    });
    
    container.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('service-item')) {
            e.target.classList.remove('dragging');
        }
    });
    
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        if (afterElement == null) {
            container.appendChild(draggedElement);
        } else {
            container.insertBefore(draggedElement, afterElement);
        }
    });
}

// Get element after drag position
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.service-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Projects Manager
function initializeProjectsManager() {
    const addProject = document.getElementById('addProject');
    const projectsGrid = document.getElementById('projectsGrid');
    
    // Load projects
    loadProjects();
    
    addProject?.addEventListener('click', () => {
        openProjectModal();
    });
}

// Load projects
function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    const projects = getSiteData().projects || [];
    
    projectsGrid.innerHTML = projects.map(project => `
        <div class="project-item" data-id="${project.id}">
            <div class="project-image">
                ${project.image ? `<img src="${project.image}" alt="${project.name}">` : 'תמונה'}
            </div>
            <div class="project-details">
                <h4>${project.name}</h4>
                <p>${project.description}</p>
                <div class="project-actions">
                    <button class="btn btn-secondary" onclick="editProject(${project.id})">ערוך</button>
                    <button class="btn btn-danger" onclick="deleteProject(${project.id})">מחק</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Similar implementations for other managers...

// Notification system
function initializeNotifications() {
    // Create notifications container if it doesn't exist
    if (!document.getElementById('notifications')) {
        const container = document.createElement('div');
        container.id = 'notifications';
        container.className = 'notifications';
        document.body.appendChild(container);
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${type === 'success' ? '<polyline points="20 6 9 17 4 12"></polyline>' : 
              type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>' :
              '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
        </svg>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Data management
function getSiteData() {
    const data = localStorage.getItem('siteData');
    return data ? JSON.parse(data) : getDefaultSiteData();
}

function updateSiteData(key, value) {
    const data = getSiteData();
    data[key] = value;
    localStorage.setItem('siteData', JSON.stringify(data));
    
    // Update the actual website data
    localStorage.setItem('digitalCraftData', JSON.stringify(data));
}

function getDefaultSiteData() {
    return {
        hero: {
            headline: 'יוצרים עבורך נוכחות דיגיטלית מושלמת',
            subtitle: 'פתרונות מותאמים אישית לאתרים, אפליקציות ומערכות ניהול עסקיות',
            background: 'gradient',
            animations: true
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
        projects: [],
        testimonials: [],
        faq: [],
        contact: {
            fields: [],
            submissions: []
        },
        design: {
            colors: {
                primary: '#007AFF',
                dark: '#1D1D1F',
                light: '#F2F2F7'
            },
            typography: {
                fontFamily: 'Heebo',
                sizes: {
                    h1: 48,
                    h2: 36,
                    body: 16
                }
            },
            layout: {
                sectionOrder: ['hero', 'services', 'projects', 'testimonials', 'contact', 'faq'],
                sectionVisibility: {
                    hero: true,
                    services: true,
                    projects: true,
                    testimonials: true,
                    contact: true,
                    faq: true
                }
            }
        },
        seo: {
            title: 'Digital Craft - יוצרים עבורך נוכחות דיגיטלית מושלמת',
            description: 'Digital Craft - פתרונות מותאמים אישית לאתרים, אפליקציות ומערכות ניהול עסקיות.',
            keywords: ''
        },
        settings: {
            businessName: 'Digital Craft',
            phone: '055-2882839',
            email: 'benatia.asaf@gmail.com',
            social: {
                facebook: '',
                instagram: '',
                linkedin: ''
            }
        }
    };
}

// Load dashboard data
function loadDashboardData() {
    // Simulate loading stats
    const stats = {
        pageViews: Math.floor(Math.random() * 2000) + 1000,
        messages: Math.floor(Math.random() * 50) + 10,
        lastUpdate: new Date().toLocaleDateString('he-IL'),
        status: 'active'
    };
    
    // Update stats display
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers[0]) statNumbers[0].textContent = stats.pageViews.toLocaleString();
    if (statNumbers[1]) statNumbers[1].textContent = stats.messages;
    if (statNumbers[2]) statNumbers[2].textContent = stats.lastUpdate;
    if (statNumbers[3]) statNumbers[3].textContent = 'פעיל';
}

// Icon helper
function getIconSVG(iconName) {
    const icons = {
        website: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line>',
        mobile: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>',
        system: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>',
        shop: '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
        maintenance: '<circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m-9-9h6m6 0h6"></path>',
        default: '<circle cx="12" cy="12" r="10"></circle>'
    };
    
    return icons[iconName] || icons.default;
}

// Additional initialization functions for other sections...
function initializeTestimonialsManager() {
    // Implementation for testimonials management
}

function initializeFAQManager() {
    // Implementation for FAQ management
}

function initializeDesignSettings() {
    // Implementation for design settings
}

function initializeContactManager() {
    // Implementation for contact form management
}

function initializeMediaManager() {
    // Implementation for media management
}

function initializeSEOSettings() {
    // Implementation for SEO settings
}

function initializeGeneralSettings() {
    // Implementation for general settings
}

// Export functions for global access
window.editService = editService;
window.deleteService = deleteService;
window.toggleService = toggleService;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.closeModal = closeModal;