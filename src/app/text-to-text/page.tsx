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
  MessageSquare,
  Settings,
  Download,
  Loader2,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { copyToClipboard, downloadFile } from "@/lib/api/client";
import { TEXT_TO_TEXT_MODELS } from "@/lib/constants/models";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import MainLayout from "@/components/layout/MainLayout";
import TurnstileModal from "@/components/shared/TurnstileModal";

export default function TextToTextPage() {
  const [inputText, setInputText] = useState("");
  const [textModel, setTextModel] = useState("gpt-5-nano"); // 默认模型
  const [processedText, setProcessedText] = useState("");
  const [isProcessingText, setIsProcessingText] = useState(false);
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

  // Text to Text functions
  const handleProcessText = async () => {
    clearError();

    const trimmedText = inputText.trim();
    if (!trimmedText) {
      setError("Please enter text content");
      return;
    }

    // 验证文本长度
    if (trimmedText.length > 5000) {
      setError("Text content cannot exceed 5000 characters");
      return;
    }

    // 打开验证弹窗
    setShowVerificationModal(true);
  };

  const handleProcessTextAfterVerification = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) {
      setError("Please enter text content");
      return;
    }

    // 验证文本长度
    if (trimmedText.length > 5000) {
      setError("Text content cannot exceed 5000 characters");
      return;
    }

    // 清理文本输入，防止XSS
    const sanitizedText = trimmedText.replace(/<[^>]*>/g, "");

    setIsProcessingText(true);
    try {
      const result = await apiClient.processText({
        text: sanitizedText,
        model: textModel,
      });

      if (result.success) {
        setProcessedText(result.processedText);
        setSuccess("Text processed successfully");
        clearMessages();
      } else {
        setError(result.error || "Text processing failed");

        // Check if it's a Turnstile-related error
        if (
          result.error?.includes("TURNSTILE") ||
          result.error?.includes("Verification")
        ) {
          setTurnstileToken(null);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Text processing failed";
      setError(errorMessage);

      // Check if it's a Turnstile-related error
      if (
        errorMessage.includes("TURNSTILE") ||
        errorMessage.includes("Verification")
      ) {
        setTurnstileToken(null);
      }
    } finally {
      setIsProcessingText(false);
    }
  };

  const handleCopyText = async () => {
    if (processedText) {
      const success = await copyToClipboard(processedText);
      if (success) {
        setSuccess("Text copied to clipboard");
        clearMessages();
      } else {
        setError("Copy failed");
      }
    }
  };

  const handleResetText = () => {
    setInputText("");
    setProcessedText("");
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4 font-sans">
            Text to Text
          </h1>
          <p className="text-gray-600 text-lg font-serif">
            Intelligent text processing including translation, summarization,
            and rewriting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-sans text-black flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                  Text Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter the text you want to process..."
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg bg-white text-black placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-sans text-black flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-green-600" />
                  Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-black mb-2 block">
                    Model
                  </Label>
                  <select
                    value={textModel}
                    onChange={(e) => setTextModel(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg bg-white text-black"
                  >
                    {TEXT_TO_TEXT_MODELS.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleProcessText}
                  disabled={isProcessingText}
                  className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  {isProcessingText ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Process Text"
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
                    // 验证成功后执行处理逻辑
                    handleProcessTextAfterVerification();
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

          <div className="lg:col-span-2">
            <Card className="border-gray-200 bg-white h-full">
              <CardHeader>
                <CardTitle className="text-lg font-sans text-black flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                  Processed Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-gray-200 rounded-lg p-4 bg-gray-50 text-gray-800 overflow-auto">
                  {processedText || "Processed text will appear here..."}
                </div>
                {processedText && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={handleCopyText}
                      variant="outline"
                      className="flex-1 border-gray-200 text-black hover:bg-gray-50 bg-transparent"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button
                      onClick={handleResetText}
                      variant="outline"
                      className="border-gray-200 text-black hover:bg-gray-50 bg-transparent"
                    >
                      Reset
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
