import React, { useRef, useState, useEffect } from 'react';
import Navbar from "../Navbar";
//import AssistantChat from "../../components/ai/AssistantChat";
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  User, 
  Grid3X3,
  UserCircle,
  Building,
  BarChart,
  LogOut, 
  MessageCircle,
  Brain,
  Stars,
  Plug,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [userName, setUserName] = useState<string>('User');

  // Monitor window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para extrair o nome do usuário do objeto user do Supabase
  useEffect(() => {
    if (user) {
      // Tenta obter o nome do usuário de várias possíveis localizações no objeto user do Supabase
      const name = 
        // Tenta user.user_metadata.name (comum no Supabase)
        (user.user_metadata && user.user_metadata.name) ||
        // Tenta user.raw_user_meta_data.name (outra possibilidade no Supabase)
        (user.raw_user_meta_data && user.raw_user_meta_data.name) ||
        // Tenta user.name diretamente (caso já esteja mapeado)
        (user as any).name ||
        // Tenta user.email como fallback
        user.email ||
        // Valor padrão se nada for encontrado
        'User';
      
      setUserName(name);
    }
  }, [user]);

  const navItems = [
    { path: '/dashboard', icon: <Grid3X3 size={20} />, label: 'Dashboard' },
    { path: '/appointments', icon: <Clock size={20} />, label: 'Agendamentos' },
    { path: '/calendars', icon: <Calendar size={20} />, label: 'Calendário' },
    { path: '/specialties', icon: <Building size={20} />, label: 'Especialidades' },
    { path: '/professionals', icon: <UserCircle size={20} />, label: 'Profissionais' },
    { path: '/clients', icon: <Users size={20} />, label: 'Clientes' },
    //{ path: '/assistant', icon: <Stars size={20} />, label: 'Assistante Virtual' },
    //{ path: '/chat', icon: <MessageCircle size={20} />, label: 'Chat' },
    //{ path: '/ai-training', icon: <Brain size={20} />, label: 'AI Training' },
    { path: '/analytics', icon: <BarChart size={20} />, label: 'Relatório' },
    { path: '/subscription', icon: <CreditCard size={20} />, label: 'Assinatura' },
    { path: '/integrations', icon: <Plug size={20} />, label: 'Integrações' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setSidebarOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setSidebarOpen(false);
    }, 3000);
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const navigateToProfile = () => {
    navigate('/profile');
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 right-4 z-50 p-2.5 rounded-lg bg-white shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300",
          isMobile 
            ? "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out"
            : "relative",
          sidebarOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : "w-20",
          !isMobile && !sidebarOpen && "w-20",
          !isMobile && sidebarOpen && "w-64"
        )}
        onMouseEnter={!isMobile ? handleMouseEnter : undefined}
        onMouseLeave={!isMobile ? handleMouseLeave : undefined}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className={cn(
              "flex items-center h-16 px-4",
              !sidebarOpen && !isMobile && "justify-center"
            )}>
              <Link to="/" className="flex items-center">
                <Calendar className="h-8 w-8 text-primary-600" />
                {sidebarOpen && (
                  <span className="ml-2 text-xl font-bold text-gray-900">Merlin Desk</span>
                )}
              </Link>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center py-2 px-3 rounded-md transition-colors",
                    isActive(item.path)
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    !sidebarOpen && !isMobile && "justify-center"
                  )}
                >
                  <div className={cn(
                    "text-gray-500 group-hover:text-gray-700",
                    (sidebarOpen || isMobile) ? "mr-3" : "mr-0"
                  )}>
                    {item.icon}
                  </div>
                  {(sidebarOpen || isMobile) && <span className="font-medium">{item.label}</span>}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Profile and Logout */}
          <div className="border-t border-gray-200 p-4">
            <div 
              onClick={navigateToProfile}
              className={cn(
                "flex items-center cursor-pointer rounded-md p-2 hover:bg-gray-50",
                !sidebarOpen && !isMobile && "justify-center"
              )}
            >
              <div className="flex-shrink-0">
                <User size={24} className="text-gray-500" />
              </div>
              {(sidebarOpen || isMobile) && user && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{userName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              )}
            </div>
            {(sidebarOpen || isMobile) ? (
              <button 
                onClick={handleLogout}
                className="mt-4 flex items-center w-full py-2 px-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut size={18} className="mr-2" />
                Sair
              </button>
            ) : (
              <button 
                onClick={handleLogout}
                className="mt-4 flex justify-center items-center w-full py-2 px-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 overflow-auto",
        isMobile && "ml-0"
      )}>
        <main className="p-6">
          {children}
        </main>
        {/* {user && <AssistantChat />} */}
      </div>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
