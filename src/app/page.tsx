"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
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
import MainLayout from "@/components/layout/MainLayout";

export default function HomePage() {
  const aiServices = [
    {
      id: "text-to-image",
      title: "Text to Image",
      description:
        "Convert your text descriptions into beautiful AI-generated images",
      icon: ImageIcon,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      id: "image-to-image",
      title: "Image to Image",
      description:
        "Transform your existing images with AI-powered editing",
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
    {
      id: "text-to-speech",
      title: "Text to Speech",
      description: "Convert text into natural and fluent speech playback",
      icon: Volume2,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      id: "speech-to-text",
      title: "Speech to Text",
      description: "Accurately recognize speech content and convert it to text",
      icon: Mic,
      color: "bg-orange-50 text-orange-600 border-orange-200",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-white text-black">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 font-sans">
              Free AI Multi-Functional Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-serif">
              Experience the future of AI with our completely free,
              registration-free platform offering five core AI functions
            </p>
          </div>
        </section>

        {/* AI Services Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4 font-sans">
                Core AI Functions
              </h2>
              <p className="text-gray-600 text-lg font-serif">
                Explore our comprehensive suite of AI-powered tools
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiServices.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Card
                    key={service.id}
                    className={`border ${service.color} hover:shadow-lg transition-shadow`}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg font-sans text-black">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 font-serif">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/${service.id}`}>
                        <Button
                          variant="outline"
                          className="w-full border-gray-200 text-black hover:bg-gray-50 bg-transparent"
                        >
                          Try Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4 font-sans">
                Why Choose FreeAI Hub
              </h2>
              <p className="text-gray-600 text-lg font-serif">
                We are committed to providing users with the best AI service
                experience
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-sans text-black">
                    Completely Free
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-serif">
                    All AI functions are completely free to use, no hidden fees
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg font-sans text-black">
                    No Registration
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-serif">
                    Use directly without cumbersome registration process
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg font-sans text-black">
                    Fast Processing
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-serif">
                    Advanced AI technology ensures fast response and processing
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg font-sans text-black">
                    High Quality Output
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-serif">
                    Professional AI models ensure high-quality output content
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
