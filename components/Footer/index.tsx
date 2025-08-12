"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StaggerIcon } from "../Miscellaneous/StaggerIcon";
import { ArrowUpRight, Globe } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { footerItems } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    // Initially position footer below viewport
    gsap.set(footer, { y: "100%" });

    let isFooterVisible = false;

    // Scroll listener for precise bottom detection
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrolled = currentScrollY + windowHeight;

      // Only show footer when we're within 30px of the actual bottom (very precise)
      const isAtBottom = scrolled >= documentHeight - 30;
      const isScrollingDown = currentScrollY > lastScrollY;
      const isScrollingUp = currentScrollY < lastScrollY;

      if (isAtBottom && isScrollingDown) {
        if (!isFooterVisible) {
          isFooterVisible = true;
          gsap.to(footer, {
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      }
      // Hide footer when scrolling up, regardless of exact position
      else if (isScrollingUp && isFooterVisible) {
        isFooterVisible = false;
        gsap.to(footer, {
          y: "100%",
          duration: 0.4,
          ease: "power2.in",
        });
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className="bg-[#0F0F0F]"
      style={{ transform: "translateY(100%)" }}
    >
      <div className="relative px-6 py-8 md:px-10 md:py-3">
        <>
          <div className="absolute top-0 left-0 w-5 h-5 bg-[#1B1B1B]" />
          <div className="absolute top-0 right-0 w-5 h-5 bg-[#1B1B1B]" />
          <div className="absolute bottom-0 left-0 w-5 h-5 bg-[#1B1B1B]" />
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#1B1B1B]" />
        </>
        
        {/* Mobile Layout */}
        <div className="block md:hidden space-y-8">
          {/* Left Items Section */}
          {footerItems.left.map((item, index) => (
            <div key={index}>
              <Link href={item.href}>
                <h3 className="text-sm font-medium text-gray-500 mb-6 flex items-center hover:text-gray-300 transition-colors">
                  {item.title}
                  <StaggerIcon
                    icon={ArrowUpRight}
                    size={16}
                    duration={0.25}
                    className="ml-1"
                  />
                </h3>
              </Link>
              {item.items && item.items.length > 0 && (
                <div className="space-y-4">
                  {item.items.map((subItem, subIndex) => (
                    <Link
                      href={subItem.href}
                      key={subIndex}
                      className="block text-white text-base hover:text-gray-300 transition-colors"
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Right Items Section */}
          {footerItems.right.map((item, index) => (
            <div key={index}>
              <Link href={item.href}>
                <h3 className="text-sm font-medium text-gray-500 mb-6 flex items-center hover:text-gray-300 transition-colors">
                  {item.title}
                  <StaggerIcon
                    icon={ArrowUpRight}
                    size={16}
                    duration={0.25}
                    className="ml-1"
                  />
                </h3>
              </Link>
              {item.items && item.items.length > 0 && (
                <div className="space-y-4">
                  {item.items.map((subItem, subIndex) => (
                    <Link
                      href={subItem.href}
                      key={subIndex}
                      className="block text-white text-base hover:text-gray-300 transition-colors"
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Mobile Bottom Section */}
          <div className="pt-4">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">&copy; 2025 QuantHive</p>
            </div>
            
            <div className="space-y-4 text-center">
              <div>
                <Link
                  href="#"
                  className="text-white text-sm hover:text-gray-300 transition-colors mr-6"
                >
                  Cookies Policy
                </Link>
                <Link
                  href="#"
                  className="text-white text-sm hover:text-gray-300 transition-colors"
                >
                  License
                </Link>
              </div>
              <div>
                <Link
                  href="#"
                  className="text-white text-sm hover:text-gray-300 transition-colors mr-6"
                >
                  Terms of Use
                </Link>
                <Link
                  href="#"
                  className="text-white text-sm hover:text-gray-300 transition-colors"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            <div className="flex justify-center items-center gap-1 text-gray-500 text-sm mt-6">
              <Globe size={16} /> English
            </div>

            {/* Social Media Icons for Mobile */}
            <div className="flex justify-center space-x-6 pt-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-row justify-between mb-5">
          <div className="flex flex-row gap-6">
            {footerItems.left.map((item, index) => (
              <div key={index} className="mr-10">
                <Link href={item.href}>
                  <motion.div initial="initial" whileHover="hovered">
                    <div className="relative flex flex-row group">
                      <div className="flex flex-row items-end justify-center text-foreground">
                        <p className="text-lg font-normal whitespace-nowrap">
                          <span className="group-hover:underline underline-offset-4">
                            {item.title}
                          </span>
                        </p>
                        <StaggerIcon
                          icon={ArrowUpRight}
                          size={20}
                          duration={0.25}
                          className="h-fit mb-0.5 -ml-0.5"
                        />
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {item.items && item.items.length > 0 && (
                  <div className="mt-5">
                    {item.items.map((subItem, subIndex) => (
                      <Link
                        href={subItem.href}
                        key={subIndex}
                        className="block font-semibold text-secondary hover:underline underline-offset-2"
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-row gap-6">
            {footerItems.right.map((item, index) => (
              <div key={index} className="ml-8">
                <Link href={item.href}>
                  <motion.div initial="initial" whileHover="hovered">
                    <div className="relative flex flex-row group">
                      <div className="flex flex-row items-end justify-center text-foreground">
                        <p className="text-lg font-normal whitespace-nowrap">
                          <span className="group-hover:underline underline-offset-4">
                            {item.title}
                          </span>
                        </p>
                        <StaggerIcon
                          icon={ArrowUpRight}
                          size={20}
                          duration={0.25}
                          className="h-fit mb-0.5 -ml-0.5"
                        />
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {item.items && item.items.length > 0 && (
                  <div className="mt-5">
                    {item.items.map((subItem, subIndex) => (
                      <Link
                        href={subItem.href}
                        key={subIndex}
                        className="block font-semibold text-secondary hover:underline underline-offset-2"
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Bottom Section */}
        <div className="hidden md:block">
        <hr className="bg-secondary h-[1.5px]" />

        <div className="flex flex-row justify-between mt-5">
          <p>&copy; 2025 QuantHive</p>

          <ul>
            <li className="inline-block mr-4">
              <Link
                href="#"
                className="text-primary hover:underline underline-offset-2"
              >
                Cookies Policy
              </Link>
            </li>
            <li className="inline-block mr-4">
              <Link
                href="#"
                className="text-primary hover:underline underline-offset-2"
              >
                License
              </Link>
            </li>
            <li className="inline-block mr-4">
              <Link
                href="#"
                className="text-primary hover:underline underline-offset-2"
              >
                Terms of Use
              </Link>
            </li>
            <li className="inline-block">
              <Link
                href="#"
                className="text-primary hover:underline underline-offset-2"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>

          <div className="inline-flex items-center gap-1 text-primary">
            <Globe size={16} /> English
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
