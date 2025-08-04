import { title } from "process";

const navItems = [
  { label: "Flash", href: "/flash", hasTrademark: true },
  { label: "About", href: "/about", hasTrademark: false },
  { label: "Contact", href: "/contact", hasTrademark: false },
];

const menuItems = [
  {
    "About Us": [
      {
        title: "Explore",
        hasTradeMark: false,
        href: "/about/explore",
        number: "01",
        image: "/images/webp/menu-about-us-1.webp",
      },
      {
        title: "Our Team",
        hasTradeMark: false,
        href: "/team",
        number: "02",
        image: "/images/webp/menu-about-us-2.webp",
      },
      {
        title: "Contact",
        hasTradeMark: false,
        href: "/contact",
        number: "03",
        image: "/images/webp/menu-about-us-3.webp",
      },
    ],
  },
  {
    Products: [
      {
        title: "Flash",
        hasTradeMark: true,
        href: "/flash",
        number: "01",
        image: "/images/webp/menu-products-1.webp",
      },
    ],
  },
];

const footerItems = {
  left: [
    {
      title: "Our Story",
      href: "#",
    },
    {
      title: "Our Team",
      href: "#",
    },
    {
      title: "Blog",
      href: "#",
      items: [
        {
          title: "What do Quant developers do?",
          href: "#",
        },
        {
          title: "How does Flashᵀᴹ work?",
          href: "#",
        },
        {
          title: "Random blog written by Harikishan",
          href: "#",
        },
      ],
    },
  ],
  right: [
    {
      title: "Careers",
      href: "#",
      items: [
        {
          title: "Open Positions",
          href: "#",
        },
        {
          title: "Benefits & Perks",
          href: "#",
        },
        {
          title: "Internships",
          href: "#",
        },
      ],
    },
    {
      title: "Contact",
      href: "#",
    },
  ],
};

export { menuItems, navItems, footerItems };
