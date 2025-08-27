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
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Mic,
  MessageSquare,
  Settings,
  Download,
  Upload,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import {
  fileToBase64,
  copyToClipboard,
} from "@/lib/api/client";
import MainLayout from "@/components/layout/MainLayout";

export default function SpeechToTextPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [sttLanguage, setSttLanguage] = useState("auto");
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Speech to Text functions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      const validTypes = ["audio/wav", "audio/mp3", "audio/mpeg", "audio/m4a", "audio/webm"];
      if (!validTypes.includes(file.type)) {
        setError(
          "Please upload an audio file in MP3, WAV, M4A, or WebM format"
        );
        return;
      }

      // 验证文件大小
      if (file.size > 50 * 1024 * 1024) {
        setError("Audio file size cannot exceed 50MB");
        return;
      }

      setAudioFile(file);
    }
  };

  const handleConvertSpeech = async () => {
    clearError();
    if (!audioFile) {
      setError("Please select an audio file");
      return;
    }

    // 再次验证文件
    const validTypes = ["audio/wav", "audio/mp3", "audio/mpeg", "audio/m4a", "audio/webm"];
    if (!validTypes.includes(audioFile.type)) {
      setError("Please upload an audio file in MP3, WAV, M4A, or WebM format");
      return;
    }

    if (audioFile.size > 50 * 1024 * 1024) {
      setError("Audio file size cannot exceed 50MB");
      return;
    }

    setIsTranscribing(true);
    try {
      const base64Data = await fileToBase64(audioFile);
      // 获取正确的音频格式
      let format = audioFile.type.split("/")[1] as any;
      // 将mpeg转换为mp3以匹配API期望的格式
      if (format === "mpeg") {
        format = "mp3";
      }
      
      const result = await apiClient.recognizeSpeech({
        audioData: base64Data,
        format: format,
        language: sttLanguage as any,
      });

      if (result.success) {
        // 清理识别结果，防止XSS
        const sanitizedText = result.text.replace(/<[^>]*>/g, "");
        setTranscribedText(sanitizedText);
        setSuccess("Speech recognition successful");
        clearMessages();
      } else {
        setError(result.error || "Speech recognition failed");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Speech recognition failed"
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopyTranscribedText = async () => {
    if (transcribedText) {
      const success = await copyToClipboard(transcribedText);
      if (success) {
        setSuccess("Text copied to clipboard");
        clearMessages();
      } else {
        setError("Copy failed");
      }
    }
  };

  const handleResetSpeechToText = () => {
    setAudioFile(null);
    setTranscribedText("");
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4 font-sans">
            Speech to Text
          </h1>
          <p className="text-gray-600 text-lg font-serif">
            Accurately recognize speech content and convert it to text
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-sans text-black flex items-center">
                  <Mic className="w-5 h-5 mr-2 text-orange-600" />
                  Audio Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500 mb-2">
                    Upload audio file or record
                  </p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label htmlFor="audio-upload">
                    <Button
                      variant="outline"
                      className="border-gray-200 text-black hover:bg-gray-50 bg-transparent cursor-pointer"
                      asChild
                    >
                      <span>Choose File</span>
                    </Button>
                  </label>
                  {audioFile && (
                    <p className="text-sm text-gray-600 mt-2 truncate">
                      Selected: {audioFile.name}
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Or record directly</p>
                  <Button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`${
                      isRecording
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-orange-600 hover:bg-orange-700"
                    } text-white`}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-sans text-black flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-orange-600" />
                  Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-black mb-2 block">
                    Source Language
                  </Label>
                  <select
                    value={sttLanguage}
                    onChange={(e) => setSttLanguage(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg bg-white text-black"
                  >
                    <option value="auto">Auto Detect</option>
                    <option value="en-US">English</option>
                    <option value="zh-CN">Chinese</option>
                    <option value="ja-JP">Japanese</option>
                    <option value="ko-KR">Korean</option>
                  </select>
                </div>
                <Button
                  onClick={handleConvertSpeech}
                  disabled={isTranscribing || !audioFile}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    "Convert to Text"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-gray-200 bg-white h-full">
              <CardHeader>
                <CardTitle className="text-lg font-sans text-black flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                  Transcribed Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-gray-200 rounded-lg p-4 bg-gray-50 text-gray-800 overflow-auto">
                  {transcribedText || "Transcribed text will appear here..."}
                </div>
                {transcribedText && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={handleCopyTranscribedText}
                      variant="outline"
                      className="flex-1 border-gray-200 text-black hover:bg-gray-50 bg-transparent"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button
                      onClick={handleResetSpeechToText}
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
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
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