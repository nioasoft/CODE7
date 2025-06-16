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
                        <input type="file" id="projectImage" class="form-control" accept="image/*">
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
    
    // Add image preview functionality
    document.getElementById('projectImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('נא לבחור קובץ תמונה תקין', 'error');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('גודל התמונה לא יכול לעלות על 5MB', 'error');
                return;
            }
            
            // Upload image to server
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
    
    const siteData = await getSiteData();
    const projects = siteData.projects || [];
    const preview = document.getElementById('projectImagePreview');
    const imageData = preview.dataset.imageData || null;
    // Preparing to save project with image data
    
    if (projectId) {
        // Edit existing
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            projects[index] = { 
                ...projects[index], 
                name, 
                description, 
                type, 
                url, 
                featured,
                image: imageData || projects[index].image
            };
        }
    } else {
        // Add new
        projects.push({
            id: Date.now(),
            name,
            description,
            type,
            url,
            featured,
            image: imageData,
            active: true,
            order: projects.length
        });
    }
    
    // Saving projects data to server
    
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
            
            // Refresh the projects display immediately
            await loadProjects();
            closeModal('projectModal');
        } else {
            throw new Error(result.message || 'Failed to save to server');
        }
    } catch (error) {
        console.error('Error saving project:', error);
        showNotification('שגיאה בשמירת הפרויקט: ' + error.message, 'error');
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
        // Return default data as fallback
        return getDefaultSiteData();
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

// Load contact submissions
async function loadContactSubmissions() {
    // Loading contact submissions from server
    const submissionsList = document.getElementById('submissionsList');
    if (!submissionsList) {
        // Contact submissions list element not found
        return;
    }
    
    const siteData = await getSiteData();
    const submissions = siteData.contact?.submissions || [];
    // Processing contact submissions data
    
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
                <p><strong>סוג פרויקט:</strong> ${submission.projectType || 'לא צוין'}</p>
                <p><strong>תקציב:</strong> ${submission.budget || 'לא צוין'}</p>
                <p><strong>לוח זמנים:</strong> ${submission.timeline || 'לא צוין'}</p>
                <p><strong>תיאור:</strong> ${submission.description}</p>
            </div>
            <div class="submission-actions">
                <button onclick="markAsRead(${submission.id})" class="btn btn-secondary">סמן כנקרא</button>
                <button onclick="markAsReplied(${submission.id})" class="btn btn-primary">סמן כטופל</button>
                <button onclick="deleteSubmission(${submission.id})" class="btn btn-danger">מחק</button>
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    switch(status) {
        case 'new': return 'חדש';
        case 'read': return 'נקרא';
        case 'replied': return 'טופל';
        default: return status;
    }
}

async function markAsRead(submissionId) {
    await updateSubmissionStatus(submissionId, 'read');
}

async function markAsReplied(submissionId) {
    await updateSubmissionStatus(submissionId, 'replied');
}

async function updateSubmissionStatus(submissionId, newStatus) {
    try {
        const response = await fetch(`/admin/submissions/${submissionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadContactSubmissions();
            showNotification(result.message, 'success');
        } else {
            showNotification(result.message || 'שגיאה בעדכון הסטטוס', 'error');
        }
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