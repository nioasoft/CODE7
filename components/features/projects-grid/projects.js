/**
 * Projects Grid Component
 * Provides dynamic projects gallery with filtering and lazy loading
 */

class ProjectsGrid {
    constructor(options = {}) {
        this.options = {
            containerSelector: '.projects-grid',
            cardSelector: '.project-card',
            filterSelector: '.project-filters',
            loadFromJSON: false,
            jsonEndpoint: '/api/projects',
            enableFilters: true,
            enableLazyLoading: true,
            animateOnScroll: true,
            enableModal: false,
            ...options
        };
        
        this.projects = [];
        this.filteredProjects = [];
        this.currentFilter = 'all';
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.container = document.querySelector(this.options.containerSelector);
        
        if (!this.container) {
            console.warn('Projects container not found');
            return;
        }
        
        if (this.options.loadFromJSON) {
            this.loadProjects();
        } else {
            this.collectExistingProjects();
        }
        
        if (this.options.enableFilters) {
            this.setupFilters();
        }
        
        if (this.options.animateOnScroll) {
            this.setupScrollAnimations();
        }
        
        this.setupEventListeners();
    }
    
    collectExistingProjects() {
        const existingCards = this.container.querySelectorAll(this.options.cardSelector);
        
        existingCards.forEach((card, index) => {
            const image = card.querySelector('.project-image img');
            const title = card.querySelector('h3')?.textContent || '';
            const description = card.querySelector('p')?.textContent || '';
            const category = card.dataset.category || 'website';
            
            this.projects.push({
                id: index + 1,
                name: title,
                description,
                image: image?.src || '',
                url: card.dataset.url || '',
                category,
                featured: card.classList.contains('featured')
            });
        });
        
        this.filteredProjects = [...this.projects];
    }
    
