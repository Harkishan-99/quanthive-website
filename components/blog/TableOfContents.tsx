'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Section {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  sections: Section[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ sections }) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isFooterVisible, setIsFooterVisible] = useState<boolean>(false);
  const chipRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Optimized active section detection using scroll events
  useEffect(() => {
    if (sections.length === 0) return;

    const viewportTopOffset = 100; // Offset for navbar
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    
    const updateActiveSection = () => {
      const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : currentScrollY < lastScrollY ? 'up' : null;
      lastScrollY = currentScrollY;
      
      // Get all section elements with their current positions and content boundaries
      const sectionElements = sections
        .map((s, index) => {
          const element = document.getElementById(s.id);
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          
          // Find the next section to determine content boundaries
          let contentBottom: number;
          if (index < sections.length - 1) {
            const nextElement = document.getElementById(sections[index + 1].id);
            if (nextElement) {
              const nextRect = nextElement.getBoundingClientRect();
              // Content extends from this heading to the next heading
              contentBottom = nextRect.top;
            } else {
              contentBottom = rect.bottom;
            }
          } else {
            // Last section: content extends to end of article or viewport
            contentBottom = rect.bottom + 1000; // Large value for last section
          }
          
          return {
            id: s.id,
            element,
            top: rect.top,
            bottom: rect.bottom,
            contentBottom, // Where this section's content ends (next section's heading)
            index
          };
        })
        .filter(Boolean) as Array<{
          id: string;
          element: HTMLElement;
          top: number;
          bottom: number;
          contentBottom: number;
          index: number;
        }>;
      
      if (sectionElements.length === 0) return;
      
      let activeId: string | null = null;
      const thresholdY = viewportTopOffset;
      
      // Two different algorithms based on scroll direction
      if (scrollDirection === 'down') {
        // SCROLLING DOWN: Update as soon as next section's heading enters viewport
        // Find the section whose heading is at or just above the threshold
        // Iterate from bottom to top to find the first section at/above threshold
        for (let i = sectionElements.length - 1; i >= 0; i--) {
          const section = sectionElements[i];
          // If section heading is at or above threshold, it's active
          if (section.top <= thresholdY + 10) {
            // Make sure section is still visible (not completely scrolled past)
            if (section.bottom > thresholdY - 50) {
              activeId = section.id;
              break;
            }
          }
        }
      } else if (scrollDirection === 'up') {
        // SCROLLING UP: Update only when previous section's HEADING appears in viewport
        // Be strict: only consider heading position, ignore content area completely
        // Iterate from bottom to top to find the section whose heading is at/above threshold
        for (let i = sectionElements.length - 1; i >= 0; i--) {
          const section = sectionElements[i];
          // Section is active if its HEADING (top of heading element) is at or above threshold
          // We only care about heading position, not where content is
          if (section.top <= thresholdY + 5) {
            // Heading is at or above threshold - this section is active
            // No need to check content area - we only care about heading position
            activeId = section.id;
            break;
          }
        }
      } else {
        // No scroll direction (initial load or stationary)
        // Use content area approach as default
        for (let i = 0; i < sectionElements.length; i++) {
          const section = sectionElements[i];
          if (i < sectionElements.length - 1) {
            const nextSection = sectionElements[i + 1];
            if (nextSection.top > thresholdY) {
              activeId = section.id;
              break;
            }
          } else {
            if (section.top <= thresholdY + 200) {
              activeId = section.id;
              break;
            }
          }
        }
      }
      
      // Fallback: if no section found, find the section whose heading is closest to threshold
      if (!activeId && sectionElements.length > 0) {
        let closestSection = sectionElements[0];
        let minDistance = Math.abs(sectionElements[0].top - thresholdY);
        
        for (let i = 1; i < sectionElements.length; i++) {
          const distance = Math.abs(sectionElements[i].top - thresholdY);
          if (distance < minDistance) {
            minDistance = distance;
            closestSection = sectionElements[i];
          }
        }
        activeId = closestSection.id;
      }
      
      if (activeId) {
        setActiveSection(activeId);
      }
    };
    
    // Initial check
    updateActiveSection();
    
    // Use scroll event for more responsive updates
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Also use IntersectionObserver as a backup for initial setup
    const observerOptions = {
      root: null,
      rootMargin: `-${viewportTopOffset}px 0px -50% 0px`,
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
    };
    
    const observer = new IntersectionObserver((entries) => {
      // IntersectionObserver is mainly for initial setup
      // Scroll handler does the real-time updates
      updateActiveSection();
    }, observerOptions);
    
    const elements: Element[] = [];
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
        elements.push(element);
      }
    });
    
    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [sections]);

  // Auto-scroll chips to center when active section changes (mobile only)
  useEffect(() => {
    if (!activeSection || typeof window === 'undefined') return;
    // Only auto-scroll on mobile screens
    if (window.innerWidth >= 1024) return;
    
    const idx = sections.findIndex(s => s.id === activeSection);
    if (idx > -1 && chipRefs.current[idx]) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        setTimeout(() => {
          const chip = chipRefs.current[idx];
          if (chip) {
            // Get the scrollable container (parent div with overflow-x-auto)
            const scrollableContainer = chip.parentElement;
            if (scrollableContainer && scrollableContainer.classList.contains('overflow-x-auto')) {
              const chipRect = chip.getBoundingClientRect();
              const containerRect = scrollableContainer.getBoundingClientRect();
              const scrollLeft = scrollableContainer.scrollLeft;
              const chipLeft = chipRect.left - containerRect.left + scrollLeft;
              const containerCenter = containerRect.width / 2;
              const targetScroll = chipLeft - containerCenter + (chipRect.width / 2);
              
              scrollableContainer.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
              });
            } else {
              // Fallback to scrollIntoView
              chip.scrollIntoView({ 
                behavior: 'smooth', 
                inline: 'center', 
                block: 'nearest' 
              });
            }
          }
        }, 150);
      });
    }
  }, [activeSection, sections]);

  // Detect footer visibility (mobile only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only observe footer on mobile screens
    if (window.innerWidth >= 1024) return;

    const footer = document.querySelector('footer');
    if (!footer) return;

    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Footer is visible when it starts entering viewport
          setIsFooterVisible(entry.isIntersecting);
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of footer is visible
      }
    );

    footerObserver.observe(footer);

    return () => {
      footerObserver.disconnect();
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset from top for navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  if (sections.length === 0) return null;

  // --- Mobile: horizontal carousel ---
  // block lg:hidden => only show on mobile
  return (
    <>
      <div className="block lg:hidden">
        <nav 
          className={`fixed bottom-0 left-0 right-0 z-40 w-full bg-black/90 shadow-2xl border-t border-white/10 transition-transform duration-300 ${
            isFooterVisible ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          {/* Vignettes - positioned absolutely, don't scroll */}
          <div className="absolute left-0 top-0 bottom-0 z-50 w-16 pointer-events-none bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 z-50 w-16 pointer-events-none bg-gradient-to-l from-black via-black/80 to-transparent"></div>
          
          {/* Scrollable content container */}
          <div className="px-2 py-3 flex overflow-x-auto no-scrollbar relative">
            {sections.map((section, i) => (
              <a
                key={section.id}
                ref={(el) => {
                  chipRefs.current[i] = el;
                }}
                href={`#${section.id}`}
                onClick={e => handleClick(e, section.id)}
                className={`mx-1 px-3 py-1 rounded-md text-xs select-none font-mono uppercase whitespace-nowrap cursor-pointer flex-shrink-0 border transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-neutral-700/60 text-white border-neutral-600/60 font-semibold'
                    : 'bg-black/60 text-neutral-300 border-transparent hover:border-neutral-500'
                }`}
                style={{ minWidth: 100 }}
              >
                {section.title.replace(/(^\d+\.[ ]?)/, '') /* Remove numbering for chip */}
              </a>
            ))}
          </div>
        </nav>
        {/* add enough bottom padding so article doesn't hide behind TOC on mobile */}
        <div style={{ height: 56 }} />
      </div>
      {/* --- Desktop: vertical nav (unchanged) --- */}
      <div className="hidden lg:block border-t border-white/10 pt-6">
        <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase mb-4 px-4 lg:px-6">
          Sections
        </h3>
        <nav className="space-y-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => handleClick(e, section.id)}
              className={`block px-4 lg:px-6 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                activeSection === section.id
                  ? 'text-white font-semibold border-l-2 border-neutral-600/60 pl-3 lg:pl-5 bg-neutral-800/30'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
              style={{
                paddingLeft: section.level === 3 ? '1.5rem' : undefined,
                paddingRight: section.level === 3 ? '1.5rem' : undefined,
              }}
            >
              {section.title}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
};

export default TableOfContents;


