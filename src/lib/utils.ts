import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data de forma segura, retornando uma string formatada ou 'Data inválida' se a data for inválida
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    return 'Data inválida';
  }
}

/**
 * Formata uma data para o formato YYYY-MM-DD para inputs de tipo date
 */
export function formatDateForInput(dateString?: string | null): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '';
  }
}

/**
 * Cria uma data ISO string a partir de uma string de data (YYYY-MM-DD)
 */
export function createISODate(dateString: string): string | undefined {
  if (!dateString) return undefined;
  
  try {
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date.toISOString();
  } catch (error) {
    return undefined;
  }
}

// Função para obter a URL base da API baseada no ambiente
export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }
  return 'https://merlindesk.com';
} 