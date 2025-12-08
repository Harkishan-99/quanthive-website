'use client';

import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
           <div className="w-3 h-3 bg-white"></div>
           <Link href="/" className="text-xl font-bold tracking-tighter text-white">QUANTHIVE</Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
            {['Markets', 'Research', 'Models', 'About'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-mono text-neutral-400 hover:text-white transition-colors uppercase tracking-wider">
                    {item}
                </a>
            ))}
        </nav>

        <button className="px-4 py-2 border border-white/20 text-xs font-mono text-white hover:bg-white hover:text-black transition-all uppercase tracking-wider">
            Subscribe
        </button>
      </div>
    </header>
  );
};

export default Header;

