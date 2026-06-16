import { useState, useRef } from 'react';

export default function ImageUploader({ onImageSelect, preview, multiple = false }) {
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            processFiles(files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            processFiles(files);
        }
    };

    const processFiles = async (files) => {
        if (!multiple) {
            // Single file mode (legacy behavior)
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                onImageSelect(file, e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            // Multiple file mode
            setUploading(true);
            const processedFiles = await Promise.all(files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({ file, preview: e.target.result });
                    };
                    reader.readAsDataURL(file);
                });
            }));
            setUploading(false);
            onImageSelect(processedFiles); // Pass array of { file, preview }

            // Reset input so same files can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const removeImage = (e) => {
        e.stopPropagation();
        onImageSelect(null, null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div
            className={`image-uploader ${preview ? 'has-image' : ''} ${dragOver ? 'drag-over' : ''}`}
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={dragOver ? { borderColor: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)' } : {}}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                capture={multiple ? undefined : "environment"}
            />

            {preview && !multiple ? (
                <div style={{ position: 'relative' }}>
                    <img
                        src={preview}
                        alt="Preview"
                        className="image-uploader-preview"
                    />
                    <button
                        onClick={removeImage}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}
                    >
                        ×
                    </button>
                </div>
            ) : (
                <>
                    <div className="image-uploader-icon">📷</div>
                    <p className="image-uploader-text">
                        {uploading ? 'Processing...' : (multiple ? 'Drag photos or click to upload multiple' : 'Drag & drop an image or click to browse')}
                    </p>
                    <p className="image-uploader-hint">
                        Supports JPG, PNG, WebP
                    </p>
                </>
            )}
        </div>
    );
}
