// Admin Panel JavaScript

// Project management functions (must be defined early for hoisting)
async function editProject(projectId) {
    await openProjectModal(projectId);
}

async function deleteProject(projectId) {
    if (confirm('האם אתה בטוח שברצונך למחוק פרויקט זה?')) {
        try {
            const response = await fetch(`/admin/projects/${projectId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const result = await response.json();
            
            if (result.success) {
                loadProjects();
                showNotification(result.message, 'success');
                
                // Update preview if open
                if (window.websitePreview && window.websitePreview.isPreviewOpen) {
                    window.websitePreview.updatePreview();
                }
            } else {
                showNotification(result.message || 'שגיאה במחיקת הפרויקט', 'error');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            showNotification('שגיאה במחיקת הפרויקט', 'error');
        }
    }
}

// Service management functions (must be defined early for hoisting)
function editService(serviceId) {
    openServiceModal(serviceId);
}

async function deleteService(serviceId) {
    if (confirm('האם אתה בטוח שברצונך למחוק שירות זה?')) {
        try {
            const response = await fetch(`/admin/services/${serviceId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const result = await response.json();
            
            if (result.success) {
                loadServices();
                showNotification(result.message, 'success');
            } else {
                showNotification(result.message || 'שגיאה במחיקת השירות', 'error');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            showNotification('שגיאה במחיקת השירות', 'error');
        }
    }
}

async function toggleService(serviceId) {
    const siteData = await getSiteData();
    const services = siteData.services || [];
    const service = services.find(s => s.id === serviceId);
    if (service) {
        service.active = !service.active;
        updateSiteData('services', services);
        showNotification(`השירות ${service.active ? 'הופעל' : 'הושבת'} בהצלחה`, 'success');
    }
}

// Session management
let sessionId = localStorage.getItem('adminSessionId');

function setSessionId(id) {
    sessionId = id;
    if (id) {
        localStorage.setItem('adminSessionId', id);
    } else {
        localStorage.removeItem('adminSessionId');
    }
}

function getAuthHeaders() {
    return sessionId ? { 'x-session-id': sessionId } : {};
}

// Check authentication with server
async function checkAuth() {
    const currentPage = window.location.pathname;
    
    if (!sessionId && !currentPage.includes('index.html')) {
        window.location.href = 'index.html';
        return;
    }
    
    if (sessionId) {
        try {
            const response = await fetch('/admin/auth/verify', {
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.authenticated && currentPage.includes('index.html')) {
                    window.location.href = 'dashboard.html';
                } else if (!result.authenticated && !currentPage.includes('index.html')) {
                    setSessionId(null);
                    window.location.href = 'index.html';
                }
            } else {
                if (!currentPage.includes('index.html')) {
                    setSessionId(null);
                    window.location.href = 'index.html';
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            if (!currentPage.includes('index.html')) {
                setSessionId(null);
                window.location.href = 'index.html';
            }
        }
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
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // Disable submit button during login
    submitButton.disabled = true;
    submitButton.textContent = 'מתחבר...';
    
    try {
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            setSessionId(result.sessionId);
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.textContent = result.message || 'שגיאה בהתחברות';
            errorMessage.classList.add('show');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'שגיאה בהתחברות לשרת';
        errorMessage.classList.add('show');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'התחבר';
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
async function logout() {
    try {
        if (sessionId) {
            await fetch('/admin/logout', {
                method: 'POST',
                headers: getAuthHeaders()
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        setSessionId(null);
        window.location.href = 'index.html';
    }
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
    
    // Save current section to localStorage
    localStorage.setItem('adminCurrentSection', sectionId);
    
    // Update URL hash without triggering scroll
    if (window.history.replaceState) {
        window.history.replaceState({}, '', `#${sectionId}`);
    } else {
        window.location.hash = sectionId;
    }
    
    // Load section-specific data
    loadSectionData(sectionId);
    
    // Close mobile sidebar
    document.getElementById('adminSidebar')?.classList.remove('show');
}

// Load section-specific data
function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'hero':
            loadHero();
            break;
        case 'services':
            loadServices();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'testimonials':
            loadTestimonials();
            break;
        case 'contact':
            initializeContactView();
            break;
        case 'faq':
            loadFAQ();
            break;
        case 'colors':
            loadColors();
            break;
        case 'typography':
            loadTypography();
            break;
    }
}

// Initialize section navigation
function initializeSectionNavigation() {
    // Get section from: 1) hash, 2) localStorage, 3) default to dashboard
    let initialSection = window.location.hash.substring(1);
    
    if (!initialSection) {
        initialSection = localStorage.getItem('adminCurrentSection') || 'dashboard';
    }
    
    // Validate that section exists
    const sectionElement = document.getElementById(initialSection);
    if (!sectionElement) {
        initialSection = 'dashboard';
    }
    
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
async function loadServices() {
    const servicesList = document.getElementById('servicesList');
    const siteData = await getSiteData();
    const services = siteData.services || [];
    
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
                <button data-action="edit-service" data-id="${service.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button data-action="delete-service" data-id="${service.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
                <label class="switch">
                    <input type="checkbox" ${service.active ? 'checked' : ''} data-action="toggle-service" data-id="${service.id}">
                    <span class="slider"></span>
                </label>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to service action buttons
    setTimeout(() => {
        document.querySelectorAll('.service-actions button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const action = this.getAttribute('data-action');
                const serviceId = parseInt(this.getAttribute('data-id'));
                
                if (action === 'edit-service') {
                    editService(serviceId);
                } else if (action === 'delete-service') {
                    deleteService(serviceId);
                }
            });
        });
        
        // Add event listeners to service toggle switches
        document.querySelectorAll('.service-actions input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const serviceId = parseInt(this.getAttribute('data-id'));
                toggleService(serviceId);
            });
        });
    }, 100);
    
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
    
    document.getElementById('saveService').addEventListener('click', () => {
        saveService(serviceId);
    });
    
    document.getElementById('closeServiceModal').addEventListener('click', () => {
        closeModal('serviceModal');
    });
}

// Save service
async function saveService(serviceId) {
    const name = document.getElementById('serviceName').value;
    const description = document.getElementById('serviceDescription').value;
    
    if (!name || !description) {
        showNotification('נא למלא את כל השדות', 'error');
        return;
    }
    
    try {
        const serviceData = { name, description, icon: 'default' };
        let response;
        
        if (serviceId) {
            // Edit existing
            response = await fetch(`/admin/services/${serviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(serviceData)
            });
        } else {
            // Add new
            response = await fetch('/admin/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(serviceData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            loadServices();
            closeModal('serviceModal');
            showNotification(result.message, 'success');
        } else {
            showNotification(result.message || 'שגיאה בשמירת השירות', 'error');
        }
    } catch (error) {
        console.error('Error saving service:', error);
        showNotification('שגיאה בשמירת השירות', 'error');
    }
}


// Close modal
function closeModal(modalId) {
    console.log('closeModal called with:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        console.log('Modal found, hiding it');
        modal.style.display = 'none';
        modal.classList.remove('show');
    } else {
        console.log('Modal not found!');
    }
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
async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    // Get data from server
    const siteData = await getSiteData();
    
    const projects = siteData.projects || [];
    
    projectsGrid.innerHTML = projects.map(project => `
        <div class="project-item" data-id="${project.id}">
            <div class="project-image">
                ${project.image ? `<img src="${project.image}" alt="${project.name}" style="width: 100%; height: 200px; object-fit: cover;">` : '<div style="display: flex; align-items: center; justify-content: center; height: 200px; background: var(--admin-light-gray); color: var(--admin-text-secondary);">תמונה</div>'}
            </div>
            <div class="project-details">
                <h4>${project.name}</h4>
                <p>${project.description}</p>
                <div class="project-actions">
                    <button class="btn btn-secondary" data-action="edit" data-id="${project.id}">ערוך</button>
                    <button class="btn btn-danger" data-action="delete" data-id="${project.id}">מחק</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to project action buttons
    setTimeout(() => {
        document.querySelectorAll('.project-actions button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const action = this.getAttribute('data-action');
                const projectId = parseInt(this.getAttribute('data-id'));
                
                if (action === 'edit') {
                    editProject(projectId);
                } else if (action === 'delete') {
                    deleteProject(projectId);
                }
            });
        });
    }, 100);
}

// Project Modal Functions
async function openProjectModal(projectId = null) {
    // Create project modal if it doesn't exist
    if (!document.getElementById('projectModal')) {
        createProjectModal();
    }
    
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    
    if (projectId) {
        const siteData = await getSiteData();
        const projects = siteData.projects || [];
        const project = projects.find(p => p.id === projectId);
        if (project) {
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectDescription').value = project.description;
            document.getElementById('projectType').value = project.type || 'website';
            document.getElementById('projectUrl').value = project.url || '';
            document.getElementById('projectFeatured').checked = project.featured || false;
            
            // Show current image if exists
            const imagePreview = document.getElementById('projectImagePreview');
            if (project.image) {
                imagePreview.innerHTML = `<img src="${project.image}" style="max-width: 200px; max-height: 150px; object-fit: cover; border-radius: 8px;">`;
                // IMPORTANT: Store the existing image URL in dataset
                imagePreview.dataset.imageData = project.image;
            } else {
                imagePreview.innerHTML = '';
                delete imagePreview.dataset.imageData;
            }
        }
    } else {
        form.reset();
        const imagePreview = document.getElementById('projectImagePreview');
        imagePreview.innerHTML = '';
        delete imagePreview.dataset.imageData;
    }
    
    modal.classList.add('show');
    
    // Store project ID in modal for save button
    modal.dataset.projectId = projectId || '';
    
    // Set save button state based on whether editing or creating new project
    const saveButton = modal.querySelector('[data-action="save-project"]');
    if (projectId) {
        // Editing existing project - enable save button
        saveButton.disabled = false;
        saveButton.textContent = 'שמור';
    } else {
        // Creating new project - disable until image is uploaded
        saveButton.disabled = true;
        saveButton.textContent = 'יש להעלות תמונה תחילה';
    }
}

function createProjectModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'projectModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>הוסף/ערוך פרויקט</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="projectForm">
                    <div class="form-group">
                        <label for="projectName">שם הפרויקט</label>
                        <input type="text" id="projectName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="projectDescription">תיאור</label>
                        <textarea id="projectDescription" class="form-control" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="projectType">סוג הפרויקט</label>
                        <select id="projectType" class="form-control" required>
                            <option value="website">אתר תדמית</option>
                            <option value="ecommerce">חנות מקוונת</option>
                            <option value="app">אפליקציה</option>
                            <option value="system">מערכת ניהול</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="projectUrl">קישור לפרויקט (אופציונלי)</label>
                        <input type="url" id="projectUrl" class="form-control" placeholder="https://example.com">
                    </div>
                    <div class="form-group">
                        <label for="projectImage">תמונה</label>
                        <div class="upload-guidelines">
                            <div class="aspect-ratio-info">
                                <strong>פרופורציה מועדפת: 3:2</strong>
                                <span class="example">(לדוגמה: 600x400, 900x600 פיקסלים)</span>
                            </div>
                            <div class="technical-specs">
                                <span>• איכות גבוהה • JPG/PNG • עד 5MB</span>
                            </div>
                        </div>
                        <input type="file" id="projectImage" class="form-control" accept="image/*">
                        <button type="button" class="btn btn-secondary btn-sm image-editor-btn" data-target="projectImage" style="margin-top: 5px; display: none;">
                            ✂️ ערוך תמונה
                        </button>
                        <div id="projectImagePreview" style="margin-top: 10px;"></div>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="projectFeatured">
                            פרויקט מומלץ (יוצג בבולט)
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">ביטול</button>
                <button class="btn btn-primary" data-action="save-project">שמור</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners for modal buttons
    modal.querySelector('[data-action="close-modal"]').addEventListener('click', () => {
        closeModal('projectModal');
    });
    
    modal.querySelector('[data-action="save-project"]').addEventListener('click', () => {
        const currentProjectId = modal.dataset.projectId ? parseInt(modal.dataset.projectId) : null;
        saveProject(currentProjectId);
    });
    
    
    // Close modal when clicking the X button
    modal.querySelector('.modal-close').addEventListener('click', () => {
        closeModal('projectModal');
    });
    
    // Add image preview functionality with editor integration
    document.getElementById('projectImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Use the image editor validation instead
            if (window.validateImage) {
                window.validateImage(file).then(() => {
                    // Show edit button
                    const editBtn = document.querySelector('[data-target="projectImage"]');
                    if (editBtn) {
                        editBtn.style.display = 'inline-block';
                        editBtn.onclick = function() {
                            const aspectRatio = window.getRecommendedAspectRatio ? window.getRecommendedAspectRatio('projectImage') : '3:2';
                            window.openImageEditor(file, 'projectImage', aspectRatio);
                        };
                    }
                    
                    // Create preview without uploading yet
                    const preview = document.getElementById('projectImagePreview');
                    const imageUrl = URL.createObjectURL(file);
                    preview.innerHTML = `
                        <img src="${imageUrl}" style="max-width: 200px; max-height: 150px; object-fit: cover; border-radius: 8px;">
                        <div style="margin-top: 5px; font-size: 12px; color: #666;">
                            תמונה נבחרה - לחץ "שמור" להעלאה לשרת
                        </div>
                    `;
                    
                    // Store the file temporarily for later upload
                    preview.dataset.pendingFile = 'true';
                    this.dataset.pendingUpload = 'true';
                    
                    showNotification('תמונה נבחרה בהצלחה', 'success');
                    
                }).catch(error => {
                    // Clear the input if validation fails
                    this.value = '';
                    showNotification(error.message, 'error');
                    
                    // Hide edit button
                    const editBtn = document.querySelector('[data-target="projectImage"]');
                    if (editBtn) {
                        editBtn.style.display = 'none';
                    }
                });
            } else {
                // Fallback to old validation if image editor not loaded
                if (!file.type.startsWith('image/')) {
                    showNotification('נא לבחור קובץ תמונה תקין', 'error');
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    showNotification('גודל התמונה לא יכול לעלות על 5MB', 'error');
                    return;
                }
                
                // Upload image to server immediately (old behavior)
                uploadImageToServerForProject(file);
            }
        }
    });
}

// Upload project image specifically
function uploadImageToServerForProject(file) {
    const saveButton = document.querySelector('[data-action="save-project"]');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'מעלה תמונה...';
    }
    
    uploadImageToServer(file, (imageUrl) => {
        const preview = document.getElementById('projectImagePreview');
        preview.innerHTML = `<img src="${imageUrl}" style="max-width: 200px; max-height: 150px; object-fit: cover; border-radius: 8px;">`;
        
        // Store image URL
        preview.dataset.imageData = imageUrl;
        showNotification('התמונה הועלתה בהצלחה', 'success');
        
        // Re-enable save button
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = 'שמור';
        }
    });
}

