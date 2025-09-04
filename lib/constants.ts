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
        title: "About",
        hasTradeMark: false,
        href: "/about",
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
      title: "Connect",
      href: "#",
      items: [
        {
          title: "LinkedIn",
          href: "https://www.linkedin.com/company/quanthive/",
        },
        {
          title: "X/Twitter",
          href: "https://x.com/QuantHiveTeam",
        },
        {
          title: "YouTube",
          href: "https://www.youtube.com/@quanthive",
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
          href: "/careers/open-positions",
        },
        {
          title: "Internships",
          href: "/careers/internships",
        },
      ],
    },
    {
      title: "Contact",
      href: "#",
      items: [
        {
          title: "Mail",
          href: "mailto:mail@quanthive.in",
        },
        {
          title: "Location",
          href: "#",
        },
        {
          title: "Phone",
          href: "#",
        },
      ],
    },
  ],
};

export { menuItems, navItems, footerItems };
