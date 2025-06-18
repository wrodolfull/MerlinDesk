import { useEffect } from 'react';
import { useCookieConsent } from '../../hooks/useCookieConsent';

const FunctionalityCookies: React.FC = () => {
  const { hasConsent, isLoaded } = useCookieConsent();

  useEffect(() => {
    // Só aplica cookies de funcionalidade se o usuário deu consentimento
    if (!isLoaded || !hasConsent('functionality')) {
      return;
    }

    // Aqui você pode adicionar lógica para cookies de funcionalidade
    // Por exemplo, salvar preferências de idioma, tema, etc.
    
    // Exemplo: Salvar preferência de idioma
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) {
      // Aplicar idioma salvo
      document.documentElement.lang = savedLanguage;
    }

    // Exemplo: Salvar preferência de tema
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme) {
      // Aplicar tema salvo
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

  }, [hasConsent, isLoaded]);

  // Função para salvar preferências (só funciona se o usuário deu consentimento)
  const savePreference = (key: string, value: string) => {
    if (hasConsent('functionality')) {
      localStorage.setItem(key, value);
    }
  };

  // Função para obter preferências (só funciona se o usuário deu consentimento)
  const getPreference = (key: string): string | null => {
    if (hasConsent('functionality')) {
      return localStorage.getItem(key);
    }
    return null;
  };

  // Não renderiza nada, apenas gerencia os cookies
  return null;
};

export default FunctionalityCookies; 