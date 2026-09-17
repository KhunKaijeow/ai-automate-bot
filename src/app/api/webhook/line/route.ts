import { NextRequest, NextResponse } from "next/server";
import { generateTyphoonResponse, TrackType } from "@/lib/typhoon";
import { getLineMessageContentBase64, replyLineMessage } from "@/lib/line";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const activeTrack = (process.env.ACTIVE_TRACK as TrackType) || "health";

  if (!token || !body.events) return NextResponse.json({ ok: true });

  for (const event of body.events) {
    if (event.type !== "message") continue;

    let imageBase64: string | undefined = undefined;
    if (event.message.type === "image") {
      imageBase64 = (await getLineMessageContentBase64(token, event.message.id)) || undefined;
    }

    const aiResult = await generateTyphoonResponse({
      track: activeTrack,
      userMessage: event.message.text || "วิเคราะห์ภาพอาหาร",
      imageBase64,
    });

    await replyLineMessage(token, event.replyToken, [{ type: "text", text: aiResult.reply }]);
  }

  return NextResponse.json({ ok: true });
}