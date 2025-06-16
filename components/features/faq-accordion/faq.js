/**
 * FAQ Accordion Component
 * Provides interactive FAQ with search, filtering, and smooth animations
 */

class FAQAccordion {
    constructor(options = {}) {
        this.options = {
            containerSelector: '.faq-list',
            itemSelector: '.faq-item',
            questionSelector: '.faq-question',
            answerSelector: '.faq-answer',
            searchSelector: '#faqSearch',
            categorySelector: '.category-btn',
            loadFromJSON: false,
            jsonEndpoint: '/api/faq',
            allowMultipleOpen: false,
            enableSearch: true,
            enableCategories: false,
            rememberState: true,
            autoScroll: true,
            highlightSearchTerms: true,
            ...options
        };
        
        this.faqItems = [];
        this.filteredItems = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.openItems = new Set();
        
        this.init();
    }
    
    init() {
        this.container = document.querySelector(this.options.containerSelector);
        this.searchInput = document.querySelector(this.options.searchSelector);
        
        if (!this.container) {
            console.warn('FAQ container not found');
            return;
        }
        
        if (this.options.loadFromJSON) {
            this.loadFAQ();
        } else {
            this.collectExistingFAQ();
        }
        
        this.setupEventListeners();
        
        if (this.options.enableSearch) {
            this.setupSearch();
        }
        
        if (this.options.enableCategories) {
            this.setupCategories();
        }
        
        if (this.options.rememberState) {
            this.loadState();
        }
        
        this.updateStats();
    }
    
    collectExistingFAQ() {
        const existingItems = this.container.querySelectorAll(this.options.itemSelector);
        
        existingItems.forEach((item, index) => {
            const question = item.querySelector(this.options.questionSelector + ' span')?.textContent || '';
            const answer = item.querySelector(this.options.answerSelector + ' p')?.textContent || '';
            const category = item.dataset.category || 'general';
            
            this.faqItems.push({
                id: index + 1,
                question: question,
                answer: answer,
                category: category,
                featured: item.classList.contains('featured'),
                keywords: this.extractKeywords(question + ' ' + answer),
                element: item
            });
        });
        
        this.filteredItems = [...this.faqItems];
    }
    
    extractKeywords(text) {
        return text.toLowerCase()
            .replace(/[^\u0590-\u05FFa-zA-Z0-9\s]/g, '') // Keep Hebrew, English, numbers
            .split(/\s+/)
            .filter(word => word.length > 2);
    }
    
    async loadFAQ() {
        try {
            const response = await fetch(this.options.jsonEndpoint);
            if (!response.ok) throw new Error('Failed to load FAQ');
            
            const data = await response.json();
            this.faqItems = data.faq || data;
            
            this.renderFAQ();
        } catch (error) {
            console.error('Error loading FAQ:', error);
            this.showError('שגיאה בטעינת השאלות הנפוצות');
        }
    }
    
    renderFAQ() {
        if (!this.container) return;
        
        if (this.filteredItems.length === 0) {
            this.showEmpty();
            return;
        }
        
        const faqHTML = this.filteredItems
            .map(item => this.createFAQItem(item))
            .join('');
        
        this.container.innerHTML = faqHTML;
        
        // Re-setup event listeners after rendering
        this.setupEventListeners();
        this.updateStats();
    }
    
    createFAQItem(item) {
        const featuredClass = item.featured ? ' featured' : '';
        const categoryClass = item.category ? ` category-${item.category}` : '';
        
        return `
            <div class="faq-item${featuredClass}${categoryClass}" data-faq-id="${item.id}" data-category="${item.category}">
                <button class="faq-question">
                    <span>${this.highlightSearchTerm(item.question)}</span>
                    <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div class="faq-answer">
                    <p>${this.highlightSearchTerm(item.answer)}</p>
                </div>
            </div>
        `;
    }
    
