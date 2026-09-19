import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, ["ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: { select: { id: true, displayName: true, username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, ["ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { withdrawalId, action, adminNote } = body; // action: 'APPROVE' | 'PAID' | 'REJECT'

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { wallet: true },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    if (action === "PAID") {
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "PAID",
            adminNote,
            processedAt: new Date(),
          },
        }),
        prisma.wallet.update({
          where: { id: withdrawal.walletId },
          data: { totalWithdrawn: { increment: withdrawal.amount } },
        }),
      ]);
    } else if (action === "REJECT") {
      // Refund the money back into the user's available balance!
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "REJECTED",
            adminNote: adminNote || "Rejected by administration",
            processedAt: new Date(),
          },
        }),
        prisma.wallet.update({
          where: { id: withdrawal.walletId },
          data: { availableBalance: { increment: withdrawal.amount } },
        }),
        prisma.walletTransaction.create({
          data: {
            walletId: withdrawal.walletId,
            type: "REFUND",
            amount: withdrawal.amount,
            fee: 0,
            netAmount: withdrawal.amount,
            status: "COMPLETED",
            referenceId: withdrawal.id,
            description: `Refund for rejected withdrawal: ${adminNote || "Administrative rejection"}`,
          },
        }),
      ]);
    } else if (action === "APPROVE") {
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "PROCESSING", adminNote },
      });
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: `WITHDRAWAL_${action}`,
        targetType: "WITHDRAWAL",
        targetId: withdrawalId,
        metadata: { amount: withdrawal.amount, action, adminNote },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Process withdrawal error:", error);
    return NextResponse.json({ error: "Failed to process withdrawal" }, { status: 500 });
  }
}
