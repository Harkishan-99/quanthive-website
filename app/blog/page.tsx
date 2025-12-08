'use client';

import React, { useEffect, useState } from 'react';
import BlogNavbarWrapper from '@/components/blog/BlogNavbarWrapper';
import FeaturedSection from '@/components/blog/FeaturedSection';
import CategorySection from '@/components/blog/CategorySection';
import Footer from '@/components/Footer';
import { BlogPost } from '@/lib/blog/types';
import { DEFAULT_FEATURED_POST, FALLBACK_RECENT_POSTS } from '@/lib/blog/data';

const LightSaberOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex justify-center">
        {/* Saber Line Container - positioned exactly at top-20 (80px) to match the grid border */}
        <div className="absolute top-20 w-full flex justify-center">
            {/* The Line - 1px height scaled to 0.5 for ultra thin look */}
            <div 
                className="w-full h-[1px] relative animate-saber-expand"
                style={{
                  transformOrigin: 'center', // Strict enforcement of center-out
                  transform: 'scaleY(0.5)', // Makes it visually thinner than 1px
                  background: 'linear-gradient(90deg, transparent 0%, #0000ff 15%, #00ffff 40%, #ffffff 50%, #00ffff 60%, #0000ff 85%, transparent 100%)',
                  boxShadow: '0 0 10px 1px rgba(0, 255, 255, 0.5), 0 0 20px 4px rgba(37, 99, 235, 0.3)'
                }}
            >
                 {/* The Downward Glow - Blue tinted */}
                 <div 
                    className="absolute top-full left-0 w-full h-[150px] opacity-0 animate-glow-fade"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(37, 99, 235, 0.25) 0%, transparent 100%)'
                    }}
                 ></div>
            </div>
        </div>
        
        {/* Subtle dark backdrop that fades in to emphasize the light */}
        <div className="absolute inset-0 bg-black/40 animate-pulse"></div>
    </div>
  );
};

const BlogPage: React.FC = () => {
  const [featuredPost] = useState<BlogPost>(DEFAULT_FEATURED_POST);
  // Initialize with FALLBACK data immediately to prevent "empty section" delay
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>(FALLBACK_RECENT_POSTS);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // In a real app, you might fetch from an API here
    // For now, we use the fallback data
    setRecentPosts(FALLBACK_RECENT_POSTS);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white relative overflow-x-hidden selection:bg-accent-blue selection:text-white">
      
      {/* Light Saber Transition Overlay */}
      {isTransitioning && <LightSaberOverlay />}

      <BlogNavbarWrapper />
      
      <div className="relative z-10 pt-4 lg:pt-24">
        <main>
          {/* Featured Section */}
          <FeaturedSection 
            post={featuredPost} 
          />
          
          {/* Category & Archive Section */}
          <CategorySection 
            posts={recentPosts} 
          />
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default BlogPage;

