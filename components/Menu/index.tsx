import { menuItems } from "@/lib/constants";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import React, { useState } from "react";
import { StaggerIcon } from "../Miscellaneous/StaggerIcon";

const Menu = () => {
  const [filteredMenuItems, setFilteredMenuItems] = useState(menuItems);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();

    if (query === "") {
      setFilteredMenuItems(menuItems);
      return;
    }

    const filtered = menuItems
      .map((section) => {
        const filteredSection: any = {};

        Object.entries(section).forEach(([sectionTitle, items]) => {
          const matchingItems = items.filter((item: any) =>
            item.title.toLowerCase().startsWith(query)
          );

          if (matchingItems.length > 0) {
            filteredSection[sectionTitle] = matchingItems;
          }
        });

        return filteredSection;
      })
      .filter((section) => Object.keys(section).length > 0);

    setFilteredMenuItems(filtered);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="absolute top-full mt-6 bg-card border-2 border-card-foreground rounded-xl pt-9 px-9 pb-12 z-10 backdrop-blur-[8px]"
    >
      <input
        type="text"
        autoFocus
        onChange={onSearch}
        className="bg-transparent border-b-2 border-muted-foreground w-full focus:outline-none placeholder:text-secondary-foreground text-xl font-semibold p-1"
        placeholder="Search"
      />

      {filteredMenuItems.map((section, index) => (
        <div key={index} className="mt-6">
          {Object.entries(section).map(([title, items]) => (
            <div key={title} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <div className="grid grid-cols-3 gap-4">
                {items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-center text-secondary-foreground transition-colors"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-[148px] h-[75px] border-2 border-[#2A2A2A] rounded-lg"
                      />
                    )}

                    <motion.div
                      initial="initial"
                      whileHover="hovered"
                      className="flex items-center"
                    >
                      <Link href={item.href}>
                        <span>{item.title}</span>
                        {item.hasTrademark && (
                          <sup className="text-[10px] ml-0.5">TM</sup>
                        )}
                      </Link>
                      <StaggerIcon
                        icon={ArrowUpRight}
                        size={16}
                        duration={0.25}
                      />
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
      {filteredMenuItems.length === 0 && (
        <div className="mt-6 text-center text-muted-foreground">
          No items found
        </div>
      )}
    </motion.div>
  );
};

export default Menu;
