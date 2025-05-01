import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-black text-white px-4 md:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="flex items-center space-x-2">
            <Image src="/images/logo.png" alt="QuantHive Logo" width={32} height={32} />
            <span className="text-xl font-medium">QuantHive</span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            {["Home", "About", "Solutions", "Careers", "Contact"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-400">© {new Date().getFullYear()} QuantHive | All rights reserved</div>
          <div className="flex items-center gap-6">
            <a
              href="https://www.linkedin.com/company/quanthive/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a href="mailto:mail@quanthive.in" className="text-sm text-gray-400 hover:text-white transition-colors">
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
