import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, ["ADMIN", "SUPER_ADMIN", "MODERATOR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
              { displayName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        isVerified: true,
        isBanned: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, ["ADMIN", "SUPER_ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserId, action, role } = body;

    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let updatedData: any = {};
    if (action === "BAN") updatedData.isBanned = true;
    if (action === "UNBAN") updatedData.isBanned = false;
    if (action === "VERIFY") updatedData.isVerified = true;
    if (action === "UNVERIFY") updatedData.isVerified = false;
    if (action === "CHANGE_ROLE" && role) updatedData.role = role;

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: updatedData,
    });

    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: `USER_${action}`,
        targetType: "USER",
        targetId: targetUserId,
        metadata: { action, role, targetEmail: target.email },
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Admin user action error:", error);
    return NextResponse.json({ error: "Failed to perform user action" }, { status: 500 });
  }
}
