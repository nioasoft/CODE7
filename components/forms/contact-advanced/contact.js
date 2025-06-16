/**
 * Advanced Contact Form Component
 * Provides enhanced form validation, submission, and UX features
 */

class AdvancedContactForm {
    constructor(options = {}) {
        this.options = {
            formSelector: '#contactForm',
            endpoint: '/contact',
            method: 'POST',
            validateOnType: true,
            validateOnBlur: true,
            showSuccessMessage: true,
            resetOnSuccess: true,
            enableCharCounter: true,
            maxDescriptionLength: 1000,
            ...options
        };
        
        this.form = null;
        this.fields = {};
        this.isSubmitting = false;
        this.validators = {};
        
        this.init();
    }
    
    init() {
        this.form = document.querySelector(this.options.formSelector);
        if (!this.form) {
            console.warn('Contact form not found');
            return;
        }
        
        this.collectFields();
        this.setupValidators();
        this.setupEventListeners();
        this.setupCharCounters();
        this.addRequiredIndicators();
    }
    
    collectFields() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            this.fields[input.name] = {
                element: input,
                group: input.closest('.form-group'),
                valid: false,
                touched: false
            };
        });
    }
    
    setupValidators() {
        this.validators = {
            name: (value) => {
                if (!value || value.trim().length < 2) {
                    return 'שם חייב להכיל לפחות 2 תווים';
                }
                if (!/^[א-תa-zA-Z\\s]+$/.test(value)) {
                    return 'שם יכול להכיל רק אותיות ורווחים';
                }
                return null;
            },
            
            email: (value) => {
                if (!value) return 'אימייל הוא שדה חובה';
                const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                if (!emailRegex.test(value)) {
                    return 'פורמט אימייל לא תקין';
                }
                return null;
            },
            
            phone: (value) => {
                if (!value) return 'טלפון הוא שדה חובה';
                const phoneRegex = /^0[5-9][0-9]{8}$|^0[2-4][0-9]{7}$/;
                const cleanPhone = value.replace(/[^0-9]/g, '');
                if (!phoneRegex.test(cleanPhone)) {
                    return 'מספר טלפון לא תקין (פורמט ישראלי)';
                }
                return null;
            },
            
            projectType: (value) => {
                if (!value) return 'יש לבחור סוג פרויקט';
                return null;
            },
            
            budget: (value) => {
                if (!value) return 'יש לבחור תקציב משוער';
                return null;
            },
            
            timeline: (value) => {
                if (!value) return 'יש לבחור לוח זמנים';
                return null;
            },
            
            description: (value) => {
                if (!value || value.trim().length < 10) {
                    return 'תיאור הפרויקט חייב להכיל לפחות 10 תווים';
                }
                if (value.length > this.options.maxDescriptionLength) {
                    return `תיאור הפרויקט ארוך מדי (מקסימום ${this.options.maxDescriptionLength} תווים)`;
                }
                return null;
            }
        };
    }
    
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Field validation
        Object.values(this.fields).forEach(field => {
            const { element, group } = field;
            
            // Focus events
            element.addEventListener('focus', () => {
                group.classList.add('focused');
                this.clearFieldError(field);
            });
            
            element.addEventListener('blur', () => {
                group.classList.remove('focused');
                field.touched = true;
                
                if (this.options.validateOnBlur) {
                    this.validateField(field);
                }
            });
            
            // Input events
            if (this.options.validateOnType) {
                element.addEventListener('input', () => {
                    if (field.touched) {
                        this.validateField(field);
                    }
                    this.updateCharCounter(field);
                });
            }
            
            // Phone formatting
            if (element.name === 'phone') {
                element.addEventListener('input', () => {
                    this.formatPhone(element);
                });
            }
        });
    }
    
    setupCharCounters() {
        if (!this.options.enableCharCounter) return;
        
        Object.values(this.fields).forEach(field => {
            const { element } = field;
            if (element.tagName === 'TEXTAREA') {
                this.createCharCounter(field);
            }
        });
    }
    
    createCharCounter(field) {
        const { element, group } = field;
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        group.appendChild(counter);
        
        this.updateCharCounter(field);
    }
    
    updateCharCounter(field) {
        const { element, group } = field;
        const counter = group.querySelector('.char-counter');
        
        if (counter && element.tagName === 'TEXTAREA') {
            const length = element.value.length;
            const max = this.options.maxDescriptionLength;
            counter.textContent = `${length}/${max}`;
            
            counter.className = 'char-counter';
            if (length > max * 0.8) counter.classList.add('warning');
            if (length > max) counter.classList.add('error');
        }
    }
    
    addRequiredIndicators() {
        Object.values(this.fields).forEach(field => {
            const { element, group } = field;
            const label = group.querySelector('label');
            
            if (element.hasAttribute('required') && label) {
                label.classList.add('required');
            }
        });
    }
    
    validateField(field) {
        const { element } = field;
        const validator = this.validators[element.name];
        
        if (!validator) {
            field.valid = true;
            this.showFieldSuccess(field);
            return true;
        }
        
        const error = validator(element.value);
        
        if (error) {
            field.valid = false;
            this.showFieldError(field, error);
            return false;
        } else {
            field.valid = true;
            this.showFieldSuccess(field);
            return true;
        }
    }
    
    validateAllFields() {
        let allValid = true;
        
        Object.values(this.fields).forEach(field => {
            field.touched = true;
            const isValid = this.validateField(field);
            if (!isValid) allValid = false;
        });
        
        return allValid;
    }
    
    showFieldError(field, message) {
        const { element, group } = field;
        
        group.classList.remove('success');
        group.classList.add('error');
        element.classList.remove('success');
        element.classList.add('error');
        
        let errorElement = group.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            group.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }
    
    showFieldSuccess(field) {
        const { element, group } = field;
        
        group.classList.remove('error');
        group.classList.add('success');
        element.classList.remove('error');
        element.classList.add('success');
        
        const errorElement = group.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    clearFieldError(field) {
        const { element, group } = field;
        
        group.classList.remove('error');
        element.classList.remove('error');
        
        const errorElement = group.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    formatPhone(element) {
        let value = element.value.replace(/[^0-9]/g, '');
        
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        if (value.length >= 3) {
            value = value.substring(0, 3) + '-' + value.substring(3);
        }
        
        element.value = value;
    }
    
    async handleSubmit() {
        if (this.isSubmitting) return;
        
        // Validate all fields
        if (!this.validateAllFields()) {
            this.showMessage('יש לתקן את השגיאות בטופס', 'error');
            return;
        }
        
        this.isSubmitting = true;
        this.setSubmitLoading(true);
        
        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);
            
            const response = await fetch(this.options.endpoint, {
                method: this.options.method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.handleSuccess(result.message || 'הפנייה נשלחה בהצלחה!');
            } else {
                this.handleError(result.message || 'שגיאה בשליחת הטופס');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.handleError('שגיאה בחיבור לשרת. נסה שוב מאוחר יותר.');
        } finally {
            this.isSubmitting = false;
            this.setSubmitLoading(false);
        }
    }
    
    handleSuccess(message) {
        if (this.options.showSuccessMessage) {
            this.showMessage(message, 'success');
        }
        
        if (this.options.resetOnSuccess) {
            setTimeout(() => {
                this.resetForm();
            }, 2000);
        }
        
        this.form.classList.add('success');
        
        // Emit success event
        this.form.dispatchEvent(new CustomEvent('formSuccess', {
            detail: { message }
        }));
    }
    
    handleError(message) {
        this.showMessage(message, 'error');
        
        // Emit error event
        this.form.dispatchEvent(new CustomEvent('formError', {
            detail: { message }
        }));
    }
    
    showMessage(text, type) {
        let messageElement = this.form.querySelector('.form-message');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'form-message';
            this.form.appendChild(messageElement);
        }
        
        messageElement.textContent = text;
        messageElement.className = `form-message ${type}`;
        
        // Trigger show animation
        setTimeout(() => {
            messageElement.classList.add('show');
        }, 10);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 5000);
    }
    
    setSubmitLoading(loading) {
        const submitButton = this.form.querySelector('.submit-button');
        
        if (loading) {
            submitButton.disabled = true;
            submitButton.classList.add('loading');
        } else {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }
    }
    
    resetForm() {
        this.form.reset();
        this.form.classList.remove('success');
        
        // Reset all field states
        Object.values(this.fields).forEach(field => {
            field.valid = false;
            field.touched = false;
            field.group.classList.remove('success', 'error', 'focused');
            field.element.classList.remove('success', 'error');
            
            const errorElement = field.group.querySelector('.error-message');
            if (errorElement) errorElement.remove();
        });
        
        // Reset character counters
        Object.values(this.fields).forEach(field => {
            this.updateCharCounter(field);
        });
        
        // Hide messages
        const messageElement = this.form.querySelector('.form-message');
        if (messageElement) {
            messageElement.classList.remove('show');
        }
    }
    
    // Public API methods
    setFieldValue(fieldName, value) {
        const field = this.fields[fieldName];
        if (field) {
            field.element.value = value;
            this.validateField(field);
            this.updateCharCounter(field);
        }
    }
    
    getFieldValue(fieldName) {
        const field = this.fields[fieldName];
        return field ? field.element.value : null;
    }
    
    isFormValid() {
        return Object.values(this.fields).every(field => field.valid);
    }
    
    getFormData() {
        const data = {};
        Object.entries(this.fields).forEach(([name, field]) => {
            data[name] = field.element.value;
        });
        return data;
    }
}

// Auto-initialize if contact form exists
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        window.contactFormInstance = new AdvancedContactForm();
        
        // Example event listeners
        contactForm.addEventListener('formSuccess', (e) => {
            console.log('Form submitted successfully:', e.detail.message);
        });
        
        contactForm.addEventListener('formError', (e) => {
            console.error('Form submission failed:', e.detail.message);
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedContactForm;
}