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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  ImageIcon,
  MessageSquare,
  Settings,
  Download,
  Loader2,
  Wand2,
  Shuffle,
  Shield,
} from "lucide-react";
import TurnstileModal from "@/components/shared/TurnstileModal";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import {
  fileToBase64,
  copyToClipboard,
  downloadFile,
  downloadBase64Image,
} from "@/lib/api/client";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import MainLayout from "@/components/layout/MainLayout";

export default function TextToImagePage() {
  const [prompt, setPrompt] = useState("");
  const [imageWidth, setImageWidth] = useState(512);
  const [imageHeight, setImageHeight] = useState(512);
  const [imageModel, setImageModel] = useState("flux");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [selectedShape, setSelectedShape] = useState("square"); // Track selected shape
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false);
  const [isGeneratingRandom, setIsGeneratingRandom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Turnstile states
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Clear messages after a delay
  const clearMessages = () => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  };

  // Clear error message
  const clearError = () => setError(null);

  // Clear success message
  const clearSuccess = () => setSuccess(null);

  // Turnstile handlers

  // Text to Image functions
  const handleGenerateImage = async () => {
    clearError();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError("Please enter an image description");
      return;
    }

    // 验证prompt长度
    if (trimmedPrompt.length > 500) {
      setError("Image description cannot exceed 500 characters");
      return;
    }

    // 打开验证弹窗
    setShowVerificationModal(true);
  };

  const handleGenerateImageAfterVerification = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError("Please enter an image description");
      return;
    }

    // 清理prompt输入，防止XSS
    const sanitizedPrompt = trimmedPrompt.replace(/<[^>]*>/g, "");

    // 同时设置按钮和图片区域的加载状态
    setIsGeneratingImage(true);
    setIsImageLoading(true);
    try {
      const result = await apiClient.generateImage(
        sanitizedPrompt,
        imageWidth,
        imageHeight,
        imageModel
      );
      if (result.success) {
        setGeneratedImage(result.imageData);
        setSuccess("Image generated successfully");
        clearMessages();
      } else {
        setError(result.error || "Image generation failed");
        // 失败时同时关闭两个加载状态
        setIsImageLoading(false);
        setIsGeneratingImage(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Image generation failed";
      setError(errorMessage);

      // Check if it's a Turnstile-related error
      if (
        errorMessage.includes("TURNSTILE") ||
        errorMessage.includes("Verification")
      ) {
        setShowTurnstile(true);
        setTurnstileToken(null);
      }

      // 失败时同时关闭两个加载状态
      setIsImageLoading(false);
      setIsGeneratingImage(false);
    }
  };

  const handleOptimizePrompt = async () => {
    clearError();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError("Please enter a prompt to optimize");
      return;
    }

    // 验证prompt长度
    if (trimmedPrompt.length > 500) {
      setError("Prompt cannot exceed 500 characters");
      return;
    }

    setIsOptimizingPrompt(true);
    try {
      // 调用专门的API端点优化prompt，后端负责拼接和优化prompt
      const result = await apiClient.fetchWithError(
        "/api/text-to-image/optimize-prompt",
        {
          method: "POST",
          body: JSON.stringify({ prompt: trimmedPrompt }),
        }
      );

      if (result.success) {
        // 从API响应中提取优化后的prompt文本并更新状态
        setPrompt(result.optimizedPrompt);
        setSuccess("Prompt optimized successfully");
        clearMessages();
      } else {
        setError(result.error || "Prompt optimization failed");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Prompt optimization failed"
      );
    } finally {
      setIsOptimizingPrompt(false);
    }
  };

  const handleRandomPrompt = () => {
    clearError();
    // 预设的随机prompt示例
    const randomPrompts = [
      "A beautiful sunset over a mountain range with vibrant colors",
      "A futuristic cityscape with flying cars and neon lights",
      "A serene forest with sunlight streaming through the trees",
      "An underwater scene with colorful coral reefs and tropical fish",
      "A cozy cabin in a snowy landscape with smoke coming from the chimney",
      "A bustling marketplace in a medieval town with merchants and shoppers",
      "A magical garden with glowing flowers and fairy lights",
      "A majestic dragon flying over a medieval castle",
      "A peaceful beach with palm trees and crystal clear water",
      "A steampunk-inspired mechanical robot in a Victorian setting",
    ];

    // 随机选择一个prompt
    const randomIndex = Math.floor(Math.random() * randomPrompts.length);
    setPrompt(randomPrompts[randomIndex]);
  };

  const handleDownloadImage = () => {
    if (generatedImage) {
      // 检查是否为base64数据
      if (generatedImage.startsWith("data:image")) {
        downloadBase64Image(
          generatedImage,
          `generated-image-${Date.now()}.jpg`
        );
      } else {
        downloadFile(generatedImage, `generated-image-${Date.now()}.jpg`);
      }
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4 font-sans">
            Text to Image
          </h1>
          <p className="text-gray-600 text-lg font-serif">
            Convert your text descriptions into beautiful AI-generated images
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧输入区域 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prompt输入 */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-sans text-black flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                  Prompt Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="w-full h-32 p-3 border border-gray-200 rounded-lg bg-white text-black placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20"
                  />
                  <div className="absolute right-2 bottom-2 flex space-x-1">
                    <button
                      onClick={handleOptimizePrompt}
                      disabled={isOptimizingPrompt}
                      className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Optimize prompt"
                    >
                      {isOptimizingPrompt ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleRandomPrompt}
                      disabled={isGeneratingRandom}
                      className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Generate random prompt"
                    >
                      {isGeneratingRandom ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shuffle className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 参数设置 */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-sans text-black flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-black mb-2 block">
                    Aspect Ratio
                  </Label>
                  <div className="grid grid-cols-5 gap-2 items-end">
                    <button
                      onClick={() => {
                        setImageWidth(1024);
                        setImageHeight(1024);
                        setSelectedShape("square");
                      }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-12 h-12 border-2 rounded transition-colors flex items-center justify-center ${
                          selectedShape === "square"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        <span className="text-xs font-medium">1:1</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setImageWidth(1024);
                        setImageHeight(768);
                        setSelectedShape("landscape");
                      }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-12 h-9 border-2 rounded transition-colors flex items-center justify-center ${
                          selectedShape === "landscape"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        <span className="text-xs font-medium">4:3</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setImageWidth(768);
                        setImageHeight(1024);
                        setSelectedShape("portrait");
                      }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-9 h-12 border-2 rounded transition-colors flex items-center justify-center ${
                          selectedShape === "portrait"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        <span className="text-xs font-medium">3:4</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setImageWidth(1024);
                        setImageHeight(576);
                        setSelectedShape("wide");
                      }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-12 h-6.5 border-2 rounded transition-colors flex items-center justify-center ${
                          selectedShape === "wide"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        <span className="text-xs font-medium">16:9</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setImageWidth(576);
                        setImageHeight(1024);
                        setSelectedShape("tall");
                      }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-6.5 h-12 border-2 rounded transition-colors flex items-center justify-center ${
                          selectedShape === "tall"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        <span className="text-xs font-medium">9:16</span>
                      </div>
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Image"
                  )}
                </Button>
                {/* Verification Modal */}
                <TurnstileModal
                  open={showVerificationModal}
                  onOpenChange={setShowVerificationModal}
                  siteKey={
                    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
                    "0x4AAAAAAAxxxxxxxxxxxxxxxxxx"
                  }
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    apiClient.setTurnstileToken(token);
                    setShowVerificationModal(false);
                    // 验证成功后执行生成逻辑
                    handleGenerateImageAfterVerification();
                  }}
                  onError={() => {
                    setTurnstileToken(null);
                    apiClient.clearTurnstileToken();
                    setShowVerificationModal(false);
                  }}
                  onExpire={() => {
                    setTurnstileToken(null);
                    apiClient.clearTurnstileToken();
                    setShowVerificationModal(false);
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* 右侧结果展示 */}
          <div className="lg:col-span-2">
            <div className="relative h-full min-h-[400px] flex items-center justify-center">
              {generatedImage || isImageLoading ? (
                <>
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50 rounded-lg">
                      <LoadingSpinner size="md" message="generating..." />
                    </div>
                  )}
                  {generatedImage && (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className={`max-w-full max-h-full object-contain rounded-lg ${isImageLoading ? "opacity-0" : "opacity-100"}`}
                        onLoad={() => {
                          // 图片加载完成时，同时关闭两个加载状态
                          setIsImageLoading(false);
                          setIsGeneratingImage(false);
                        }}
                        onError={() => {
                          // 图片加载失败时，同时关闭两个加载状态
                          setIsImageLoading(false);
                          setIsGeneratingImage(false);
                          setError("Image loading failed");
                        }}
                      />
                      {/* 下载按钮 */}
                      <button
                        onClick={() => handleDownloadImage()}
                        className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full shadow-md hover:bg-opacity-100 hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-110"
                        title="download"
                      >
                        <Download className="w-5 h-5 text-gray-700 hover:text-blue-600 transition-colors duration-200" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Generated image will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="fixed top-4 right-4 z-50">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={clearError}
                      className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {success && (
          <div className="fixed top-4 right-4 z-50">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      {success}
                    </h3>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={clearSuccess}
                      className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