    highlightSearchTerm(text) {
        if (!this.options.highlightSearchTerms || !this.searchTerm) {
            return text;
        }
        
        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
    
    setupEventListeners() {
        // Remove existing listeners to prevent duplicates
        this.container.removeEventListener('click', this.handleClick);
        
        // Add new listener
        this.handleClick = this.handleClick.bind(this);
        this.container.addEventListener('click', this.handleClick);
    }
    
    handleClick(e) {
        const question = e.target.closest(this.options.questionSelector);
        if (!question) return;
        
        const faqItem = question.closest(this.options.itemSelector);
        if (!faqItem) return;
        
        e.preventDefault();
        this.toggleItem(faqItem);
    }
    
    toggleItem(faqItem) {
        const faqId = faqItem.dataset.faqId;
        const isActive = faqItem.classList.contains('active');
        
        if (!this.options.allowMultipleOpen) {
            // Close all items first
            this.container.querySelectorAll(this.options.itemSelector).forEach(item => {
                item.classList.remove('active');
                this.openItems.delete(item.dataset.faqId);
            });
        }
        
        if (!isActive) {
            // Open the clicked item
            faqItem.classList.add('active');
            this.openItems.add(faqId);
            
            // Auto-scroll to item if enabled
            if (this.options.autoScroll) {
                setTimeout(() => {
                    faqItem.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }, 300);
            }
        } else if (this.options.allowMultipleOpen) {
            // Close the item if multiple open is allowed
            faqItem.classList.remove('active');
            this.openItems.delete(faqId);
        }
        
        // Save state
        if (this.options.rememberState) {
            this.saveState();
        }
        
        // Emit event
        const faqData = this.faqItems.find(item => item.id == faqId);
        document.dispatchEvent(new CustomEvent('faqItemToggle', {
            detail: { 
                faq: faqData, 
                element: faqItem, 
                isOpen: faqItem.classList.contains('active') 
            }
        }));
    }
    
    setupSearch() {
        if (!this.searchInput) return;
        
        let searchTimeout;
        
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });
        
