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
import Menu from "../Menu";

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
            delayChildren: 0.6,
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
      className="pt-10 relative flex flex-row items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scaleX: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
          opacity: { duration: 0.2 },
          scale: { duration: 0.3 },
        }}
        style={{ transformOrigin: "center" }}
        className={`${
          isOpen ? "scale-105" : "hover:scale-105"
        } transition-all duration-300`}
      >
        <div className="flex items-center justify-center bg-[#0A0A0A] rounded-full border-2 border-muted-foreground py-2 px-5">
          <div className="w-7 h-7 mr-3 flex items-center justify-center">
            <Logo />
          </div>

          <NavbarItems />

          <div
            onClick={() => {
              isOpen ? setIsOpen(false) : setIsOpen(true);
            }}
            className={`text-foreground text-lg ml-1.5 ${
              isOpen ? "scale-125" : "hover:scale-125"
            } transition-all duration-300 ${isOpen ? "rotate-180" : ""}`}
          >
            <ChevronDown strokeWidth={"2.5"} size={"24"} />
          </div>
        </div>
      </motion.div>

      {isOpen && <Menu />}
    </nav>
  );
};

export default Navbar;
