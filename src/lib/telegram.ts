export async function sendTelegramMessage(token: string, chatId: number | string, text: string) {
  return await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  }).then((r) => r.json());
}

export async function getTelegramFileBase64(token: string, fileId: string): Promise<string | null> {
  try {
    const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`).then((r) => r.json());
    if (!fileRes.ok || !fileRes.result?.file_path) return null;
    const downloadUrl = `https://api.telegram.org/file/bot${token}/${fileRes.result.file_path}`;
    const imgRes = await fetch(downloadUrl);
    const buffer = await imgRes.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  } catch {
    return null;
  }
}