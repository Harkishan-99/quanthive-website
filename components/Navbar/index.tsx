import React, { useRef, useState } from "react";
import Logo from "../Logo";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import Menu from "../Menu";
import { navItems } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import styles from "./Navbar.module.css";

// Add onTeamClick to NavbarProps
type NavbarProps = {
  onAboutClick: () => void;
  onTeamClick: () => void;
};

const NavbarItems: React.FC = () => {
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
            className={`relative px-1.5 py-[3px] md:px-2.5 md:py-1 flex flex-row navbar-item-mobile ${styles['navbar-item-mobile']}`}
            onMouseEnter={() => setHoveredItem(index)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="text-foreground text-base md:text-lg font-normal whitespace-nowrap navbar-item-text-mobile font-luxe_uno">
              <span className="relative">
                {item.label}
                {hoveredItem === index && (
                  <motion.div
                    className="absolute -bottom-[1px] md:-bottom-0.5 left-0 right-0 h-[1px] md:h-0.5 bg-foreground rounded-full"
                    layoutId="navbar-underline"
                  />
                )}
              </span>
              {item.hasTrademark && (
                <sup className="text-[8px] md:text-[10px] ml-0.5">TM</sup>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

const Navbar: React.FC<NavbarProps> = ({ onAboutClick, onTeamClick }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

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
    <div className="pt-10 relative flex flex-row items-center justify-center">
      <div
        ref={dialogRef}
        className="w-fit flex flex-row items-center justify-center"
      >
        <motion.nav
          initial={{ opacity: 0, scaleX: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            opacity: { duration: 0.2 },
            scale: { duration: 0.3 },
          }}
          style={{ transformOrigin: "center" }}
          className={`navbar-mobile ${
            isOpen ? "scale-105" : "hover:scale-105"
          } transition-all duration-300 flex items-center justify-center bg-[#0A0A0A] rounded-full border-2 border-muted-foreground py-1 px-[14px] md:py-2 md:px-5 select-none ${styles['navbar-font']}`}
        >
          <div className={`logo-mobile w-4 h-4 md:w-7 md:h-7 mr-2 md:mr-3 mt-0.5 md:mt-1 flex items-center justify-center ${styles['logo-mobile']}`}>
            <Link href="/">
              <span className="inline-flex items-center justify-center" aria-label="Home">
                <Logo />
              </span>
            </Link>
          </div>

          {/* Pass onAboutClick to NavbarItems */}
          <NavbarItems />

          <button
            onClick={() => {
              isOpen ? setIsOpen(false) : setIsOpen(true);
            }}
            className={`text-foreground text-lg ml-1.5 ${
              isOpen ? "scale-125" : "hover:scale-125"
            } transition-all duration-300 ${isOpen ? "rotate-180" : ""} navbar-dropdown-mobile`}
          >
            <ChevronDown
              strokeWidth={"2.5"}
              size={isMobile ? 28 : 24} // Larger on mobile
            />
          </button>
        </motion.nav>

        {/* Pass onTeamClick to Menu */}
        <AnimatePresence>
          {isOpen && <Menu onTeamClick={onTeamClick} />}
        </AnimatePresence>
      </div>
      <style jsx>{`
        @media (max-width: 640px) {
          .navbar-mobile {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
            min-height: 3.5rem;
          }
          .logo-mobile {
            width: 1.75rem !important;
            height: 1.75rem !important;
            margin-right: 1rem !important;
          }
          .navbar-item-mobile {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          .navbar-item-text-mobile {
            font-size: 1.45rem !important; /* 20px */
          }
          .navbar-dropdown-mobile svg {
            width: 2rem !important;
            height: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Navbar;