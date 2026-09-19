import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required to purchase" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { paymentMethod = "WALLET", paymentReference } = body;

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { seller: { include: { wallet: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if buyer already owns entitlement
    const existing = await prisma.entitlement.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You already own this item.",
        downloadUrl: product.downloadUrl,
      });
    }

    const settings = await getSiteSettings();
    const commissionPercent = Number(settings.commission_rate) || 10;
    const platformFee = (product.price * commissionPercent) / 100;
    const sellerEarning = product.price - platformFee;

    // Create Order and Entitlement atomically in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const order = await tx.order.create({
        data: {
          buyerId: user.id,
          totalAmount: product.price,
          status: "COMPLETED",
          paymentMethod,
          paymentStatus: "PAID",
          paymentReference: paymentReference || null,
          items: {
            create: {
              productId: product.id,
              price: product.price,
            },
          },
        },
      });

      // 2. Grant Entitlement
      const entitlement = await tx.entitlement.create({
        data: {
          userId: user.id,
          productId: product.id,
        },
      });

      // 3. Update product sales counter
      await tx.product.update({
        where: { id: product.id },
        data: { salesCount: { increment: 1 } },
      });

      // 4. Credit seller wallet & ledger
      if (product.seller.wallet) {
        await tx.wallet.update({
          where: { id: product.seller.wallet.id },
          data: {
            availableBalance: { increment: sellerEarning },
            totalEarnings: { increment: sellerEarning },
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: product.seller.wallet.id,
            type: "SALE",
            amount: product.price,
            fee: platformFee,
            netAmount: sellerEarning,
            status: "COMPLETED",
            referenceId: order.id,
            description: `Sale earnings for digital product: "${product.title}"`,
          },
        });
      }

      return { order, entitlement };
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: product.sellerId,
        type: "SALE",
        title: "Digital Product Sold!",
        message: `Your item "${product.title}" was purchased. Earnings of ${sellerEarning} RWF credited to your wallet.`,
        link: `/dashboard/wallet`,
      },
    });

    return NextResponse.json({
      success: true,
      order: result.order,
      downloadUrl: product.downloadUrl,
    });
  } catch (error: any) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: "Failed to complete purchase" }, { status: 500 });
  }
}
