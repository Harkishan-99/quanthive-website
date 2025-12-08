'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { BlogPost } from '@/lib/blog/types';
import { SearchEngine } from '@/lib/blog/searchAlgorithm';
import Link from 'next/link';

const CATEGORIES = [
  'ALL', 'RESEARCH'
];

interface CategorySectionProps {
  posts: BlogPost[];
}

const INITIAL_VISIBLE_COUNT = 4;

const CategorySection: React.FC<CategorySectionProps> = ({ posts }) => {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  // Initialize Search Engine
  const searchEngine = useMemo(() => new SearchEngine(posts), [posts]);

  useEffect(() => {
    let results = posts;

    // 1. Apply Search
    if (searchQuery.trim()) {
        results = searchEngine.search(searchQuery);
    } else {
        // 2. If no search, Apply Category Filter
        if (activeCategory !== "ALL") {
            results = posts.filter(post => 
                post.category.toUpperCase() === activeCategory || 
                post.category.toUpperCase().includes(activeCategory)
            );
        }
    }

    setFilteredPosts(results);
    // Reset to initial count whenever the underlying list changes
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [searchQuery, activeCategory, posts, searchEngine]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  const displayedPosts = filteredPosts.slice(0, visibleCount);

  return (
    <section 
        className="max-w-[1400px] mx-auto w-full border-t border-white/10 mt-8 relative" 
    >

        <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10">
            
            {/* Sidebar Area - Slimmer (Desktop Only) */}
            <div className="lg:col-span-2 border-r border-white/10 flex flex-col hidden lg:flex">
                {/* Categories Label Box */}
                <div className="py-6 pl-4 border-b border-white/10 h-full lg:h-auto flex items-center">
                   <h2 className="text-[10px] font-mono font-bold tracking-widest text-white uppercase">
                        Categories
                   </h2>
                </div>
                {/* Empty sidebar space */}
                <div className="flex-grow hidden lg:block"></div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-10">
                
                {/* MOBILE: Filters and Search Container with Rectangle Border */}
                <div className="lg:border-b border-white/10 lg:p-6">
                  {/* Mobile: Rectangle border container */}
                  <div className="lg:border-none border border-white/10 p-4 lg:p-0">
                    {/* MOBILE: Filters Row - Top */}
                    <div className="mb-4 lg:mb-0">
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button 
                                    key={cat}
                                    onClick={() => {
                                        setActiveCategory(cat);
                                        setSearchQuery(""); // Clear search when switching categories
                                    }}
                                    className={`px-3 py-1.5 text-[10px] font-mono uppercase border transition-colors tracking-wider
                                        ${activeCategory === cat && !searchQuery
                                            ? 'bg-black border-white text-white' 
                                            : 'border-white/10 text-neutral-500 hover:border-white/30 hover:text-neutral-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* MOBILE: Search Row */}
                    <div className="lg:border-b border-white/10 lg:p-6 flex items-center space-x-4">
                        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search articles..." 
                            className="w-full bg-transparent border-none outline-none text-xs font-mono text-neutral-300 placeholder-neutral-700 focus:ring-0"
                        />
                    </div>
                  </div>
                </div>

                {/* Posts Grid */}
                <div className="p-4 lg:p-16">
                     {/* MOBILE: Rectangle border container for article cards */}
                     <div className="lg:border-none border border-white/10 p-4 lg:p-0">
                       {/* MOBILE: Single column, DESKTOP: 2 columns */}
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-8 lg:gap-x-20 lg:gap-y-20 max-w-5xl mx-auto">
                        {displayedPosts.length > 0 ? (
                            <>
                                {displayedPosts.map((post) => (
                                    <article 
                                        key={post.id} 
                                        className="group flex flex-col h-full cursor-pointer lg:min-h-[450px]"
                                    >
                                        {/* Meta Top */}
                                        <div className="flex items-center space-x-2 mb-4 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                                            <span>{post.date}</span>
                                            <span className="text-neutral-600">■</span>
                                            <span className="text-neutral-300">{post.category}</span>
                                        </div>

                                        {/* Image Wrapper - MOBILE: Full width, DESKTOP: 2:1 Ratio */}
                                        <Link href={`/blog/${post.slug}`} className="relative w-full pt-[56.25%] lg:pt-[50%] mb-6 lg:mb-8 bg-neutral-900 border border-white/5 p-1 block">
                                            {/* Corner Brackets - Desktop only */}
                                            <div className="corner-bracket corner-tl hidden lg:block"></div>
                                            <div className="corner-bracket corner-tr hidden lg:block"></div>
                                            <div className="corner-bracket corner-bl hidden lg:block"></div>
                                            <div className="corner-bracket corner-br hidden lg:block"></div>

                                            <div className="absolute inset-1 overflow-hidden bg-neutral-950">
                                                {/* Static Image - Removed opacity/scale transitions */}
                                                <img 
                                                    src={post.imageUrl} 
                                                    alt={post.title}
                                                    referrerPolicy="no-referrer"
                                                    className="w-full h-full object-cover opacity-100"
                                                />
                                            </div>
                                        </Link>

                                        {/* Title */}
                                        <Link href={`/blog/${post.slug}`}>
                                          <h3 className="text-xl lg:text-2xl text-white font-medium leading-tight mb-6 lg:mb-8 group-hover:text-accent-blue transition-colors">
                                              {post.title}
                                          </h3>
                                        </Link>

                                        {/* Author Footer */}
                                        <div className="mt-auto flex items-center pt-4 lg:pt-6 border-t border-white/5">
                                            {/* Generic Avatar Icon */}
                                            <div className="w-6 h-6 rounded-sm bg-neutral-800 mr-3 flex items-center justify-center border border-white/10">
                                                <svg 
                                                    className="w-4 h-4 text-neutral-500" 
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
                                    </article>
                                ))}
                                
                                {/* Placeholder card when there's only one article */}
                                {displayedPosts.length === 1 && (
                                    <article className="flex flex-col h-full lg:min-h-[450px] opacity-60">
                                        {/* Meta Top */}
                                        <div className="flex items-center space-x-2 mb-4 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                                            <span className="text-neutral-700">—</span>
                                            <span className="text-neutral-600">■</span>
                                            <span className="text-neutral-700">—</span>
                                        </div>

                                        {/* Image Wrapper - Animated SVG */}
                                        <div className="relative w-full pt-[56.25%] lg:pt-[50%] mb-6 lg:mb-8 bg-neutral-900 border border-white/5 p-1">
                                            {/* Corner Brackets - Desktop only */}
                                            <div className="corner-bracket corner-tl hidden lg:block"></div>
                                            <div className="corner-bracket corner-tr hidden lg:block"></div>
                                            <div className="corner-bracket corner-bl hidden lg:block"></div>
                                            <div className="corner-bracket corner-br hidden lg:block"></div>

                                            <div className="absolute inset-1 overflow-hidden bg-neutral-950 flex items-center justify-center">
                                                {/* Animated Search/Empty State SVG */}
                                                <svg 
                                                    className="w-16 h-16 lg:w-20 lg:h-20 text-neutral-700 animate-gentle-float"
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <circle 
                                                        cx="11" 
                                                        cy="11" 
                                                        r="8" 
                                                        strokeWidth="1.5"
                                                        className="animate-gentle-pulse"
                                                    />
                                                    <path 
                                                        d="m21 21-4.35-4.35" 
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        className="animate-gentle-pulse"
                                                        style={{ animationDelay: '1s' }}
                                                    />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl lg:text-2xl text-neutral-500 font-medium leading-tight mb-6 lg:mb-8">
                                            There's nothing more to show
                                        </h3>

                                        {/* Author Footer */}
                                        <div className="mt-auto flex items-center pt-4 lg:pt-6 border-t border-white/5">
                                            <div className="w-6 h-6 rounded-sm bg-neutral-800 mr-3 flex items-center justify-center">
                                                <div className="w-3 h-3 bg-neutral-700 rounded-full animate-pulse"></div>
                                            </div>
                                            <div className="text-[10px] font-mono tracking-wider">
                                                <span className="text-neutral-700 mr-2">MORE</span>
                                                <span className="text-neutral-600 uppercase">Coming Soon</span>
                                            </div>
                                        </div>
                                    </article>
                                )}
                            </>
                        ) : (
                            <div className="col-span-1 lg:col-span-2 text-center py-20">
                                <p className="text-neutral-500 font-mono text-sm">No research found matching your query.</p>
                            </div>
                        )}
                       </div>
                       
                       {/* Load More Button */}
                       {filteredPosts.length >= 6 && visibleCount < filteredPosts.length && (
                          <div className="flex justify-center mt-8 lg:mt-20 border-t border-white/5 pt-8 lg:pt-12">
                              <button 
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      handleLoadMore();
                                  }}
                                  className="group relative px-8 py-4 bg-transparent border border-white/20 overflow-hidden"
                              >
                                  <span className="absolute inset-0 w-full h-full bg-white transform -translate-x-full transition-transform duration-300 group-hover:translate-x-0"></span>
                                  <span className="relative text-xs font-mono uppercase tracking-widest text-white group-hover:text-black transition-colors">
                                      Load More
                                  </span>
                              </button>
                          </div>
                       )}
                     </div>
                </div>

            </div>
        </div>
    </section>
  );
};

export default CategorySection;

