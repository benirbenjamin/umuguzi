import React from "react";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VideoPlayerClient from "./VideoPlayerClient";
import prisma from "@/lib/prisma";
import { VideoItem } from "@/types";

export default async function VideoPage({ params }: { params: { id: string } }) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            subscriberCount: true,
            isVerified: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        comments: {
          where: { parentId: null },
          include: {
            user: {
              select: { id: true, displayName: true, username: true, avatar: true },
            },
            replies: {
              include: {
                user: {
                  select: { id: true, displayName: true, username: true, avatar: true },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!video) {
      notFound();
    }

    const related = await prisma.video.findMany({
      where: {
        id: { not: video.id },
        status: "APPROVED",
        ...(video.categoryId ? { categoryId: video.categoryId } : {}),
      },
      include: {
        channel: {
          select: { id: true, name: true, handle: true, avatar: true, subscriberCount: true, isVerified: true },
        },
        category: { select: { id: true, name: true, slug: true } },
      },
      take: 8,
    });

    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <VideoPlayerClient
            initialVideo={video}
            relatedVideos={related as unknown as VideoItem[]}
          />
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("VideoPage render error:", error);
    notFound();
  }
}