    async loadProjects() {
        this.isLoading = true;
        this.showLoading();
        
        try {
            const response = await fetch(this.options.jsonEndpoint);
            if (!response.ok) throw new Error('Failed to load projects');
            
            const data = await response.json();
            this.projects = data.projects || data;
            this.filteredProjects = [...this.projects];
            
            this.renderProjects();
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showError('שגיאה בטעינת הפרויקטים');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }
    
    renderProjects() {
        if (!this.container) return;
        
        if (this.filteredProjects.length === 0) {
            this.showEmpty();
            return;
        }
        
        const projectsHTML = this.filteredProjects
            .map(project => this.createProjectCard(project))
            .join('');
        
        this.container.innerHTML = projectsHTML;
        
        // Setup lazy loading after rendering
        if (this.options.enableLazyLoading) {
            this.setupLazyLoading();
        }
        
        // Re-setup animations after rendering
        if (this.options.animateOnScroll) {
            this.setupScrollAnimations();
        }
        
        this.setupEventListeners();
    }
    
    createProjectCard(project) {
        const featuredClass = project.featured ? ' featured' : '';
        const imageContent = project.image 
            ? `<img src="${project.image}" alt="${project.name}" loading="lazy">`
            : '';
        
        const metaContent = project.category || project.url ? `
            <div class="project-meta">
                ${project.category ? `<span class="project-category">${this.getCategoryName(project.category)}</span>` : ''}
                ${project.url ? `
                    <a href="${project.url}" target="_blank" class="project-link">
                        צפה בפרויקט
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15,3 21,3 21,9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                ` : ''}
            </div>
        ` : '';
        
        return `
            <div class="project-card${featuredClass}" data-project-id="${project.id}" data-category="${project.category}" data-url="${project.url || ''}">
                <div class="project-image">
                    ${imageContent}
                </div>
                <div class="project-content">
                    <h3>${project.name}</h3>
                    <p>${project.description}</p>
                    ${metaContent}
                </div>
            </div>
        `;
    }
    
    getCategoryName(category) {
        const categories = {
            'website': 'אתר תדמית',
            'ecommerce': 'חנות מקוונת',
            'app': 'אפליקציה',
            'system': 'מערכת ניהול',
            'other': 'אחר'
        };
        return categories[category] || category;
    }
    
    setupFilters() {
        const filtersContainer = document.querySelector(this.options.filterSelector);
        
        if (!filtersContainer && this.options.enableFilters) {
            this.createFilters();
        }
        
        // Setup filter event listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-button')) {
                e.preventDefault();
                const filter = e.target.dataset.filter;
                this.applyFilter(filter);
                
                // Update active button
                document.querySelectorAll('.filter-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });
    }
    
    createFilters() {
        const categories = ['all', ...new Set(this.projects.map(p => p.category))];
        const filtersHTML = categories.map(category => {
            const name = category === 'all' ? 'הכל' : this.getCategoryName(category);
            const activeClass = category === 'all' ? ' active' : '';
            return `<button class="filter-button${activeClass}" data-filter="${category}">${name}</button>`;
        }).join('');
        
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'project-filters';
        filtersContainer.innerHTML = filtersHTML;
        
        // Insert before projects grid
        this.container.parentNode.insertBefore(filtersContainer, this.container);
    }
    
    applyFilter(filter) {
        this.currentFilter = filter;
        
        if (filter === 'all') {
            this.filteredProjects = [...this.projects];
        } else {
            this.filteredProjects = this.projects.filter(project => project.category === filter);
        }
        
        this.renderProjects();
        
        // Emit filter event
        document.dispatchEvent(new CustomEvent('projectsFiltered', {
            detail: { filter, count: this.filteredProjects.length }
        }));
    }
    
    setupLazyLoading() {
        const images = this.container.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('loading');
                        imageObserver.unobserve(img);
                    }
                });
            }, { threshold: 0.1 });
            
            images.forEach(img => {
                img.classList.add('loading');
                imageObserver.observe(img);
            });
        }
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
                // Don't trigger if clicking on a link
                if (e.target.tagName === 'A') return;
                
                const projectId = card.dataset.projectId;
                const url = card.dataset.url;
                
                if (url) {
                    window.open(url, '_blank');
                } else if (this.options.enableModal) {
                    this.showProjectModal(projectId);
                }
                
                // Emit click event
                const project = this.projects.find(p => p.id == projectId);
                document.dispatchEvent(new CustomEvent('projectCardClick', {
                    detail: { project, element: card }
                }));
            });
        });
    }
    
    showProjectModal(projectId) {
        const project = this.projects.find(p => p.id == projectId);
        if (!project) return;
        
        // Implementation for modal would go here
        console.log('Show modal for project:', project);
    }
    
    showLoading() {
        if (this.container) {
            this.container.innerHTML = Array(6).fill(0).map(() => `
                <div class="project-card loading">
                    <div class="project-image loading"></div>
                    <div class="project-content">
                        <div class="loading-text"></div>
                        <div class="loading-text short"></div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    hideLoading() {
        const loadingCards = this.container.querySelectorAll('.project-card.loading');
        loadingCards.forEach(card => card.remove());
    }
    
    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="projects-error">
                    <h3>שגיאה בטעינת הפרויקטים</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()">נסה שוב</button>
                </div>
            `;
        }
    }
    
    showEmpty() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="projects-empty">
                    <h3>אין פרויקטים להצגה</h3>
                    <p>נסה לשנות את המסנן או לבדוק מאוחר יותר</p>
                </div>
            `;
        }
    }
    
    // Public API methods
    addProject(project) {
        const newId = Math.max(...this.projects.map(p => p.id), 0) + 1;
        project.id = newId;
        
        this.projects.push(project);
        this.applyFilter(this.currentFilter);
        
        return newId;
    }
    
    updateProject(id, updates) {
        const index = this.projects.findIndex(p => p.id == id);
        if (index !== -1) {
            this.projects[index] = { ...this.projects[index], ...updates };
            this.applyFilter(this.currentFilter);
            return true;
        }
        return false;
    }
    
    removeProject(id) {
        const index = this.projects.findIndex(p => p.id == id);
        if (index !== -1) {
            this.projects.splice(index, 1);
            this.applyFilter(this.currentFilter);
            return true;
        }
        return false;
    }
    
    getProjectCount() {
        return this.projects.length;
    }
    
    getFeaturedProjects() {
        return this.projects.filter(p => p.featured);
    }
    
    getProjectsByCategory(category) {
        return this.projects.filter(p => p.category === category);
    }
}

// Auto-initialize if projects grid exists
document.addEventListener('DOMContentLoaded', function() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
        window.projectsInstance = new ProjectsGrid();
        
        // Example event listeners
        document.addEventListener('projectCardClick', (e) => {
            console.log('Project clicked:', e.detail.project);
        });
        
        document.addEventListener('projectsFiltered', (e) => {
            console.log('Filter applied:', e.detail.filter, 'Count:', e.detail.count);
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectsGrid;
}