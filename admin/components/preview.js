// Preview Component for Real-time Website Updates
class WebsitePreview {
    constructor(options = {}) {
        this.options = {
            previewUrl: '../index.html',
            updateDelay: 500,
            autoUpdate: true,
            ...options
        };
        
        this.updateTimeout = null;
        this.isPreviewOpen = false;
        this.previewFrame = null;
        
        this.init();
    }
    
    init() {
        this.initializePreviewPanel();
        this.bindEvents();
        this.setupAutoUpdate();
    }
    
    initializePreviewPanel() {
        this.previewPanel = document.getElementById('previewPanel');
        this.previewFrame = document.getElementById('previewFrame');
        
        if (!this.previewPanel || !this.previewFrame) {
            // Preview panel elements not found
            return;
        }
        
        // Setup device switching
        this.deviceButtons = document.querySelectorAll('.preview-device');
        this.deviceButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchDevice(btn.dataset.device);
            });
        });
        
        // Setup close button
        const closeBtn = document.getElementById('closePreview');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePreview();
            });
        }
    }
    
    bindEvents() {
        // Listen for preview toggle
        const previewToggle = document.getElementById('previewToggle');
        if (previewToggle) {
            previewToggle.addEventListener('click', () => {
                this.togglePreview();
            });
        }
        
        // Listen for form changes that should trigger preview updates
        document.addEventListener('change', (e) => {
            if (this.shouldUpdatePreview(e.target)) {
                this.scheduleUpdate();
            }
        });
        
        // Listen for input changes with debouncing
        document.addEventListener('input', (e) => {
            if (this.shouldUpdatePreview(e.target)) {
                this.scheduleUpdate();
            }
        });
        
        // Listen for custom preview update events
        document.addEventListener('previewUpdate', () => {
            this.updatePreview();
        });
    }
    
    shouldUpdatePreview(element) {
        // Check if the element should trigger a preview update
        const previewTriggers = [
            'heroHeadline',
            'heroSubtitle',
            'serviceName',
            'serviceDescription'
        ];
        
        return previewTriggers.includes(element.id) || 
               element.hasAttribute('data-preview-update') ||
               element.closest('[data-preview-section]');
    }
    
    setupAutoUpdate() {
        if (this.options.autoUpdate) {
            // Monitor data changes in localStorage
            window.addEventListener('storage', (e) => {
                if (e.key === 'code7Data' && this.isPreviewOpen) {
                    this.updatePreview();
                }
            });
        }
    }
    
    togglePreview() {
        if (this.isPreviewOpen) {
            this.closePreview();
        } else {
            this.openPreview();
        }
    }
    
    openPreview() {
        if (!this.previewPanel) return;
        
        this.previewPanel.classList.add('show');
        this.isPreviewOpen = true;
        
        // Load initial preview
        this.updatePreview();
        
        // Adjust main content area
        document.querySelector('.admin-main').style.marginLeft = '50%';
        
        // Show notification
        this.showPreviewNotification('תצוגה מקדימה נפתחה', 'success');
    }
    
    closePreview() {
        if (!this.previewPanel) return;
        
        this.previewPanel.classList.remove('show');
        this.isPreviewOpen = false;
        
        // Reset main content area
        document.querySelector('.admin-main').style.marginLeft = '';
        
        this.showPreviewNotification('תצוגה מקדימה נסגרה', 'success');
    }
    
    switchDevice(device) {
        // Update active device button
        this.deviceButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-device="${device}"]`).classList.add('active');
        
        // Apply device-specific styles to preview frame
        if (this.previewFrame) {
            const previewContainer = this.previewFrame.parentElement;
            
            switch (device) {
                case 'mobile':
                    previewContainer.style.width = '375px';
                    previewContainer.style.margin = '0 auto';
                    previewContainer.style.border = '8px solid #333';
                    previewContainer.style.borderRadius = '20px';
                    break;
                case 'tablet':
                    previewContainer.style.width = '768px';
                    previewContainer.style.margin = '0 auto';
                    previewContainer.style.border = '4px solid #666';
                    previewContainer.style.borderRadius = '12px';
                    break;
                default: // desktop
                    previewContainer.style.width = '100%';
                    previewContainer.style.margin = '0';
                    previewContainer.style.border = 'none';
                    previewContainer.style.borderRadius = '0';
            }
        }
        
        this.showPreviewNotification(`עבר למצב ${this.getDeviceName(device)}`, 'success');
    }
    
    getDeviceName(device) {
        const names = {
            mobile: 'נייד',
            tablet: 'טאבלט',
            desktop: 'מחשב'
        };
        return names[device] || device;
    }
    
    scheduleUpdate() {
        // Debounce updates to avoid too frequent refreshes
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        
        this.updateTimeout = setTimeout(() => {
            this.updatePreview();
        }, this.options.updateDelay);
    }
    
    updatePreview() {
        if (!this.isPreviewOpen || !this.previewFrame) return;
        
        try {
            // Get current admin data
            const adminData = this.getCurrentAdminData();
            
            // Update the main website with admin data
            this.syncDataToMainSite(adminData);
            
            // Refresh the preview iframe
            this.refreshPreviewFrame();
            
        } catch (error) {
            console.error('Error updating preview:', error);
            this.showPreviewNotification('שגיאה בעדכון התצוגה המקדימה', 'error');
        }
    }
    
    getCurrentAdminData() {
        // Collect current data from all admin forms
        const data = {
            hero: {
                headline: document.getElementById('heroHeadline')?.value || '',
                subtitle: document.getElementById('heroSubtitle')?.value || '',
                background: document.querySelector('input[name="heroBackground"]:checked')?.value || 'gradient',
                animations: document.getElementById('heroAnimations')?.checked || true
            },
            services: this.getServicesData(),
            projects: this.getProjectsData(),
            testimonials: this.getTestimonialsData(),
            faq: this.getFaqData(),
            design: this.getDesignData(),
            settings: this.getSettingsData()
        };
        
        return data;
    }
    
    getServicesData() {
        // Extract services data from the admin interface
        const services = [];
        document.querySelectorAll('.service-item').forEach((item, index) => {
            const nameEl = item.querySelector('h4');
            const descEl = item.querySelector('p');
            const activeEl = item.querySelector('input[type="checkbox"]');
            
            if (nameEl && descEl) {
                services.push({
                    id: index + 1,
                    name: nameEl.textContent,
                    description: descEl.textContent,
                    active: activeEl ? activeEl.checked : true,
                    order: index
                });
            }
        });
        
        return services;
    }
    
    getProjectsData() {
        // Extract projects data from the admin interface
        const projects = [];
        document.querySelectorAll('.project-item').forEach((item, index) => {
            const nameEl = item.querySelector('h4');
            const descEl = item.querySelector('p');
            
            if (nameEl && descEl) {
                projects.push({
                    id: index + 1,
                    name: nameEl.textContent,
                    description: descEl.textContent,
                    order: index
                });
            }
        });
        
        return projects;
    }
    
    getTestimonialsData() {
        // Extract testimonials data
        const testimonials = [];
        document.querySelectorAll('.testimonial-item').forEach((item, index) => {
            // Implementation would depend on testimonial structure
        });
        
        return testimonials;
    }
    
    getFaqData() {
        // Extract FAQ data
        const faq = [];
        document.querySelectorAll('.faq-item').forEach((item, index) => {
            // Implementation would depend on FAQ structure
        });
        
        return faq;
    }
    
    getDesignData() {
        // Extract design settings
        return {
            colors: {
                primary: document.getElementById('primaryColor')?.value || '#007AFF',
                dark: document.getElementById('darkColor')?.value || '#1D1D1F',
                light: document.getElementById('lightColor')?.value || '#F2F2F7'
            },
            typography: {
                fontFamily: document.getElementById('fontFamily')?.value || 'Heebo',
                sizes: {
                    h1: document.getElementById('h1Size')?.value || 48,
                    h2: document.getElementById('h2Size')?.value || 36,
                    body: document.getElementById('bodySize')?.value || 16
                }
            }
        };
    }
    
    getSettingsData() {
        // Extract general settings
        return {
            businessName: document.getElementById('businessName')?.value || 'CODE7',
            phone: document.getElementById('businessPhone')?.value || '055-2882839',
            email: document.getElementById('businessEmail')?.value || 'benatia.asaf@gmail.com'
        };
    }
    
    syncDataToMainSite(data) {
        // Store data in localStorage for the main site to use
        localStorage.setItem('code7Data', JSON.stringify(data));
        
        // If preview frame is accessible, inject data directly
        try {
            if (this.previewFrame.contentWindow && this.previewFrame.contentWindow.updateFromAdmin) {
                this.previewFrame.contentWindow.updateFromAdmin(data);
            }
        } catch (e) {
            // Cross-origin restrictions may prevent direct access
            // Data will be picked up on next frame reload
        }
    }
    
    refreshPreviewFrame() {
        if (this.previewFrame) {
            // Add timestamp to force reload
            const url = new URL(this.previewFrame.src, window.location.origin);
            url.searchParams.set('_t', Date.now());
            this.previewFrame.src = url.toString();
        }
    }
    
    showPreviewNotification(message, type = 'info') {
        // Create a small notification specific to preview actions
        const notification = document.createElement('div');
        notification.className = `preview-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: calc(var(--header-height) + 20px);
            right: 20px;
            background: var(--admin-white);
            border: 1px solid var(--admin-border);
            border-radius: 8px;
            padding: 0.75rem 1rem;
            box-shadow: var(--admin-shadow);
            z-index: 1001;
            font-size: 0.875rem;
            animation: slideInRight 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.borderColor = 'var(--admin-success)';
            notification.style.color = 'var(--admin-success)';
        } else if (type === 'error') {
            notification.style.borderColor = 'var(--admin-danger)';
            notification.style.color = 'var(--admin-danger)';
        }
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    // Comparison mode
    showBeforeAfter() {
        // Implementation for before/after comparison view
        if (!this.isPreviewOpen) {
            this.openPreview();
        }
        
        // Create split view
        const previewContent = document.querySelector('.preview-content');
        if (previewContent) {
            previewContent.innerHTML = `
                <div style="display: flex; height: 100%;">
                    <div style="flex: 1; border-right: 1px solid var(--admin-border);">
                        <div style="padding: 8px; background: var(--admin-light-gray); text-align: center; font-size: 0.875rem;">לפני</div>
                        <iframe src="${this.options.previewUrl}" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>
                    </div>
                    <div style="flex: 1;">
                        <div style="padding: 8px; background: var(--admin-light-gray); text-align: center; font-size: 0.875rem;">אחרי</div>
                        <iframe id="previewFrame" src="${this.options.previewUrl}?_live=1" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>
                    </div>
                </div>
            `;
            
            this.previewFrame = document.getElementById('previewFrame');
        }
    }
    
    // Screenshot functionality
    takeScreenshot() {
        if (!this.previewFrame) return;
        
        // Use html2canvas or similar library if available
        // For now, show a placeholder
        this.showPreviewNotification('צילום מסך נשמר', 'success');
    }
    
    // Export preview
    exportPreview() {
        const data = this.getCurrentAdminData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `code7-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showPreviewNotification('גיבוי נוצר בהצלחה', 'success');
    }
}

// CSS animations for preview notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize preview system
let websitePreview;

document.addEventListener('DOMContentLoaded', function() {
    websitePreview = new WebsitePreview();
});

// Export for global access
window.WebsitePreview = WebsitePreview;
window.websitePreview = websitePreview;