"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("不支持的文件类型，仅支持 JPG、PNG、GIF、WebP");
      return;
    }

    // 验证文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("文件大小超过限制（最大 10MB）");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("上传失败:", data.error);
        setError(data.error ?? "上传失败");
        return;
      }

      onChange(data.url);
    } catch (err) {
      console.error("上传失败:", err);
      setError(err instanceof Error ? err.message : "上传失败，请重试");
    } finally {
      setUploading(false);
      // 清空 input，允许重新选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange("");
    }
    setError("");
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <img
              src={value}
              alt="上传的图片"
              className="h-full w-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
            title="删除图片"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="mb-3 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <p className="text-sm text-slate-600">上传中...</p>
            </>
          ) : (
            <>
              <div className="mb-3 rounded-full bg-blue-100 p-3">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <p className="mb-1 text-sm font-medium text-slate-700">
                点击上传图片
              </p>
              <p className="text-xs text-slate-500">
                支持 JPG、PNG、GIF、WebP，最大 10MB
              </p>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
