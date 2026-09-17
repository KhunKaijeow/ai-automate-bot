import { NextResponse } from "next/server";
import { sendDailySummaryEmail, EmailMethod } from "@/lib/email";

export async function GET() {
  const targetEmail = process.env.DAILY_REPORT_EMAIL;
  if (!targetEmail) return NextResponse.json({ message: "No email configured" });

  const html = `
    <div style="font-family: sans-serif; background: #0f172a; color: #fff; padding: 24px; border-radius: 12px;">
      <h2>🌟 [AI Automation] สรุปรายงานประจำวัน</h2>
      <p>ระบบรวบรวมข้อมูลและส่งสรุปให้คุณเรียบร้อยแล้ว</p>
    </div>
  `;

  const result = await sendDailySummaryEmail({
    toEmail: targetEmail,
    subject: "⏰ [AI Digest] รายงานสรุปประจำวัน",
    htmlContent: html,
    method: (process.env.EMAIL_METHOD as EmailMethod) || "resend",
  });

  return NextResponse.json({ success: true, result });
}