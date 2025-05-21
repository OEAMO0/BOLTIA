import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-800 shadow-inner py-6 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              © {year} GameHub - All games are for entertainment purposes only
            </p>
          </div>
          <div className="flex space-x-6">
            <a 
              href="#" 
              className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm transition-colors"
            >
              Terms
            </a>
            <a 
              href="#" 
              className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm transition-colors"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm transition-colors"
            >
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;