/* ---------------------- New Navbar ------------------------ 
This a new navbar component that is being created.
It is a placeholder for now and will be updated later.
It will be used in the main page of the website.
-------------------------------------------------------------
*/

import React from "react";
import Logo from "../Logo";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const Navbar = () => {
  return (
    <div className="flex flex-row items-center justify-center">
      <nav className="flex flex-row items-center justify-center bg-[#0A0A0A] rounded-full border-2 border-muted-foreground py-[14px] px-5 transition-all duration-300">
        <Link
          href="/"
          className="w-7 h-7 mr-3 flex items-center justify-center"
        >
          <Logo />
        </Link>

        <Link
          href="#"
          className="group font-normal text-foreground ml-3 mr-2.5"
        >
          <span className="text-xl group-hover:underline underline-offset-4">
            Flash
          </span>
          <sup className="text-[10px]"> TM</sup>
        </Link>

        <Link
          href="#"
          className="text-foreground text-xl mx-2.5 hover:underline underline-offset-4"
        >
          Benchmark
        </Link>

        <Link
          href="#"
          className="text-foreground text-xl ml-2.5 mr-2 hover:underline underline-offset-4"
        >
          Careers
        </Link>

        <button onClick={() => {}} className="text-foreground text-lg ml-2">
          <ChevronDown size={"24"} />
        </button>
      </nav>
    </div>
  );
};

export default Navbar;
