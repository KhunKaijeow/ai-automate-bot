export type EmailMethod = "resend" | "google_apps_script";

export async function sendDailySummaryEmail({
  toEmail,
  subject,
  htmlContent,
  method = "resend",
  apiKey,
}: {
  toEmail: string;
  subject: string;
  htmlContent: string;
  method?: EmailMethod;
  apiKey?: string;
}) {
  // วิธีที่ 1: Google Apps Script Webhook Relay (ฟรี 100% ไม่ต้องมี Domain)
  if (method === "google_apps_script") {
    const scriptUrl = apiKey || process.env.GOOGLE_SCRIPT_WEBHOOK_URL;
    if (!scriptUrl) return { success: false, message: "ไม่พบ GOOGLE_SCRIPT_WEBHOOK_URL" };

    await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: toEmail, subject, htmlBody: htmlContent }),
    });
    return { success: true, message: `ส่งผ่าน Google Apps Script ไปยัง ${toEmail} สำเร็จ` };
  }

  // วิธีที่ 2: Resend Free Sandbox (ใช้ sender onboarding@resend.dev ส่งเข้า Gmail ตัวเองได้ทันที)
  const resendKey = apiKey || process.env.RESEND_API_KEY;
  if (!resendKey) return { success: false, message: "ไม่พบ RESEND_API_KEY" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "AI Automation Class <onboarding@resend.dev>",
      to: [toEmail],
      subject,
      html: htmlContent,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "ส่งอีเมลไม่สำเร็จ");
  return { success: true, message: `ส่งอีเมลสำเร็จไปยัง ${toEmail}`, details: data };
}