// Upload image to Cloudinary function
function uploadImageToServer(file, callback) {
    // Cloudinary configuration
    const cloudName = 'dh1ompp1r';
    const uploadPreset = 'code7_upload';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'code7/projects'); // Optional: organize in folders
    
    // Show loading notification
    showNotification('מעלה תמונה ל-Cloudinary...', 'info');
    
    // Uploading image to Cloudinary
    
    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        // Processing Cloudinary response
        return response.json();
    })
    .then(data => {
        // Processing Cloudinary response data
        if (data.secure_url) {
            // Create transformed URL for 600x400 WebP
            const transformedUrl = data.secure_url.replace('/upload/', '/upload/w_600,h_400,c_fill,g_center,q_auto:best,f_webp/');
            // Image uploaded successfully to Cloudinary
            callback(transformedUrl);
            showNotification('התמונה הועלתה בהצלחה', 'success');
        } else {
            console.error('Upload failed:', data.error);
            showNotification(data.error?.message || 'שגיאה בהעלאת התמונה', 'error');
        }
    })
    .catch(error => {
        console.error('Upload error:', error);
        showNotification('שגיאה בהעלאת התמונה: ' + error.message, 'error');
    });
}

// Image resize function (kept for fallback)
function resizeImage(file, maxWidth, maxHeight, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to data URL with compression
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        callback(dataUrl);
    };
    
    img.src = URL.createObjectURL(file);
}

