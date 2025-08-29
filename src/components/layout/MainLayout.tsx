"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Globe,
  ArrowRight,
  ImageIcon,
  MessageSquare,
  Volume2,
  Mic,
  Wand2,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const aiServices = [
    // {
    //   id: "image-to-image",
    //   title: "Image to Image",
    //   description: "Transform your existing images with AI-powered editing",
    //   icon: Wand2,
    //   color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    // },
    {
      id: "generate-image-prompt",
      title: "Generate Image Prompt",
      description:
        "Create detailed prompts for AI image generation by selecting dimensions",
      icon: Wand2,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
    {
      id: "text-to-text",
      title: "Text to Text",
      description:
        "Intelligent text processing including translation, summarization, and rewriting",
      icon: MessageSquare,
      color: "bg-green-50 text-green-600 border-green-200",
    },
    // {
    //   id: "text-to-speech",
    //   title: "Text to Speech",
    //   description: "Convert text into natural and fluent speech playback",
    //   icon: Volume2,
    //   color: "bg-purple-50 text-purple-600 border-purple-200",
    // },
    // {
    //   id: "speech-to-text",
    //   title: "Speech to Text",
    //   description: "Accurately recognize speech content and convert it to text",
    //   icon: Mic,
    //   color: "bg-orange-50 text-orange-600 border-orange-200",
    // },
  ];

  const isActiveService = (serviceId: string) => {
    return (
      pathname === `/${serviceId}` ||
      (serviceId === "generate-image-prompt" &&
        pathname === "/generate-image-prompt")
    );
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <img src="/favicon.ico" alt="CalmSky AI" className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-black font-sans">
                CalmSky AI
              </h1>
            </Link>

            {/* Function Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {aiServices.map((service) => (
                <Link
                  key={service.id}
                  href={
                    service.id === "generate-image-prompt"
                      ? "/generate-image-prompt"
                      : `/${service.id}`
                  }
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
          </div>
        </div>
      </header>

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
                  <img src="/favicon.ico" alt="CalmSky AI" className="w-5 h-5" />
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
