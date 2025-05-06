import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  Settings, 
  User, 
  PanelLeft, 
  Grid3X3,
  UserCircle,
  Building,
  BarChart,
  LogOut,
  MessageCircle,
  Brain
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', icon: <Grid3X3 size={20} />, label: 'Dashboard' },
    { path: '/appointments', icon: <Clock size={20} />, label: 'Appointments' },
    { path: '/calendars', icon: <Calendar size={20} />, label: 'Calendars' },
    { path: '/specialties', icon: <Building size={20} />, label: 'Specialties' },
    { path: '/professionals', icon: <UserCircle size={20} />, label: 'Professionals' },
    { path: '/clients', icon: <Users size={20} />, label: 'Clients' },
    { path: '/chat', icon: <MessageCircle size={20} />, label: 'Chat' },
    { path: '/ai-training', icon: <Brain size={20} />, label: 'AI Training' },
    { path: '/analytics', icon: <BarChart size={20} />, label: 'Analytics' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4">
              <Link to="/" className="flex items-center">
                <Calendar className="h-8 w-8 text-primary-600" />
                {sidebarOpen && (
                  <span className="ml-2 text-xl font-bold text-gray-900">AppointEase</span>
                )}
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <PanelLeft size={20} />
              </button>
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
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="mr-3 text-gray-500 group-hover:text-gray-700">
                    {item.icon}
                  </div>
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Profile and Logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User size={24} className="text-gray-500" />
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Admin User</p>
                  <p className="text-xs text-gray-500">admin@appointease.com</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button className="mt-4 flex items-center w-full py-2 px-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                <LogOut size={18} className="mr-2" />
                Sign out
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;