"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Copy, Download, Shield } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import {
  IMAGE_PROMPT_SUBJECTS,
  IMAGE_PROMPT_STYLES,
  IMAGE_PROMPT_QUALITIES,
  IMAGE_PROMPT_COMPOSITIONS,
  IMAGE_PROMPT_LIGHTING,
  IMAGE_PROMPT_COLORS,
  IMAGE_PROMPT_MOODS,
  IMAGE_PROMPT_ENVIRONMENTS,
} from "@/lib/constants/image-prompt-dimensions";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import {
  validateTurnstileToken,
} from "@/lib/api/client";

interface DimensionSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  onCustomChange?: (value: string) => void;
  customValue?: string;
}

const DimensionSelector = ({
  label,
  value,
  onChange,
  options,
  onCustomChange,
  customValue,
}: DimensionSelectorProps) => {
  const [showCustomInput, setShowCustomInput] = useState(value === "other");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value === "other") {
      setShowCustomInput(true);
    } else {
      // 延迟隐藏，以便动画可以完成
      const timer = setTimeout(() => setShowCustomInput(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const handleClear = () => {
    onChange("");
    if (onCustomChange) {
      onCustomChange("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <Label className="text-sm font-medium text-black whitespace-nowrap min-w-[100px] sm:min-w-[120px]">
          {label}:
        </Label>
        <div className="flex-1 flex items-center gap-2">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={`Clear ${label}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showCustomInput ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {value === "other" && onCustomChange && (
          <div className="sm:ml-[108px] md:ml-[128px]">
            <input
              type="text"
              value={customValue || ""}
              onChange={(e) => onCustomChange(e.target.value)}
              placeholder={`Enter custom ${label.toLowerCase()}...`}
              className="w-full p-2 border border-gray-200 rounded-lg bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={10}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {customValue ? customValue.length : 0}/10 characters
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ImagePromptGenerator() {
  // 维度状态
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState("");
  const [quality, setQuality] = useState("");
  const [composition, setComposition] = useState("");
  const [lighting, setLighting] = useState("");
  const [color, setColor] = useState("");
  const [mood, setMood] = useState("");
  const [environment, setEnvironment] = useState("");

  // 自定义输入状态
  const [customSubject, setCustomSubject] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const [customQuality, setCustomQuality] = useState("");
  const [customComposition, setCustomComposition] = useState("");
  const [customLighting, setCustomLighting] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [customEnvironment, setCustomEnvironment] = useState("");

  // 结果状态
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Turnstile states
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showTurnstile, setShowTurnstile] = useState(true);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);

  // 清除消息
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Turnstile handlers
  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
    setTurnstileError(null);
    setShowTurnstile(false);
    apiClient.setTurnstileToken(token);
  };

  const handleTurnstileError = () => {
    setTurnstileError("Verification failed, please try again");
    setTurnstileToken(null);
    setShowTurnstile(true);
    apiClient.clearTurnstileToken();
  };

  const handleTurnstileExpire = () => {
    setTurnstileToken(null);
    setShowTurnstile(true);
    setTurnstileError(
      "Verification expired, please complete verification again"
    );
    apiClient.clearTurnstileToken();
  };

  // 生成提示词
  const handleGeneratePrompt = async () => {
    clearMessages();
    setTurnstileError(null);

    // Check Turnstile verification first
    const tokenValidation = validateTurnstileToken(turnstileToken);
    if (tokenValidation) {
      setError(tokenValidation);
      setShowTurnstile(true);
      return;
    }

    // 验证至少选择了一个选项
    const hasAtLeastOneSelection =
      subject ||
      style ||
      quality ||
      composition ||
      lighting ||
      color ||
      mood ||
      environment;
    if (!hasAtLeastOneSelection) {
      setError("Please select at least one dimension");
      return;
    }

    // 验证自定义输入字符限制
    if (subject === "other" && customSubject && customSubject.length > 10) {
      setError("Custom subject cannot exceed 10 characters");
      return;
    }

    if (style === "other" && customStyle && customStyle.length > 10) {
      setError("Custom style cannot exceed 10 characters");
      return;
    }

    if (quality === "other" && customQuality && customQuality.length > 10) {
      setError("Custom quality cannot exceed 10 characters");
      return;
    }

    if (
      composition === "other" &&
      customComposition &&
      customComposition.length > 10
    ) {
      setError("Custom composition cannot exceed 10 characters");
      return;
    }

    if (lighting === "other" && customLighting && customLighting.length > 10) {
      setError("Custom lighting cannot exceed 10 characters");
      return;
    }

    if (color === "other" && customColor && customColor.length > 10) {
      setError("Custom color cannot exceed 10 characters");
      return;
    }

    if (mood === "other" && customMood && customMood.length > 10) {
      setError("Custom mood cannot exceed 10 characters");
      return;
    }

    if (
      environment === "other" &&
      customEnvironment &&
      customEnvironment.length > 10
    ) {
      setError("Custom environment cannot exceed 10 characters");
      return;
    }

    // 准备请求数据，只包含已选择的选项
    const requestData: any = {};

    if (subject) {
      requestData.subject = subject;
      if (subject === "other" && customSubject) {
        requestData.customSubject = customSubject;
      }
    }

    if (style) {
      requestData.style = style;
      if (style === "other" && customStyle) {
        requestData.customStyle = customStyle;
      }
    }

    if (quality) {
      requestData.quality = quality;
      if (quality === "other" && customQuality) {
        requestData.customQuality = customQuality;
      }
    }

    if (composition) {
      requestData.composition = composition;
      if (composition === "other" && customComposition) {
        requestData.customComposition = customComposition;
      }
    }

    if (lighting) {
      requestData.lighting = lighting;
      if (lighting === "other" && customLighting) {
        requestData.customLighting = customLighting;
      }
    }

    if (color) {
      requestData.color = color;
      if (color === "other" && customColor) {
        requestData.customColor = customColor;
      }
    }

    if (mood) {
      requestData.mood = mood;
      if (mood === "other" && customMood) {
        requestData.customMood = customMood;
      }
    }

    if (environment) {
      requestData.environment = environment;
      if (environment === "other" && customEnvironment) {
        requestData.customEnvironment = customEnvironment;
      }
    }

    setIsGenerating(true);
    try {
      const result = await apiClient.fetchWithError(
        "/api/generate-image-prompt",
        {
          method: "POST",
          body: JSON.stringify(requestData),
        }
      );

      if (result.success) {
        setGeneratedPrompt(result.prompt);
      } else {
        setError(result.error || "Failed to generate prompt");
        
        // Check if it's a Turnstile-related error
        if (
          result.error?.includes("TURNSTILE") ||
          result.error?.includes("Verification")
        ) {
          setShowTurnstile(true);
          setTurnstileToken(null);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate prompt";
      setError(errorMessage);

      // Check if it's a Turnstile-related error
      if (
        errorMessage.includes("TURNSTILE") ||
        errorMessage.includes("Verification")
      ) {
        setShowTurnstile(true);
        setTurnstileToken(null);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // 复制提示词
  const handleCopyPrompt = async () => {
    if (generatedPrompt) {
      try {
        await navigator.clipboard.writeText(generatedPrompt);
        setSuccess("Prompt copied to clipboard");
      } catch (err) {
        // 如果 Clipboard API 失败，使用备用方法
        const textArea = document.createElement("textarea");
        textArea.value = generatedPrompt;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          setSuccess("Prompt copied to clipboard");
        } catch (execErr) {
          setError("Failed to copy prompt");
        }
        document.body.removeChild(textArea);
      }
    }
  };

  // 重置表单
  const handleReset = () => {
    setSubject("");
    setStyle("");
    setQuality("");
    setComposition("");
    setLighting("");
    setColor("");
    setMood("");
    setEnvironment("");

    setCustomSubject("");
    setCustomStyle("");
    setCustomQuality("");
    setCustomComposition("");
    setCustomLighting("");
    setCustomColor("");
    setCustomMood("");
    setCustomEnvironment("");

    setGeneratedPrompt("");
    clearMessages();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <DimensionSelector
          label="Subject"
          value={subject}
          onChange={setSubject}
          options={IMAGE_PROMPT_SUBJECTS}
          onCustomChange={setCustomSubject}
          customValue={customSubject}
        />

        <DimensionSelector
          label="Style"
          value={style}
          onChange={setStyle}
          options={IMAGE_PROMPT_STYLES}
          onCustomChange={setCustomStyle}
          customValue={customStyle}
        />

        <DimensionSelector
          label="Quality"
          value={quality}
          onChange={setQuality}
          options={IMAGE_PROMPT_QUALITIES}
          onCustomChange={setCustomQuality}
          customValue={customQuality}
        />

        <DimensionSelector
          label="Composition"
          value={composition}
          onChange={setComposition}
          options={IMAGE_PROMPT_COMPOSITIONS}
          onCustomChange={setCustomComposition}
          customValue={customComposition}
        />

        <DimensionSelector
          label="Lighting"
          value={lighting}
          onChange={setLighting}
          options={IMAGE_PROMPT_LIGHTING}
          onCustomChange={setCustomLighting}
          customValue={customLighting}
        />

        <DimensionSelector
          label="Color"
          value={color}
          onChange={setColor}
          options={IMAGE_PROMPT_COLORS}
          onCustomChange={setCustomColor}
          customValue={customColor}
        />

        <DimensionSelector
          label="Mood"
          value={mood}
          onChange={setMood}
          options={IMAGE_PROMPT_MOODS}
          onCustomChange={setCustomMood}
          customValue={customMood}
        />

        <DimensionSelector
          label="Environment"
          value={environment}
          onChange={setEnvironment}
          options={IMAGE_PROMPT_ENVIRONMENTS}
          onCustomChange={setCustomEnvironment}
          customValue={customEnvironment}
        />
      </div>

      <div className="text-sm text-gray-500 italic">
        Tip: Select &quot;other&quot; to enter custom values for any dimension
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleGeneratePrompt}
          disabled={isGenerating || !turnstileToken}
          className="bg-blue-600 hover:bg-blue-700 text-white flex-1 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Wand2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : !turnstileToken ? (
            "Complete verification first"
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Prompt
            </>
          )}
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          className="border-gray-200 text-black hover:bg-gray-50 bg-transparent"
        >
          Reset
        </Button>
      </div>

      {/* Turnstile verification widget */}
      {showTurnstile && (
        <div>
          <TurnstileWidget
            siteKey={
              process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
              "0x4AAAAAAAxxxxxxxxxxxxxxxxxx"
            }
            onSuccess={handleTurnstileSuccess}
            onError={handleTurnstileError}
            onExpire={handleTurnstileExpire}
            theme="light"
            size="normal"
            className="flex justify-center"
          />
          {turnstileError && (
            <p className="text-red-600 text-sm mt-2 text-center">
              {turnstileError}
            </p>
          )}
        </div>
      )}

      {generatedPrompt && (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Wand2 className="w-5 h-5 mr-2 text-blue-600" />
              Optimized Prompt (Generated by AI)
            </h3>
            <div className="text-gray-800 bg-white p-3 rounded border border-gray-300 whitespace-pre-wrap">
              {generatedPrompt}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleCopyPrompt}
              variant="outline"
              className="flex-1 border-gray-200 text-black hover:bg-gray-50 bg-transparent"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Optimized Prompt
            </Button>
          </div>
        </div>
      )}

      {/* 错误和成功消息 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}
    </div>
  );
}
