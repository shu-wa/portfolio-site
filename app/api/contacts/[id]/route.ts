import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { contactTable, db } from "../../../../lib/db";
import { apiError, HttpError, requireAdmin, requireSameOrigin } from "../../../../lib/security";

export const runtime = "nodejs";
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    await requireAdmin(request);
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/.test(id)) throw new HttpError(400, "IDを確認してください。");
    await db.send(new DeleteCommand({ TableName: contactTable, Key: { id } }));
    return Response.json({ message: "お問い合わせを削除しました。" });
  } catch (error) { return apiError(error); }
}
