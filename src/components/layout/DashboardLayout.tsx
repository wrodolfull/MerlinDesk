import React, { useRef, useState, useEffect } from 'react';
import Navbar from "../Navbar";
import AssistantChat from "../../components/ai/AssistantChat";
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  Settings, 
  User, 
  Grid3X3,
  UserCircle,
  Building,
  BarChart,
  LogOut, 
  MessageCircle,
  Brain,
  Stars
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [userName, setUserName] = useState<string>('User');

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
    { path: '/settings', icon: <Settings size={20} />, label: 'Configurações' },
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
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className={cn(
              "flex items-center h-16 px-4",
              !sidebarOpen && "justify-center"
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
                  className={cn(
                    "group flex items-center py-2 px-3 rounded-md transition-colors",
                    isActive(item.path)
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    !sidebarOpen && "justify-center"
                  )}
                >
                  <div className={cn(
                    "text-gray-500 group-hover:text-gray-700",
                    sidebarOpen ? "mr-3" : "mr-0"
                  )}>
                    {item.icon}
                  </div>
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Profile and Logout */}
          <div className="border-t border-gray-200 p-4">
            {/* Perfil do usuário clicável */}
            <div 
              onClick={navigateToProfile}
              className={cn(
                "flex items-center cursor-pointer rounded-md p-2 hover:bg-gray-50",
                !sidebarOpen && "justify-center"
              )}
            >
              <div className="flex-shrink-0">
                <User size={24} className="text-gray-500" />
              </div>
              {sidebarOpen && user && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{userName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              )}
            </div>
            {sidebarOpen ? (
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
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
        {user && <AssistantChat />}
      </div>
    </div>
  );
};

export default DashboardLayout;
