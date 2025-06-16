/**
 * Testimonials Cards Component
 * Provides dynamic testimonials management with ratings and animations
 */

class TestimonialsCards {
    constructor(options = {}) {
        this.options = {
            containerSelector: '.testimonials-grid',
            cardSelector: '.testimonial-card',
            loadFromJSON: false,
            jsonEndpoint: '/api/testimonials',
            enableCarousel: false,
            autoRotate: false,
            rotateInterval: 5000,
            animateOnScroll: true,
            showRatings: true,
            maxRating: 5,
            ...options
        };
        
        this.testimonials = [];
        this.currentSlide = 0;
        this.rotateTimer = null;
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.container = document.querySelector(this.options.containerSelector);
        
        if (!this.container) {
            console.warn('Testimonials container not found');
            return;
        }
        
        if (this.options.loadFromJSON) {
            this.loadTestimonials();
        } else {
            this.collectExistingTestimonials();
        }
        
        if (this.options.enableCarousel) {
            this.setupCarousel();
        }
        
        if (this.options.animateOnScroll) {
            this.setupScrollAnimations();
        }
        
        this.setupEventListeners();
    }
    
    collectExistingTestimonials() {
        const existingCards = this.container.querySelectorAll(this.options.cardSelector);
        
        existingCards.forEach((card, index) => {
            const text = card.querySelector('.testimonial-content p')?.textContent || '';
            const name = card.querySelector('.testimonial-author strong')?.textContent || '';
            const role = card.querySelector('.testimonial-author span')?.textContent || '';
            const ratingElement = card.querySelector('.stars');
            const rating = ratingElement ? this.countStars(ratingElement.textContent) : 5;
            
            this.testimonials.push({
                id: index + 1,
                name: name,
                role: role,
                company: '',
                text: text.replace(/^"|"$/g, ''), // Remove quotes
                rating: rating,
                avatar: '',
                featured: card.classList.contains('featured')
            });
        });
    }
    
    countStars(starsText) {
        return (starsText.match(/★/g) || []).length;
    }
    
    async loadTestimonials() {
        this.isLoading = true;
        this.showLoading();
        
        try {
            const response = await fetch(this.options.jsonEndpoint);
            if (!response.ok) throw new Error('Failed to load testimonials');
            
            const data = await response.json();
            this.testimonials = data.testimonials || data;
            
            this.renderTestimonials();
        } catch (error) {
            console.error('Error loading testimonials:', error);
            this.showError('שגיאה בטעינת ההמלצות');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }
    
    renderTestimonials() {
        if (!this.container) return;
        
        if (this.testimonials.length === 0) {
            this.showEmpty();
            return;
        }
        
        const testimonialsHTML = this.testimonials
            .map(testimonial => this.createTestimonialCard(testimonial))
            .join('');
        
        this.container.innerHTML = testimonialsHTML;
        
        // Re-setup animations after rendering
        if (this.options.animateOnScroll) {
            this.setupScrollAnimations();
        }
        
        if (this.options.enableCarousel) {
            this.setupCarousel();
        }
        
        this.setupEventListeners();
    }
    
    createTestimonialCard(testimonial) {
        const featuredClass = testimonial.featured ? ' featured' : '';
        
        const ratingHTML = this.options.showRatings && testimonial.rating ? `
            <div class="testimonial-rating">
                <span class="stars">${'★'.repeat(testimonial.rating)}${'☆'.repeat(this.options.maxRating - testimonial.rating)}</span>
                <span class="rating-number">(${testimonial.rating}.0)</span>
            </div>
        ` : '';
        
        const avatarHTML = testimonial.avatar ? `
            <div class="author-avatar">
                <img src="${testimonial.avatar}" alt="${testimonial.name}" loading="lazy">
            </div>
        ` : '';
        
        const authorHTML = `
            <div class="testimonial-author${!testimonial.avatar ? ' stacked' : ''}">
                ${avatarHTML}
                <div class="author-info">
                    <strong>${testimonial.name}</strong>
                    <span>${testimonial.role}${testimonial.company ? ` - ${testimonial.company}` : ''}</span>
                </div>
            </div>
        `;
        
        return `
            <div class="testimonial-card${featuredClass}" data-testimonial-id="${testimonial.id}">
                ${ratingHTML}
                <div class="testimonial-content">
                    <p>"${testimonial.text}"</p>
                    ${authorHTML}
                </div>
            </div>
        `;
    }
    
    setupCarousel() {
        if (!this.options.enableCarousel || this.testimonials.length <= 1) return;
        
        // Add carousel class to parent
        this.container.parentElement.classList.add('testimonials-carousel');
        
        // Create carousel controls
        this.createCarouselControls();
        
        // Setup auto-rotate
        if (this.options.autoRotate) {
            this.startAutoRotate();
        }
    }
    
    createCarouselControls() {
        const controlsHTML = `
            <div class="carousel-controls">
                <button class="carousel-btn prev" aria-label="Previous">‹</button>
                <button class="carousel-btn next" aria-label="Next">›</button>
            </div>
            <div class="carousel-dots">
                ${this.testimonials.map((_, index) => 
                    `<button class="carousel-dot${index === 0 ? ' active' : ''}" data-slide="${index}"></button>`
                ).join('')}
            </div>
        `;
        
        const controlsDiv = document.createElement('div');
        controlsDiv.innerHTML = controlsHTML;
        
        this.container.parentElement.appendChild(controlsDiv.firstElementChild);
        this.container.parentElement.appendChild(controlsDiv.lastElementChild);
        
        // Setup event listeners
        document.querySelector('.carousel-btn.prev').addEventListener('click', () => this.previousSlide());
        document.querySelector('.carousel-btn.next').addEventListener('click', () => this.nextSlide());
        
        document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
    }
    
    previousSlide() {
        this.currentSlide = this.currentSlide > 0 ? this.currentSlide - 1 : this.testimonials.length - 1;
        this.updateCarousel();
    }
    
    nextSlide() {
        this.currentSlide = this.currentSlide < this.testimonials.length - 1 ? this.currentSlide + 1 : 0;
        this.updateCarousel();
    }
    
    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
    }
    
