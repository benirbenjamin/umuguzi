import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required to upload videos" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration = 180,
      accessType = "PUBLIC",
      price = 0,
      categoryId,
    } = body;

    if (!title || !videoUrl) {
      return NextResponse.json({ error: "Title and video URL are required" }, { status: 400 });
    }

    // Ensure user has a channel; if not, create one automatically
    let channel = await prisma.channel.findFirst({
      where: { ownerId: user.id },
    });

    if (!channel) {
      channel = await prisma.channel.create({
        data: {
          ownerId: user.id,
          name: `${user.displayName}'s Channel`,
          handle: user.username,
          description: `Official channel of ${user.displayName} on Umuguzipro.`,
          avatar: user.avatar,
        },
      });
    }

    // Generate unique slug
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = "video";
    let slug = `${baseSlug}-${Date.now().toString().slice(-5)}`;

    const video = await prisma.video.create({
      data: {
        channelId: channel.id,
        userId: user.id,
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl?.trim() || null,
        duration: Number(duration) || 0,
        accessType,
        accessLevel: accessType === "PREMIUM" ? "PREMIUM" : "ALL",
        price: Number(price) || 0,
        status: "APPROVED",
        categoryId: categoryId || null,
      },
      include: {
        channel: true,
      },
    });

    return NextResponse.json({ success: true, video });
  } catch (error: any) {
    console.error("Video upload error:", error);
    return NextResponse.json({ error: "Failed to publish video" }, { status: 500 });
  }
}
