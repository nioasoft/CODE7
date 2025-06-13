// File Upload Component
class FileUpload {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            accept: '*',
            multiple: false,
            maxSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: [],
            dragAndDrop: true,
            preview: true,
            ...options
        };
        
        this.files = [];
        this.init();
    }
    
    init() {
        this.createUploadArea();
        this.bindEvents();
    }
    
    createUploadArea() {
        // Create upload container
        this.container = document.createElement('div');
        this.container.className = 'file-upload-container';
        this.container.style.cssText = `
            border: 2px dashed var(--admin-border);
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            background: var(--admin-light-gray);
            transition: var(--admin-transition);
            cursor: pointer;
            position: relative;
        `;
        
        // Upload content
        this.uploadContent = document.createElement('div');
        this.uploadContent.className = 'upload-content';
        this.uploadContent.innerHTML = `
            <div class="upload-icon" style="font-size: 3rem; margin-bottom: 1rem; color: var(--admin-text-secondary);">
                📁
            </div>
            <div class="upload-text">
                <h3 style="margin-bottom: 0.5rem; color: var(--admin-text);">העלה קבצים</h3>
                <p style="color: var(--admin-text-secondary); margin-bottom: 1rem;">
                    גרור קבצים לכאן או לחץ לבחירה
                </p>
                <button type="button" class="btn btn-primary upload-button">
                    בחר קבצים
                </button>
            </div>
        `;
        
        this.container.appendChild(this.uploadContent);
        
        // File input (hidden)
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = this.options.accept;
        this.fileInput.multiple = this.options.multiple;
        this.fileInput.style.display = 'none';
        this.container.appendChild(this.fileInput);
        
        // Progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'upload-progress';
        this.progressBar.style.cssText = `
            width: 100%;
            height: 4px;
            background: var(--admin-border);
            border-radius: 2px;
            margin-top: 1rem;
            overflow: hidden;
            display: none;
        `;
        
        this.progressFill = document.createElement('div');
        this.progressFill.style.cssText = `
            height: 100%;
            background: var(--admin-primary);
            transition: width 0.3s ease;
            width: 0%;
        `;
        this.progressBar.appendChild(this.progressFill);
        this.container.appendChild(this.progressBar);
        
        // File list
        this.fileList = document.createElement('div');
        this.fileList.className = 'file-list';
        this.fileList.style.cssText = `
            margin-top: 1rem;
            display: none;
        `;
        this.container.appendChild(this.fileList);
        
        // Replace original element
        this.element.style.display = 'none';
        this.element.parentNode.insertBefore(this.container, this.element);
    }
    
    bindEvents() {
        // Click to upload
        this.container.addEventListener('click', (e) => {
            if (!e.target.closest('.file-item')) {
                this.fileInput.click();
            }
        });
        
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(Array.from(e.target.files));
        });
        
        if (this.options.dragAndDrop) {
            // Drag and drop events
            this.container.addEventListener('dragenter', this.handleDragEnter.bind(this));
            this.container.addEventListener('dragover', this.handleDragOver.bind(this));
            this.container.addEventListener('dragleave', this.handleDragLeave.bind(this));
            this.container.addEventListener('drop', this.handleDrop.bind(this));
        }
    }
    
    handleDragEnter(e) {
        e.preventDefault();
        this.container.style.borderColor = 'var(--admin-primary)';
        this.container.style.backgroundColor = 'rgba(0, 122, 255, 0.05)';
    }
    
    handleDragOver(e) {
        e.preventDefault();
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        if (!this.container.contains(e.relatedTarget)) {
            this.resetDragState();
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.resetDragState();
        
        const files = Array.from(e.dataTransfer.files);
        this.handleFiles(files);
    }
    
    resetDragState() {
        this.container.style.borderColor = 'var(--admin-border)';
        this.container.style.backgroundColor = 'var(--admin-light-gray)';
    }
    
    handleFiles(files) {
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) return;
        
        if (!this.options.multiple) {
            this.files = [validFiles[0]];
        } else {
            this.files.push(...validFiles);
        }
        
        this.uploadFiles(validFiles);
    }
    
    validateFile(file) {
        // Check file size
        if (file.size > this.options.maxSize) {
            this.showError(`הקובץ ${file.name} גדול מדי. מקסימום ${this.formatFileSize(this.options.maxSize)}`);
            return false;
        }
        
        // Check file type
        if (this.options.allowedTypes.length > 0) {
            const fileType = file.type.toLowerCase();
            const fileExtension = file.name.split('.').pop().toLowerCase();
            
            const isAllowed = this.options.allowedTypes.some(type => {
                return fileType.includes(type) || fileExtension === type;
            });
            
            if (!isAllowed) {
                this.showError(`סוג הקובץ ${file.name} לא נתמך`);
                return false;
            }
        }
        
        return true;
    }
    
    uploadFiles(files) {
        this.showProgress();
        
        files.forEach((file, index) => {
            // Simulate upload progress
            this.simulateUpload(file, index, files.length);
        });
    }
    
    simulateUpload(file, index, total) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Add file to list
                this.addFileToList(file);
                
                // Hide progress if all files are done
                if (index === total - 1) {
                    setTimeout(() => {
                        this.hideProgress();
                        this.showFileList();
                    }, 500);
                }
            }
            
            this.updateProgress(progress);
        }, 100);
    }
    
    addFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            border: 1px solid var(--admin-border);
            border-radius: 8px;
            margin-bottom: 0.5rem;
            background: var(--admin-white);
        `;
        
        const fileInfo = document.createElement('div');
        fileInfo.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 1;
        `;
        
        // File icon
        const fileIcon = document.createElement('div');
        fileIcon.textContent = this.getFileIcon(file);
        fileIcon.style.cssText = `
            font-size: 2rem;
            width: 48px;
            text-align: center;
        `;
        
        // File details
        const fileDetails = document.createElement('div');
        fileDetails.innerHTML = `
            <div style="font-weight: 500; margin-bottom: 0.25rem;">${file.name}</div>
            <div style="font-size: 0.875rem; color: var(--admin-text-secondary);">
                ${this.formatFileSize(file.size)} • ${file.type || 'Unknown'}
            </div>
        `;
        
        fileInfo.appendChild(fileIcon);
        fileInfo.appendChild(fileDetails);
        
        // Actions
        const actions = document.createElement('div');
        actions.style.cssText = `
            display: flex;
            gap: 0.5rem;
        `;
        
        // Preview button (for images)
        if (file.type.startsWith('image/') && this.options.preview) {
            const previewBtn = document.createElement('button');
            previewBtn.type = 'button';
            previewBtn.className = 'btn btn-secondary';
            previewBtn.textContent = 'תצוגה מקדימה';
            previewBtn.style.fontSize = '0.875rem';
            previewBtn.style.padding = '0.5rem 1rem';
            
            previewBtn.addEventListener('click', () => {
                this.showImagePreview(file);
            });
            
            actions.appendChild(previewBtn);
        }
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-danger';
        removeBtn.textContent = 'הסר';
        removeBtn.style.fontSize = '0.875rem';
        removeBtn.style.padding = '0.5rem 1rem';
        
        removeBtn.addEventListener('click', () => {
            this.removeFile(file, fileItem);
        });
        
        actions.appendChild(removeBtn);
        
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(actions);
        
        this.fileList.appendChild(fileItem);
    }
    
    removeFile(file, fileItem) {
        const index = this.files.indexOf(file);
        if (index > -1) {
            this.files.splice(index, 1);
        }
        
        fileItem.remove();
        
        if (this.files.length === 0) {
            this.hideFileList();
        }
        
        this.updateOriginalInput();
    }
    
    showImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Create modal for preview
            const modal = document.createElement('div');
            modal.className = 'image-preview-modal';
            modal.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                cursor: pointer;
            `;
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                border-radius: 8px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            `;
            
            modal.appendChild(img);
            document.body.appendChild(modal);
            
            modal.addEventListener('click', () => {
                modal.remove();
            });
        };
        
        reader.readAsDataURL(file);
    }
    
    getFileIcon(file) {
        const type = file.type.toLowerCase();
        
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎥';
        if (type.startsWith('audio/')) return '🎵';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word')) return '📝';
        if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
        if (type.includes('powerpoint') || type.includes('presentation')) return '📋';
        if (type.includes('zip') || type.includes('rar')) return '📦';
        
        return '📄';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    showProgress() {
        this.progressBar.style.display = 'block';
        this.uploadContent.style.display = 'none';
    }
    
    hideProgress() {
        this.progressBar.style.display = 'none';
        this.uploadContent.style.display = 'block';
    }
    
    updateProgress(percent) {
        this.progressFill.style.width = `${percent}%`;
    }
    
    showFileList() {
        this.fileList.style.display = 'block';
    }
    
    hideFileList() {
        this.fileList.style.display = 'none';
    }
    
    showError(message) {
        // Show error notification
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }
    
    updateOriginalInput() {
        // Create a DataTransfer object to update the original input
        const dataTransfer = new DataTransfer();
        this.files.forEach(file => {
            dataTransfer.items.add(file);
        });
        
        this.element.files = dataTransfer.files;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        this.element.dispatchEvent(event);
    }
    
    getFiles() {
        return this.files;
    }
    
    clear() {
        this.files = [];
        this.fileList.innerHTML = '';
        this.hideFileList();
        this.fileInput.value = '';
        this.updateOriginalInput();
    }
}

