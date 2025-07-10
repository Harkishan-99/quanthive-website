/* ---------------------- New Navbar ------------------------ 
This a new navbar component that is being created.
It is a placeholder for now and will be updated later.
It will be used in the main page of the website.
-------------------------------------------------------------
*/

import React, { useRef, useState } from "react";
import Logo from "../Logo";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";

const navItems = [
  { label: "Flash", href: "#", hasTrademark: true },
  { label: "Benchmark", href: "#", hasTrademark: false },
  { label: "Careers", href: "#", hasTrademark: false },
];

const NavbarItems = () => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <motion.div
      className="relative flex items-center"
      initial="initial"
      animate="visible"
      variants={{
        initial: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.5,
          },
        },
      }}
    >
      {navItems.map((item, index) => (
        <motion.div
          key={index}
          variants={{
            initial: { opacity: 0, y: 10, filter: "blur(8px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.3 },
            },
          }}
        >
          <Link
            href={item.href}
            className="relative px-2.5 py-1 flex flex-row"
            onMouseEnter={() => setHoveredItem(index)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="text-foreground text-lg font-normal whitespace-nowrap">
              <span className="relative">
                {item.label}

                {hoveredItem === index && (
                  <motion.div
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-foreground rounded-full"
                    layoutId="navbar-underline"
                  />
                )}
              </span>

              {item.hasTrademark && (
                <sup className="text-[10px] ml-0.5">TM</sup>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  const handleClickOutside = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  useOnClickOutside(
    dialogRef as React.RefObject<HTMLElement>,
    handleClickOutside
  );

  return (
    <nav
      ref={dialogRef}
      className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-row items-center justify-center"
    >
      <div
        className={`${
          isOpen ? "scale-105" : "hover:scale-105"
        } transition-all duration-300`}
      >
        <motion.div
          initial={{ scaleX: 0, scaleY: 0 }}
          animate={{ scaleX: 1, scaleY: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
          className="flex items-center justify-center bg-[#0A0A0A] rounded-full border-2 border-muted-foreground py-2 px-5 transition-all duration-300"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex items-center"
          >
            <div className="w-7 h-7 mr-3 flex items-center justify-center">
              <Logo />
            </div>

            <NavbarItems />

            <button
              onClick={() => {
                isOpen ? setIsOpen(false) : setIsOpen(true);
              }}
              className={`text-foreground text-lg ml-1.5 ${
                isOpen ? "scale-125" : "hover:scale-125"
              } transition-all duration-300 ${isOpen ? "rotate-180" : ""}`}
            >
              <ChevronDown strokeWidth={"2.5"} size={"24"} />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#0A0A0A] rounded-lg shadow-lg p-4 z-10"
        >
          <NavbarItems />
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
