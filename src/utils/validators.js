// src/utils/validators.js
import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const promotionSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido.')
    .max(100, 'El título no puede superar los 100 caracteres.'),
  description: z
    .string()
    .max(300, 'La descripción no puede superar los 300 caracteres.')
    .optional()
    .or(z.literal('')),
  date: z.string().optional(),
  active: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido.')
    .email('Ingrese un email válido.'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export const validateImageFile = (file) => {
  if (!file) return { valid: false, error: 'Seleccione una imagen.' };

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Solo se permiten imágenes JPG, PNG o WebP.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'La imagen no puede superar los 5MB.',
    };
  }

  return { valid: true, error: null };
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
