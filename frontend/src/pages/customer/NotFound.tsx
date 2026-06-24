import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 max-w-md mx-auto">
      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <HelpCircle size={48} className="stroke-[1.5]" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-800">404 - Page Not Found</h1>
      <p className="text-slate-500 text-sm leading-relaxed">
        The page you are looking for does not exist or has been relocated. Use the options below to return.
      </p>
      <div className="flex gap-4 w-full">
        <Link
          to="/"
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md transition-colors"
        >
          <Home size={16} />
          <span>Home Page</span>
        </Link>
        <Link
          to="/products"
          className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2.5 rounded-xl text-sm transition-colors"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  );
};
