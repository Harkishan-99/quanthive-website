/* ---------------------- New Navbar ------------------------ 
This a new navbar component that is being created.
It is a placeholder for now and will be updated later.
It will be used in the main page of the website.
-------------------------------------------------------------
*/

import React, { useState } from "react";
import Logo from "../Logo";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { label: "Flash", href: "#", hasTrademark: true },
  { label: "Benchmark", href: "#", hasTrademark: false },
  { label: "Careers", href: "#", hasTrademark: false },
];

const NavbarItems = () => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <div className="relative flex items-center">
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className="relative px-2.5 py-1"
          onMouseEnter={() => setHoveredItem(index)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <span className="relative z-10 text-foreground text-lg font-normal">
            {item.label}

            {hoveredItem === index && (
              <motion.div
                className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-foreground"
                layoutId="navbar-underline"
              />
            )}
          </span>

          {item.hasTrademark && <sup className="text-[10px]"> TM</sup>}
        </Link>
      ))}
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="absolute top-12 right-1/2 translate-x-1/2 flex flex-row items-center justify-center bg-[#0A0A0A] rounded-full border-2 border-muted-foreground py-2 px-5 transition-all duration-300">
      <Link href="/" className="w-7 h-7 mr-3 flex items-center justify-center">
        <Logo />
      </Link>

      <NavbarItems />

      <button
        onClick={() => {}}
        className="text-foreground text-lg ml-2 hover:scale-125 transition-all duration-300"
      >
        <ChevronDown size={"24"} />
      </button>
    </nav>
  );
};

export default Navbar;