// Save project
async function saveProject(projectId) {
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDescription').value;
    const type = document.getElementById('projectType').value;
    const url = document.getElementById('projectUrl').value;
    const featured = document.getElementById('projectFeatured').checked;
    
    if (!name || !description) {
        showNotification('נא למלא את כל השדות הנדרשים', 'error');
        return;
    }
    
    // Check if there's a pending image upload
    const projectImageInput = document.getElementById('projectImage');
    const preview = document.getElementById('projectImagePreview');
    
    if (projectImageInput.dataset.pendingUpload === 'true' && projectImageInput.files[0]) {
        // Upload the image first
        const saveButton = document.querySelector('[data-action="save-project"]');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.textContent = 'מעלה תמונה...';
        }
        
        return new Promise((resolve) => {
            uploadImageToServer(projectImageInput.files[0], async (imageUrl) => {
                // Clear pending state
                delete projectImageInput.dataset.pendingUpload;
                delete preview.dataset.pendingFile;
                preview.dataset.imageData = imageUrl;
                
                // Now save the project with the uploaded image
                await saveProjectWithImage(projectId, { name, description, type, url, featured }, imageUrl);
                
                if (saveButton) {
                    saveButton.disabled = false;
                    saveButton.textContent = 'שמור';
                }
                resolve();
            });
        });
    } else {
        // No pending upload, save immediately
        const imageData = preview.dataset.imageData || null;
        await saveProjectWithImage(projectId, { name, description, type, url, featured }, imageData);
    }
}

