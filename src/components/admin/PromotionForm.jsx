// src/components/admin/PromotionForm.jsx
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { promotionSchema } from '../../utils/validators';
import { getTodayISO } from '../../utils/helpers';
import ImageUploader from './ImageUploader';
import Button from '../common/Button';
import Alert from '../common/Alert';
import RequiredAsterisk from '../common/RequiredAsterisk';
import { Save, X } from 'lucide-react';

const PromotionForm = ({ initialData, onSubmit, onCancel, onRequestClose, isSubmitting }) => {
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState(null);
  const [imageRequired, setImageRequired] = useState(false);

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      date: initialData?.date || getTodayISO(),
      active: initialData?.active ?? true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        date: initialData.date || getTodayISO(),
        active: initialData.active ?? true,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    setFormError(null);
    setImageRequired(false);

    // Requerir imagen si es una nueva promoción
    if (!isEditing && !imageFile) {
      setImageRequired(true);
      return;
    }

    const payload = {
      ...data,
      date: initialData?.date || getTodayISO(),
      description: '',
      imageUrl: initialData?.imageUrl || '',
    };

    const result = await onSubmit(payload, imageFile, (progress) => {
      setUploadProgress(progress);
    });

    if (result?.error) {
      setFormError(result.error);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="p-6 space-y-5">
        {formError && (
          <Alert type="error" message={formError} onClose={() => setFormError(null)} />
        )}

        {/* Image Upload */}
        <div>
          <label className="label">
            Imagen <RequiredAsterisk />
          </label>
          <ImageUploader
            currentImageUrl={initialData?.imageUrl}
            onFileSelect={setImageFile}
            uploadProgress={uploadProgress}
          />
          {imageRequired && (
            <p className="text-error text-sm mt-1.5 flex items-center gap-1">
              La imagen es requerida.
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="label" htmlFor="title">
            Título <RequiredAsterisk />
          </label>
          <input
            id="title"
            {...register('title')}
            className={`input-field ${errors.title ? 'error' : ''}`}
            placeholder="Ej: 2x1 en pizzas todos los martes"
            maxLength={100}
          />
          {errors.title && (
            <p className="text-error text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Active toggle */}
        <div>
          <label className="label">Estado</label>
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
                    border-2 border-transparent transition-colors duration-200 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:ring-offset-2
                    ${field.value ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                  role="switch"
                  aria-checked={field.value}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full
                      bg-white shadow ring-0 transition duration-200 ease-in-out
                      ${field.value ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
                <span className={`text-sm font-semibold ${field.value ? 'text-secondary' : 'text-text-secondary'}`}>
                  {field.value ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            )}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-background-secondary rounded-b-card">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          icon={Save}
          size="sm"
        >
          {isEditing ? 'Guardar cambios' : 'Crear promoción'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onRequestClose || onCancel}
          disabled={isSubmitting}
          icon={X}
          size="sm"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default PromotionForm;
