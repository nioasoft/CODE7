// Rich Text Editor Component
class RichTextEditor {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            toolbar: ['bold', 'italic', 'underline', 'link', 'unorderedList', 'orderedList'],
            placeholder: 'הכנס טקסט...',
            direction: 'rtl',
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.createEditor();
        this.createToolbar();
        this.bindEvents();
    }
    
    createEditor() {
        // Replace textarea with contenteditable div
        this.editor = document.createElement('div');
        this.editor.className = 'rich-editor-content';
        this.editor.contentEditable = true;
        this.editor.dir = this.options.direction;
        this.editor.style.cssText = `
            min-height: 120px;
            padding: 12px 16px;
            border: 1px solid var(--admin-border);
            border-radius: 8px;
            background: var(--admin-white);
            outline: none;
            font-family: inherit;
            font-size: 1rem;
            line-height: 1.6;
        `;
        
        // Set initial content
        this.editor.innerHTML = this.element.value || '';
        
        // Replace original element
        this.element.style.display = 'none';
        this.element.parentNode.insertBefore(this.editor, this.element);
        
        // Add placeholder handling
        this.updatePlaceholder();
    }
    
    createToolbar() {
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'rich-editor-toolbar';
        this.toolbar.style.cssText = `
            display: flex;
            gap: 4px;
            padding: 8px;
            border: 1px solid var(--admin-border);
            border-bottom: none;
            border-radius: 8px 8px 0 0;
            background: var(--admin-light-gray);
            flex-wrap: wrap;
        `;
        
        // Insert toolbar before editor
        this.editor.parentNode.insertBefore(this.toolbar, this.editor);
        
        // Update editor styles for toolbar
        this.editor.style.borderRadius = '0 0 8px 8px';
        
        // Create toolbar buttons
        this.createToolbarButtons();
    }
    
    createToolbarButtons() {
        const buttons = {
            bold: { icon: 'B', title: 'מודגש', command: 'bold' },
            italic: { icon: 'I', title: 'נטוי', command: 'italic' },
            underline: { icon: 'U', title: 'קו תחתון', command: 'underline' },
            link: { icon: '🔗', title: 'קישור', command: 'createLink' },
            unorderedList: { icon: '• ', title: 'רשימה', command: 'insertUnorderedList' },
            orderedList: { icon: '1.', title: 'רשימה ממוספרת', command: 'insertOrderedList' }
        };
        
        this.options.toolbar.forEach(buttonName => {
            if (buttons[buttonName]) {
                const button = this.createButton(buttons[buttonName]);
                this.toolbar.appendChild(button);
            }
        });
    }
    
    createButton(buttonConfig) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'toolbar-button';
        button.innerHTML = buttonConfig.icon;
        button.title = buttonConfig.title;
        button.style.cssText = `
            padding: 6px 12px;
            border: 1px solid var(--admin-border);
            border-radius: 4px;
            background: var(--admin-white);
            cursor: pointer;
            font-weight: bold;
            transition: var(--admin-transition);
        `;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.executeCommand(buttonConfig.command);
        });
        
        button.addEventListener('mouseenter', () => {
            button.style.background = 'var(--admin-primary)';
            button.style.color = 'var(--admin-white)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = 'var(--admin-white)';
            button.style.color = 'inherit';
        });
        
        return button;
    }
    
    executeCommand(command) {
        this.editor.focus();
        
        if (command === 'createLink') {
            const url = prompt('הכנס URL:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else {
            document.execCommand(command, false, null);
        }
        
        this.updateOriginalElement();
        this.updatePlaceholder();
    }
    
    bindEvents() {
        // Update original element on content change
        this.editor.addEventListener('input', () => {
            this.updateOriginalElement();
            this.updatePlaceholder();
        });
        
        this.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            document.execCommand('insertText', false, text);
        });
        
        // Focus styles
        this.editor.addEventListener('focus', () => {
            this.editor.style.borderColor = 'var(--admin-primary)';
            this.editor.style.boxShadow = '0 0 0 3px rgba(0, 122, 255, 0.1)';
        });
        
        this.editor.addEventListener('blur', () => {
            this.editor.style.borderColor = 'var(--admin-border)';
            this.editor.style.boxShadow = 'none';
        });
    }
    
    updateOriginalElement() {
        this.element.value = this.editor.innerHTML;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        this.element.dispatchEvent(event);
    }
    
    updatePlaceholder() {
        const isEmpty = this.editor.textContent.trim() === '';
        
        if (isEmpty && !this.editor.querySelector('.placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder';
            placeholder.textContent = this.options.placeholder;
            placeholder.style.cssText = `
                color: var(--admin-text-secondary);
                pointer-events: none;
                position: absolute;
            `;
            this.editor.appendChild(placeholder);
        } else if (!isEmpty && this.editor.querySelector('.placeholder')) {
            this.editor.querySelector('.placeholder').remove();
        }
    }
    
    getValue() {
        return this.editor.innerHTML;
    }
    
    setValue(content) {
        this.editor.innerHTML = content;
        this.updateOriginalElement();
        this.updatePlaceholder();
    }
    
    destroy() {
        if (this.toolbar) {
            this.toolbar.remove();
        }
        if (this.editor) {
            this.editor.remove();
        }
        this.element.style.display = '';
    }
}

