"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClub, updateClub } from "@/actions/club";
import Link from "next/link";
import { StorageImage } from "@/components/storage-image";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { useState, useRef } from "react";

interface SocialLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  youtube?: string;
}

interface Club {
  id: string;
  name: string;
  description: string | null;
  curriculum: string | null;
  logoUrl: string | null;
  order: number;
  isActive: boolean;
  socialLinks: unknown;
}

export function ClubForm({ club }: { club?: Club }) {
  const [logoUrl, setLogoUrl] = useState<string>(club?.logoUrl || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const action = club ? updateClub.bind(null, club.id) : createClub;
  const socialLinks = (club?.socialLinks as SocialLinks) || {};

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("파일 크기는 5MB 이하만 가능합니다.");
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
      setLogoUrl(data.url);
    } catch {
      setError("업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/clubs"
          className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          동아리 목록
        </Link>
        <h1 className="text-2xl font-bold">
          {club ? "동아리 수정" : "새 동아리"}
        </h1>
      </div>

      <form action={action} className="max-w-2xl space-y-6">
        <input type="hidden" name="logoUrl" value={logoUrl} />

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
                이름 *
              </label>
              <Input name="name" defaultValue={club?.name || ""} required />
            </div>

            <div>
              <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
                순서
              </label>
              <Input
                name="order"
                type="number"
                defaultValue={club?.order || 0}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
              로고
            </label>
            <div className="flex items-start gap-4">
              {logoUrl ? (
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl bg-[hsl(var(--secondary))] overflow-hidden">
                    <StorageImage
                      src={logoUrl}
                      alt="로고 미리보기"
                      width={96}
                      height={96}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--muted-foreground))] transition-colors">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-[hsl(var(--muted-foreground))] mb-1" />
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        업로드
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
              <div className="flex-1">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  PNG, JPG, SVG 등 이미지 파일
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  최대 5MB
                </p>
                {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
              소개
            </label>
            <Textarea
              name="description"
              defaultValue={club?.description || ""}
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
              커리큘럼
            </label>
            <Textarea
              name="curriculum"
              defaultValue={club?.curriculum || ""}
              rows={2}
              placeholder="예: 시스템 해킹, 리버싱, 웹 해킹"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              defaultChecked={club?.isActive ?? true}
              className="w-4 h-4 rounded border-[hsl(var(--border))] bg-transparent"
            />
            <label
              htmlFor="isActive"
              className="text-sm text-[hsl(var(--muted-foreground))]"
            >
              활성화
            </label>
          </div>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 space-y-4">
          <h3 className="font-semibold">SNS 링크</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1.5">
                웹사이트
              </label>
              <Input
                name="website"
                defaultValue={socialLinks.website || ""}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1.5">
                Facebook
              </label>
              <Input
                name="facebook"
                defaultValue={socialLinks.facebook || ""}
              />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1.5">
                Instagram
              </label>
              <Input
                name="instagram"
                defaultValue={socialLinks.instagram || ""}
              />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1.5">
                GitHub
              </label>
              <Input name="github" defaultValue={socialLinks.github || ""} />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1.5">
                YouTube
              </label>
              <Input name="youtube" defaultValue={socialLinks.youtube || ""} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {club ? "수정" : "생성"}
          </button>
          <Link
            href="/admin/clubs"
            className="px-4 py-2 bg-[hsl(var(--secondary))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--secondary))]/80 transition-colors"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
