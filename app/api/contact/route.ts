import { createHash, randomUUID } from "node:crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { contactTable, db } from "../../../lib/db";
import { apiError, HttpError, readJson, requireSameOrigin } from "../../../lib/security";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request, 16_000);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new HttpError(400, "入力内容を確認してください。");
    const input = body as Record<string, unknown>;
    const field = (key: string, max: number) => {
      const value = input[key];
      if (typeof value !== "string" || !value.trim() || value.length > max) throw new HttpError(400, "入力内容を確認してください。");
      return value.trim();
    };
    const name = field("name", 100), email = field("email", 254), message = field("message", 5000);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email)) throw new HttpError(400, "メールアドレスを確認してください。");
    if (input.website) return Response.json({ message: "お問い合わせを受け付けました。" });
    // Conditional slots enforce a shared limit without requiring a new IAM action.
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = (Math.floor(now / 3600) + 1) * 3600;
    const key = createHash("sha256").update(email.toLowerCase()).digest("hex");
    let reserved = false;
    for (let slot = 0; slot < 3; slot++) {
      try {
        await db.send(new PutCommand({
          TableName: contactTable, Item: { id: `rate#${key}#${slot}`, expiresAt },
          ConditionExpression: "attribute_not_exists(id) OR expiresAt <= :now",
          ExpressionAttributeValues: { ":now": now },
        }));
        reserved = true;
        break;
      } catch (error) {
        if (!(error instanceof Error) || error.name !== "ConditionalCheckFailedException") throw error;
      }
    }
    if (!reserved) throw new HttpError(429, "送信回数が多いため、時間をおいてお試しください。");
    await db.send(new PutCommand({ TableName: contactTable, Item: { id: randomUUID(), name, email, message, createdAt: new Date().toISOString() } }));
    return Response.json({ message: "お問い合わせを受け付けました。" });
  } catch (error) { return apiError(error); }
}
