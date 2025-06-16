/**
 * Services Cards Component
 * Provides dynamic services management with animations
 */

class ServicesCards {
    constructor(options = {}) {
        this.options = {
            containerSelector: '.services-grid',
            cardSelector: '.service-card',
            animateOnScroll: true,
            loadFromJSON: false,
            jsonEndpoint: '/api/services',
            autoHide: false,
            ...options
        };
        
        this.services = [];
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.container = document.querySelector(this.options.containerSelector);
        
        if (!this.container) {
            console.warn('Services container not found');
            return;
        }
        
        if (this.options.loadFromJSON) {
            this.loadServices();
        } else {
            this.collectExistingServices();
        }
        
        if (this.options.animateOnScroll) {
            this.setupScrollAnimations();
        }
        
        this.setupEventListeners();
    }
    
    collectExistingServices() {
        const existingCards = this.container.querySelectorAll(this.options.cardSelector);
        
        existingCards.forEach((card, index) => {
            const iconSVG = card.querySelector('.service-icon svg')?.outerHTML || '';
            const title = card.querySelector('h3')?.textContent || '';
            const description = card.querySelector('p')?.textContent || '';
            
            this.services.push({
                id: index + 1,
                title,
                description,
                icon: iconSVG,
                active: true,
                featured: card.classList.contains('featured')
            });
        });
    }
    
    async loadServices() {
        this.isLoading = true;
        this.showLoading();
        
        try {
            const response = await fetch(this.options.jsonEndpoint);
            if (!response.ok) throw new Error('Failed to load services');
            
            const data = await response.json();
            this.services = data.services || data;
            
            this.renderServices();
        } catch (error) {
            console.error('Error loading services:', error);
            this.showError('שגיאה בטעינת השירותים');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }
    
    renderServices() {
        if (!this.container) return;
        
        const servicesHTML = this.services
            .filter(service => service.active || !this.options.autoHide)
            .map(service => this.createServiceCard(service))
            .join('');
        
        this.container.innerHTML = servicesHTML;
        
        // Re-setup animations after rendering
        if (this.options.animateOnScroll) {
            this.setupScrollAnimations();
        }
        
        this.setupEventListeners();
    }
    
    createServiceCard(service) {
        const featuredClass = service.featured ? ' featured' : '';
        const badge = service.badge ? `<div class="service-badge">${service.badge}</div>` : '';
        
        return `
            <div class="service-card${featuredClass}" data-service-id="${service.id}">
                ${badge}
                <div class="service-icon">
                    ${service.icon}
                </div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
            </div>
        `;
    }
    
    setupScrollAnimations() {
        const cards = this.container.querySelectorAll(this.options.cardSelector);
        
        // Setup intersection observer for scroll animations
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        cards.forEach((card, index) => {
            // Set initial state
            card.style.opacity = '0.3';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
            
            observer.observe(card);
        });
    }
    
    setupEventListeners() {
        const cards = this.container.querySelectorAll(this.options.cardSelector);
        
        cards.forEach(card => {
            // Click event
            card.addEventListener('click', (e) => {
                const serviceId = card.dataset.serviceId;
                this.onCardClick(serviceId, card);
            });
            
            // Enhanced hover effects
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.service-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.service-icon');
                if (icon) {
                    icon.style.transform = '';
                }
            });
        });
    }
    
    onCardClick(serviceId, cardElement) {
        const service = this.services.find(s => s.id == serviceId);
        if (service) {
            // Emit custom event
            const event = new CustomEvent('serviceCardClick', {
                detail: { service, element: cardElement }
            });
            document.dispatchEvent(event);
            
            // Optional callback
            if (this.options.onCardClick) {
                this.options.onCardClick(service, cardElement);
            }
        }
    }
    
    addService(service) {
        const newId = Math.max(...this.services.map(s => s.id), 0) + 1;
        service.id = newId;
        
        this.services.push(service);
        this.renderServices();
        
        return newId;
    }
    
    updateService(id, updates) {
        const index = this.services.findIndex(s => s.id == id);
        if (index !== -1) {
            this.services[index] = { ...this.services[index], ...updates };
            this.renderServices();
            return true;
        }
        return false;
    }
    
    removeService(id) {
        const index = this.services.findIndex(s => s.id == id);
        if (index !== -1) {
            this.services.splice(index, 1);
            this.renderServices();
            return true;
        }
        return false;
    }
    
    toggleService(id) {
        const service = this.services.find(s => s.id == id);
        if (service) {
            service.active = !service.active;
            this.renderServices();
            return service.active;
        }
        return false;
    }
    
    filterServices(criteria) {
        const filtered = this.services.filter(service => {
            return Object.entries(criteria).every(([key, value]) => {
                if (key === 'search') {
                    return service.title.toLowerCase().includes(value.toLowerCase()) ||
                           service.description.toLowerCase().includes(value.toLowerCase());
                }
                return service[key] === value;
            });
        });
        
        return filtered;
    }
    
    showLoading() {
        if (this.container) {
            this.container.classList.add('loading');
        }
    }
    
    hideLoading() {
        if (this.container) {
            this.container.classList.remove('loading');
        }
    }
    
    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="services-error">
                    <p>${message}</p>
                    <button onclick="location.reload()">נסה שוב</button>
                </div>
            `;
        }
    }
    
    // Utility methods
    getServiceCount() {
        return this.services.length;
    }
    
    getActiveServices() {
        return this.services.filter(s => s.active);
    }
    
    getFeaturedServices() {
        return this.services.filter(s => s.featured);
    }
}

// Auto-initialize if services grid exists
document.addEventListener('DOMContentLoaded', function() {
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
        window.servicesInstance = new ServicesCards();
        
        // Example event listener for card clicks
        document.addEventListener('serviceCardClick', (e) => {
            console.log('Service clicked:', e.detail.service);
            // Handle service card click here
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServicesCards;
}