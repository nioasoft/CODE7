// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    mobileMenuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Header scroll effect
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // Active navigation link
    const sections = document.querySelectorAll('section[id]');
    
    function setActiveLink() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }
    
    window.addEventListener('scroll', setActiveLink);

    // Smooth scroll for anchor links
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

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Form data prepared for submission
        
        // Send data to server
        fetch('/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('תודה על פנייתך! נחזור אליך בהקדם.');
                this.reset();
            } else {
                alert('שגיאה בשליחת הטופס: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error sending form:', error);
            alert('שגיאה בשליחת הטופס. נסה שוב מאוחר יותר.');
        });
        });
    }

    // Scroll animations - optimized for faster loading
    const observerOptions = {
        threshold: 0.15, // Trigger earlier for faster response
        rootMargin: '0px 0px -50px 0px' // Reduced margin for earlier trigger
    };

    // Make observer global for reuse
    window.scrollObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                window.scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Function to setup animations for elements
    function setupAnimations() {
        const animatedElements = document.querySelectorAll('.service-card, .project-card, .testimonial-card, .faq-item');
        
        animatedElements.forEach((el, index) => {
            // Show content immediately, then animate
            el.style.opacity = '0.3'; // Show content with low opacity first
            el.style.transform = 'translateY(20px)';
            el.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
            window.scrollObserver.observe(el);
        });
    }
    
    // Setup animations immediately
    setupAnimations();

    // Parallax effect for hero background shapes
    const shapes = document.querySelectorAll('.geometric-shape');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            shape.style.transform = `translateY(${yPos}px)`;
        });
    });

    // Form validation
    const inputs = contactForm ? contactForm.querySelectorAll('input, select, textarea') : [];
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value) {
                this.classList.add('error');
                this.style.borderColor = '#FF3B30';
            } else {
                this.classList.remove('error');
                this.style.borderColor = '';
            }
        });
        
        input.addEventListener('focus', function() {
            this.classList.remove('error');
            this.style.borderColor = '';
        });
    });

    // Email validation
    const emailInput = document.getElementById('email');
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
            this.classList.add('error');
            this.style.borderColor = '#FF3B30';
        }
        });
    }

    // Phone validation
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
        // Remove non-numeric characters
        this.value = this.value.replace(/[^0-9-]/g, '');
        });
    }

    // Add loading state to submit button
    if (contactForm) {
        contactForm.addEventListener('submit', function() {
        const submitButton = this.querySelector('.submit-button');
        submitButton.textContent = 'שולח...';
        submitButton.disabled = true;
        
        // Reset button after 2 seconds (simulating server response)
        setTimeout(() => {
            submitButton.textContent = 'שלח פנייה';
            submitButton.disabled = false;
        }, 2000);
        });
    }

    // Lazy loading for project images
    const projectImages = document.querySelectorAll('.project-image');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Here you would normally load the actual image
                entry.target.style.opacity = '1';
                imageObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    projectImages.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.6s ease';
        imageObserver.observe(img);
    });

    // Add hover effect to project cards
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Service cards hover effect
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.service-icon');
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.service-icon');
            icon.style.transform = '';
        });
    });

    // Load dynamic content from admin data
    loadDynamicContent();
    
    // Set initial styles for hero animations - faster and smoother
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const ctaButton = document.querySelector('.cta-button');
    
    if (heroTitle) {
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(20px)';
        heroTitle.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    }
    
    if (heroSubtitle) {
        heroSubtitle.style.opacity = '0';
        heroSubtitle.style.transform = 'translateY(20px)';
        heroSubtitle.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    }
    
    if (ctaButton) {
        ctaButton.style.opacity = '0';
        ctaButton.style.transform = 'translateY(20px)';
        ctaButton.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    }

    // Initialize animations on page load - much faster
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Animate hero content with shorter delays
        setTimeout(() => {
            if (heroTitle) {
                heroTitle.style.opacity = '1';
                heroTitle.style.transform = 'translateY(0)';
            }
        }, 100);
        
        setTimeout(() => {
            if (heroSubtitle) {
                heroSubtitle.style.opacity = '1';
                heroSubtitle.style.transform = 'translateY(0)';
            }
        }, 200);
        
        setTimeout(() => {
            if (ctaButton) {
                ctaButton.style.opacity = '1';
                ctaButton.style.transform = 'translateY(0)';
            }
        }, 300);
    });
    
    // Load dynamic content when page loads
    loadDynamicContent();
});

// Load dynamic content from server
async function loadDynamicContent() {
    console.log('loadDynamicContent called');
    try {
        // Fetch data from server
        console.log('Fetching site data...');
        const response = await fetch('/site-data');
        if (!response.ok) throw new Error('Failed to fetch site data');
        console.log('Site data response:', response.status);
        
        const data = await response.json();
        console.log('Site data loaded:', data);
        // Site data loaded successfully from server
        
        updatePageContent(data);
    } catch (error) {
        console.error('Error loading site data from server:', error);
        // No fallback to localStorage - we want to rely on server data only
    }
}