// Initialize rich text editors
function initializeRichTextEditors() {
    // Auto-initialize editors with data-rich-editor attribute
    document.querySelectorAll('[data-rich-editor]').forEach(element => {
        const options = JSON.parse(element.getAttribute('data-rich-editor') || '{}');
        new RichTextEditor(element, options);
    });
}

// Color Picker Component
class ColorPicker {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            format: 'hex',
            presets: ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#AF52DE'],
            showPresets: true,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.createPicker();
        this.bindEvents();
    }
    
    createPicker() {
        const wrapper = document.createElement('div');
        wrapper.className = 'color-picker-wrapper';
        wrapper.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        `;
        
        // Color input
        this.colorInput = document.createElement('input');
        this.colorInput.type = 'color';
        this.colorInput.value = this.element.value || '#007AFF';
        this.colorInput.style.cssText = `
            width: 48px;
            height: 48px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        `;
        
        // Text input for hex value
        this.textInput = document.createElement('input');
        this.textInput.type = 'text';
        this.textInput.value = this.colorInput.value;
        this.textInput.placeholder = '#000000';
        this.textInput.maxLength = 7;
        this.textInput.style.cssText = `
            width: 120px;
            padding: 8px 12px;
            border: 1px solid var(--admin-border);
            border-radius: 6px;
            font-family: monospace;
        `;
        
        wrapper.appendChild(this.colorInput);
        wrapper.appendChild(this.textInput);
        
        // Add presets if enabled
        if (this.options.showPresets) {
            const presets = document.createElement('div');
            presets.className = 'color-presets';
            presets.style.cssText = `
                display: flex;
                gap: 4px;
                margin-top: 8px;
                width: 100%;
            `;
            
            this.options.presets.forEach(color => {
                const preset = document.createElement('button');
                preset.type = 'button';
                preset.className = 'color-preset';
                preset.style.cssText = `
                    width: 32px;
                    height: 32px;
                    border: 2px solid transparent;
                    border-radius: 6px;
                    background-color: ${color};
                    cursor: pointer;
                    transition: var(--admin-transition);
                `;
                
                preset.addEventListener('click', () => {
                    this.setValue(color);
                });
                
                preset.addEventListener('mouseenter', () => {
                    preset.style.borderColor = 'var(--admin-primary)';
                });
                
                preset.addEventListener('mouseleave', () => {
                    preset.style.borderColor = 'transparent';
                });
                
                presets.appendChild(preset);
            });
            
            wrapper.appendChild(presets);
        }
        
        // Replace original element
        this.element.style.display = 'none';
        this.element.parentNode.insertBefore(wrapper, this.element);
    }
    
    bindEvents() {
        this.colorInput.addEventListener('change', () => {
            this.setValue(this.colorInput.value);
        });
        
        this.textInput.addEventListener('input', () => {
            const value = this.textInput.value;
            if (this.isValidHex(value)) {
                this.colorInput.value = value;
                this.element.value = value;
                this.triggerChange();
            }
        });
    }
    
    setValue(value) {
        if (this.isValidHex(value)) {
            this.colorInput.value = value;
            this.textInput.value = value;
            this.element.value = value;
            this.triggerChange();
        }
    }
    
    isValidHex(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }
    
    triggerChange() {
        const event = new Event('change', { bubbles: true });
        this.element.dispatchEvent(event);
    }
}

// Icon Picker Component
class IconPicker {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            icons: [
                'home', 'user', 'settings', 'star', 'heart', 'search', 'plus', 'minus',
                'check', 'x', 'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down',
                'mail', 'phone', 'globe', 'camera', 'image', 'file', 'folder',
                'edit', 'trash', 'copy', 'save', 'download', 'upload', 'refresh'
            ],
            columns: 6,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.createPicker();
        this.bindEvents();
    }
    
    createPicker() {
        const wrapper = document.createElement('div');
        wrapper.className = 'icon-picker';
        wrapper.style.cssText = `
            border: 1px solid var(--admin-border);
            border-radius: 8px;
            padding: 12px;
            background: var(--admin-white);
            max-height: 200px;
            overflow-y: auto;
        `;
        
        const grid = document.createElement('div');
        grid.className = 'icon-grid';
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(${this.options.columns}, 1fr);
            gap: 8px;
        `;
        
        this.options.icons.forEach(iconName => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'icon-option';
            button.dataset.icon = iconName;
            button.style.cssText = `
                width: 40px;
                height: 40px;
                border: 2px solid transparent;
                border-radius: 6px;
                background: var(--admin-light-gray);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--admin-transition);
            `;
            
            // Add icon (using simple text representations)
            button.textContent = this.getIconSymbol(iconName);
            
            button.addEventListener('click', () => {
                this.selectIcon(iconName, button);
            });
            
            grid.appendChild(button);
        });
        
        wrapper.appendChild(grid);
        
        // Hide original element and insert picker
        this.element.style.display = 'none';
        this.element.parentNode.insertBefore(wrapper, this.element);
        
        // Select current icon if any
        if (this.element.value) {
            this.selectIcon(this.element.value);
        }
    }
    
    selectIcon(iconName, buttonElement = null) {
        // Remove previous selection
        this.element.parentNode.querySelectorAll('.icon-option').forEach(btn => {
            btn.style.borderColor = 'transparent';
            btn.style.backgroundColor = 'var(--admin-light-gray)';
        });
        
        // Select new icon
        const button = buttonElement || this.element.parentNode.querySelector(`[data-icon="${iconName}"]`);
        if (button) {
            button.style.borderColor = 'var(--admin-primary)';
            button.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
        }
        
        this.element.value = iconName;
        this.triggerChange();
    }
    
    getIconSymbol(iconName) {
        const symbols = {
            home: '🏠', user: '👤', settings: '⚙️', star: '⭐', heart: '❤️',
            search: '🔍', plus: '+', minus: '-', check: '✓', x: '✗',
            'arrow-right': '→', 'arrow-left': '←', 'arrow-up': '↑', 'arrow-down': '↓',
            mail: '📧', phone: '📞', globe: '🌐', camera: '📷', image: '🖼️',
            file: '📄', folder: '📁', edit: '✏️', trash: '🗑️', copy: '📋',
            save: '💾', download: '⬇️', upload: '⬆️', refresh: '🔄'
        };
        
        return symbols[iconName] || '📄';
    }
    
    bindEvents() {
        // Additional event bindings if needed
    }
    
    triggerChange() {
        const event = new Event('change', { bubbles: true });
        this.element.dispatchEvent(event);
    }
}

// Auto-initialize components on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeRichTextEditors();
    
    // Initialize color pickers
    document.querySelectorAll('[data-color-picker]').forEach(element => {
        const options = JSON.parse(element.getAttribute('data-color-picker') || '{}');
        new ColorPicker(element, options);
    });
    
    // Initialize icon pickers
    document.querySelectorAll('[data-icon-picker]').forEach(element => {
        const options = JSON.parse(element.getAttribute('data-icon-picker') || '{}');
        new IconPicker(element, options);
    });
});

// Export components
window.RichTextEditor = RichTextEditor;
window.ColorPicker = ColorPicker;
window.IconPicker = IconPicker;