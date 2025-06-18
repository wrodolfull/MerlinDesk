import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Mail, Phone, MapPin, Settings } from 'lucide-react';
import CookieSettings from '../ui/CookieSettings';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);

  return (
    <>
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Merlin Desk</h3>
              <p className="text-gray-400 mb-4">Simplificando agendamentos para empresas em todo o Brasil.</p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/merlindesk/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.056 1.987.24 2.45.415a4.92 4.92 0 0 1 1.772 1.153 4.92 4.92 0 0 1 1.153 1.772c.175.463.359 1.28.415 2.45.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.987-.415 2.45a4.92 4.92 0 0 1-1.153 1.772 4.92 4.92 0 0 1-1.772 1.153c-.463.175-1.28.359-2.45.415-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.987-.24-2.45-.415a4.92 4.92 0 0 1-1.772-1.153 4.92 4.92 0 0 1-1.153-1.772c-.175-.463-.359-1.28-.415-2.45C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.056-1.17.24-1.987.415-2.45a4.92 4.92 0 0 1 1.153-1.772A4.92 4.92 0 0 1 5.573 2.65c.463-.175 1.28-.359 2.45-.415C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.736 0 8.332.013 7.052.072 5.776.13 4.732.312 3.85.635c-.9.31-1.662.764-2.425 1.527C.764 3.925.31 4.688 0 5.587c-.323.882-.505 1.926-.563 3.202C-.013 8.668 0 9.072 0 12c0 2.928.013 3.332.072 4.613.058 1.276.24 2.32.563 3.202.31.9.764 1.662 1.527 2.425.763.763 1.525 1.217 2.425 1.527.882.323 1.926.505 3.202.563C8.668 23.987 9.072 24 12 24s3.332-.013 4.613-.072c1.276-.058 2.32-.24 3.202-.563.9-.31 1.662-.764 2.425-1.527.763-.763 1.217-1.525 1.527-2.425.323-.882.505-1.926.563-3.202C23.987 15.332 24 14.928 24 12s-.013-3.332-.072-4.613c-.058-1.276-.24-2.32-.563-3.202a6.911 6.911 0 0 0-1.527-2.425 6.911 6.911 0 0 0-2.425-1.527C19.332.313 18.288.13 17.012.072 15.732.013 15.328 0 12 0zM12 5.838A6.162 6.162 0 1 0 18.162 12 6.162 6.162 0 0 0 12 5.838zm0 10.162A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.406-11.845a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Preços</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutoriais</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Contato</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-400">(11) 3456-7890</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-400">contato@merlindesk.com</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-400">São Paulo, SP - Brasil</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 Merlin Desk. Todos os direitos reservados.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Política de Privacidade</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Termos de Serviço</Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">Política de Cookies</Link>
              <button
                onClick={() => setIsCookieSettingsOpen(true)}
                className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
              >
                <Settings className="w-3 h-3 mr-1" />
                Configurar Cookies
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Configurações de Cookies */}
      <CookieSettings
        isOpen={isCookieSettingsOpen}
        onClose={() => setIsCookieSettingsOpen(false)}
      />
    </>
  );
};

export default Footer;