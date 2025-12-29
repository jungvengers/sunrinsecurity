"use client";

import { useState, useRef } from "react";
import { StorageImage } from "@/components/storage-image";
import { Upload, X, Loader2 } from "lucide-react";
import { updateSettings } from "@/actions/settings";

export function BackgroundUploader({
  initialImage,
}: {
  initialImage: string;
}) {
  const [backgroundUrl, setBackgroundUrl] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("파일 크기는 10MB 이하만 가능합니다.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("업로드 실패");
      }

      const data = await response.json();
      setBackgroundUrl(data.url);
    } catch {
      setError("업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setBackgroundUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.append("key", "appearance");
    formData.append("backgroundImage", backgroundUrl);
    await updateSettings(formData);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-3">
          배경 이미지
        </label>

        {backgroundUrl ? (
          <div className="space-y-4">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
              <StorageImage
                src={backgroundUrl}
                alt="배경 미리보기"
                fill
                className="object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-white/80">선린인터넷고등학교</p>
                  <p className="text-2xl font-bold text-white">정보보호과</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-[hsl(var(--border))] cursor-pointer hover:border-[hsl(var(--muted-foreground))] transition-colors bg-[hsl(var(--secondary))]">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--muted-foreground))]" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-[hsl(var(--muted-foreground))] mb-2" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  클릭하여 이미지 업로드
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  PNG, JPG (최대 10MB)
                </span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}

        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
          비워두면 기본 검정 배경이 적용됩니다
        </p>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={uploading || saving}
        className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? "저장 중..." : "저장"}
      </button>
    </div>
  );
}
