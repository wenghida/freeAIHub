"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Users,
  Clock,
  AlertTriangle,
  Scale,
  Lock,
  Database,
  Eye,
  FileText,
} from "lucide-react";

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-white text-black">
        {/* Header Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 font-sans">
                Privacy Policy
              </h1>
              <p className="text-gray-600 text-lg font-serif mb-2">
                Last updated: August 29, 2025
              </p>
              <p className="text-gray-600 font-serif max-w-2xl mx-auto">
                At CalmSky AI, we take your privacy seriously. This Privacy
                Policy explains how we collect, use, and protect your
                information when you use our AI generation services.
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
                  <FileText className="w-6 h-6 mr-3 text-blue-600" />
                  1. Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed">
                <p>
                  At CalmSky AI, we take your privacy seriously. This Privacy
                  Policy explains how we collect, use, and protect your
                  information when you use our AI generation service at
                  calmsky.ai ("the Service").
                </p>
              </CardContent>
            </Card>

            {/* 2. Information We Don't Collect */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Lock className="w-6 h-6 mr-3 text-green-600" />
                  2. Information We Don't Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed space-y-4">
                <p>We are committed to minimal data collection. We do not:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Require user registration or accounts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Store your prompts or generated images</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Collect personal information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Use cookies for tracking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Share any data with third parties</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 3. Information We Process */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Database className="w-6 h-6 mr-3 text-blue-600" />
                  3. Information We Process
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed space-y-4">
                <p>The only information we process includes:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Temporary text prompts during image generation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Generated images during the creation process</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Basic usage analytics (non-personally identifiable)
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 4. How We Use Information */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Users className="w-6 h-6 mr-3 text-purple-600" />
                  4. How We Use Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed space-y-4">
                <p>Any information processed is used solely for:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Generating images in response to your prompts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Improving the Service's performance and quality</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Maintaining service security and preventing abuse
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 5. Data Retention */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Clock className="w-6 h-6 mr-3 text-orange-600" />
                  5. Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed">
                <p>
                  We follow a strict no-storage policy. All prompts and
                  generated images are processed in real-time and deleted
                  immediately after generation. We do not maintain any database
                  of user content.
                </p>
              </CardContent>
            </Card>

            {/* 6. Security Measures */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Shield className="w-6 h-6 mr-3 text-red-600" />
                  6. Security Measures
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed">
                <p>
                  We implement appropriate technical measures to protect against
                  unauthorized access, alteration, or destruction of the limited
                  data we process. Our service operates on secure, encrypted
                  connections.
                </p>
              </CardContent>
            </Card>

            {/* 7. Children's Privacy */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Users className="w-6 h-6 mr-3 text-pink-600" />
                  7. Children's Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed">
                <p>
                  Our Service is not intended for children under 13 years of
                  age. We do not knowingly collect or process information from
                  children under 13.
                </p>
              </CardContent>
            </Card>

            {/* 8. Changes to Privacy Policy */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                  8. Changes to Privacy Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed">
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify users of any material changes by posting the new
                  Privacy Policy on this page.
                </p>
              </CardContent>
            </Card>

            {/* 9. Your Rights */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Eye className="w-6 h-6 mr-3 text-teal-600" />
                  9. Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed">
                <p>
                  Since we don't collect personal data, there is typically no
                  user data to:
                </p>
                <ul className="space-y-2 ml-4 mt-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Access</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Correct</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Delete</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Export</span>
                  </li>
                </ul>
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
                  If you have any questions about this Privacy Policy, please
                  contact us at:
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

            {/* 11. Legal Basis */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-sans text-black">
                  <Scale className="w-6 h-6 mr-3 text-gray-600" />
                  11. Legal Basis
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 font-serif leading-relaxed">
                <p>
                  We process the minimal required information based on
                  legitimate interests in providing and improving the Service
                  while maintaining user privacy and security.
                </p>
              </CardContent>
            </Card>

            <Separator className="my-8" />
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
