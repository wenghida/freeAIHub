"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/shared/Header";
import { Toaster } from "@/components/ui/sonner";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <Toaster position="top-right" richColors />

      <main>{children}</main>

      <footer className="py-12 px-4 border-t border-gray-200 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link
                href="/"
                className="flex items-center space-x-2 mb-4 cursor-pointer"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <img
                    src="/favicon.ico"
                    alt="CalmSky AI"
                    className="w-5 h-5"
                  />
                </div>
                <h3 className="text-xl font-bold text-black font-sans">
                  CalmSky AI
                </h3>
              </Link>
              <p className="text-gray-600 mb-4 font-serif">
                Free AI multi-function conversion platform providing
                text-to-image, text-to-text, text-to-speech, and speech-to-text
                core AI functions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-4 font-sans">Tools</h4>
              <ul className="space-y-2 text-gray-600 font-serif">
                {/* <li>
                  <Link
                    href="/image-to-image"
                    className="hover:text-black transition-colors"
                  >
                    Image to Image
                  </Link>
                </li> */}
                <li>
                  <Link
                    href="/generate-image-prompt"
                    className="hover:text-black transition-colors"
                  >
                    Generate Image Prompt
                  </Link>
                </li>
                <li>
                  <Link
                    href="/text-to-text"
                    className="hover:text-black transition-colors"
                  >
                    Text to Text
                  </Link>
                </li>
                {/* <li>
                  <button
                    onClick={() => {
                      router.push("/text-to-speech");
                    }}
                    className="hover:text-black transition-colors"
                  >
                    Text to Speech
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      router.push("/speech-to-text");
                    }}
                    className="hover:text-black transition-colors"
                  >
                    Speech to Text
                  </button>
                </li> */}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-4 font-sans">About</h4>
              <ul className="space-y-2 text-gray-600 font-serif">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-black transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-black transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600 font-serif">
            <p>&copy; 2025 CalmSky AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
