"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  CheckCircle2,
  Bell,
  MessageSquare,
  QrCode,
  Copy,
  Check,
  Play,
  Lock,
  Sparkles,
} from "lucide-react";
import VideoCard from "@/components/video/VideoCard";
import { useApp } from "@/components/providers/AppProviders";
import { formatCompactNumber, timeAgo, formatCurrency } from "@/lib/utils";

export default function VideoPlayerClient({
  initialVideo,
  relatedVideos,
}: {
  initialVideo: any;
  relatedVideos: any[];
}) {
  const { user } = useApp();
  const [video, setVideo] = useState(initialVideo);
  const [likes, setLikes] = useState<number>(Number(initialVideo.likes) || 0);
  const [userLiked, setUserLiked] = useState<boolean | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>(initialVideo.comments || []);
  const [submittingComment, setSubmittingComment] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const viewRecordedRef = useRef(false);

  // Track View on play
  const handlePlay = () => {
    if (!viewRecordedRef.current) {
      viewRecordedRef.current = true;
      fetch(`/api/videos/${video.id}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device: "web", country: "Rwanda" }),
      }).catch(console.error);
    }
  };

  const handleLike = async (isLike: boolean) => {
    if (!user) {
      window.location.href = `/login?redirect=/video/${video.id}`;
      return;
    }

    try {
      const res = await fetch(`/api/videos/${video.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLike }),
      });
      const data = await res.json();
      if (data.action === "liked") {
        setLikes((prev: number) => prev + 1);
        setUserLiked(true);
      } else if (data.action === "removed") {
        setLikes((prev: number) => Math.max(0, prev - 1));
        setUserLiked(null);
      } else {
        setUserLiked(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/video/${video.id}`;
      return;
    }
    setIsSubscribed(!isSubscribed);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = `/login?redirect=/video/${video.id}`;
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/videos/${video.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setComments([data.comment, ...comments]);
        setCommentText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/video/${video.id}${user?.referralCode ? `?ref=${user.referralCode}` : ""}`
    : "";

  const copyShareLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Helper to determine if video is YouTube or direct file
  const isYouTube = video.videoUrl?.includes("youtube.com") || video.videoUrl?.includes("youtu.be");
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
      : url;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left 2 Cols: Main Player & Details */}
      <div className="lg:col-span-2 space-y-5">
        {/* Video Player Box */}
        <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          {isYouTube ? (
            <iframe
              src={getYouTubeEmbedUrl(video.videoUrl)}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
              onLoad={handlePlay}
            />
          ) : (
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.thumbnailUrl || undefined}
              controls
              autoPlay
              onPlay={handlePlay}
              className="w-full h-full object-contain"
            />
          )}

          {/* Premium Lock Overlay if unpaid premium */}
          {video.accessType === "PREMIUM" && video.price > 0 && !user && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Premium Content</h3>
              <p className="text-xs text-slate-300 max-w-md">
                This creator video is premium. Purchase instant access for {formatCurrency(video.price)} to unlock full HD playback.
              </p>
              <Link
                href={`/login?redirect=/video/${video.id}`}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Sign In to Unlock ({formatCurrency(video.price)})
              </Link>
            </div>
          )}
        </div>

        {/* Video Title & Actions */}
        <div className="space-y-4">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            {/* Channel Info */}
            <div className="flex items-center gap-3">
              <Link href={`/channel/${video.channel.handle}`}>
                {video.channel.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.channel.avatar}
                    alt={video.channel.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center font-bold text-base">
                    {video.channel.name.charAt(0)}
                  </div>
                )}
              </Link>

              <div>
                <Link
                  href={`/channel/${video.channel.handle}`}
                  className="flex items-center gap-1 font-bold text-sm text-slate-900 hover:text-brand"
                >
                  <span>{video.channel.name}</span>
                  {video.channel.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                  )}
                </Link>
                <p className="text-xs text-slate-500">
                  {formatCompactNumber(video.channel.subscriberCount)} subscribers
                </p>
              </div>

              <button
                onClick={handleSubscribe}
                className={`ml-4 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                  isSubscribed
                    ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                    : "bg-slate-900 hover:bg-brand text-white"
                }`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>

            {/* Action Buttons: Like, Dislike, Share */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-full bg-slate-100 p-1 border border-slate-200/80">
                <button
                  onClick={() => handleLike(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    userLiked === true ? "text-brand bg-white shadow-sm" : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{formatCompactNumber(likes)}</span>
                </button>
                <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                <button
                  onClick={() => handleLike(false)}
                  className={`p-1.5 rounded-full text-xs transition-colors ${
                    userLiked === false ? "text-red-600 bg-white shadow-sm" : "text-slate-700 hover:bg-slate-200"
                  }`}
                  aria-label="Dislike"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShareModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors border border-slate-200/80 shadow-sm"
              >
                <Share2 className="w-4 h-4 text-brand" />
                <span>Share &amp; Earn</span>
              </button>
            </div>
          </div>

          {/* Description Box */}
          <div className="p-4 rounded-2xl bg-slate-100/70 text-slate-800 text-xs sm:text-sm space-y-2 leading-relaxed">
            <div className="flex items-center gap-3 font-semibold text-slate-600 text-xs">
              <span>{formatCompactNumber(video.views)} views</span>
              <span>&bull;</span>
              <span>Published {timeAgo(video.createdAt)}</span>
              {video.category && (
                <>
                  <span>&bull;</span>
                  <span className="text-brand">#{video.category.name}</span>
                </>
              )}
            </div>
            <p className="whitespace-pre-line text-slate-700">{video.description || "No description provided."}</p>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              <h3 className="font-extrabold text-base text-slate-900">
                {comments.length} Comments
              </h3>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handlePostComment} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.displayName?.charAt(0) || "U"}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={user ? "Add a respectful comment..." : "Sign in to join the conversation"}
                  disabled={!user || submittingComment}
                  className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white"
                />
                {user && commentText.trim() && (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setCommentText("")}
                      className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="px-4 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      {submittingComment ? "Posting..." : "Comment"}
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* Comment List */}
            <div className="space-y-4 pt-2">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3 text-xs sm:text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {comment.user.displayName.charAt(0)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{comment.user.displayName}</span>
                      <span className="text-[11px] text-slate-400">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Col: Related Videos Sidebar */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
          Related Videos
        </h3>
        <div className="flex flex-col gap-4">
          {relatedVideos.map((item) => (
            <VideoCard key={item.id} video={item} />
          ))}
        </div>
      </div>

      {/* Share & Affiliate Referral Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-lg text-slate-900">Share &amp; Earn</h3>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Share this video with friends or social networks. Anyone who registers or purchases through your link will earn you referral commissions in your Umuguzipro wallet!
            </p>

            {/* Referral Link Box */}
            <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="bg-transparent text-xs text-slate-700 flex-1 outline-none font-mono"
              />
              <button
                onClick={copyShareLink}
                className="px-3 py-1.5 bg-brand text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out this video on Umuguzipro: ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(video.title)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition-colors"
              >
                Twitter / X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
