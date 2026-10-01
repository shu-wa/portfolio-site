import { ScanCommand, type ScanCommandOutput } from "@aws-sdk/lib-dynamodb";
import { contactTable, db } from "../../../lib/db";
import { apiError, requireAdmin } from "../../../lib/security";

export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const items: Record<string, unknown>[] = [];
    let cursor: ScanCommandOutput["LastEvaluatedKey"];
    do {
      const result: ScanCommandOutput = await db.send(new ScanCommand({ TableName: contactTable, ExclusiveStartKey: cursor }));
      items.push(...(result.Items ?? []));
      cursor = result.LastEvaluatedKey;
    } while (cursor);
    const contacts = items.filter((item) => !String(item.id).startsWith("rate#")).sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
    return Response.json(contacts, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}
