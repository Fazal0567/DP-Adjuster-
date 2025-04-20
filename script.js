document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('image-input');
    const previewCanvas = document.getElementById('preview-canvas');
    const ctx = previewCanvas.getContext('2d');
    const zoomControl = document.getElementById('zoom');
    const rotationControl = document.getElementById('rotation');
    const bgColorSelect = document.getElementById('bg-color');
    const downloadBtn = document.getElementById('download-btn');
    
    let currentImage = null;
    let scale = 1;
    let rotation = 0;
    let bgType = 'transparent';
    
    // Set canvas size
    previewCanvas.width = 500;
    previewCanvas.height = 500;
    
    // Event listeners
    imageInput.addEventListener('change', handleImageUpload);
    zoomControl.addEventListener('input', updateImage);
    rotationControl.addEventListener('input', updateImage);
    bgColorSelect.addEventListener('change', updateImage);
    downloadBtn.addEventListener('click', downloadImage);
    
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                currentImage = img;
                updateImage();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function updateImage() {
        if (!currentImage) return;
        
        scale = parseFloat(zoomControl.value);
        rotation = parseInt(rotationControl.value);
        bgType = bgColorSelect.value;
        
        // Clear canvas
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        
        // Set background
        if (bgType === 'white') {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        } else if (bgType === 'black') {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        } else if (bgType === 'blur') {
            // Create blurred background
            ctx.save();
            ctx.beginPath();
            ctx.arc(previewCanvas.width/2, previewCanvas.height/2, previewCanvas.width/2, 0, Math.PI*2);
            ctx.closePath();
            ctx.clip();
            
            // Draw blurred version
            ctx.filter = 'blur(10px)';
            drawImage();
            ctx.filter = 'none';
            ctx.restore();
        }
        
        // Draw the image with current settings
        ctx.save();
        ctx.beginPath();
        ctx.arc(previewCanvas.width/2, previewCanvas.height/2, previewCanvas.width/2, 0, Math.PI*2);
        ctx.closePath();
        ctx.clip();
        
        drawImage();
        ctx.restore();
    }
    
    function drawImage() {
        const centerX = previewCanvas.width / 2;
        const centerY = previewCanvas.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.scale(scale, scale);
        
        // Calculate dimensions to maintain aspect ratio
        const imgRatio = currentImage.width / currentImage.height;
        let drawWidth, drawHeight;
        
        if (imgRatio > 1) {
            drawWidth = previewCanvas.width;
            drawHeight = previewCanvas.width / imgRatio;
        } else {
            drawHeight = previewCanvas.height;
            drawWidth = previewCanvas.height * imgRatio;
        }
        
        ctx.drawImage(
            currentImage,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        );
        
        // Reset transformations
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    function downloadImage() {
        if (!currentImage) {
            alert('Please upload an image first');
            return;
        }
        
        // Create a temporary canvas for download (higher quality)
        const downloadCanvas = document.createElement('canvas');
        downloadCanvas.width = 500;
        downloadCanvas.height = 500;
        const downloadCtx = downloadCanvas.getContext('2d');
        
        // Draw background
        if (bgType === 'white') {
            downloadCtx.fillStyle = 'white';
            downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
        } else if (bgType === 'black') {
            downloadCtx.fillStyle = 'black';
            downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
        } else if (bgType === 'blur') {
            downloadCtx.filter = 'blur(10px)';
            drawImageOnCanvas(downloadCtx, downloadCanvas);
            downloadCtx.filter = 'none';
        }
        
        // Draw image with clipping
        downloadCtx.save();
        downloadCtx.beginPath();
        downloadCtx.arc(downloadCanvas.width/2, downloadCanvas.height/2, downloadCanvas.width/2, 0, Math.PI*2);
        downloadCtx.closePath();
        downloadCtx.clip();
        
        drawImageOnCanvas(downloadCtx, downloadCanvas);
        downloadCtx.restore();
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'whatsapp-dp.png';
        link.href = downloadCanvas.toDataURL('image/png');
        link.click();
    }
    
    function drawImageOnCanvas(context, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        context.translate(centerX, centerY);
        context.rotate(rotation * Math.PI / 180);
        context.scale(scale, scale);
        
        const imgRatio = currentImage.width / currentImage.height;
        let drawWidth, drawHeight;
        
        if (imgRatio > 1) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
        } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
        }
        
        context.drawImage(
            currentImage,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        );
        
        context.setTransform(1, 0, 0, 1, 0, 0);
    }
});