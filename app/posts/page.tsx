import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PostsClient from "./PostsClient";
import prisma from "@/lib/prisma";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    include: {
      user: { select: { id: true, displayName: true, username: true, avatar: true, role: true } },
      comments: {
        include: {
          user: { select: { id: true, displayName: true, username: true, avatar: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostsClient initialPosts={posts} />
      </main>
      <Footer />
    </div>
  );
}
