/**
 * Gradient Animated Hero Component
 * Provides animated hero section with parallax effects
 */

class GradientAnimatedHero {
    constructor(options = {}) {
        this.options = {
            heroSelector: '.hero',
            titleSelector: '.hero-title',
            subtitleSelector: '.hero-subtitle',
            ctaSelector: '.cta-button',
            shapesSelector: '.geometric-shape',
            scrollIndicatorSelector: '.scroll-indicator',
            parallaxIntensity: 0.5,
            enableParallax: true,
            animationDuration: 500,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.hero = document.querySelector(this.options.heroSelector);
        this.title = document.querySelector(this.options.titleSelector);
        this.subtitle = document.querySelector(this.options.subtitleSelector);
        this.cta = document.querySelector(this.options.ctaSelector);
        this.shapes = document.querySelectorAll(this.options.shapesSelector);
        this.scrollIndicator = document.querySelector(this.options.scrollIndicatorSelector);
        
        this.setupAnimations();
        this.setupParallax();
        this.setupScrollIndicator();
        this.setupLoadAnimations();
    }
    
    setupAnimations() {
        // Set initial styles for load animations
        if (this.title) {
            this.title.style.opacity = '0';
            this.title.style.transform = 'translateY(20px)';
            this.title.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        }
        
        if (this.subtitle) {
            this.subtitle.style.opacity = '0';
            this.subtitle.style.transform = 'translateY(20px)';
            this.subtitle.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        }
        
        if (this.cta) {
            this.cta.style.opacity = '0';
            this.cta.style.transform = 'translateY(20px)';
            this.cta.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        }
    }
    
    setupParallax() {
        if (!this.options.enableParallax || !this.shapes.length) return;
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            this.shapes.forEach((shape, index) => {
                const speed = this.options.parallaxIntensity + (index * 0.1);
                const yPos = -(scrolled * speed);
                shape.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
    
    setupScrollIndicator() {
        if (!this.scrollIndicator) return;
        
        this.scrollIndicator.addEventListener('click', () => {
            const nextSection = this.hero?.nextElementSibling;
            if (nextSection) {
                nextSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    setupLoadAnimations() {
        // Trigger animations on page load
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
            
            // Animate title
            setTimeout(() => {
                if (this.title) {
                    this.title.style.opacity = '1';
                    this.title.style.transform = 'translateY(0)';
                }
            }, 100);
            
            // Animate subtitle
            setTimeout(() => {
                if (this.subtitle) {
                    this.subtitle.style.opacity = '1';
                    this.subtitle.style.transform = 'translateY(0)';
                }
            }, 200);
            
            // Animate CTA button
            setTimeout(() => {
                if (this.cta) {
                    this.cta.style.opacity = '1';
                    this.cta.style.transform = 'translateY(0)';
                }
            }, 300);
        });
    }
    
    updateContent(content) {
        if (content.title && this.title) {
            this.title.textContent = content.title;
        }
        
        if (content.subtitle && this.subtitle) {
            this.subtitle.textContent = content.subtitle;
        }
        
        if (content.ctaText && this.cta) {
            this.cta.textContent = content.ctaText;
        }
        
        if (content.ctaLink && this.cta) {
            this.cta.href = content.ctaLink;
        }
    }
    
    setTheme(theme) {
        if (!this.hero) return;
        
        const themes = {
            dark: {
                '--hero-bg-primary': '#1D1D1F',
                '--hero-bg-secondary': '#2C2C2E',
                '--hero-text-primary': '#FFFFFF',
                '--hero-text-secondary': 'rgba(255, 255, 255, 0.86)'
            },
            light: {
                '--hero-bg-primary': '#F2F2F7',
                '--hero-bg-secondary': '#FFFFFF',
                '--hero-text-primary': '#1D1D1F',
                '--hero-text-secondary': 'rgba(29, 29, 31, 0.86)'
            },
            blue: {
                '--hero-bg-primary': '#007AFF',
                '--hero-bg-secondary': '#0056CC',
                '--hero-text-primary': '#FFFFFF',
                '--hero-text-secondary': 'rgba(255, 255, 255, 0.86)'
            }
        };
        
        if (themes[theme]) {
            Object.entries(themes[theme]).forEach(([property, value]) => {
                this.hero.style.setProperty(property, value);
            });
        }
    }
    
    toggleParallax(enable = null) {
        if (enable === null) {
            this.options.enableParallax = !this.options.enableParallax;
        } else {
            this.options.enableParallax = enable;
        }
        
        if (!this.options.enableParallax) {
            // Reset shape positions
            this.shapes.forEach(shape => {
                shape.style.transform = '';
            });
        } else {
            this.setupParallax();
        }
    }
    
    addShape(config) {
        if (!this.hero) return;
        
        const background = this.hero.querySelector('.hero-background');
        if (!background) return;
        
        const shape = document.createElement('div');
        shape.className = 'geometric-shape';
        
        // Apply configuration
        Object.entries(config).forEach(([key, value]) => {
            shape.style[key] = value;
        });
        
        background.appendChild(shape);
        
        // Add to shapes collection for parallax
        this.shapes = document.querySelectorAll(this.options.shapesSelector);
    }
    
    removeAllShapes() {
        this.shapes.forEach(shape => shape.remove());
        this.shapes = [];
    }
}

// Auto-initialize if hero exists
document.addEventListener('DOMContentLoaded', function() {
    const hero = document.querySelector('.hero');
    if (hero) {
        window.heroInstance = new GradientAnimatedHero();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GradientAnimatedHero;
}