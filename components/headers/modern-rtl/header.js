/**
 * Modern RTL Header Component
 * Provides mobile-responsive navigation with RTL support
 */

class ModernRTLHeader {
    constructor(options = {}) {
        this.options = {
            headerSelector: '#header',
            mobileToggleSelector: '#mobileMenuToggle',
            navMenuSelector: '#navMenu',
            logoSelector: '#siteLogo',
            logoTextSelector: '#siteTitle',
            scrollThreshold: 100,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.header = document.querySelector(this.options.headerSelector);
        this.mobileMenuToggle = document.querySelector(this.options.mobileToggleSelector);
        this.navMenu = document.querySelector(this.options.navMenuSelector);
        this.siteLogo = document.querySelector(this.options.logoSelector);
        this.siteTitle = document.querySelector(this.options.logoTextSelector);
        
        this.setupEventListeners();
        this.setupScrollEffect();
        this.setupActiveLink();
        this.setupSmoothScroll();
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        if (this.mobileMenuToggle && this.navMenu) {
            this.mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Close mobile menu when clicking on links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navMenu?.contains(e.target) && !this.mobileMenuToggle?.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }
    
    setupScrollEffect() {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > this.options.scrollThreshold) {
                this.header?.classList.add('scrolled');
            } else {
                this.header?.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }
    
    setupActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        
        const setActiveLink = () => {
            const scrollY = window.pageYOffset;
            
            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');
                const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    // Remove active class from all links
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                    });
                    
                    // Add active class to current link
                    if (correspondingLink) {
                        correspondingLink.classList.add('active');
                    }
                }
            });
        };
        
        window.addEventListener('scroll', setActiveLink);
    }
    
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    toggleMobileMenu() {
        if (this.mobileMenuToggle && this.navMenu) {
            this.mobileMenuToggle.classList.toggle('active');
            this.navMenu.classList.toggle('active');
        }
    }
    
    closeMobileMenu() {
        if (this.mobileMenuToggle && this.navMenu) {
            this.mobileMenuToggle.classList.remove('active');
            this.navMenu.classList.remove('active');
        }
    }
    
    updateLogo(logoUrl, altText = '') {
        if (this.siteLogo && this.siteTitle) {
            if (logoUrl) {
                this.siteLogo.onload = () => {
                    this.siteLogo.style.display = 'block';
                    this.siteTitle.style.display = 'none';
                };
                this.siteLogo.src = logoUrl;
                this.siteLogo.alt = altText;
            } else {
                this.siteLogo.style.display = 'none';
                this.siteTitle.style.display = 'block';
            }
        }
    }
    
    updateTitle(title) {
        if (this.siteTitle) {
            this.siteTitle.textContent = title;
        }
    }
    
    updateNavigation(menuItems) {
        if (this.navMenu) {
            this.navMenu.innerHTML = menuItems.map(item => `
                <li><a href="${item.href}" class="nav-link ${item.active ? 'active' : ''}">${item.text}</a></li>
            `).join('');
            
            // Re-setup event listeners for new links
            this.setupEventListeners();
        }
    }
}

// Auto-initialize if elements exist
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('#header');
    if (header) {
        window.headerInstance = new ModernRTLHeader();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernRTLHeader;
}