// Image Cropper Component
class ImageCropper {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            aspectRatio: 1,
            width: 300,
            height: 300,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.createCropper();
    }
    
    createCropper() {
        this.container = document.createElement('div');
        this.container.className = 'image-cropper';
        this.container.style.cssText = `
            border: 1px solid var(--admin-border);
            border-radius: 8px;
            padding: 1rem;
            background: var(--admin-white);
            text-align: center;
        `;
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.canvas.style.cssText = `
            border: 1px solid var(--admin-border);
            max-width: 100%;
            height: auto;
            cursor: move;
        `;
        
        this.container.appendChild(this.canvas);
        
        // Controls
        const controls = document.createElement('div');
        controls.style.cssText = `
            margin-top: 1rem;
            display: flex;
            justify-content: center;
            gap: 1rem;
        `;
        
        const cropBtn = document.createElement('button');
        cropBtn.type = 'button';
        cropBtn.className = 'btn btn-primary';
        cropBtn.textContent = 'חתוך';
        cropBtn.addEventListener('click', () => this.crop());
        
        const resetBtn = document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.className = 'btn btn-secondary';
        resetBtn.textContent = 'איפוס';
        resetBtn.addEventListener('click', () => this.reset());
        
        controls.appendChild(cropBtn);
        controls.appendChild(resetBtn);
        this.container.appendChild(controls);
        
        this.element.parentNode.insertBefore(this.container, this.element);
        this.element.style.display = 'none';
        
        this.ctx = this.canvas.getContext('2d');
        this.bindEvents();
    }
    
    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.image = new Image();
            this.image.onload = () => {
                this.drawImage();
            };
            this.image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    drawImage() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate scaling to fit canvas
        const scale = Math.min(
            this.canvas.width / this.image.width,
            this.canvas.height / this.image.height
        );
        
        const width = this.image.width * scale;
        const height = this.image.height * scale;
        const x = (this.canvas.width - width) / 2;
        const y = (this.canvas.height - height) / 2;
        
        this.ctx.drawImage(this.image, x, y, width, height);
    }
    
    bindEvents() {
        // Add mouse/touch events for cropping area selection
        let isDrawing = false;
        let startX, startY;
        
        this.canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const rect = this.canvas.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            // Redraw image and selection rectangle
            this.drawImage();
            this.drawSelection(startX, startY, currentX, currentY);
        });
        
        this.canvas.addEventListener('mouseup', () => {
            isDrawing = false;
        });
    }
    
    drawSelection(x1, y1, x2, y2) {
        this.ctx.strokeStyle = 'var(--admin-primary)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.clearRect(x1, y1, x2 - x1, y2 - y1);
    }
    
    crop() {
        // Get cropped image data
        const imageData = this.canvas.toDataURL('image/png');
        
        // Trigger change event with cropped image
        const event = new CustomEvent('crop', {
            detail: { imageData }
        });
        this.element.dispatchEvent(event);
    }
    
    reset() {
        if (this.image) {
            this.drawImage();
        }
    }
}

// Auto-initialize file upload components
document.addEventListener('DOMContentLoaded', function() {
    // Initialize file uploads
    document.querySelectorAll('[data-file-upload]').forEach(element => {
        const options = JSON.parse(element.getAttribute('data-file-upload') || '{}');
        new FileUpload(element, options);
    });
    
    // Initialize image croppers
    document.querySelectorAll('[data-image-cropper]').forEach(element => {
        const options = JSON.parse(element.getAttribute('data-image-cropper') || '{}');
        new ImageCropper(element, options);
    });
});

// Export components
window.FileUpload = FileUpload;
window.ImageCropper = ImageCropper;