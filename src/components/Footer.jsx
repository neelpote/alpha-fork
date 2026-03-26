import React from 'react';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-background/50 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-2 mb-4 md:mb-0 opacity-80">
          <Shield className="text-accent-blue" size={20} />
          <span className="text-gray-200 font-semibold tracking-wide">AlphaVault</span>
        </div>
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} AlphaVault. All rights reserved. Verifiable Alpha.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