    updateCarousel() {
        const translateX = -this.currentSlide * (300 + 16); // card width + margin
        this.container.style.transform = `translateX(${translateX}px)`;
        
        // Update dots
        document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
        
        // Restart auto-rotate timer
        if (this.options.autoRotate) {
            this.restartAutoRotate();
        }
    }
    
    startAutoRotate() {
        this.rotateTimer = setInterval(() => {
            this.nextSlide();
        }, this.options.rotateInterval);
    }
    
    stopAutoRotate() {
        if (this.rotateTimer) {
            clearInterval(this.rotateTimer);
            this.rotateTimer = null;
        }
    }
    
    restartAutoRotate() {
        this.stopAutoRotate();
        this.startAutoRotate();
    }
    
    setupScrollAnimations() {
        const cards = this.container.querySelectorAll(this.options.cardSelector);
        
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
            card.style.opacity = '0.3';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
            observer.observe(card);
        });
    }
    
    setupEventListeners() {
        const cards = this.container.querySelectorAll(this.options.cardSelector);
        
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                const testimonialId = card.dataset.testimonialId;
                const testimonial = this.testimonials.find(t => t.id == testimonialId);
                
                if (testimonial) {
                    // Emit click event
                    document.dispatchEvent(new CustomEvent('testimonialCardClick', {
                        detail: { testimonial, element: card }
                    }));
                    
                    // Optional callback
                    if (this.options.onCardClick) {
                        this.options.onCardClick(testimonial, card);
                    }
                }
            });
        });
        
        // Pause auto-rotate on hover
        if (this.options.autoRotate) {
            this.container.addEventListener('mouseenter', () => this.stopAutoRotate());
            this.container.addEventListener('mouseleave', () => this.startAutoRotate());
        }
    }
    
    showLoading() {
        if (this.container) {
            this.container.innerHTML = Array(3).fill(0).map(() => `
                <div class="testimonial-card loading">
                    <div class="testimonial-content">
                        <p>Loading testimonial content...</p>
                        <div class="testimonial-author">
                            <strong>Loading name...</strong>
                            <span>Loading role...</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    hideLoading() {
        const loadingCards = this.container.querySelectorAll('.testimonial-card.loading');
        loadingCards.forEach(card => card.remove());
    }
    
    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="testimonials-error">
                    <h3>שגיאה בטעינת ההמלצות</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()">נסה שוב</button>
                </div>
            `;
        }
    }
    
    showEmpty() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="testimonials-empty">
                    <h3>אין המלצות להצגה</h3>
                    <p>בקרוב יתווספו המלצות של לקוחות מרוצים</p>
                </div>
            `;
        }
    }
    
    // Public API methods
    addTestimonial(testimonial) {
        const newId = Math.max(...this.testimonials.map(t => t.id), 0) + 1;
        testimonial.id = newId;
        
        this.testimonials.push(testimonial);
        this.renderTestimonials();
        
        return newId;
    }
    
    updateTestimonial(id, updates) {
        const index = this.testimonials.findIndex(t => t.id == id);
        if (index !== -1) {
            this.testimonials[index] = { ...this.testimonials[index], ...updates };
            this.renderTestimonials();
            return true;
        }
        return false;
    }
    
    removeTestimonial(id) {
        const index = this.testimonials.findIndex(t => t.id == id);
        if (index !== -1) {
            this.testimonials.splice(index, 1);
            this.renderTestimonials();
            return true;
        }
        return false;
    }
    
    getTestimonialsByRating(minRating) {
        return this.testimonials.filter(t => t.rating >= minRating);
    }
    
    getFeaturedTestimonials() {
        return this.testimonials.filter(t => t.featured);
    }
    
    getAverageRating() {
        if (this.testimonials.length === 0) return 0;
        const total = this.testimonials.reduce((sum, t) => sum + (t.rating || 0), 0);
        return Math.round((total / this.testimonials.length) * 10) / 10;
    }
    
    // Cleanup
    destroy() {
        this.stopAutoRotate();
        
        // Remove event listeners
        document.removeEventListener('testimonialCardClick', this.handleCardClick);
        
        // Remove carousel controls
        const controls = document.querySelector('.carousel-controls');
        const dots = document.querySelector('.carousel-dots');
        if (controls) controls.remove();
        if (dots) dots.remove();
    }
}

// Auto-initialize if testimonials grid exists
document.addEventListener('DOMContentLoaded', function() {
    const testimonialsGrid = document.querySelector('.testimonials-grid');
    if (testimonialsGrid) {
        window.testimonialsInstance = new TestimonialsCards();
        
        // Example event listener
        document.addEventListener('testimonialCardClick', (e) => {
            console.log('Testimonial clicked:', e.detail.testimonial);
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestimonialsCards;
}