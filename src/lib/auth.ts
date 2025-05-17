import { supabase } from './supabase';

export async function signUp(email: string, password: string, userData: { name: string; phone?: string }) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: userData.name,
        phone: userData.phone,
      },
    },
  });

  if (authError) {
    throw authError;
  }

  // Create client profile
  if (authData.user) {
    const { error: profileError } = await supabase.from('clients').insert({
      id: authData.user.id,
      name: userData.name,
      email,
      phone: userData.phone,
    });

    if (profileError) {
      throw profileError;
    }
  }

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  
  if (error) {
    throw error;
  }
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
}