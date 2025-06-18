import { useEffect } from 'react';
import { useCookieConsent } from '../../hooks/useCookieConsent';

// Google Analytics Measurement ID (substitua pelo seu ID real)
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Substitua pelo seu ID do Google Analytics

const GoogleAnalytics: React.FC = () => {
  const { hasConsent, isLoaded } = useCookieConsent();

  useEffect(() => {
    // Só carrega o Google Analytics se o usuário deu consentimento para cookies de performance
    if (!isLoaded || !hasConsent('performance')) {
      return;
    }

    // Carrega o script do Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Configura o gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    // Limpa o script quando o componente for desmontado
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [hasConsent, isLoaded]);

  // Não renderiza nada, apenas gerencia o script
  return null;
};

// Declaração global para o TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default GoogleAnalytics; 