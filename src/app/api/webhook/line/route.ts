import { NextRequest, NextResponse } from "next/server";
import { generateTyphoonResponse, TrackType } from "@/lib/typhoon";
import { getLineMessageContentBase64, replyLineMessage } from "@/lib/line";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("LINE Webhook received:", JSON.stringify(body));

    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const activeTrack = (process.env.ACTIVE_TRACK as TrackType) || "health";

    if (!token) {
      console.error("LINE_CHANNEL_ACCESS_TOKEN is missing in process.env");
      return NextResponse.json({ ok: true });
    }

    if (!body.events || !Array.isArray(body.events)) {
      console.log("No events array in webhook payload");
      return NextResponse.json({ ok: true });
    }

    for (const event of body.events) {
      if (event.type !== "message") continue;

      let imageBase64: string | undefined = undefined;
      if (event.message?.type === "image") {
        imageBase64 = (await getLineMessageContentBase64(token, event.message.id)) || undefined;
      }

      const userMessage = event.message?.text || (event.message?.type === "image" ? "วิเคราะห์ภาพอาหาร" : "");
      if (!userMessage && !imageBase64) continue;

      console.log(`Processing LINE message: "${userMessage}", activeTrack: ${activeTrack}`);

      const aiResult = await generateTyphoonResponse({
        track: activeTrack,
        userMessage: userMessage || "สวัสดี",
        imageBase64,
      });

      console.log("AI reply result:", aiResult.reply);

      const replyRes = await replyLineMessage(token, event.replyToken, [{ type: "text", text: aiResult.reply }]);
      console.log("LINE reply response:", replyRes);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error processing LINE webhook:", err);
    return NextResponse.json({ ok: true });
  }
}