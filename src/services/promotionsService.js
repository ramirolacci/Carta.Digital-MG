// src/services/promotionsService.js
import { supabase, isSupabaseConfigured } from './supabase';

const PAGE_SIZE = 10;
const LOCAL_STORAGE_KEY = 'site_promociones_data';

// Helper to map DB row (lowercase) to App object (camelCase)
const toApp = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    imageUrl: row.imageurl || '',
    imageStoragePath: row.imagestoragepath || '',
    date: row.date || '',
    active: row.active ?? true,
    createdAt: row.createdat || new Date().toISOString(),
    updatedAt: row.updatedat || new Date().toISOString(),
  };
};

// Helper to map App object (camelCase) to DB row (lowercase)
const toDb = (promo) => {
  if (!promo) return null;
  return {
    title: promo.title,
    description: promo.description || '',
    imageurl: promo.imageUrl,
    imagestoragepath: promo.imageStoragePath || '',
    date: promo.date,
    active: promo.active,
  };
};

const getLocalPromotions = () => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing local promotions:', e);
    }
  }
  
  // Default list of 6 local promotion images
  const defaultPromotions = [
    {
      id: 'local-1',
      title: 'Promoción 1',
      description: 'Imagen de promoción 1',
      imageUrl: '/promociones/1.jpg',
      active: true,
      date: new Date(Date.now() - 0 * 24 * 3600 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'local-2',
      title: 'Promoción 2',
      description: 'Imagen de promoción 2',
      imageUrl: '/promociones/2.jpg',
      active: true,
      date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'local-3',
      title: 'Promoción 3',
      description: 'Imagen de promoción 3',
      imageUrl: '/promociones/3.jpg',
      active: true,
      date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'local-4',
      title: 'Promoción 4',
      description: 'Imagen de promoción 4',
      imageUrl: '/promociones/4.jpg',
      active: true,
      date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'local-5',
      title: 'Promoción 5',
      description: 'Imagen de promoción 5',
      imageUrl: '/promociones/5.jpg',
      active: true,
      date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'local-6',
      title: 'Promoción 6',
      description: 'Imagen de promoción 6',
      imageUrl: '/promociones/6.jpg',
      active: true,
      date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultPromotions));
  return defaultPromotions;
};

const saveLocalPromotions = (promotions) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(promotions));
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

export const getActivePromotions = async (lastDoc = null) => {
  if (!isSupabaseConfigured) {
    try {
      const allLocal = getLocalPromotions();
      const active = allLocal.filter(p => p.active);
      // Sort by date desc
      active.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      const startIndex = lastDoc ? active.findIndex(p => p.id === lastDoc) + 1 : 0;
      
      if (startIndex < 0 || startIndex >= active.length) {
        return { promotions: [], lastVisible: null, hasMore: false, error: null };
      }
      
      const promotions = active.slice(startIndex, startIndex + PAGE_SIZE);
      const lastVisible = promotions[promotions.length - 1]?.id || null;
      const hasMore = startIndex + PAGE_SIZE < active.length;
      
      return { promotions, lastVisible, hasMore, error: null };
    } catch (error) {
      console.error('Error fetching local active promotions:', error);
      return { promotions: [], lastVisible: null, hasMore: false, error: 'Error al cargar las promociones locales.' };
    }
  }
  try {
    const offset = (lastDoc && !isNaN(lastDoc)) ? Number(lastDoc) : 0;
    
    const { data: promotions, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true)
      .order('date', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;

    const lastVisible = offset + promotions.length;
    const hasMore = promotions.length === PAGE_SIZE;

    return { promotions: promotions.map(toApp), lastVisible, hasMore, error: null };
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    return { promotions: [], lastVisible: null, hasMore: false, error: 'Error al cargar las promociones.' };
  }
};

export const getAllPromotions = async (filterStatus = 'all', sortOrder = 'newest') => {
  if (!isSupabaseConfigured) {
    try {
      let promotions = getLocalPromotions();
      
      if (filterStatus === 'active') {
        promotions = promotions.filter(p => p.active);
      } else if (filterStatus === 'inactive') {
        promotions = promotions.filter(p => !p.active);
      }
      
      const sortDir = sortOrder === 'newest' ? -1 : 1;
      promotions.sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return (dateA - dateB) * sortDir;
      });
      
      return { promotions, error: null };
    } catch (error) {
      console.error('Error fetching all local promotions:', error);
      return { promotions: [], error: 'Error al cargar las promociones locales.' };
    }
  }
  try {
    const ascending = sortOrder !== 'newest';
    let queryBuilder = supabase
      .from('promotions')
      .select('*')
      .order('date', { ascending })
      .order('id', { ascending });

    if (filterStatus === 'active') {
      queryBuilder = queryBuilder.eq('active', true);
    } else if (filterStatus === 'inactive') {
      queryBuilder = queryBuilder.eq('active', false);
    }

    const { data: promotions, error } = await queryBuilder;
    if (error) throw error;

    return { promotions: promotions.map(toApp), error: null };
  } catch (error) {
    console.error('Error fetching all promotions:', error);
    return { promotions: [], error: 'Error al cargar las promociones.' };
  }
};

