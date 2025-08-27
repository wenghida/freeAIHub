"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageUpload, disabled = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 重置状态
    setError(null);
    setPreviewUrl(null);

    // 客户端验证
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("只支持 JPEG、PNG、WebP 和 GIF 格式的图片");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("图片大小不能超过 10MB");
      return;
    }

    // 创建预览
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrl(previewUrl);

    // 开始上传
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      const data = await response.json();
      
      if (data.success) {
        onImageUpload(data.url);
        toast({
          title: "上传成功",
          description: "图片已成功上传，现在可以使用图生图功能了",
        });
      } else {
        throw new Error(data.error || "上传失败");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "上传过程中发生错误");
      // 清除预览
      setPreviewUrl(null);
      URL.revokeObjectURL(previewUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onImageUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-upload">上传图片</Label>
        <div className="mt-1">
          <Input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            ref={fileInputRef}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            disabled={disabled || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                选择图片
              </>
            )}
          </Button>
        </div>
      </div>

      {previewUrl && (
        <div className="relative mt-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 rounded-full"
              onClick={removeImage}
              disabled={isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!previewUrl && !isUploading && (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          <span className="ml-2">尚未选择图片</span>
        </div>
      )}
    </div>
  );
}