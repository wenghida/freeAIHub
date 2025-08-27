"use client";

import { useState, useRef } from "react";
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
import { Slider } from "@/components/ui/slider";
import {
  ArrowRight,
  Volume2,
  Settings,
  Download,
  Play,
  Pause,
  Square,
  Loader2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import {
  downloadFile,
} from "@/lib/api/client";
import MainLayout from "@/components/layout/MainLayout";

export default function TextToSpeechPage() {
  const [ttsText, setTtsText] = useState("");
  const [voice, setVoice] = useState("zh-CN-XiaoxiaoNeural");
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
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

  // Text to Speech functions
  const handleGenerateSpeech = async () => {
    clearError();
    const trimmedText = ttsText.trim();
    if (!trimmedText) {
      setError("Please enter text content");
      return;
    }

    // 验证文本长度
    if (trimmedText.length > 1000) {
      setError("Text content cannot exceed 1000 characters");
      return;
    }

    // 清理文本输入，防止XSS
    const sanitizedText = trimmedText.replace(/<[^>]*>/g, "");

    // 验证语速参数
    const validatedSpeed = Math.min(Math.max(speechSpeed, 0.5), 2.0);

    setIsGeneratingSpeech(true);
    try {
      const result = await apiClient.generateSpeech({
        text: sanitizedText,
        voice,
        language: voice.startsWith("zh")
          ? "zh"
          : voice.startsWith("en")
            ? "en"
            : "ja",
        speed: validatedSpeed,
      });

      if (result.success) {
        setGeneratedAudio(result.audioData);
        setSuccess("Speech generated successfully");
        clearMessages();
      } else {
        setError(result.error || "Speech generation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speech generation failed");
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          setError("Audio playback failed: " + err.message);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleDownloadAudio = () => {
    if (generatedAudio) {
      downloadFile(generatedAudio, `generated-speech-${Date.now()}.mp3`);
    }
  };

  const handleResetSpeech = () => {
    setTtsText("");
    setGeneratedAudio(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4 font-sans">
            Text to Speech
          </h1>
          <p className="text-gray-600 text-lg font-serif">
            Convert text into natural and fluent speech playback
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-sans text-black flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                  Text Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="Enter the text you want to convert to speech..."
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg bg-white text-black placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-sans text-black flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-600" />
                  Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-black mb-2 block">
                    Voice Type
                  </Label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg bg-white text-black"
                  >
                    <option value="zh-CN-XiaoxiaoNeural">
                      Chinese Female (Xiaoxiao)
                    </option>
                    <option value="zh-CN-YunjianNeural">
                      Chinese Male (Yunjian)
                    </option>
                    <option value="en-US-JennyNeural">
                      English Female (Jenny)
                    </option>
                    <option value="en-US-GuyNeural">
                      English Male (Guy)
                    </option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-black mb-2 block">
                    Speed: {speechSpeed}x
                  </Label>
                  <Slider
                    value={[speechSpeed]}
                    onValueChange={([value]) => setSpeechSpeed(value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={handleGenerateSpeech}
                  disabled={isGeneratingSpeech}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isGeneratingSpeech ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Speech"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-gray-200 bg-white h-full">
              <CardHeader>
                <CardTitle className="text-lg font-sans text-black flex items-center">
                  <Volume2 className="w-5 h-5 mr-2 text-purple-600" />
                  Audio Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                  {generatedAudio ? (
                    <div className="text-center w-full">
                      <audio
                        ref={audioRef}
                        src={generatedAudio}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                      <Volume2 className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                      <p className="text-gray-700 mb-4">
                        Audio generated successfully
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePlayAudio}
                          className="border-gray-200 text-black hover:bg-gray-50"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStopAudio}
                          className="border-gray-200 text-black hover:bg-gray-50 bg-transparent"
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Volume2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 mb-4">
                        Audio will be generated here
                      </p>
                    </div>
                  )}
                </div>
                {generatedAudio && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={handleDownloadAudio}
                      variant="outline"
                      className="flex-1 border-gray-200 text-black hover:bg-gray-50 bg-transparent"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Audio
                    </Button>
                    <Button
                      onClick={handleResetSpeech}
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