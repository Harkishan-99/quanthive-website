'use client';

import React, { useEffect, useState } from 'react';
import { BlogPost } from '@/lib/blog/types';
import Link from 'next/link';

interface FeaturedSectionProps {
  post: BlogPost;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ post }) => {
  const [animationStage, setAnimationStage] = useState<'init' | 'shimmering' | 'revealed'>('init');
  const [autoHover, setAutoHover] = useState(false); // Start false, wait for shimmer

  useEffect(() => {
    // Start sequence on mount
    setAnimationStage('shimmering');
    
    // After shimmer duration (0.8s), reveal text/images and START auto-hover
    const revealTimer = setTimeout(() => {
        setAnimationStage('revealed');
        setAutoHover(true); // Start the hover effect now that shimmer is done
    }, 800);

    // Stop Auto-hover effect 3 seconds AFTER it started (0.8s + 3s = 3.8s)
    const stopHoverTimer = setTimeout(() => {
        setAutoHover(false);
    }, 3800);

    return () => {
        clearTimeout(revealTimer);
        clearTimeout(stopHoverTimer);
    };
  }, []);

  return (
    <section 
      className="relative w-full cursor-pointer group mt-4"
    >
      {/* --- MOBILE: Grid Background Pattern - 4 columns, 5 rows --- */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 lg:hidden">
        {/* Big Grid Boxes Pattern */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {/* Vertical Lines - 4 columns (5 vertical lines) */}
          <div 
            className="absolute inset-0 w-full h-full" 
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
              backgroundSize: '25% 100%' 
            }}
          ></div>
          {/* Horizontal Lines - 5 rows (6 horizontal lines) */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
              backgroundSize: '100% 20%'
            }}
          ></div>
        </div>

        {/* Mobile: Auto-Animated Gradient Blob */}
        <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden opacity-100 mix-blend-screen">
            <div 
                className="absolute -bottom-[40%] -left-[10%] w-[120%] h-[80%] blur-3xl animate-horizontal-sway"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(29, 78, 216, 0.4) 0%, rgba(88, 28, 135, 0.2) 40%, transparent 70%)'
                }}
            ></div>
        </div>
      </div>

      {/* --- DESKTOP: FULL WIDTH BACKGROUND CONTAINER --- */}
      {/* Increased top border thickness to 4px (border-t-4) to accommodate the light saber effect */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block border-t-4 border-b border-white/10">
        
        {/* Full Width Grid Lines */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
             {/* Vertical Lines */}
             <div 
                className="absolute inset-0 w-full h-full" 
                style={{
                    backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '120px 100%' 
                }}
             ></div>
             {/* Horizontal Lines */}
             <div 
                className="absolute inset-0 w-full h-full"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '100% 100px'
                }}
             ></div>
        </div>

        {/* Diagonal Shimmer Overlay (Initial Load) */}
        {animationStage !== 'revealed' && (
            <div className="absolute inset-0 z-20 overflow-hidden">
                <div 
                    className="w-[200%] h-full absolute top-0 left-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer-slide opacity-50"
                    style={{ transform: 'translateX(-100%)' }}
                ></div>
            </div>
        )}

        {/* Interactive Hover Blob (Horizontal Sway) */}
        {/* Logic: If autoHover is true, Opacity 100. Else, Opacity 0 unless group-hover. */}
        <div className={`absolute bottom-0 left-0 w-full h-full overflow-hidden transition-opacity duration-1000 ease-in-out mix-blend-screen
            ${autoHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}>
            <div 
                className="absolute -bottom-[40%] -left-[10%] w-[120%] h-[80%] blur-3xl animate-horizontal-sway"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(29, 78, 216, 0.4) 0%, rgba(88, 28, 135, 0.2) 40%, transparent 70%)'
                }}
            ></div>
        </div>
      </div>


      {/* --- CENTERED CONTENT CONTAINER --- */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-0">
        {/* MOBILE: Simplified Layout */}
        <div className="lg:hidden relative z-10 pt-12 pb-8 px-4 mt-8">
          {/* Featured Label */}
          <div className="mb-4">
            <div className="bg-white text-black px-4 py-2 inline-block">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
                Featured
              </span>
            </div>
          </div>
          
          {/* Featured Card with Image - No background, no border */}
          <div className="relative overflow-hidden">
            {/* Image Section */}
            <Link href={`/blog/${post.slug}`} className="block relative w-full pt-[56.25%] overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </Link>
            
            {/* Content Below Image - Aligned with image left edge */}
            <div className="px-0 pt-6 pb-6">
              {/* Date and Category */}
              <div className="flex items-center space-x-2 mb-4 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                <span>{post.date}</span>
                <span className="text-neutral-600">■</span>
                <span className="text-neutral-300">{post.category}</span>
              </div>
              
              {/* Title (duplicate for better mobile UX) */}
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-medium text-white leading-[1.2] tracking-tight mb-6 hover:text-accent-blue transition-colors">
                  {post.title}
                </h2>
              </Link>
              
              {/* Author - No border separator */}
              <div className="flex items-center space-x-3 pt-4">
                {/* Generic Avatar Icon */}
                <div className="w-8 h-8 rounded-sm bg-neutral-800 flex items-center justify-center border border-white/10">
                  <svg 
                    className="w-5 h-5 text-neutral-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                </div>
                <div className="text-[10px] font-mono tracking-wider">
                  <span className="text-neutral-500 mr-2">BY</span>
                  <span className="text-white font-bold uppercase">{post.author}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP: Original Grid Layout */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 border-white/10 relative">
            
            {/* Left Column: LATEST Label */}
            <div className="col-span-12 lg:col-span-2 relative z-10 border-b lg:border-b-0 border-white/10 lg:border-r py-6 lg:py-12 pl-4">
            <div className={`flex items-start transition-opacity duration-1000 ${animationStage === 'revealed' ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-xs font-mono font-bold tracking-widest text-white uppercase bg-neutral-900 border border-white/20 px-3 py-1">
                Latest
                </span>
            </div>
            </div>

            {/* Middle Column: Text Content */}
            <div className="col-span-12 lg:col-span-5 relative z-10 border-b lg:border-b-0 border-white/10 lg:border-r p-6 lg:p-12 flex flex-col justify-between min-h-[400px]">
            <div className={`transition-all duration-1000 delay-100 ${animationStage === 'revealed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center space-x-3 mb-6">
                <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                    {post.date}
                </span>
                <span className="w-1 h-1 bg-neutral-600 rounded-full"></span>
                <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                    {post.category}
                </span>
                </div>
                
                <Link href={`/blog/${post.slug}`}>
                  <h1 className="text-4xl lg:text-6xl font-medium text-white leading-[1.1] tracking-tight mb-8 hover:text-accent-blue transition-colors">
                    {post.title}
                  </h1>
                </Link>
            </div>

            <div className={`flex items-center space-x-4 mt-auto pt-8 transition-all duration-1000 delay-200 ${animationStage === 'revealed' ? 'opacity-100' : 'opacity-0'}`}>
                {/* Generic Avatar Icon */}
                <div className="w-10 h-10 rounded-sm bg-neutral-800 flex items-center justify-center border border-white/10">
                  <svg 
                    className="w-6 h-6 text-neutral-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                </div>
                <div className="text-xs font-mono tracking-wider">
                <span className="text-neutral-500 mr-2">BY</span>
                <span className="text-white font-bold uppercase">{post.author}</span>
                </div>
            </div>
            </div>

            {/* Right Column: Image */}
            <div className="col-span-12 lg:col-span-5 relative z-10 p-6 lg:p-12 flex items-center justify-center">
                {/* Reduced max-height from 400px to 300px for a 'smaller' look */}
                <Link href={`/blog/${post.slug}`} className={`relative group w-full aspect-video lg:aspect-auto lg:h-full max-h-[300px] transition-all duration-1000 delay-300 ${animationStage === 'revealed' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    {/* Image Container with Corner Brackets */}
                    <div className="absolute inset-0 p-1">
                        <div className="corner-bracket corner-tl"></div>
                        <div className="corner-bracket corner-tr"></div>
                        <div className="corner-bracket corner-bl"></div>
                        <div className="corner-bracket corner-br"></div>
                        
                        <div className="w-full h-full relative overflow-hidden bg-neutral-900 border border-white/5">
                            <img 
                            src={post.imageUrl} 
                            alt="Featured" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-100 group-hover:scale-105 transform"
                            />
                        </div>
                    </div>
                </Link>
                {/* Decorative marks from original design */}
                <div className={`absolute top-12 left-0 w-3 h-3 border-t border-l border-white/20 hidden lg:block transition-opacity duration-1000 delay-500 ${animationStage === 'revealed' ? 'opacity-100' : 'opacity-0'}`}></div>
                <div className={`absolute top-12 right-0 w-3 h-3 border-t border-r border-white/20 hidden lg:block transition-opacity duration-1000 delay-500 ${animationStage === 'revealed' ? 'opacity-100' : 'opacity-0'}`}></div>
                <div className={`absolute bottom-12 left-0 w-3 h-3 border-b border-l border-white/20 hidden lg:block transition-opacity duration-1000 delay-500 ${animationStage === 'revealed' ? 'opacity-100' : 'opacity-0'}`}></div>
                <div className={`absolute bottom-12 right-0 w-3 h-3 border-b border-r border-white/20 hidden lg:block transition-opacity duration-1000 delay-500 ${animationStage === 'revealed' ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;

