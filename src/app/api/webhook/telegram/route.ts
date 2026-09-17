import { NextRequest, NextResponse } from "next/server";
import { generateTyphoonResponse, TrackType } from "@/lib/typhoon";
import { getTelegramFileBase64, sendTelegramMessage } from "@/lib/telegram";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const activeTrack = (process.env.ACTIVE_TRACK as TrackType) || "fortune";

  if (!body.message || !botToken) return NextResponse.json({ ok: true });

  const chatId = body.message.chat?.id;
  const text = body.message.text || body.message.caption || "";
  const photos = body.message.photo;

  let imageBase64: string | undefined = undefined;
  if (photos && photos.length > 0) {
    const fileId = photos[photos.length - 1].file_id;
    imageBase64 = (await getTelegramFileBase64(botToken, fileId)) || undefined;
  }

  const aiResult = await generateTyphoonResponse({
    track: activeTrack,
    userMessage: text || "กรุณาวิเคราะห์ภาพนี้",
    imageBase64,
  });

  await sendTelegramMessage(botToken, chatId, aiResult.reply);
  return NextResponse.json({ ok: true });
}