async function saveProjectWithImage(projectId, projectData, imageData) {
    const siteData = await getSiteData();
    const projects = siteData.projects || [];
    // Preparing to save project with image data
    
    if (projectId) {
        // Edit existing
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            projects[index] = { 
                ...projects[index], 
                name: projectData.name, 
                description: projectData.description, 
                type: projectData.type, 
                url: projectData.url, 
                featured: projectData.featured,
                image: imageData || projects[index].image
            };
        }
    } else {
        // Add new
        projects.push({
            id: Date.now(),
            name: projectData.name,
            description: projectData.description,
            type: projectData.type,
            url: projectData.url,
            featured: projectData.featured,
            image: imageData,
            active: true,
            order: projects.length
        });
    }
    
    // Save the entire site data with updated projects
    siteData.projects = projects;
    
    // Send to server directly
    try {
        const response = await fetch('/site-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(siteData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('הפרויקט נשמר בהצלחה', 'success');
            closeModal('projectModal');
            loadProjects();
        } else {
            showNotification(result.message || 'שגיאה בשמירת הפרויקט', 'error');
        }
    } catch (error) {
        console.error('Error saving project:', error);
        showNotification('שגיאה בשמירת הפרויקט', 'error');
    }
    
    // Force update main website
    triggerMainSiteUpdate();
    
    // Update preview if open
    if (window.websitePreview && window.websitePreview.isPreviewOpen) {
        window.websitePreview.updatePreview();
    }
}


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
async function getSiteData() {
    try {
        const response = await fetch('/site-data', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error(`Server responded with ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching site data:', error);
        showNotification('שגיאה בטעינת הנתונים מהשרת', 'error');
        // Return minimal fallback data
        return {
            hero: {},
            services: [],
            projects: [],
            testimonials: [],
            faq: [],
            contact: { fields: [], submissions: [] },
            design: {},
            seo: {},
            settings: {}
        };
    }
}

async function updateSiteData(key, value) {
    try {
        // Get current data
        const data = await getSiteData();
        data[key] = value;
        
        // Save to server
        const response = await fetch('/site-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            return true;
        } else {
            throw new Error(result.message || 'Server save failed');
        }
    } catch (error) {
        console.error('Error saving data:', error);
        showNotification('שגיאה בשמירת הנתונים: ' + error.message, 'error');
        return false;
    }
}

// Trigger main site update
function triggerMainSiteUpdate() {
    // Notify the main site to reload data from server
    try {
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
                type: 'dataUpdate',
                source: 'admin'
            }, '*');
        }
    } catch (e) {
        // Could not communicate with parent window
    }
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
            title: 'CODE7 - יוצרים עבורך נוכחות דיגיטלית מושלמת',
            description: 'CODE7 - פתרונות מותאמים אישית לאתרים, אפליקציות ומערכות ניהול עסקיות.',
            keywords: ''
        },
        settings: {
            businessName: 'CODE7',
            phone: '055-2882839',
            email: 'benatia.asaf@gmail.com',
            logo: '',
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
    loadContactSubmissions();
}

function initializeContactView() {
    // Restore saved view mode
    const savedViewMode = localStorage.getItem('contactViewMode') || 'kanban';
    
    if (savedViewMode === 'list') {
        document.getElementById('kanbanBoard').style.display = 'none';
        document.getElementById('submissionsList').style.display = 'block';
        
        // Update button states
        document.querySelectorAll('.view-toggle .btn').forEach(btn => btn.classList.remove('active'));
        const listBtn = document.querySelector('.view-toggle .btn[onclick="switchToList()"]');
        if (listBtn) listBtn.classList.add('active');
    } else {
        document.getElementById('kanbanBoard').style.display = 'flex';
        document.getElementById('submissionsList').style.display = 'none';
        
        // Update button states
        document.querySelectorAll('.view-toggle .btn').forEach(btn => btn.classList.remove('active'));
        const kanbanBtn = document.querySelector('.view-toggle .btn[onclick="switchToKanban()"]');
        if (kanbanBtn) kanbanBtn.classList.add('active');
    }
    
    loadContactSubmissions();
}

// Load contact submissions
async function loadContactSubmissions() {
    console.log('Loading contact submissions...');
    
    const siteData = await getSiteData();
    const submissions = siteData.contact?.submissions || [];
    console.log('Found submissions:', submissions.length, submissions);
    
    // Check which view is active
    const kanbanBoard = document.getElementById('kanbanBoard');
    const submissionsList = document.getElementById('submissionsList');
    
    if (kanbanBoard && kanbanBoard.style.display !== 'none') {
        loadKanbanView(submissions);
    } else if (submissionsList) {
        loadListView(submissions);
    }
}

function loadKanbanView(submissions) {
    // Clear all columns
    const statuses = ['new', 'contacted', 'quoted', 'approved', 'in_development', 'completed'];
    statuses.forEach(status => {
        const cardsContainer = document.getElementById(`cards-${status}`);
        const countElement = document.getElementById(`count-${status}`);
        if (cardsContainer) cardsContainer.innerHTML = '';
        if (countElement) countElement.textContent = '0';
    });
    
    if (submissions.length === 0) {
        document.getElementById('cards-new').innerHTML = '<div class="empty-column">אין פניות</div>';
        return;
    }
    
    // Group submissions by status
    const submissionsByStatus = {};
    statuses.forEach(status => submissionsByStatus[status] = []);
    
    submissions.forEach(submission => {
        const status = submission.status || 'new';
        if (submissionsByStatus[status]) {
            submissionsByStatus[status].push(submission);
        }
    });
    
    // Populate each column
    statuses.forEach(status => {
        const statusSubmissions = submissionsByStatus[status];
        const cardsContainer = document.getElementById(`cards-${status}`);
        const countElement = document.getElementById(`count-${status}`);
        
        if (countElement) {
            countElement.textContent = statusSubmissions.length;
        }
        
        if (cardsContainer) {
            cardsContainer.innerHTML = statusSubmissions.map(submission => createKanbanCard(submission)).join('');
        }
    });
    
    // Initialize drag and drop
    initializeDragAndDrop();
}

function createKanbanCard(submission) {
    const deadlineWarning = getDeadlineWarning(submission.deadline);
    const projectTypeBadge = submission.projectType ? `<span class="project-type-badge project-type-${submission.projectType}">${getProjectTypeText(submission.projectType)}</span>` : '';
    
    return `
        <div class="kanban-card" draggable="true" data-id="${submission.id}" onclick="editSubmission(${submission.id})">
            <div class="card-header">
                <h5 class="card-title">${submission.name}</h5>
                <span class="card-date">${new Date(submission.timestamp).toLocaleDateString('he-IL')}</span>
            </div>
            <div class="card-details">
                <div class="card-detail"><strong>אימייל:</strong> ${submission.email}</div>
                <div class="card-detail"><strong>טלפון:</strong> ${submission.phone}</div>
                ${submission.price ? `<div class="card-detail"><strong>מחיר:</strong> <span class="budget-badge">${submission.price.toLocaleString()} ₪</span></div>` : ''}
                ${projectTypeBadge}
                ${deadlineWarning}
            </div>
        </div>
    `;
}

function getDeadlineWarning(deadline) {
    if (!deadline) return '';
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `<div class="deadline-warning">איחור: ${Math.abs(diffDays)} ימים</div>`;
    } else if (diffDays <= 3) {
        return `<div class="deadline-warning">נותרו ${diffDays} ימים</div>`;
    } else if (diffDays <= 7) {
        return `<div class="deadline-ok">נותרו ${diffDays} ימים</div>`;
    }
    return '';
}

function loadListView(submissions) {
    const submissionsList = document.getElementById('submissionsList');
    if (!submissionsList) return;
    
    if (submissions.length === 0) {
        submissionsList.innerHTML = '<div class="no-submissions">אין פניות חדשות</div>';
        return;
    }

    submissionsList.innerHTML = submissions.map(submission => `
        <div class="submission-item ${submission.status}" data-id="${submission.id}">
            <div class="submission-header">
                <h4>${submission.name}</h4>
                <span class="submission-date">${new Date(submission.timestamp).toLocaleDateString('he-IL')}</span>
                <span class="submission-status status-${submission.status}">${getStatusText(submission.status)}</span>
            </div>
            <div class="submission-details">
                <p><strong>אימייל:</strong> ${submission.email}</p>
                <p><strong>טלפון:</strong> ${submission.phone}</p>
                <p><strong>סוג פרויקט:</strong> ${getProjectTypeText(submission.projectType)}</p>
                <p><strong>תקציב:</strong> ${getBudgetText(submission.budget)}</p>
                <p><strong>לוח זמנים:</strong> ${getTimelineText(submission.timeline)}</p>
                <p><strong>תיאור:</strong> ${submission.description}</p>
                ${submission.price ? `<p><strong>מחיר מוצע:</strong> ${submission.price.toLocaleString()} ₪</p>` : ''}
                ${submission.deadline ? `<p><strong>תאריך יעד:</strong> ${new Date(submission.deadline).toLocaleDateString('he-IL')}</p>` : ''}
                ${submission.notes ? `<p><strong>הערות:</strong> ${submission.notes}</p>` : ''}
                ${submission.lastUpdated ? `<p class="last-updated"><strong>עודכן לאחרונה:</strong> ${new Date(submission.lastUpdated).toLocaleDateString('he-IL')} ${new Date(submission.lastUpdated).toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'})}</p>` : ''}
            </div>
            <div class="submission-actions">
                <select onchange="updateSubmissionStatus(${submission.id}, this.value)" class="form-control" style="display: inline-block; width: auto; margin-left: 10px;">
                    <option value="">עדכן סטטוס</option>
                    <option value="contacted">יצירת קשר</option>
                    <option value="quoted">הצעת מחיר נשלחה</option>
                    <option value="approved">אושר ע"י לקוח</option>
                    <option value="in_development">בפיתוח</option>
                    <option value="completed">הושלם</option>
                    <option value="cancelled">בוטל</option>
                </select>
                <button onclick="editSubmission(${submission.id})" class="btn btn-primary">ערוך</button>
                <button onclick="deleteSubmission(${submission.id})" class="btn btn-danger">מחק</button>
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    switch(status) {
        case 'new': return 'חדש';
        case 'contacted': return 'יצירת קשר';
        case 'quoted': return 'הצעת מחיר נשלחה';
        case 'approved': return 'אושר ע"י לקוח';
        case 'in_development': return 'בפיתוח';
        case 'completed': return 'הושלם';
        case 'cancelled': return 'בוטל';
        case 'read': return 'נקרא';
        case 'replied': return 'טופל';
        default: return status;
    }
}

function getProjectTypeText(projectType) {
    if (!projectType) return 'לא צוין';
    switch(projectType) {
        case 'website': return 'אתר תדמית';
        case 'ecommerce': return 'חנות מקוונת';
        case 'app': return 'אפליקציה מותאמת';
        case 'system': return 'מערכת ניהול';
        case 'maintenance': return 'שיפור אתר קיים';
        default: return projectType;
    }
}

function getBudgetText(budget) {
    if (!budget) return 'לא צוין';
    switch(budget) {
        case '2000-5000': return '2,000-5,000 ₪';
        case '5000-10000': return '5,000-10,000 ₪';
        case '10000-20000': return '10,000-20,000 ₪';
        case '20000+': return '20,000+ ₪';
        default: return budget;
    }
}

function getTimelineText(timeline) {
    if (!timeline) return 'לא צוין';
    switch(timeline) {
        case 'urgent': return 'דחוף (עד שבועיים)';
        case 'normal': return 'רגיל (חודש)';
        case 'flexible': return 'גמיש (חודש-שלושה)';
        default: return timeline;
    }
}

async function markAsRead(submissionId) {
    await updateSubmissionStatus(submissionId, 'read');
}

async function markAsReplied(submissionId) {
    await updateSubmissionStatus(submissionId, 'replied');
}

async function updateSubmissionStatus(submissionId, newStatus) {
    if (!newStatus) return;
    
    console.log('Updating submission:', submissionId, 'to status:', newStatus);
    
    try {
        const requestData = { 
            status: newStatus,
            lastUpdated: new Date().toISOString()
        };
        console.log('Request data:', requestData);
        
        const response = await fetch(`/admin/submissions/${submissionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadContactSubmissions();
            showNotification(`הסטטוס עודכן ל: ${getStatusText(newStatus)}`, 'success');
        } else {
            showNotification(result.message || 'שגיאה בעדכון הסטטוס', 'error');
        }
    } catch (error) {
        console.error('Error updating submission status:', error);
        showNotification('שגיאה בעדכון הסטטוס', 'error');
    }
}

async function editSubmission(submissionId) {
    try {
        const siteData = await getSiteData();
        const submission = siteData.contact?.submissions?.find(s => s.id == submissionId);
        
        if (!submission) {
            showNotification('פנייה לא נמצאה', 'error');
            return;
        }

        // Fill form with current data
        document.getElementById('submissionId').value = submission.id;
        document.getElementById('submissionStatus').value = submission.status || 'new';
        document.getElementById('submissionPrice').value = submission.price || '';
        document.getElementById('submissionDeadline').value = submission.deadline || '';
        document.getElementById('submissionNotes').value = submission.notes || '';
        
        // Show files if any
        displaySubmissionFiles(submission.files || []);
        
        // Show modal
        document.getElementById('submissionModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading submission:', error);
        showNotification('שגיאה בטעינת הפנייה', 'error');
    }
}

async function saveSubmission() {
    console.log('saveSubmission called');
    try {
        const submissionId = document.getElementById('submissionId').value;
        const status = document.getElementById('submissionStatus').value;
        const price = document.getElementById('submissionPrice').value;
        const deadline = document.getElementById('submissionDeadline').value;
        const notes = document.getElementById('submissionNotes').value;
        
        console.log('Form data:', { submissionId, status, price, deadline, notes });
        
        const updateData = {
            status,
            price: price ? parseFloat(price) : null,
            deadline: deadline || null,
            notes: notes || null,
            lastUpdated: new Date().toISOString()
        };

        const response = await fetch(`/admin/submissions/${submissionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        console.log('Response:', result);
        
        if (result.success) {
            console.log('Success - closing modal');
            closeModal('submissionModal');
            loadContactSubmissions();
            showNotification('הפנייה עודכנה בהצלחה', 'success');
        } else {
            console.log('Error in response:', result.message);
            showNotification(result.message || 'שגיאה בעדכון הפנייה', 'error');
        }
    } catch (error) {
        console.error('Error saving submission:', error);
        showNotification('שגיאה בשמירת הפנייה', 'error');
    }
}

function displaySubmissionFiles(files) {
    const filesList = document.getElementById('submissionFilesList');
    if (!files || files.length === 0) {
        filesList.innerHTML = '<p class="no-files">אין קבצים מצורפים</p>';
        return;
    }
    
    filesList.innerHTML = files.map(file => `
        <div class="file-item">
            <span class="file-name">${file.name}</span>
            <span class="file-size">(${formatFileSize(file.size)})</span>
            <button type="button" class="btn btn-sm btn-danger" onclick="removeSubmissionFile('${file.id}')">מחק</button>
        </div>
    `).join('');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
}

// View switching functions
function switchToKanban() {
    document.getElementById('kanbanBoard').style.display = 'flex';
    document.getElementById('submissionsList').style.display = 'none';
    
    // Update button states
    document.querySelectorAll('.view-toggle .btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.btn').classList.add('active');
    
    // Save view preference
    localStorage.setItem('contactViewMode', 'kanban');
    
    loadContactSubmissions();
}

function switchToList() {
    document.getElementById('kanbanBoard').style.display = 'none';
    document.getElementById('submissionsList').style.display = 'block';
    
    // Update button states
    document.querySelectorAll('.view-toggle .btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.btn').classList.add('active');
    
    // Save view preference
    localStorage.setItem('contactViewMode', 'list');
    
    loadContactSubmissions();
}

// Drag and Drop functionality
function initializeDragAndDrop() {
    const cards = document.querySelectorAll('.kanban-card');
    const columns = document.querySelectorAll('.column-cards');
    
    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.target.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

async function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    
    if (!draggedElement) return;
    
    const targetColumn = e.target.closest('.kanban-column');
    const newStatus = targetColumn.dataset.status;
    const submissionId = draggedElement.dataset.id;
    
    // Update status on server
    try {
        await updateSubmissionStatus(submissionId, newStatus);
        // Reload kanban to reflect changes
        loadContactSubmissions();
    } catch (error) {
        console.error('Error updating submission status:', error);
        showNotification('שגיאה בעדכון הסטטוס', 'error');
    }
}

async function deleteSubmission(submissionId) {
    if (confirm('האם אתה בטוח שברצונך למחוק פנייה זו?')) {
        try {
            const response = await fetch(`/admin/submissions/${submissionId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const result = await response.json();
            
            if (result.success) {
                loadContactSubmissions();
                showNotification(result.message, 'success');
            } else {
                showNotification(result.message || 'שגיאה במחיקת הפנייה', 'error');
            }
        } catch (error) {
            console.error('Error deleting submission:', error);
            showNotification('שגיאה במחיקת הפנייה', 'error');
        }
    }
}

function initializeMediaManager() {
    // Implementation for media management
}

function initializeSEOSettings() {
    // Implementation for SEO settings
}

function initializeGeneralSettings() {
    // Load settings data
    loadSettingsData();
    
    // Initialize logo upload
    initializeLogoUpload();
    
    // Save settings button
    const saveSettings = document.getElementById('saveSettings');
    saveSettings?.addEventListener('click', () => {
        saveSettingsData();
    });
}

async function loadSettingsData() {
    const data = await getSiteData();
    const settings = data.settings || {};
    
    // Update form fields if they exist
    const businessName = document.getElementById('businessName');
    const phone = document.getElementById('businessPhone');
    const email = document.getElementById('businessEmail');
    const facebook = document.getElementById('facebookUrl');
    const instagram = document.getElementById('instagramUrl');
    const linkedin = document.getElementById('linkedinUrl');
    
    if (businessName) businessName.value = settings.businessName || 'CODE7';
    if (phone) phone.value = settings.phone || '';
    if (email) email.value = settings.email || '';
    if (facebook) facebook.value = settings.social?.facebook || '';
    if (instagram) instagram.value = settings.social?.instagram || '';
    if (linkedin) linkedin.value = settings.social?.linkedin || '';
    
    // Update logo display
    updateLogoDisplay(settings.logo);
}

function initializeLogoUpload() {
    const logoUpload = document.getElementById('logoUpload');
    const removeLogo = document.getElementById('removeLogo');
    
    logoUpload?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            uploadLogoImage(file);
        }
    });
    
    removeLogo?.addEventListener('click', () => {
        removeLogoImage();
    });
}

function uploadLogoImage(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('נא לבחור קובץ תמונה תקין', 'error');
        return;
    }
    
    // Validate file size (max 2MB for logo)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('גודל הלוגו לא יכול לעלות על 2MB', 'error');
        return;
    }
    
    // Upload logo to Cloudinary with different transformations
    const cloudName = 'dh1ompp1r';
    const uploadPreset = 'code7_upload';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'code7/logos');
    
    showNotification('מעלה לוגו ל-Cloudinary...', 'info');
    
    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(async (data) => {
        if (data.secure_url) {
            // Create transformed URL for logo (max height 80px)
            const transformedUrl = data.secure_url.replace('/upload/', '/upload/h_80,c_scale,q_auto:best,f_auto/');
            
            // Update settings with logo URL
            const siteData = await getSiteData();
            siteData.settings = siteData.settings || {};
            siteData.settings.logo = transformedUrl;
            
            await updateSiteData('settings', siteData.settings);
            updateLogoDisplay(transformedUrl);
            updateMainSiteLogo(transformedUrl);
            showNotification('הלוגו עודכן בהצלחה', 'success');
        } else {
            showNotification(data.error?.message || 'שגיאה בהעלאת הלוגו', 'error');
        }
    })
    .catch(error => {
        console.error('Logo upload error:', error);
        showNotification('שגיאה בהעלאת הלוגו: ' + error.message, 'error');
    });
}

async function removeLogoImage() {
    const data = await getSiteData();
    data.settings = data.settings || {};
    data.settings.logo = '';
    
    await updateSiteData('settings', data.settings);
    updateLogoDisplay('');
    updateMainSiteLogo('');
    showNotification('הלוגו הוסר בהצלחה', 'success');
}

function updateLogoDisplay(logoUrl) {
    const logoPreview = document.getElementById('logoPreview');
    const removeLogo = document.getElementById('removeLogo');
    
    if (logoPreview) {
        if (logoUrl) {
            logoPreview.innerHTML = `<img src="${logoUrl}" style="max-width: 200px; max-height: 80px; object-fit: contain; border-radius: 8px;">`;
            if (removeLogo) removeLogo.style.display = 'inline-block';
        } else {
            logoPreview.innerHTML = '<div style="padding: 20px; background: var(--admin-light-gray); border-radius: 8px; text-align: center; color: var(--admin-text-secondary);">אין לוגו</div>';
            if (removeLogo) removeLogo.style.display = 'none';
        }
    }
}

function updateMainSiteLogo(logoUrl) {
    // Update the main site logo in real time if possible
    try {
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
                type: 'logoUpdate',
                logoUrl: logoUrl
            }, '*');
        }
    } catch (e) {
        // Could not communicate with main site
    }
}

async function saveSettingsData() {
    try {
        const businessName = document.getElementById('businessName')?.value || 'CODE7';
        const phone = document.getElementById('businessPhone')?.value || '';
        const email = document.getElementById('businessEmail')?.value || '';
        const facebook = document.getElementById('facebookUrl')?.value || '';
        const instagram = document.getElementById('instagramUrl')?.value || '';
        const linkedin = document.getElementById('linkedinUrl')?.value || '';
        
        const data = await getSiteData();
        const settings = {
            businessName,
            phone,
            email,
            logo: data.settings?.logo || '',
            social: {
                facebook,
                instagram,
                linkedin
            }
        };
        
        const response = await fetch('/admin/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(settings)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            
            // Update preview if open
            if (window.websitePreview && window.websitePreview.isPreviewOpen) {
                window.websitePreview.updatePreview();
            }
        } else {
            showNotification(result.message || 'שגיאה בשמירת ההגדרות', 'error');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('שגיאה בשמירת ההגדרות', 'error');
    }
}

// Export functions for global access
window.editService = editService;
window.deleteService = deleteService;
window.toggleService = toggleService;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.closeModal = closeModal;
window.openProjectModal = openProjectModal;
window.saveProject = saveProject;
window.markAsRead = markAsRead;
window.markAsReplied = markAsReplied;
window.deleteSubmission = deleteSubmission;
window.editSubmission = editSubmission;
window.saveSubmission = saveSubmission;
window.updateSubmissionStatus = updateSubmissionStatus;
window.switchToKanban = switchToKanban;
window.switchToList = switchToList;

