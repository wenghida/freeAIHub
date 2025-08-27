"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Copy, Shield } from "lucide-react";
import ImagePromptGenerator from "@/components/image-prompt/ImagePromptGenerator";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import MainLayout from "@/components/layout/MainLayout";

export default function GenerateImagePromptPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4 font-sans">
            AI Image Prompt Generator
          </h1>
          <p className="text-gray-600 text-lg font-serif">
            Generate detailed prompts for AI image generation by selecting dimensions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-sans text-black flex items-center">
                  <Wand2 className="w-6 h-6 mr-2 text-blue-600" />
                  Generate Image Prompt
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Select dimensions for each category to create a detailed AI image generation prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImagePromptGenerator />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}