import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadProductImage } from '@/services/productService';

const ImageUploader = ({ images = [], onChange, maxImages = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // Valider le fichier
        if (!file.type.startsWith('image/')) {
          throw new Error('Seules les images sont acceptées');
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Taille maximale: 5MB');
        }

        const { url, error } = await uploadProductImage(file);
        if (error) throw error;
        return { url, name: file.name };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedImages]);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Preview des images */}
      <AnimatePresence>
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={image.url || index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30"
              >
                <img
                  src={image.url || image}
                  alt={image.name || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Badge primary */}
                {index === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-gold text-black text-xs font-bold rounded">
                    Principal
                  </span>
                )}

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {/* Move buttons */}
                  {index > 0 && (
                    <button
                      onClick={() => moveImage(index, index - 1)}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 text-white"
                      title="Déplacer à gauche"
                    >
                      ←
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      onClick={() => moveImage(index, index + 1)}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 text-white"
                      title="Déplacer à droite"
                    >
                      →
                    </button>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500/80 rounded-lg hover:bg-red-500 text-white"
                    title="Supprimer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Zone de drop */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${dragActive
              ? 'border-gold bg-gold/10'
              : 'border-gray-300 dark:border-bronze/30 hover:border-gray-400 dark:hover:border-bronze/50 bg-gray-50 dark:bg-black'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
              <p className="text-gray-500 dark:text-white/60">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {dragActive ? (
                <Upload className="w-8 h-8 text-gold" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400 dark:text-white/40" />
              )}
              <div>
                <p className="text-gray-900 dark:text-white">
                  {dragActive
                    ? 'Déposez les images ici'
                    : 'Glissez-déposez ou cliquez pour ajouter'}
                </p>
                <p className="text-gray-500 dark:text-white/40 text-sm mt-1">
                  PNG, JPG jusqu'à 5MB ({images.length}/{maxImages})
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