export const getPromotionById = async (id) => {
  if (!isSupabaseConfigured) {
    try {
      const promotions = getLocalPromotions();
      const promotion = promotions.find(p => p.id === id);
      if (!promotion) {
        return { promotion: null, error: 'Promoción no encontrada.' };
      }
      return { promotion, error: null };
    } catch (error) {
      return { promotion: null, error: 'Error al cargar la promoción.' };
    }
  }
  try {
    const { data: promotion, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { promotion: toApp(promotion), error: null };
  } catch (error) {
    return { promotion: null, error: 'Error al cargar la promoción.' };
  }
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createPromotion = async (data, imageFile, onProgress) => {
  if (!isSupabaseConfigured) {
    try {
      let imageUrl = data.imageUrl || '';
      
      if (imageFile) {
        const compressed = await compressImage(imageFile);
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(compressed);
        });
      }
      
      if (!imageUrl) return { promotion: null, error: 'Se requiere una imagen.' };
      
      const now = new Date().toISOString();
      const newPromotion = {
        id: `local-${Date.now()}`,
        title: data.title,
        description: data.description || '',
        imageUrl,
        imageStoragePath: '',
        date: data.date || new Date().toISOString().split('T')[0],
        active: data.active ?? true,
        createdAt: now,
        updatedAt: now,
      };
      
      const promotions = getLocalPromotions();
      promotions.unshift(newPromotion);
      saveLocalPromotions(promotions);
      
      return { promotion: newPromotion, error: null };
    } catch (error) {
      console.error('Error creating local promotion:', error);
      return { promotion: null, error: 'Error al crear la promoción local.' };
    }
  }
  try {
    let imageUrl = data.imageUrl || '';
    let imageStoragePath = '';

    if (imageFile) {
      const uploadResult = await uploadImage(imageFile, onProgress);
      if (uploadResult.error) return { promotion: null, error: uploadResult.error };
      imageUrl = uploadResult.url;
      imageStoragePath = uploadResult.path;
    }

    if (!imageUrl) return { promotion: null, error: 'Se requiere una imagen.' };

    const docData = {
      title: data.title,
      description: data.description || '',
      imageUrl,
      imageStoragePath,
      date: data.date,
      active: data.active ?? true,
    };

    const { data: insertedData, error } = await supabase
      .from('promotions')
      .insert([toDb(docData)])
      .select()
      .single();

    if (error) throw error;
    return { promotion: toApp(insertedData), error: null };
  } catch (error) {
    console.error('Error creating promotion:', error);
    return { promotion: null, error: 'Error al crear la promoción.' };
  }
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updatePromotion = async (id, data, imageFile, onProgress) => {
  if (!isSupabaseConfigured) {
    try {
      const promotions = getLocalPromotions();
      const index = promotions.findIndex(p => p.id === id);
      if (index === -1) return { error: 'Promoción no encontrada.' };
      
      let imageUrl = data.imageUrl || promotions[index].imageUrl;
      if (imageFile) {
        const compressed = await compressImage(imageFile);
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(compressed);
        });
      }
      
      promotions[index] = {
        ...promotions[index],
        title: data.title,
        description: data.description || '',
        imageUrl,
        date: data.date || new Date().toISOString().split('T')[0],
        active: data.active,
        updatedAt: new Date().toISOString(),
      };
      
      saveLocalPromotions(promotions);
      return { error: null };
    } catch (error) {
      console.error('Error updating local promotion:', error);
      return { error: 'Error al actualizar la promoción local.' };
    }
  }
  try {
    const { promotion: existing } = await getPromotionById(id);
    if (!existing) return { error: 'Promoción no encontrada.' };

    let imageUrl = data.imageUrl || existing.imageUrl;
    let imageStoragePath = existing.imageStoragePath || '';

    if (imageFile) {
      // Delete old image if exists
      if (existing.imageStoragePath) {
        await deleteImageFromStorage(existing.imageStoragePath);
      }
      const uploadResult = await uploadImage(imageFile, onProgress);
      if (uploadResult.error) return { error: uploadResult.error };
      imageUrl = uploadResult.url;
      imageStoragePath = uploadResult.path;
    } else if (data.imageUrl && data.imageUrl !== existing.imageUrl) {
      // Si se pasa una URL externa y existía una imagen en storage, eliminarla para liberar espacio
      if (existing.imageStoragePath) {
        await deleteImageFromStorage(existing.imageStoragePath);
      }
      imageUrl = data.imageUrl;
      imageStoragePath = '';
    }

    const updates = {
      title: data.title,
      description: data.description || '',
      imageUrl,
      imageStoragePath,
      date: data.date,
      active: data.active,
    };

    const { error } = await supabase
      .from('promotions')
      .update(toDb(updates))
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating promotion:', error);
    return { error: 'Error al actualizar la promoción.' };
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deletePromotion = async (id) => {
  if (!isSupabaseConfigured) {
    try {
      const promotions = getLocalPromotions();
      const updated = promotions.filter(p => p.id !== id);
      saveLocalPromotions(updated);
      return { error: null };
    } catch (error) {
      console.error('Error deleting local promotion:', error);
      return { error: 'Error al eliminar la promoción local.' };
    }
  }
  try {
    const { promotion } = await getPromotionById(id);
    if (promotion?.imageStoragePath) {
      await deleteImageFromStorage(promotion.imageStoragePath);
    }
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return { error: 'Error al eliminar la promoción.' };
  }
};

// ─── Image Upload ─────────────────────────────────────────────────────────────

const compressImage = (file, maxWidth = 900, maxHeight = 1200, quality = 0.78) => {
  return new Promise((resolve) => {
    if (!file.type || !file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const baseName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'image';

        // Intentar compresión en formato WebP (formato ligero moderno)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback a JPEG si el navegador no genera WebP
              canvas.toBlob(
                (jpegBlob) => {
                  if (!jpegBlob) return resolve(file);
                  const compressedFile = new File([jpegBlob], `${baseName}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                },
                'image/jpeg',
                quality
              );
              return;
            }
            const compressedFile = new File([blob], `${baseName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export const uploadImage = async (file, onProgress) => {
  if (!isSupabaseConfigured) {
    return { url: null, path: null, error: 'Supabase no está configurado.' };
  }

  // Comprimir y convertir a WebP antes de subir
  const compressedFile = await compressImage(file);
  const ext = compressedFile.type === 'image/webp' ? 'webp' : 'jpg';
  console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)}MB, Comprimido: ${(compressedFile.size / 1024).toFixed(2)}KB (${ext.toUpperCase()})`);

  return new Promise((resolve) => {
    // Generar nombre de archivo único
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${ext}`;
    const filePath = `${fileName}`;

    // Simular barra de progreso para mejor respuesta visual en la interfaz
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.round(Math.random() * 15) + 5;
      if (progress >= 90) {
        progress = 90;
        clearInterval(progressInterval);
      }
      onProgress?.(progress);
    }, 100);

    supabase.storage
      .from('promotions')
      .upload(filePath, compressedFile, {
        cacheControl: '31536000', // 1 año de caché (el nombre del archivo es único, evita re-descargas)
        contentType: compressedFile.type,
        upsert: false,
      })
      .then(({ data, error }) => {
        clearInterval(progressInterval);
        if (error) {
          console.error('Upload error:', error);
          resolve({ url: null, path: null, error: 'Error al subir la imagen.' });
        } else {
          onProgress?.(100);
          const { data: { publicUrl } } = supabase.storage
              .from('promotions')
              .getPublicUrl(filePath);
          resolve({ url: publicUrl, path: filePath, error: null });
        }
      })
      .catch((err) => {
        clearInterval(progressInterval);
        console.error('Upload exception:', err);
        resolve({ url: null, path: null, error: 'Error al subir la imagen.' });
      });
  });
};

const deleteImageFromStorage = async (path) => {
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase.storage
      .from('promotions')
      .remove([path]);
    if (error) {
      console.warn('Could not delete image from Supabase storage:', error);
    }
  } catch (error) {
    // Non-critical: log but don't fail the operation
    console.warn('Could not delete image from storage:', error);
  }
};
