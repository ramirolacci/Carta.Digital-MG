// src/services/authService.js
import { supabase, isSupabaseConfigured } from './supabase';

export const loginWithEmail = async (email, password) => {
  if (!isSupabaseConfigured) {
    return { user: null, error: 'Supabase no está configurado.' };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    const message = getAuthErrorMessage(error.message || error.code || '');
    return { user: null, error: message };
  }
};

export const logout = async () => {
  if (!isSupabaseConfigured) {
    return { error: null };
  }
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: 'Error al cerrar sesión. Intente de nuevo.' };
  }
};

export const subscribeToAuthChanges = (callback) => {
  if (!isSupabaseConfigured) {
    callback(null);
    return () => {};
  }
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(session?.user || null);
    }
  );
  
  return () => {
    subscription.unsubscribe();
  };
};

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

const getAuthErrorMessage = (code) => {
  const errorMessages = {
    'Invalid login credentials': 'Email o contraseña incorrectos.',
    'auth/invalid-email': 'El email ingresado no es válido.',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
    'auth/user-not-found': 'No existe una cuenta con este email.',
    'auth/wrong-password': 'La contraseña es incorrecta.',
    'auth/invalid-credential': 'Email o contraseña incorrectos.',
  };
  return errorMessages[code] || code || 'Error de autenticación. Intente de nuevo.';
};
