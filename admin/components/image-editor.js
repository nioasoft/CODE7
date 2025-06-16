// Image Editor with Cropper.js
let cropper = null;
let currentFile = null;
let currentTargetInput = null;
let recommendedAspectRatio = null;

// Image validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSIONS = { width: 200, height: 200 };
const MAX_DIMENSIONS = { width: 5000, height: 5000 };
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Function to determine recommended aspect ratio based on input context
function getRecommendedAspectRatio(inputId) {
    // Logo uploads - horizontal layout preferred
    if (inputId === 'logoUpload' || inputId.includes('logo')) {
        return '2:1';
    }
    
    // Project images - standard photo ratio
    if (inputId === 'projectImage' || inputId.includes('project') || inputId.includes('Project')) {
        return '3:2';
    }
    
    // Hero/banner images - wide format
    if (inputId.includes('hero') || inputId.includes('banner') || inputId.includes('Hero')) {
        return '16:9';
    }
    
    // Service images - square or close to square
    if (inputId.includes('service') || inputId.includes('Service')) {
        return '1:1';
    }
    
    // Testimonial images - square for profile photos
    if (inputId.includes('testimonial') || inputId.includes('Testimonial') || inputId.includes('profile')) {
        return '1:1';
    }
    
    // Check if we're in a specific section based on current active nav
    const activeSection = document.querySelector('.nav-item.active')?.dataset.section;
    if (activeSection) {
        switch (activeSection) {
            case 'hero':
                return '16:9';
            case 'projects':
                return '3:2';
            case 'services':
                return '1:1';
            case 'testimonials':
                return '1:1';
            case 'settings':
                return '2:1'; // Assuming logo in settings
        }
    }
    
    // Default to free crop
    return 'free';
}

// Function to get upload guidelines text based on context
function getUploadGuidelines(inputId) {
    const aspectRatio = getRecommendedAspectRatio(inputId);
    
    const guidelines = {
        '2:1': {
            ratio: 'פרופורציה מועדפת: 2:1',
            example: '(לדוגמה: 400x200, 600x300 פיקסלים)',
            specs: '• רזולוציה גבוהה • רקע שקוף (PNG) • עד 2MB'
        },
        '3:2': {
            ratio: 'פרופורציה מועדפת: 3:2', 
            example: '(לדוגמה: 600x400, 900x600 פיקסלים)',
            specs: '• רזולוציה גבוהה • JPG/PNG • עד 5MB'
        },
        '16:9': {
            ratio: 'פרופורציה מועדפת: 16:9',
            example: '(לדוגמה: 1920x1080, 1280x720 פיקסלים)', 
            specs: '• רזולוציה גבוהה • JPG/PNG • עד 5MB'
        },
        '1:1': {
            ratio: 'פרופורציה מועדפת: 1:1',
            example: '(לדוגמה: 400x400, 600x600 פיקסלים)',
            specs: '• רזולוציה גבוהה • JPG/PNG • עד 3MB'
        },
        'free': {
            ratio: 'פרופורציה: חופשית',
            example: '(כל יחס גובה-רוחב)',
            specs: '• רזולוציה גבוהה • JPG/PNG • עד 5MB'
        }
    };
    
    return guidelines[aspectRatio] || guidelines['free'];
}

