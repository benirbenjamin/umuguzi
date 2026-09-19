"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Video, Image as ImageIcon, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function StudioUploadPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [duration, setDuration] = useState("180");
  const [accessType, setAccessType] = useState<"PUBLIC" | "PRIVATE" | "PREMIUM">("PUBLIC");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch video categories
    fetch("/api/categories?type=VIDEO")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "video" | "thumbnail") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (target === "video") {
        setVideoUrl(data.url);
      } else {
        setThumbnailUrl(data.url);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !videoUrl) {
      setError("Title and video URL/file are required.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/videos/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          thumbnailUrl,
          duration: Number(duration) || 180,
          accessType,
          price: accessType === "PREMIUM" ? Number(price) : 0,
          categoryId: categoryId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish video");

      setSuccess(true);
      setTimeout(() => {
        router.push(`/video/${data.video.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900">Upload &amp; Publish Video</h1>
        <p className="text-xs text-slate-500">
          Share your content with Rwanda and global viewers. Configure access type and monetization.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-10 space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Video Published Successfully!</h3>
            <p className="text-xs text-slate-500">Redirecting to your video page...</p>
          </div>
        ) : (
          <form onSubmit={handlePublish} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Video Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your video a catchy title..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Video File or URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Video Source (Direct File or YouTube/Vimeo URL) *
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste direct MP4/WebM URL or YouTube link..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand font-mono text-xs"
                />
                <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0">
                  <Video className="w-4 h-4 text-brand" />
                  <span>{uploadingFile ? "Uploading..." : "Upload File"}</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, "video")}
                    className="hidden"
                    disabled={uploadingFile}
                  />
                </label>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Thumbnail Image (Optional)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://... or upload image"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand font-mono text-xs"
                />
                <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0">
                  <ImageIcon className="w-4 h-4 text-brand" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "thumbnail")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Category & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Duration (Seconds)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 180"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            {/* Visibility / Access Type */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Visibility &amp; Access Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAccessType("PUBLIC")}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                    accessType === "PUBLIC"
                      ? "border-brand bg-blue-50 text-brand ring-2 ring-brand/20"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Public (Free)
                </button>
                <button
                  type="button"
                  onClick={() => setAccessType("PREMIUM")}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                    accessType === "PREMIUM"
                      ? "border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Premium (Paid)
                </button>
                <button
                  type="button"
                  onClick={() => setAccessType("PRIVATE")}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                    accessType === "PRIVATE"
                      ? "border-slate-800 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Private
                </button>
              </div>

              {accessType === "PREMIUM" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 mt-2">
                  <label className="block text-xs font-bold text-amber-900">
                    Pay-per-view Price (RWF)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 text-sm bg-white"
                  />
                  <p className="text-[11px] text-amber-700">
                    Viewers will be required to unlock this video via Flutterwave or MoMo before playing.
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers what your video is about, credit collaborators, or add social tags..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || uploadingFile}
              className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Publishing Video..." : "Publish to Umuguzipro"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
