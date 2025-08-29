"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Shield,
  Users,
  Clock,
  AlertTriangle,
  Scale,
} from "lucide-react";

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-white text-black">
        {/* Header Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 font-sans">
                Terms of Service
              </h1>
              <p className="text-gray-600 text-lg font-serif mb-2">
                Last updated: August 29, 2025
              </p>
              <p className="text-gray-600 font-serif max-w-2xl mx-auto">
                Welcome to CalmSky AI. Please read these Terms of Service
                carefully before using our service. By accessing or using our
                service, you agree to be bound by these terms.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl space-y-8">
            {/* 1. Introduction */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Users className="w-6 h-6 mr-3 text-blue-600" />
                  1. Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed">
                <p>
                  Welcome to CalmSky AI platform ("the Service"). By accessing
                  or using our AI generation service at calmsky.ai, you agree to
                  be bound by these Terms of Service ("Terms"). Please read
                  these Terms carefully before using the Service.
                </p>
              </CardContent>
            </Card>

            {/* 2. Service Description */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Shield className="w-6 h-6 mr-3 text-green-600" />
                  2. Service Description
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed space-y-4">
                <p>
                  CalmSky AI is a free AI multi-functional platform powered by
                  advanced AI models. We provide users with the following core
                  services:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Text to Image: Generate high-quality AI images from text
                      descriptions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Text to Text: Intelligent text processing and generation
                      services
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Text to Speech: Convert text to natural and fluent speech
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Speech to Text: Accurate speech recognition and
                      transcription services
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Image Prompt Generation: Intelligently generate optimized
                      AI drawing prompts
                    </span>
                  </li>
                </ul>
                <p>
                  All services are available without registration or payment.
                </p>
              </CardContent>
            </Card>

            {/* 3. User Obligations */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <AlertTriangle className="w-6 h-6 mr-3 text-orange-600" />
                  3. User Obligations
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed space-y-4">
                <p>By using our Service, you agree to:</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Use the Service in compliance with all applicable laws and
                      regulations
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Not attempt to circumvent any limitations or security
                      measures
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Not use the Service for any illegal or unauthorized
                      purposes
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Not interfere with or disrupt the Service or servers
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Not generate content that violates intellectual property
                      rights or contains harmful material
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Complete Cloudflare Turnstile verification to ensure
                      service security
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 4. Intellectual Property Rights */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Scale className="w-6 h-6 mr-3 text-purple-600" />
                  4. Intellectual Property Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed space-y-4">
                <p>
                  Images and content generated through our Service are provided
                  under the Creative Commons Zero (CC0) license. You may use the
                  generated content for any purpose, including commercial use,
                  without attribution requirements. However, you acknowledge
                  that certain prompts or outputs may be subject to third-party
                  rights.
                </p>
                <p>
                  The platform's source code, interface design, and trademarks
                  are owned by CalmSky AI and protected by relevant intellectual
                  property laws.
                </p>
              </CardContent>
            </Card>

            {/* 5. Privacy and Data Protection */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Shield className="w-6 h-6 mr-3 text-green-600" />
                  5. Privacy and Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed space-y-4">
                <p>
                  Our privacy practices are outlined in our Privacy Policy. We
                  do not store user prompts or generated content, and we do not
                  require user registration or collect personal information.
                </p>
              </CardContent>
            </Card>

            {/* 6. Service Availability */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Clock className="w-6 h-6 mr-3 text-blue-600" />
                  6. Service Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed space-y-4">
                <p>
                  While we strive to maintain continuous service availability,
                  we do not guarantee uninterrupted access to the Service. We
                  reserve the right to modify, suspend, or discontinue any
                  aspect of the Service at any time without notice.
                </p>
                <p>The Service is subject to the following limitations:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Rate limiting: Maximum 20 requests per minute per IP
                      address
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      File size limit: Maximum 50MB for uploaded files
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Audio length limit: Maximum 5 minutes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 7. Content Guidelines */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
                  7. Content Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed space-y-4">
                <p>You agree not to generate the following types of content:</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Content that violates any applicable laws or regulations
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Hateful, discriminatory, or offensive content</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Content that infringes on intellectual property rights
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Sexually explicit or pornographic content</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Content intended to harass, abuse, or harm others
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 8. Limitation of Liability */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Scale className="w-6 h-6 mr-3 text-gray-600" />
                  8. Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed space-y-4">
                <p>
                  The Service is provided "as is" without any warranties. We
                  shall not be liable for any damages arising from the use of
                  the Service, including but not limited to direct, indirect,
                  incidental, punitive, and consequential damages.
                </p>
                <p>
                  Users are fully responsible for content generated using the
                  Service, including ensuring it complies with applicable laws
                  and regulations.
                </p>
              </CardContent>
            </Card>

            {/* 9. Changes to Terms */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                  9. Changes to Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed space-y-4">
                <p>
                  We reserve the right to modify these Terms at any time.
                  Continued use of the Service after any changes constitutes
                  acceptance of the new Terms. We will notify users of material
                  changes by posting the updated Terms on this page.
                </p>
              </CardContent>
            </Card>

            {/* 10. Contact Information */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Users className="w-6 h-6 mr-3 text-blue-600" />
                  10. Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed space-y-4">
                <p>
                  If you have any questions about these Terms, please contact us
                  at:
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">
                    Email: support@calmsky.ai
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    We will respond to your inquiry within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-8" />
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
