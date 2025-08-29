"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const aiServices = [
    {
      id: "generate-image-prompt",
      title: "Generate Image Prompt",
      href: "/generate-image-prompt",
    },
    {
      id: "text-to-text",
      title: "Text to Text",
      href: "/text-to-text",
    },
  ];

  const isActiveService = (serviceId: string) => {
    return (
      pathname === `/${serviceId}` ||
      (serviceId === "generate-image-prompt" &&
        pathname === "/generate-image-prompt")
    );
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <img src="/favicon.ico" alt="CalmSky AI" className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-black font-sans">
              CalmSky AI
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/#get-inspired"
              className="transition-colors font-medium text-black hover:text-blue-600"
            >
              Get Inspired
            </Link>
            <Link
              href="/#key-features"
              className="transition-colors font-medium text-black hover:text-blue-600"
            >
              Features
            </Link>
            <Link
              href="/#faq"
              className="transition-colors font-medium text-black hover:text-blue-600"
            >
              FAQs
            </Link>
            {aiServices.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className={`transition-colors font-medium ${
                  isActiveService(service.id)
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-black hover:text-blue-600"
                }`}
              >
                {service.title}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 z-50"></div>
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <img src="/favicon.ico" alt="CalmSky AI" className="h-6 w-6" />
                CalmSky AI
              </span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Link
                  href="/#get-inspired"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Inspired
                </Link>
                {aiServices.map((service) => (
                  <Link
                    key={service.id}
                    href={service.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {service.title}
                  </Link>
                ))}
                <Link
                  href="/#get-inspired"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Inspired
                </Link>
                <Link
                  href="/#key-features"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/#faq"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQs
                </Link>
              </div>
              <div className="py-6 space-y-2">
                <Link
                  href="/privacy"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Terms
                </Link>
                <Link
                  href="https://github.com/pollinations/pollinations"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
