"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface ImageUploaderProps {
  onUploadComplete: (imageUrl: string) => void;
  disabled?: boolean;
}

export default function ImageUploader({
  onUploadComplete,
  disabled,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드 가능합니다.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("파일 크기는 10MB 이하여야 합니다.");
        return;
      }

      setPreview(URL.createObjectURL(file));
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      setUploading(false);

      if (!res.ok) {
        toast.error(data.error ?? "업로드 실패");
        setPreview(null);
        return;
      }

      toast.success("이미지 업로드 완료!");
      onUploadComplete(data.imageUrl);
    },
    [onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="w-full">
      <label
        htmlFor="image-input"
        className={cn(
          "relative flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all",
          dragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
          (disabled || uploading) && "pointer-events-none opacity-60"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative h-64 w-full overflow-hidden rounded-2xl">
            <Image
              src={preview}
              alt="업로드 미리보기"
              fill
              className="object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                <div className="flex flex-col items-center gap-3 text-white">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="text-sm font-medium">업로드 중...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <span className="text-3xl">📸</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">
                사진을 드래그하거나 클릭해서 업로드
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                정면 전신 사진 1장 • JPEG / PNG / WebP • 최대 10MB
              </p>
            </div>
            <div className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              파일 선택
            </div>
          </div>
        )}

        <input
          id="image-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleChange}
          disabled={disabled || uploading}
        />
      </label>

      {preview && !uploading && (
        <button
          onClick={() => setPreview(null)}
          className="mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          다른 사진 선택
        </button>
      )}
    </div>
  );
}
