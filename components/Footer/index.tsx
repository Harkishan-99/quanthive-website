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

      if (isAtBottom) {
        if (!isFooterVisible) {
          isFooterVisible = true;
          gsap.to(footer, {
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      }
      // Hide footer when scrolling up and we're more than 100px away from bottom
      else if (isScrollingUp && scrolled < documentHeight - 20) {
        if (isFooterVisible) {
          isFooterVisible = false;
          gsap.to(footer, {
            y: "100%",
            duration: 0.4,
            ease: "power2.in",
          });
        }
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
      className="bg-[#0F0F0F] mt-20"
      style={{ transform: "translateY(100%)" }}
    >
      <div className="relative px-10 py-3">
        <>
          <div className="absolute top-0 left-0 w-5 h-5 bg-[#1B1B1B]" />
          <div className="absolute top-0 right-0 w-5 h-5 bg-[#1B1B1B]" />
          <div className="absolute bottom-0 left-0 w-5 h-5 bg-[#1B1B1B]" />
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#1B1B1B]" />
        </>
        <div className="flex flex-row justify-between mb-5">
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
    </footer>
  );
};

export default Footer;
