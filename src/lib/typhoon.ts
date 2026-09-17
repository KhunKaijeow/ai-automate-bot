import OpenAI from "openai";

export const TYPHOON_API_BASE = "https://api.opentyphoon.ai/v1";

export const TYPHOON_MODELS = {
  TEXT: "typhoon-v1.5x-70b-instruct",
  VISION: "typhoon-v1.5x-vision",
};

export function getTyphoonClient(apiKey?: string) {
  const key = apiKey || process.env.TYPHOON_API_KEY;
  if (!key) return null;
  return new OpenAI({
    apiKey: key,
    baseURL: TYPHOON_API_BASE,
  });
}

export type TrackType = "fortune" | "self_dev" | "health";

export async function generateTyphoonResponse({
  track,
  userMessage,
  imageBase64,
  knowledgeContent,
  apiKey,
}: {
  track: TrackType;
  userMessage: string;
  imageBase64?: string;
  knowledgeContent?: string;
  apiKey?: string;
}): Promise<{ reply: string; modelUsed: string }> {
  const client = getTyphoonClient(apiKey);

  let systemRole = "";
  if (track === "fortune") {
    systemRole = "คุณคืออาจารย์หมอดูและผู้เชี่ยวชาญด้านโหราศาสตร์ AI ที่รอบรู้ สุภาพ และให้กำลังใจเสมอ หากมีภาพถ่ายลายมือหรือใบหน้า ให้วิเคราะห์ตามหลักการพยากรณ์";
  } else if (track === "self_dev") {
    systemRole = "คุณคือ AI Life Coach & Productivity Mentor ผู้ช่วยวางแผนชีวิต ตั้งเป้าหมาย SMART Goals ปรับใช้เทคนิค Atomic Habits และชวนทบทวนตัวเองประจำวัน";
  } else if (track === "health") {
    systemRole = "คุณคือ AI Nutritionist & Health Assistant ผู้เชี่ยวชาญด้านโภชนาการ หากได้รับภาพถ่ายอาหาร ให้ตรวจจับเมนู ประมาณการแคลอรี่ และให้คำแนะนำโภชนาการ";
  }

  const fullSystemPrompt = `${systemRole}

=== องค์ความรู้เฉพาะทาง (KNOWLEDGE BASE) ===
${knowledgeContent || "ใช้ความรู้มาตรฐานในการให้ข้อมูลที่ถูกต้อง"}
============================================

ตอบเป็นภาษาไทยเสมอ จัดรูปแบบด้วย Markdown หัวข้อย่อยและ Emoji ให้อ่านง่าย`;

  if (!client) {
    return {
      reply: "กรุณาระบุ TYPHOON_API_KEY ในไฟล์ .env หรือตั้งค่าบน Cloudflare",
      modelUsed: "Mock Fallback",
    };
  }

  try {
    if (imageBase64) {
      // เรียกโมเดล Vision พร้อมรูปภาพ
      const response = await client.chat.completions.create({
        model: TYPHOON_MODELS.VISION,
        messages: [
          { role: "system", content: fullSystemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userMessage || "กรุณาวิเคราะห์ภาพนี้ตามหลักองค์ความรู้" },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.6,
        max_tokens: 1000,
      });

      return {
        reply: response.choices[0]?.message?.content || "ไม่สามารถวิเคราะห์ภาพได้",
        modelUsed: TYPHOON_MODELS.VISION,
      };
    } else {
      // เรียกโมเดล Text
      const response = await client.chat.completions.create({
        model: TYPHOON_MODELS.TEXT,
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        reply: response.choices[0]?.message?.content || "ไม่ได้รับคำตอบจากระบบ",
        modelUsed: TYPHOON_MODELS.TEXT,
      };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      reply: `เกิดข้อผิดพลาดในการเรียก Typhoon AI: ${errorMessage}`,
      modelUsed: "Error Handler",
    };
  }
}