        // Add search icon if not exists
        if (!this.searchInput.parentElement.querySelector('.search-icon')) {
            const searchIcon = document.createElement('div');
            searchIcon.innerHTML = `
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                </svg>
            `;
            this.searchInput.parentElement.appendChild(searchIcon.firstElementChild);
        }
    }
    
    performSearch(searchTerm) {
        this.searchTerm = searchTerm.trim().toLowerCase();
        
        if (!this.searchTerm) {
            this.filteredItems = this.applyCurrentFilter();
        } else {
            this.filteredItems = this.faqItems.filter(item => {
                const searchText = (item.question + ' ' + item.answer).toLowerCase();
                const keywordMatch = item.keywords.some(keyword => 
                    keyword.includes(this.searchTerm));
                const directMatch = searchText.includes(this.searchTerm);
                
                return directMatch || keywordMatch;
            });
            
            // Apply current category filter to search results
            if (this.currentFilter !== 'all') {
                this.filteredItems = this.filteredItems.filter(item => 
                    item.category === this.currentFilter);
            }
        }
        
        if (this.options.loadFromJSON) {
            this.renderFAQ();
        } else {
            this.filterExistingItems();
        }
        
        this.updateStats();
        
        // Emit search event
        document.dispatchEvent(new CustomEvent('faqSearch', {
            detail: { 
                term: searchTerm, 
                results: this.filteredItems.length,
                total: this.faqItems.length 
            }
        }));
    }
    
    setupCategories() {
        const categoryButtons = document.querySelectorAll(this.options.categorySelector);
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const category = button.dataset.category;
                this.applyFilter(category);
                
                // Update active button
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }
    
    applyFilter(category) {
        this.currentFilter = category;
        this.filteredItems = this.applyCurrentFilter();
        
        if (this.options.loadFromJSON) {
            this.renderFAQ();
        } else {
            this.filterExistingItems();
        }
        
        this.updateStats();
    }
    
    applyCurrentFilter() {
        if (this.currentFilter === 'all') {
            return [...this.faqItems];
        }
        return this.faqItems.filter(item => item.category === this.currentFilter);
    }
    
    filterExistingItems() {
        const allItems = this.container.querySelectorAll(this.options.itemSelector);
        const visibleIds = new Set(this.filteredItems.map(item => item.id.toString()));
        
        allItems.forEach(item => {
            const itemId = item.dataset.faqId;
            if (visibleIds.has(itemId)) {
                item.classList.remove('hidden');
                
                // Update content with highlighting
                const faqData = this.filteredItems.find(f => f.id.toString() === itemId);
                if (faqData) {
                    const questionSpan = item.querySelector(this.options.questionSelector + ' span');
                    const answerP = item.querySelector(this.options.answerSelector + ' p');
                    
                    if (questionSpan) questionSpan.innerHTML = this.highlightSearchTerm(faqData.question);
                    if (answerP) answerP.innerHTML = this.highlightSearchTerm(faqData.answer);
                }
            } else {
                item.classList.add('hidden');
            }
        });
        
        // Show no results message if needed
        if (this.filteredItems.length === 0) {
            this.showNoResults();
        } else {
            this.hideNoResults();
        }
    }
    
    updateStats() {
        let statsElement = document.querySelector('.faq-stats');
        
        if (!statsElement) {
            statsElement = document.createElement('div');
            statsElement.className = 'faq-stats';
            this.container.parentElement.insertBefore(statsElement, this.container);
        }
        
        const total = this.faqItems.length;
        const visible = this.filteredItems.length;
        
        if (this.searchTerm || this.currentFilter !== 'all') {
            statsElement.innerHTML = `מציג <span class="total-count">${visible}</span> מתוך ${total} שאלות`;
        } else {
            statsElement.innerHTML = `<span class="total-count">${total}</span> שאלות נפוצות`;
        }
    }
    
    showNoResults() {
        this.hideNoResults();
        
        const noResults = document.createElement('div');
        noResults.className = 'faq-item no-results';
        noResults.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3>לא נמצאו תוצאות</h3>
                <p>נסה מונחי חיפוש אחרים או בחר קטגוריה אחרת</p>
            </div>
        `;
        
        this.container.appendChild(noResults);
    }
    
    hideNoResults() {
        const noResults = this.container.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
    }
    
    showEmpty() {
        this.container.innerHTML = `
            <div class="faq-empty">
                <h3>אין שאלות נפוצות</h3>
                <p>בקרוב יתווספו שאלות ותשובות נפוצות</p>
            </div>
        `;
    }
    
    showError(message) {
        this.container.innerHTML = `
            <div class="faq-error">
                <h3>שגיאה בטעינת השאלות</h3>
                <p>${message}</p>
                <button onclick="location.reload()">נסה שוב</button>
            </div>
        `;
    }
    
    saveState() {
        if (!this.options.rememberState) return;
        
        const state = {
            openItems: Array.from(this.openItems),
            searchTerm: this.searchTerm,
            currentFilter: this.currentFilter
        };
        
        localStorage.setItem('faq-state', JSON.stringify(state));
    }
    
    loadState() {
        if (!this.options.rememberState) return;
        
        try {
            const savedState = localStorage.getItem('faq-state');
            if (!savedState) return;
            
            const state = JSON.parse(savedState);
            
            // Restore search
            if (state.searchTerm && this.searchInput) {
                this.searchInput.value = state.searchTerm;
                this.performSearch(state.searchTerm);
            }
            
            // Restore filter
            if (state.currentFilter && state.currentFilter !== 'all') {
                this.applyFilter(state.currentFilter);
                
                const categoryBtn = document.querySelector(`[data-category="${state.currentFilter}"]`);
                if (categoryBtn) {
                    document.querySelectorAll(this.options.categorySelector).forEach(btn => 
                        btn.classList.remove('active'));
                    categoryBtn.classList.add('active');
                }
            }
            
            // Restore open items
            setTimeout(() => {
                state.openItems.forEach(itemId => {
                    const item = this.container.querySelector(`[data-faq-id="${itemId}"]`);
                    if (item) {
                        item.classList.add('active');
                        this.openItems.add(itemId);
                    }
                });
            }, 100);
            
        } catch (error) {
            console.warn('Failed to load FAQ state:', error);
        }
    }
    
    // Public API methods
    openItem(id) {
        const item = this.container.querySelector(`[data-faq-id="${id}"]`);
        if (item && !item.classList.contains('active')) {
            this.toggleItem(item);
        }
    }
    
    closeItem(id) {
        const item = this.container.querySelector(`[data-faq-id="${id}"]`);
        if (item && item.classList.contains('active')) {
            this.toggleItem(item);
        }
    }
    
    openAll() {
        if (!this.options.allowMultipleOpen) return;
        
        this.container.querySelectorAll(this.options.itemSelector).forEach(item => {
            if (!item.classList.contains('hidden')) {
                item.classList.add('active');
                this.openItems.add(item.dataset.faqId);
            }
        });
        
        if (this.options.rememberState) {
            this.saveState();
        }
    }
    
    closeAll() {
        this.container.querySelectorAll(this.options.itemSelector).forEach(item => {
            item.classList.remove('active');
        });
        
        this.openItems.clear();
        
        if (this.options.rememberState) {
            this.saveState();
        }
    }
    
    search(term) {
        if (this.searchInput) {
            this.searchInput.value = term;
        }
        this.performSearch(term);
    }
    
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.performSearch('');
    }
    
    getOpenItems() {
        return Array.from(this.openItems);
    }
    
    getStats() {
        return {
            total: this.faqItems.length,
            visible: this.filteredItems.length,
            open: this.openItems.size,
            categories: [...new Set(this.faqItems.map(item => item.category))]
        };
    }
}

// Auto-initialize if FAQ list exists
document.addEventListener('DOMContentLoaded', function() {
    const faqList = document.querySelector('.faq-list');
    if (faqList) {
        window.faqInstance = new FAQAccordion();
        
        // Example event listeners
        document.addEventListener('faqItemToggle', (e) => {
            console.log('FAQ item toggled:', e.detail.faq?.question, 'Open:', e.detail.isOpen);
        });
        
        document.addEventListener('faqSearch', (e) => {
            console.log('FAQ search:', e.detail.term, 'Results:', e.detail.results);
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FAQAccordion;
}