// Image validation function
function validateImage(file) {
    return new Promise((resolve, reject) => {
        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            reject(new Error('סוג קובץ לא נתמך. אנא השתמש ב-JPEG, PNG או WebP'));
            return;
        }
        
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            reject(new Error(`הקובץ גדול מדי. הגודל המקסימלי הוא ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
            return;
        }
        
        // Check image dimensions
        const img = new Image();
        img.onload = function() {
            if (this.width < MIN_DIMENSIONS.width || this.height < MIN_DIMENSIONS.height) {
                reject(new Error(`התמונה קטנה מדי. גודל מינימלי: ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} פיקסלים`));
                return;
            }
            
            if (this.width > MAX_DIMENSIONS.width || this.height > MAX_DIMENSIONS.height) {
                reject(new Error(`התמונה גדולה מדי. גודל מקסימלי: ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} פיקסלים`));
                return;
            }
            
            resolve({
                width: this.width,
                height: this.height,
                aspectRatio: this.width / this.height,
                size: file.size
            });
        };
        
        img.onerror = function() {
            reject(new Error('לא ניתן לטעון את התמונה. אנא בדוק שהקובץ תקין'));
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// Image Editor Functions
async function openImageEditor(file, targetInputId, aspectRatio = 'free') {
    try {
        // Validate image before opening editor
        await validateImage(file);
        
        currentFile = file;
        currentTargetInput = targetInputId;
        recommendedAspectRatio = aspectRatio;
        
        const modal = document.getElementById('imageEditorModal');
        const cropImage = document.getElementById('cropImage');
        
        // Create file URL and load image
        const imageUrl = URL.createObjectURL(file);
        cropImage.src = imageUrl;
        
        // Show modal
        modal.style.display = 'flex';
        
        // Initialize cropper when image loads
        cropImage.onload = function() {
            initializeCropper(aspectRatio);
        };
        
    } catch (error) {
        showNotification(error.message, 'error');
        console.error('Image validation failed:', error);
    }
}

function initializeCropper(aspectRatio = 'free') {
    const cropImage = document.getElementById('cropImage');
    
    // Destroy existing cropper if any
    if (cropper) {
        cropper.destroy();
    }
    
    // Set aspect ratio
    let cropperAspectRatio = NaN; // Free crop by default
    if (aspectRatio !== 'free') {
        const [width, height] = aspectRatio.split(':').map(Number);
        cropperAspectRatio = width / height;
    }
    
    // Initialize Cropper.js
    cropper = new Cropper(cropImage, {
        aspectRatio: cropperAspectRatio,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 0.8,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        crop: function(event) {
            updateCropPreview();
        }
    });
    
    // Set recommended aspect ratio as active
    setActiveAspectRatio(aspectRatio);
    
    // Update preview
    setTimeout(() => {
        updateCropPreview();
    }, 100);
}

function setActiveAspectRatio(ratio) {
    // Remove active class from all buttons
    document.querySelectorAll('.aspect-ratio-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected ratio
    const activeBtn = document.querySelector(`[data-ratio="${ratio}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function updateCropPreview() {
    if (!cropper) return;
    
    const canvas = cropper.getCroppedCanvas({
        width: 200,
        height: 200,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });
    
    const previewCanvas = document.getElementById('cropPreviewCanvas');
    const ctx = previewCanvas.getContext('2d');
    
    // Set canvas size
    previewCanvas.width = 200;
    previewCanvas.height = 200;
    
    // Clear canvas
    ctx.clearRect(0, 0, 200, 200);
    
    // Draw cropped image centered
    if (canvas) {
        const aspectRatio = canvas.width / canvas.height;
        let drawWidth = 200;
        let drawHeight = 200;
        let x = 0;
        let y = 0;
        
        if (aspectRatio > 1) {
            // Landscape
            drawHeight = 200 / aspectRatio;
            y = (200 - drawHeight) / 2;
        } else {
            // Portrait or square
            drawWidth = 200 * aspectRatio;
            x = (200 - drawWidth) / 2;
        }
        
        ctx.drawImage(canvas, x, y, drawWidth, drawHeight);
    }
}

function closeImageEditor() {
    const modal = document.getElementById('imageEditorModal');
    modal.style.display = 'none';
    
    // Destroy cropper
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    
    // Clean up
    currentFile = null;
    currentTargetInput = null;
    recommendedAspectRatio = null;
    
    // Revoke object URL
    const cropImage = document.getElementById('cropImage');
    if (cropImage.src) {
        URL.revokeObjectURL(cropImage.src);
    }
}

async function applyCrop() {
    if (!cropper || !currentFile || !currentTargetInput) return;
    
    try {
        // Get cropped canvas
        const canvas = cropper.getCroppedCanvas({
            width: 800,
            height: 600,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        // Convert to blob
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.9);
        });
        
        // Create new file with cropped data
        const croppedFile = new File([blob], currentFile.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
        });
        
        // Create a new FileList-like object
        const dt = new DataTransfer();
        dt.items.add(croppedFile);
        
        // Update the input
        const targetInput = document.getElementById(currentTargetInput);
        if (targetInput) {
            targetInput.files = dt.files;
            
            // For project image, update the preview manually since we handle it differently
            if (targetInput.id === 'projectImage') {
                const preview = document.getElementById('projectImagePreview');
                const imageUrl = URL.createObjectURL(croppedFile);
                preview.innerHTML = `
                    <img src="${imageUrl}" style="max-width: 200px; max-height: 150px; object-fit: cover; border-radius: 8px;">
                    <div style="margin-top: 5px; font-size: 12px; color: #666;">
                        תמונה נערכה - לחץ "שמור" להעלאה לשרת
                    </div>
                `;
                
                // Mark as pending upload
                targetInput.dataset.pendingUpload = 'true';
                preview.dataset.pendingFile = 'true';
            } else {
                // Trigger change event for other inputs
                const event = new Event('change', { bubbles: true });
                targetInput.dispatchEvent(event);
            }
        }
        
        // Close editor
        closeImageEditor();
        
        showNotification('התמונה נערכה בהצלחה', 'success');
        
    } catch (error) {
        console.error('Error applying crop:', error);
        showNotification('שגיאה בעריכת התמונה', 'error');
    }
}

