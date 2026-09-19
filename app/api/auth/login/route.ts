import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, generateSixDigitCode, signToken } from "@/lib/auth";
import { sendEmail, getTwoFactorEmailTemplate } from "@/lib/email";
import { getSiteSettings } from "@/lib/settings";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email/username and password." },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: "This account has been suspended. Please contact platform administration." },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email/username and password." },
        { status: 401 }
      );
    }

    // Two-Factor Authentication Flow
    const twoFactorCode = generateSixDigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store 2FA code securely in DB
    await prisma.twoFactorCode.deleteMany({ where: { userId: user.id } });
    await prisma.twoFactorCode.create({
      data: {
        userId: user.id,
        code: twoFactorCode,
        expiresAt,
      },
    });

    // Send 2FA code via email
    const settings = await getSiteSettings();
    await sendEmail({
      to: user.email,
      subject: `Your ${settings.app_name} Login 2FA Code: ${twoFactorCode}`,
      html: getTwoFactorEmailTemplate(twoFactorCode, settings.app_name),
      text: `Your ${settings.app_name} 2FA security code is: ${twoFactorCode}. Valid for 10 minutes.`,
    });

    // Generate a temporary 2FA token so user can verify
    const pendingToken = signToken({ userId: user.id, purpose: "2FA" }, "15m");

    const response = NextResponse.json({
      success: true,
      requires2FA: true,
      email: user.email.replace(/(.{2})(.*)(?=@)/, (_m, p1, p2) => p1 + "*".repeat(p2.length)),
      message: "Password verified. A 6-digit 2FA code has been sent to your email.",
    });

    // Set pending 2FA cookie
    response.cookies.set("umuguzi_2fa_pending", pendingToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during login." }, { status: 500 });
  }
}
