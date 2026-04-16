// frontend/src/components/ImageUpload/ImageUpload.jsx
// Drag-and-drop image upload component with preview

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, X, FileImage, AlertCircle } from 'lucide-react';
import './ImageUpload.css';

const ImageUpload = ({ onImageSelect, disabled = false }) => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError('Image is too large. Max size is 10MB.');
        } else {
          setError('Invalid file type. Please upload an image.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const removeImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    onImageSelect(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/bmp': ['.bmp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    disabled,
  });

  return (
    <div className="image-upload" id="image-upload-zone">
      <motion.div
        {...getRootProps()}
        className={`image-upload__dropzone ${isDragActive ? 'image-upload__dropzone--active' : ''} ${
          preview ? 'image-upload__dropzone--has-preview' : ''
        } ${disabled ? 'image-upload__dropzone--disabled' : ''}`}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input {...getInputProps()} id="image-upload-input" />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              className="image-upload__preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <img src={preview} alt="Upload preview" className="image-upload__preview-img" />
              <div className="image-upload__preview-overlay">
                <FileImage size={20} />
                <span>Click to change image</span>
              </div>
              <button
                className="image-upload__remove"
                onClick={removeImage}
                id="remove-image-btn"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              className="image-upload__placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="image-upload__icon-wrapper">
                <motion.div
                  animate={isDragActive ? { scale: 1.2, y: -5 } : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {isDragActive ? (
                    <Image size={40} className="image-upload__icon--active" />
                  ) : (
                    <Upload size={40} className="image-upload__icon" />
                  )}
                </motion.div>
              </div>
              <div className="image-upload__text">
                <p className="image-upload__title">
                  {isDragActive ? 'Drop your image here' : 'Upload Question Image'}
                </p>
                <p className="image-upload__subtitle">
                  Drag & drop or click to browse • PNG, JPG, WebP up to 10MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="image-upload__error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;
