import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Menu, User, X, LogOut, Settings, CreditCard } from 'lucide-react';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/calendars', label: 'Calendars' },
    { path: '/appointments', label: 'Appointments' },
    { path: '/pricing', label: 'Pricing' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Calendar className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AppointEase</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive(link.path)
                    ? 'border-primary-600 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Authentication */}
          <div className="flex items-center">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <Avatar size="sm" src={user.avatar} alt={user.name} />
                    <span className="font-medium text-sm text-gray-700">{user.name}</span>
                  </button>
                  
                  {/* Dropdown Panel */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </Link>
                    <Link
                      to="/settings?tab=subscription"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CreditCard size={16} className="mr-2" />
                      Subscription
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden ml-2">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                {menuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white py-2 px-4 sm:px-6 shadow-inner animate-fade-in">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 px-3 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <>
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="flex items-center px-3 py-2">
                    <Avatar size="sm" src={user.avatar} alt={user.name} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <Link
                    to="/settings?tab=subscription"
                    className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    Subscription
                  </Link>
                  <button
                    className="block w-full text-left py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-200 my-2 pt-2">
                <Link
                  to="/login"
                  className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block py-2 px-3 rounded-md text-base font-medium text-primary-600 hover:bg-primary-50 hover:text-primary-700"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;