// Update page content with data
function updatePageContent(data) {
    if (!data) return;
    
    // Update hero section
    if (data.hero) {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        
        if (heroTitle && data.hero.headline) {
            heroTitle.textContent = data.hero.headline;
        }
        if (heroSubtitle && data.hero.subtitle) {
            heroSubtitle.textContent = data.hero.subtitle;
        }
    }
    
    // Update logo
    if (data.settings) {
        updateSiteLogo(data.settings.logo);
    }
    
    // Update projects dynamically from JSON with proper ordering
    if (data.projects) {
        console.log('Updating projects with data:', data.projects);
        const projectsGrid = document.querySelector('.projects-grid');
        
        if (projectsGrid) {
            // Clear existing static projects
            projectsGrid.innerHTML = '';
            
            // Sort projects by order field (for drag & drop reordering)
            const sortedProjects = data.projects
                .filter(project => project.active)
                .sort((a, b) => {
                    const orderA = a.order !== undefined ? a.order : a.id;
                    const orderB = b.order !== undefined ? b.order : b.id;
                    return orderA - orderB;
                });
            
            // Create project cards dynamically from JSON
            sortedProjects.forEach((project) => {
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                projectCard.dataset.projectId = project.id; // For drag & drop
                
                projectCard.innerHTML = `
                    <div class="project-image">
                        ${project.image ? `<img src="${project.image}" alt="${project.name}" style="width: 100%; height: 100%; object-fit: cover;">` : ''}
                    </div>
                    <div class="project-content">
                        <h3>${project.name}</h3>
                        <p>${project.description}</p>
                        ${project.url ? `<a href="${project.url}" target="_blank" class="project-link">צפה בפרויקט</a>` : ''}
                    </div>
                `;
                
                projectsGrid.appendChild(projectCard);
                console.log(`Added project: ${project.name} with image: ${project.image ? 'YES' : 'NO'} at order: ${project.order || 0}`);
            });
            
            console.log(`Total projects displayed: ${sortedProjects.length}`);
        }
    }
    
    // Update testimonials
    if (data.testimonials) {
        updateTestimonials(data.testimonials);
    }
    
    // Update FAQ
    if (data.faq) {
        updateFAQ(data.faq);
    }
}

// Function to update from admin panel
function updateFromAdmin(data) {
    if (data.hero) {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        
        if (heroTitle && data.hero.headline) {
            heroTitle.textContent = data.hero.headline;
        }
        if (heroSubtitle && data.hero.subtitle) {
            heroSubtitle.textContent = data.hero.subtitle;
        }
    }
    
    // Update projects
    if (data.projects) {
        const projectCards = document.querySelectorAll('.project-card');
        data.projects.forEach((project, index) => {
            if (projectCards[index]) {
                const projectName = projectCards[index].querySelector('h3');
                const projectDesc = projectCards[index].querySelector('p');
                const projectImage = projectCards[index].querySelector('.project-image');
                
                if (projectName) projectName.textContent = project.name;
                if (projectDesc) projectDesc.textContent = project.description;
                if (projectImage && project.image) {
                    projectImage.innerHTML = `<img src="${project.image}" alt="${project.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
            }
        });
    }
}

// Listen for messages from admin panel
window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'dataUpdate') {
        // Received data update notification from admin panel
        loadDynamicContent();
    } else if (e.data && e.data.type === 'logoUpdate') {
        // Received logo update from admin panel
        updateSiteLogo(e.data.logoUrl);
    }
});

// Function to update site logo
function updateSiteLogo(logoUrl) {
    const siteLogo = document.getElementById('siteLogo');
    const siteTitle = document.getElementById('siteTitle');
    
    if (siteLogo && siteTitle) {
        if (logoUrl) {
            // Force reload to bypass cache
            siteLogo.onload = function() {
                this.style.display = 'block';
                siteTitle.style.display = 'none';
            };
            siteLogo.src = logoUrl;
        } else {
            siteLogo.style.display = 'none';
            siteTitle.style.display = 'block';
        }
    }
}

// Function to update testimonials dynamically
function updateTestimonials(testimonials) {
    const testimonialsGrid = document.querySelector('.testimonials-grid');
    if (!testimonialsGrid) return;
    
    testimonialsGrid.innerHTML = testimonials.map(testimonial => `
        <div class="testimonial-card">
            <div class="testimonial-content">
                <p>"${testimonial.text}"</p>
                <div class="testimonial-author">
                    <strong>${testimonial.name}</strong>
                    <span>${testimonial.role}${testimonial.company ? ` - ${testimonial.company}` : ''}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Re-setup animations for new content
    const newCards = testimonialsGrid.querySelectorAll('.testimonial-card');
    newCards.forEach((card, index) => {
        card.style.opacity = '0.3';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
        window.scrollObserver.observe(card);
    });
}

// Function to update FAQ dynamically
function updateFAQ(faq) {
    const faqList = document.querySelector('.faq-list');
    if (!faqList) return;
    
    faqList.innerHTML = faq.map(item => `
        <div class="faq-item">
            <button class="faq-question">
                <span>${item.question}</span>
                <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div class="faq-answer">
                <p>${item.answer}</p>
            </div>
        </div>
    `).join('');
    
    // Re-setup animations for new FAQ items
    const newItems = faqList.querySelectorAll('.faq-item');
    newItems.forEach((item, index) => {
        item.style.opacity = '0.3';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
        window.scrollObserver.observe(item);
    });
    
    // Re-initialize FAQ accordion functionality
    initializeFAQAccordion();
}

// Function to initialize FAQ accordion
function initializeFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Make updateFromAdmin available globally for iframe communication
window.updateFromAdmin = updateFromAdmin;