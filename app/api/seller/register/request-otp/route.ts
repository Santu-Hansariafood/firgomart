import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/db";
import { getEmailOtpModel } from "@/lib/models/EmailOtp";
import { findSellerAcrossDBs } from "@/lib/models/Seller";
import nodemailer from "nodemailer";
import { getCommonEmailTemplate } from "@/lib/email/templates";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) throw new Error("Missing SMTP configuration");
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }
    const existingSeller = await findSellerAcrossDBs({ email: normalized });
    if (existingSeller) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    const conn = await connectDB();
    const EmailOtp = getEmailOtpModel(conn);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await (EmailOtp as any).deleteMany({
      email: normalized,
      purpose: "seller-register",
    });
    await (EmailOtp as any).create({
      email: normalized,
      purpose: "seller-register",
      code,
      expiresAt,
      verified: false,
    });
    const payload: Record<string, unknown> = { success: true };
    if (process.env.NODE_ENV !== "production") payload.otp = code;
    try {
      const transport = createTransport();
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || normalized;
      const subject = "FirgoMart | Verify your seller email";
      const html = getCommonEmailTemplate({
        title: "Verify your seller email",
        greeting: "Hi there",
        message: "Thank you for choosing <strong>FirgoMart</strong>. To keep your account secure, we need to verify your email address before you can continue with the seller registration.",
        otp: code,
        expiryText: "This code is valid for 10 minutes.",
        warningText: "If you did not request this email, you can safely ignore it. Your seller account will not be created without completing this verification."
      });
      await transport.sendMail({
        from,
        to: normalized,
        subject,
        text: `Your OTP for seller registration is ${code}. It is valid for 10 minutes.`,
        html,
      });
      return NextResponse.json(payload, { status: 200 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      if (process.env.NODE_ENV !== "production") {
        console.error("Email OTP send failed (dev fallback)", msg);
        return NextResponse.json(payload, { status: 200 });
      }
      throw e;
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Server error", reason },
      { status: 500 }
    );
  }
}
