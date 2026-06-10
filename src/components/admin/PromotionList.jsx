// src/components/admin/PromotionList.jsx
import { memo, useLayoutEffect, useRef, useState } from 'react';
import { Pencil, Trash2, Eye, EyeOff, Calendar, ImageOff } from 'lucide-react';
import gsap from 'gsap';
import { formatDateShort, isPromotionCurrent } from '../../utils/helpers';
import Button from '../common/Button';
import Modal from '../common/Modal';

const ConfirmDeleteModal = ({ promotion, onConfirm, onCancel, isDeleting }) => (
  <Modal isOpen={!!promotion} onClose={onCancel} title="Eliminar promoción">
    <div className="p-6 space-y-4">
      <p className="text-text-secondary">
        ¿Estás seguro que querés eliminar{' '}
        <strong className="text-text">"{promotion?.title}"</strong>?
        Esta acción no se puede deshacer.
      </p>
      {promotion?.imageUrl && (
        <img
          src={promotion.imageUrl?.startsWith('/') ? `${import.meta.env.BASE_URL}${promotion.imageUrl.slice(1)}` : promotion.imageUrl}
          alt={promotion.title}
          className="w-full aspect-video object-cover rounded-btn"
        />
      )}
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isDeleting}>
          Cancelar
        </Button>
        <Button variant="danger" size="sm" loading={isDeleting} onClick={onConfirm}>
          Sí, eliminar
        </Button>
      </div>
    </div>
  </Modal>
);

const PromotionListItem = memo(({ promotion, onEdit, onDelete }) => {
  const [imgError, setImgError] = useState(false);
  const isCurrent = isPromotionCurrent(promotion.date);

  return (
    <div data-promo-card className="bg-white rounded-card shadow-card overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-video bg-background-secondary overflow-hidden">
        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
            <ImageOff size={28} className="opacity-30" />
          </div>
        ) : (
          <img
            src={promotion.imageUrl?.startsWith('/') ? `${import.meta.env.BASE_URL}${promotion.imageUrl.slice(1)}` : promotion.imageUrl}
            alt={promotion.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        )}
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {promotion.active ? (
            <span className="badge-active">
              <Eye size={10} />
              Activa
            </span>
          ) : (
            <span className="badge-inactive">
              <EyeOff size={10} />
              Inactiva
            </span>
          )}
        </div>
        {/* Vigente badge */}
        {promotion.active && isCurrent && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 bg-secondary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Vigente
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-text text-sm leading-snug line-clamp-2">
          {promotion.title}
        </h3>
        {promotion.description && (
          <p className="text-xs text-text-secondary line-clamp-2">{promotion.description}</p>
        )}
        <div className="flex items-center gap-1 text-xs text-text-secondary mt-auto pt-1">
          <Calendar size={11} />
          {formatDateShort(promotion.date)}
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 flex gap-2">
        <button
          onClick={() => onEdit(promotion)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold
                     text-primary border border-primary/30 rounded-btn hover:bg-primary/5 transition-colors"
        >
          <Pencil size={12} />
          Editar
        </button>
        <button
          onClick={() => onDelete(promotion)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold
                     text-error border border-error/30 rounded-btn hover:bg-error/5 transition-colors"
        >
          <Trash2 size={12} />
          Eliminar
        </button>
      </div>
    </div>
  );
});

PromotionListItem.displayName = 'PromotionListItem';

const PromotionList = ({ promotions, onEdit, onDelete, isDeleting, transitionKey }) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const gridRef = useRef(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await onDelete(deleteTarget.id);
    setDeleteTarget(null);
  };

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || !promotions.length) return;

    const cards = grid.querySelectorAll('[data-promo-card]');

    gsap.killTweensOf([grid, cards]);
    gsap.fromTo(
      grid,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'opacity,transform' }
    );
    gsap.fromTo(
      cards,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.05,
        clearProps: 'opacity,transform',
      }
    );
  }, [promotions, transitionKey]);

  if (!promotions.length) {
    return (
      <div className="py-12 text-center text-text-secondary text-sm">
        No hay promociones para mostrar.
      </div>
    );
  }

  return (
    <>
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promo) => (
          <PromotionListItem
            key={promo.id}
            promotion={promo}
            onEdit={onEdit}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      <ConfirmDeleteModal
        promotion={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default PromotionList;
