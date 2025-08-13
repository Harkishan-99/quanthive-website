"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StaggerIcon } from "../Miscellaneous/StaggerIcon";
import { ArrowUpRight } from "lucide-react";
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
        </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
