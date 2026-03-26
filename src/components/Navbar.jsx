import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Wallet } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "text-accent-blue" : "text-gray-300 hover:text-white";
  };

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-wider">
          <Shield className="text-accent-blue" size={28} />
          <span>AlphaVault</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-medium">
          <Link to="/" className={`transition-colors duration-200 ${isActive('/')}`}>Home</Link>
          <Link to="/workflow" className={`transition-colors duration-200 ${isActive('/workflow')}`}>About</Link>
          <Link to="/dashboard" className={`transition-colors duration-200 ${isActive('/dashboard')}`}>Dashboard</Link>
        </div>

        <button className="flex items-center gap-2 bg-accent-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]">
          <Wallet size={18} />
          <span>Connect Wallet</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
