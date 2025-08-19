"use client";

import React from "react";
import Link from "next/link";
import { footerItems } from "@/lib/constants";

type FooterGroup = {
  title: string;
  href: string;
  items?: { title: string; href: string }[];
};

const Footer = (): React.ReactElement => {
  const groups: FooterGroup[] = [...footerItems.left, ...footerItems.right];

  return (
    <footer className="bg-[#0F0F0F] text-white relative z-10">
      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {groups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-sm font-medium text-gray-400 mb-4">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {(group.items || []).map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-gray-100 hover:text-gray-300 transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-[#1B1B1B] pt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-400">&copy; 2025 QuantHive</p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="#" className="text-sm text-gray-200 hover:text-gray-400 transition-colors">Cookies Policy</Link>
            <Link href="#" className="text-sm text-gray-200 hover:text-gray-400 transition-colors">License</Link>
            <Link href="#" className="text-sm text-gray-200 hover:text-gray-400 transition-colors">Terms of Use</Link>
            <Link href="#" className="text-sm text-gray-200 hover:text-gray-400 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
