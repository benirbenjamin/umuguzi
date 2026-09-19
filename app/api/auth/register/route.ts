import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, generateSixDigitCode } from "@/lib/auth";
import { sendEmail, getVerificationEmailTemplate } from "@/lib/email";
import { getSiteSettings } from "@/lib/settings";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, displayName, password, ref } = body;

    if (!email || !username || !displayName || !password) {
      return NextResponse.json(
        { error: "Email, username, display name, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters and alphanumeric." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email or username already exists." },
        { status: 409 }
      );
    }

    // Check referrer if provided
    let referrerId: string | null = null;
    if (ref) {
      const referrer = await prisma.user.findFirst({
        where: {
          OR: [{ referralCode: ref }, { username: ref.toLowerCase() }],
        },
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    const passwordHash = await hashPassword(password);
    const verificationCode = generateSixDigitCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user and wallet atomically
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        displayName: displayName.trim(),
        passwordHash,
        isVerified: false,
        twoFactorEnabled: true,
        referredById: referrerId,
        wallet: {
          create: {
            availableBalance: 0,
            pendingBalance: 0,
            totalEarnings: 0,
            totalWithdrawn: 0,
            currency: "RWF",
          },
        },
        emailCodes: {
          create: {
            code: verificationCode,
            expiresAt,
          },
        },
      },
    });

    // Send verification email
    const settings = await getSiteSettings();
    await sendEmail({
      to: cleanEmail,
      subject: `Your ${settings.app_name} Verification Code: ${verificationCode}`,
      html: getVerificationEmailTemplate(verificationCode, settings.app_name),
      text: `Your ${settings.app_name} email verification code is: ${verificationCode}. Expires in 15 minutes.`,
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please enter the 6-digit verification code sent to your email.",
      email: cleanEmail,
      userId: user.id,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    const msg = error?.message || "An unexpected error occurred during registration.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
