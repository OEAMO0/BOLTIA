import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, User, Settings, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { usePlayer } from '../contexts/PlayerContext';
import ProfileModal from './ProfileModal';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { player } = usePlayer();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2" onClick={() => setMenuOpen(false)}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">GH</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">GameHub</h1>
          </Link>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="md:hidden text-slate-700 dark:text-white"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {player.name}
              </span>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Profile"
              >
                <User size={20} className="text-slate-700 dark:text-slate-200" />
              </button>
            </div>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-300" />
              ) : (
                <Moon size={20} className="text-slate-700" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="mt-4 md:hidden">
            <nav className="flex flex-col space-y-4 py-2">
              <Link 
                to="/" 
                className="px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <div className="px-4 py-2 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {player.name}
                  </span>
                  <button 
                    onClick={() => {
                      setShowProfileModal(true);
                      setMenuOpen(false);
                    }}
                    className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    <User size={18} className="text-slate-700 dark:text-slate-200" />
                  </button>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  {theme === 'dark' ? (
                    <Sun size={18} className="text-yellow-300" />
                  ) : (
                    <Moon size={18} className="text-slate-700" />
                  )}
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
      
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </header>
  );
};

export default Header;