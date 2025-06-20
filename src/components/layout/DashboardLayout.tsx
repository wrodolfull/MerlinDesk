import React, { useRef, useState, useEffect } from 'react';
import Navbar from "./Navbar";
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
  CreditCard,
  ListIcon
} from 'lucide-react';
import { cn } from '../../utils/cn';
import CreateAppointmentModal from '../modals/CreateAppointmentModal';
import QuickAppointmentModal from '../modals/QuickAppointmentModal';
import CreateTaskModal from '../tasks/CreateTaskModal';
import { Toaster, toast } from 'react-hot-toast';
import { useTasks } from '../../hooks/useTasks';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { createTask } = useTasks();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [showCreateAppointmentModal, setShowCreateAppointmentModal] = useState(false);
  const [showQuickAppointmentModal, setShowQuickAppointmentModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        // Tenta user.name diretamente (caso já esteja mapeado)
        (user as any).name ||
        // Tenta user.email como fallback
        user.email ||
        // Valor padrão se nada for encontrado
        'User';
      
      setUserName(name);
    }
  }, [user]);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

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
    {
      path: '/tasks',
      label: 'Minhas tarefas',
      icon: <ListIcon className="w-5 h-5" />,
    },
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

  const handleCreateTask = async (data: any) => {
    const { title, description, dueDate, status, priority } = data;
    const error = await createTask({
      title,
      description,
      due_date: dueDate,
      status,
      priority,
    });
    if (error) {
      toast.error(`Falha ao criar tarefa: ${error.message}`);
    } else {
      toast.success('Tarefa criada com sucesso!');
    }
    setShowCreateTaskModal(false);
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

            {/* Create Task Button - agora logo abaixo do logo */}
            <div className={cn("flex justify-center mt-4", !sidebarOpen && !isMobile && "px-0")}> 
              <div className="relative w-full flex justify-center" ref={dropdownRef}>
                <button
                  className={`flex items-center justify-center rounded-full bg-[#7C45D0] text-white shadow-lg transition-all duration-200 ${sidebarOpen ? 'w-40 h-12 text-lg font-semibold' : 'w-12 h-12 text-3xl'} ${sidebarOpen ? '' : 'p-0'}`}
                  onClick={() => setDropdownOpen((open) => !open)}
                  title="Criar"
                  style={{ lineHeight: 1, height: sidebarOpen ? '3rem' : '3rem', minHeight: '3rem', alignItems: 'center' }}
                >
                  <span className={sidebarOpen ? "mr-2 text-2xl flex items-center justify-center" : "flex items-center justify-center w-full h-full text-2xl"} style={{lineHeight: 1}}>
                    +
                  </span>
                  {sidebarOpen && 'Criar'}
                </button>
                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-100">
                    <button
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => { setShowQuickAppointmentModal(true); setDropdownOpen(false); }}
                    >
                      <div className="flex flex-col items-start">
                        <span>Agendamento Rápido</span>
                        <span className="text-xs text-gray-500 mt-1">Crie um agendamento para um cliente rapidamente</span>
                      </div>
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => { setShowCreateTaskModal(true); setDropdownOpen(false); }}
                    >
                      <div className="flex flex-col items-start">
                        <span>Tarefa</span>
                        <span className="text-xs text-gray-500 mt-1">Adicione uma tarefa para sua organização</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
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

      {showQuickAppointmentModal && (
        <QuickAppointmentModal
          onClose={() => setShowQuickAppointmentModal(false)}
          onSuccess={() => setShowQuickAppointmentModal(false)}
        />
      )}

      {showCreateTaskModal && (
        <CreateTaskModal
          open={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
