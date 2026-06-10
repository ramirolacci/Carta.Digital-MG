// src/components/admin/AdminPanel.jsx
import { useState, useEffect } from 'react';
import { Plus, Filter, ArrowUpDown, Loader2, RefreshCw } from 'lucide-react';
import { useAdminPromotions } from '../../hooks/usePromotions';
import { useToast } from '../../hooks/useToast';
import PromotionList from './PromotionList';
import PromotionForm from './PromotionForm';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Alert from '../common/Alert';

const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 text-sm font-semibold rounded-btn transition-colors
      ${active
        ? 'bg-primary text-white'
        : 'bg-background-secondary text-text-secondary hover:text-text hover:bg-gray-100'
      }
    `}
  >
    {children}
  </button>
);

const AdminPanel = () => {
  const toast = useToast();
  const {
    promotions,
    loading,
    error,
    filterStatus,
    sortOrder,
    fetchAll,
    handleFilterChange,
    handleSortChange,
    create,
    update,
    remove,
  } = useAdminPromotions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = () => {
    setEditingPromotion(null);
    setIsFormOpen(true);
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPromotion(null);
  };

  const handleSubmit = async (data, imageFile, onProgress) => {
    setIsSubmitting(true);
    let result;

    if (editingPromotion) {
      result = await update(editingPromotion.id, data, imageFile, onProgress);
      if (!result.error) {
        toast.success('¡Promoción actualizada correctamente!');
        handleFormClose();
      }
    } else {
      result = await create(data, imageFile, onProgress);
      if (!result.error) {
        toast.success('¡Promoción creada correctamente!');
        handleFormClose();
      }
    }

    if (result.error) {
      toast.error(result.error);
    }

    setIsSubmitting(false);
    return result;
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    const result = await remove(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Promoción eliminada.');
    }
    setIsDeleting(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text">
            Promociones
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {promotions.length} promoción{promotions.length !== 1 ? 'es' : ''} en total
          </p>
        </div>
        <Button onClick={handleCreate} icon={Plus} size="sm">
          Nueva promoción
        </Button>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-background-secondary rounded-card">
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-text-secondary" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Estado:</span>
          <div className="flex gap-1">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'active', label: 'Activas' },
              { value: 'inactive', label: 'Inactivas' },
            ].map(({ value, label }) => (
              <FilterButton
                key={value}
                active={filterStatus === value}
                onClick={() => handleFilterChange(value)}
              >
                {label}
              </FilterButton>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown size={14} className="text-text-secondary" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Orden:</span>
          <div className="flex gap-1">
            {[
              { value: 'newest', label: 'Recientes' },
              { value: 'oldest', label: 'Antiguas' },
            ].map(({ value, label }) => (
              <FilterButton
                key={value}
                active={sortOrder === value}
                onClick={() => handleSortChange(value)}
              >
                {label}
              </FilterButton>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-4"
        />
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <PromotionList
          promotions={promotions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          transitionKey={`${filterStatus}-${sortOrder}`}
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingPromotion ? 'Editar promoción' : 'Nueva promoción'}
        maxWidth="max-w-xl"
      >
        <PromotionForm
          key={editingPromotion?.id || 'new'}
          initialData={editingPromotion}
          onSubmit={handleSubmit}
          onCancel={handleFormClose}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default AdminPanel;
