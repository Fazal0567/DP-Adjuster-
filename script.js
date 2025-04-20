document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('image-input');
    const previewCanvas = document.getElementById('preview-canvas');
    const ctx = previewCanvas.getContext('2d');
    const zoomControl = document.getElementById('zoom');
    const rotationControl = document.getElementById('rotation');
    const bgColorSelect = document.getElementById('bg-color');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    const verticalControl = document.getElementById('vertical-position');
    
    let currentImage = null;
    let scale = 1;
    let rotation = 0;
    let bgType = 'transparent';
    let verticalOffset = 0;
    
    // Set canvas size
    previewCanvas.width = 500;
    previewCanvas.height = 500;
    
    // Event listeners
    imageInput.addEventListener('change', handleImageUpload);
    zoomControl.addEventListener('input', updateImage);
    rotationControl.addEventListener('input', updateImage);
    bgColorSelect.addEventListener('change', updateImage);
    downloadBtn.addEventListener('click', downloadImage);
    shareBtn.addEventListener('click', shareToWhatsApp);
    verticalControl.addEventListener('input', updateImage);
    
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
        verticalOffset = parseInt(verticalControl.value);
        
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
        
        ctx.translate(centerX, centerY + verticalOffset);
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
        
        context.translate(centerX, centerY + verticalOffset);
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

    function fallbackShare(canvas) {
        // Create a data URL
        const dataUrl = canvas.toDataURL('image/png');
        const message = 'Check out my new profile picture!';
        
        if (navigator.userAgent.match(/Mobile|Android|iPhone|iPad|iPod/i)) {
            // Mobile device - use WhatsApp API with the image
            const encodedMessage = encodeURIComponent(message);
            const encodedImage = encodeURIComponent(dataUrl);
            window.location.href = `whatsapp://send?text=${encodedMessage}&attachment=${encodedImage}`;
        } else {
            // Desktop - open WhatsApp web
            const encodedMessage = encodeURIComponent(message + ' ' + dataUrl);
            window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, '_blank');
        }
    }

    function shareToWhatsApp() {
        if (!currentImage) {
            alert('Please upload an image first');
            return;
        }

        const shareCanvas = document.createElement('canvas');
        shareCanvas.width = 500;
        shareCanvas.height = 500;
        const shareCtx = shareCanvas.getContext('2d');

        // Draw background
        if (bgType === 'white') {
            shareCtx.fillStyle = 'white';
            shareCtx.fillRect(0, 0, shareCanvas.width, shareCanvas.height);
        } else if (bgType === 'black') {
            shareCtx.fillStyle = 'black';
            shareCtx.fillRect(0, 0, shareCanvas.width, shareCanvas.height);
        } else if (bgType === 'blur') {
            shareCtx.filter = 'blur(10px)';
            drawImageOnCanvas(shareCtx, shareCanvas);
            shareCtx.filter = 'none';
        }

        // Draw image with clipping
        shareCtx.save();
        shareCtx.beginPath();
        shareCtx.arc(shareCanvas.width/2, shareCanvas.height/2, shareCanvas.width/2, 0, Math.PI*2);
        shareCtx.closePath();
        shareCtx.clip();
        
        drawImageOnCanvas(shareCtx, shareCanvas);
        shareCtx.restore();

        // Try Web Share API first
        shareCanvas.toBlob(async function(blob) {
            const file = new File([blob], 'whatsapp-dp.png', { type: 'image/png' });
            
            try {
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'WhatsApp Profile Picture',
                        text: 'Check out my new profile picture!'
                    });
                } else {
                    fallbackShare(shareCanvas);
                }
            } catch (err) {
                console.error('Sharing failed:', err);
                fallbackShare(shareCanvas);
            }
        }, 'image/png');
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // Add with other constants
    const horizontalControl = document.getElementById('horizontal-position');
    
    // Add with other state variables
    let horizontalOffset = 0;
    
    // Add with other event listeners
    horizontalControl.addEventListener('input', updateImage);
    
    function updateImage() {
        if (!currentImage) return;
        
        // Add with other control values
        horizontalOffset = parseInt(horizontalControl.value);
        // ...existing code...
    }
    
    function drawImage() {
        const centerX = previewCanvas.width / 2;
        const centerY = previewCanvas.height / 2;
        
        // Update translation to include horizontal offset
        ctx.translate(centerX + horizontalOffset, centerY + verticalOffset);
        // ...existing code...
    }
    
    function drawImageOnCanvas(context, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Update translation in download/share function too
        context.translate(centerX + horizontalOffset, centerY + verticalOffset);
        // ...existing code...
    }
});