// Function to update upload guidelines dynamically 
function updateUploadGuidelines(inputElement) {
    const guidelines = getUploadGuidelines(inputElement.id);
    
    // Find or create guidelines container near the input
    let guidelinesContainer = inputElement.parentElement.querySelector('.upload-guidelines');
    
    if (!guidelinesContainer) {
        // Create guidelines container if it doesn't exist
        guidelinesContainer = document.createElement('div');
        guidelinesContainer.className = 'upload-guidelines';
        inputElement.parentElement.insertBefore(guidelinesContainer, inputElement);
    }
    
    // Update guidelines content
    guidelinesContainer.innerHTML = `
        <div class="aspect-ratio-info">
            <strong>${guidelines.ratio}</strong>
            <span class="example">${guidelines.example}</span>
        </div>
        <div class="technical-specs">
            <span>${guidelines.specs}</span>
        </div>
    `;
}

// Event listeners for aspect ratio buttons
document.addEventListener('DOMContentLoaded', function() {
    // Aspect ratio buttons
    document.querySelectorAll('.aspect-ratio-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const ratio = this.dataset.ratio;
            setActiveAspectRatio(ratio);
            
            if (cropper) {
                let aspectRatio = NaN;
                if (ratio !== 'free') {
                    const [width, height] = ratio.split(':').map(Number);
                    aspectRatio = width / height;
                }
                
                cropper.setAspectRatio(aspectRatio);
            }
        });
    });
    
    // Initialize upload guidelines for existing inputs
    document.querySelectorAll('input[type="file"][accept*="image"]').forEach(input => {
        updateUploadGuidelines(input);
    });
    
    // Handle image uploads with validation and editor button
    document.querySelectorAll('input[type="file"][accept*="image"]').forEach(input => {
        input.addEventListener('change', async function() {
            const file = this.files[0];
            if (file) {
                try {
                    // Validate image first
                    const imageInfo = await validateImage(file);
                    
                    // Show edit button
                    const editBtn = document.querySelector(`[data-target="${this.id}"]`);
                    if (editBtn) {
                        editBtn.style.display = 'inline-block';
                        editBtn.onclick = function() {
                            // Determine recommended aspect ratio based on input and context
                            let aspectRatio = getRecommendedAspectRatio(input.id);
                            openImageEditor(file, input.id, aspectRatio);
                        };
                    }
                    
                    // Show success message with image info
                    showNotification(`תמונה הועלתה בהצלחה (${imageInfo.width}x${imageInfo.height} פיקסלים)`, 'success');
                    
                } catch (error) {
                    // Clear the input if validation fails
                    this.value = '';
                    showNotification(error.message, 'error');
                    
                    // Hide edit button
                    const editBtn = document.querySelector(`[data-target="${this.id}"]`);
                    if (editBtn) {
                        editBtn.style.display = 'none';
                    }
                }
            }
        });
    });
});

// Function to initialize image editor for dynamically created inputs
function initializeImageEditor(inputElement) {
    if (!inputElement || inputElement.type !== 'file') return;
    
    // Update guidelines
    updateUploadGuidelines(inputElement);
    
    // Add change event listener
    inputElement.addEventListener('change', async function() {
        const file = this.files[0];
        if (file) {
            try {
                // Validate image first
                const imageInfo = await validateImage(file);
                
                // Show edit button
                const editBtn = document.querySelector(`[data-target="${this.id}"]`);
                if (editBtn) {
                    editBtn.style.display = 'inline-block';
                    editBtn.onclick = function() {
                        // Determine recommended aspect ratio based on input and context
                        let aspectRatio = getRecommendedAspectRatio(inputElement.id);
                        openImageEditor(file, inputElement.id, aspectRatio);
                    };
                }
                
                // Show success message with image info
                showNotification(`תמונה הועלתה בהצלחה (${imageInfo.width}x${imageInfo.height} פיקסלים)`, 'success');
                
            } catch (error) {
                // Clear the input if validation fails
                this.value = '';
                showNotification(error.message, 'error');
                
                // Hide edit button
                const editBtn = document.querySelector(`[data-target="${this.id}"]`);
                if (editBtn) {
                    editBtn.style.display = 'none';
                }
            }
        }
    });
}

// Export functions to window for global access
window.openImageEditor = openImageEditor;
window.closeImageEditor = closeImageEditor;
window.applyCrop = applyCrop;
window.initializeImageEditor = initializeImageEditor;
window.getRecommendedAspectRatio = getRecommendedAspectRatio;
window.updateUploadGuidelines = updateUploadGuidelines;
window.validateImage = validateImage;