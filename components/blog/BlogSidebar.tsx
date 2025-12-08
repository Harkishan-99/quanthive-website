import React, { useRef, useEffect } from "react";
import Link from "next/link";
import TableOfContents from "./TableOfContents";

interface Section {
  id: string;
  title: string;
  level: number;
}

interface BlogSidebarProps {
  sections: Section[];
}

// Social links component
const SocialLinks = () => (
  <div className="border-t border-white/10">
    <a href="#" className="block p-6 lg:p-8 border-b border-white/10 text-xs font-mono text-neutral-500 hover:text-white uppercase tracking-widest flex justify-between items-center group">
      <span>Facebook</span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
    </a>
    <a href="#" className="block p-6 lg:p-8 border-b border-white/10 text-xs font-mono text-neutral-500 hover:text-white uppercase tracking-widest flex justify-between items-center group">
      <span>Twitter</span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
    </a>
    <a href="#" className="block p-6 lg:p-8 text-xs font-mono text-neutral-500 hover:text-white uppercase tracking-widest flex justify-between items-center group">
      <span>Telegram</span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
    </a>
  </div>
);

// GSAP ScrollTrigger pinning logic
let gsap: any = null;
let ScrollTrigger: any = null;

const BlogSidebar: React.FC<BlogSidebarProps> = ({ sections }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let scrollTriggerInstance: any = null;
    let timeoutId: NodeJS.Timeout;
    
    const initializeScrollTrigger = async () => {
      // Wait for DOM to be fully ready and sections to be available
      await new Promise<void>(resolve => {
        let retryCount = 0;
        const maxRetries = 20; // Maximum 1 second of retries (20 * 50ms)
        
        const checkReady = () => {
          retryCount++;
          
          // Check if sections are available in the DOM
          const hasSections = sections.length > 0 && sections.some(s => {
            const element = document.getElementById(s.id);
            return element !== null;
          });
          
          if ((hasSections || retryCount >= maxRetries) && sidebarRef.current) {
            resolve();
          } else if (retryCount < maxRetries) {
            // Retry after a short delay
            requestAnimationFrame(() => {
              timeoutId = setTimeout(checkReady, 50);
            });
          } else {
            // Max retries reached, resolve anyway
            resolve();
          }
        };
        
        // Start checking after initial render
        requestAnimationFrame(() => {
          checkReady();
        });
      });
      
      if (!gsap) gsap = (await import("gsap")).default;
      if (!ScrollTrigger) ScrollTrigger = (await import("gsap/ScrollTrigger")).ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      
      if (window.innerWidth < 1024 || !sidebarRef.current) return;
      
      const sidebar = sidebarRef.current;
      
      // Kill any existing ScrollTriggers on this element
      ScrollTrigger.getAll().forEach((trigger: any) => {
        if (trigger.vars?.trigger === sidebar) {
          trigger.kill();
        }
      });
      
      // Refresh ScrollTrigger to recalculate positions
      ScrollTrigger.refresh();
      
      // Create new ScrollTrigger instance
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: sidebar,
        start: "top top",
        end: () => `bottom+=${window.innerHeight} top`,
        pin: true,
        pinSpacing: false,
        scrub: false,
        markers: false,
        invalidateOnRefresh: true,
      });
      
      // Refresh again after creation to ensure proper positioning
      ScrollTrigger.refresh();
    };
    
    initializeScrollTrigger();
    
    // Also initialize/reinitialize when window loads (for direct page loads)
    const handleLoad = async () => {
      if (!sidebarRef.current) return;
      
      // Ensure GSAP is loaded
      if (!gsap) gsap = (await import("gsap")).default;
      if (!ScrollTrigger) ScrollTrigger = (await import("gsap/ScrollTrigger")).ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      
      if (window.innerWidth < 1024) return;
      
      // Refresh ScrollTrigger to recalculate positions after page load
      ScrollTrigger.refresh();
    };
    
    if (typeof window !== "undefined") {
      if (document.readyState === 'complete') {
        // Page already loaded, refresh immediately
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
      }
    }
    
    return () => {
      clearTimeout(timeoutId);
      if (typeof window !== "undefined") {
        window.removeEventListener('load', handleLoad);
        if (ScrollTrigger) {
          // Kill all ScrollTriggers
          ScrollTrigger.getAll().forEach((trigger: any) => {
            if (trigger.vars?.trigger === sidebarRef.current) {
              trigger.kill();
            }
          });
          ScrollTrigger.refresh();
        }
      }
    };
  }, [sections]); // Add sections as dependency to re-initialize when sections change

  return (
    <aside ref={sidebarRef} className="hidden lg:flex flex-col h-auto min-h-screen sidebar-scrollbar bg-transparent z-20 w-full lg:w-1/4 border-t border-r border-white/10">
      {/* Back Button only on lg+ screens (hidden on mobile) */}
      <div className="hidden lg:block p-6 flex-shrink-0">
        <Link 
          href="/blog"
          className="flex items-center text-xs font-mono text-neutral-400 hover:text-white transition-colors uppercase tracking-widest"
        >
          <span className="mr-2">◄</span> BACK
        </Link>
      </div>
      {/* Table of Contents - NO top margin/padding on mobile */}
      <div className="flex-shrink-0">
        <TableOfContents sections={sections} />
      </div>
      <div className="flex-grow"></div>
      {/* SocialLinks only on lg+ */}
      <div className="hidden lg:block">
        <SocialLinks />
      </div>
    </aside>
  );
};

export default BlogSidebar;
