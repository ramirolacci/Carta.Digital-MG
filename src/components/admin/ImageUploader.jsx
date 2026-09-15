// src/components/admin/ImageUploader.jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image, AlertCircle, Link, ExternalLink } from 'lucide-react';
import { validateImageFile } from '../../utils/validators';
import { formatFileSize } from '../../utils/helpers';

const ImageUploader = ({
  currentImageUrl = '',
  imageUrl = '',
  onUrlChange,
  onFileSelect,
  uploadProgress = 0,
  className = '',
}) => {
  const initialUrl = imageUrl || currentImageUrl || '';
  const [activeTab, setActiveTab] = useState(initialUrl && !initialUrl.startsWith('data:') ? 'url' : 'url');
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [urlImageError, setUrlImageError] = useState(false);

  const [filePreview, setFilePreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (imageUrl !== undefined && imageUrl !== urlInput && activeTab === 'url') {
      setUrlInput(imageUrl);
      setUrlImageError(false);
    }
  }, [imageUrl]);

  const handleUrlInputChange = (e) => {
    const val = e.target.value;
    setUrlInput(val);
    setUrlImageError(false);
    onUrlChange?.(val);
    if (val) {
      setFilePreview(null);
      setFileInfo(null);
      onFileSelect?.(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'url') {
      onFileSelect?.(null);
      setFilePreview(null);
      setFileInfo(null);
      if (inputRef.current) inputRef.current.value = '';
      onUrlChange?.(urlInput);
    } else {
      onUrlChange?.('');
    }
  };

  const processFile = useCallback(
    (file) => {
      setFileError(null);
      const { valid, error } = validateImageFile(file);

      if (!valid) {
        setFileError(error);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);

      setFileInfo({ name: file.name, size: file.size });
      onFileSelect?.(file);
      onUrlChange?.('');
    },
    [onFileSelect, onUrlChange]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleRemoveFile = () => {
    setFilePreview(null);
    setFileInfo(null);
    setFileError(null);
    onFileSelect?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClearUrl = () => {
    setUrlInput('');
    setUrlImageError(false);
    onUrlChange?.('');
  };

  const isUploading = uploadProgress > 0 && uploadProgress < 100;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selector de modo */}
      <div className="flex bg-background-secondary p-1 rounded-lg gap-1 border border-gray-200/60">
        <button
          type="button"
          onClick={() => handleTabSwitch('url')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'url'
              ? 'bg-white text-primary shadow-sm'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          <Link size={14} />
          URL (Postimages)
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch('file')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'file'
              ? 'bg-white text-primary shadow-sm'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          <Upload size={14} />
          Subir archivo local
        </button>
      </div>

      {/* Modo URL (Postimages) */}
      {activeTab === 'url' && (
        <div className="space-y-3">
          <div>
            <div className="relative flex items-center">
              <input
                type="url"
                value={urlInput}
                onChange={handleUrlInputChange}
                placeholder="Ej: https://i.postimg.cc/xyz123/promocion.jpg"
                className={`input-field pr-10 ${urlImageError ? 'error' : ''}`}
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={handleClearUrl}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Limpiar URL"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-1.5 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <ExternalLink size={12} />
                Pegá el <strong>Enlace directo</strong> desde Postimages o la web.
              </span>
              <a
                href="https://postimages.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline flex items-center gap-1"
              >
                Abrir Postimages
              </a>
            </div>
            {urlInput.includes('postimg.cc') && !urlInput.includes('i.postimg.cc') && (
              <div className="mt-2 p-2.5 rounded-btn bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong>Atención con el enlace:</strong> Copiaste el enlace de la página de Postimages. Copiá el <strong>Enlace directo</strong> (el que empieza con <code>https://i.postimg.cc/...</code> y termina en <code>.jpg</code> o <code>.png</code>).
                </div>
              </div>
            )}
          </div>

          {/* Vista previa de URL */}
          {urlInput.trim() && (
            <div className="relative rounded-card overflow-hidden border border-gray-200 bg-black/5">
              {!urlImageError ? (
                <div className="relative group">
                  <img
                    src={urlInput}
                    alt="Vista previa de la URL"
                    className="w-full aspect-video object-cover transition-opacity duration-200"
                    onError={() => setUrlImageError(true)}
                  />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    Vista previa de la URL
                  </div>
                </div>
              ) : (
                <div className="p-6 flex flex-col items-center justify-center text-center text-error bg-red-50/50">
                  <AlertCircle size={28} className="mb-2" />
                  <p className="text-sm font-semibold">No se pudo cargar la imagen desde esta URL</p>
                  <p className="text-xs text-text-secondary mt-1">
                    Asegurate de copiar el enlace directo (ej: <code>https://i.postimg.cc/...</code>)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modo Archivo Local */}
      {activeTab === 'file' && (
        <div>
          {filePreview ? (
            <div className="relative rounded-card overflow-hidden border border-gray-200">
              <img
                src={filePreview}
                alt="Preview"
                className="w-full aspect-video object-cover"
              />

              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                  <div className="w-48 bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-white text-sm font-semibold">
                    Subiendo... {uploadProgress}%
                  </span>
                </div>
              )}

              {!isUploading && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                  aria-label="Eliminar imagen"
                >
                  <X size={14} />
                </button>
              )}

              {fileInfo && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2">
                  <p className="text-white text-xs truncate">
                    {fileInfo.name} · {formatFileSize(fileInfo.size)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`upload-zone ${dragging ? 'dragging' : ''}`}
            >
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${dragging ? 'bg-primary/10' : 'bg-background-secondary'}`}>
                  {dragging ? (
                    <Image size={22} className="text-primary" />
                  ) : (
                    <Upload size={22} className="text-text-secondary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">
                    {dragging ? 'Soltá la imagen' : 'Arrastrá una imagen o hacé clic'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    JPG, PNG o WebP · máx. 5MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {fileError && (
            <div className="flex items-center gap-2 mt-2 text-error text-sm">
              <AlertCircle size={14} />
              <span>{fileError}</span>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

