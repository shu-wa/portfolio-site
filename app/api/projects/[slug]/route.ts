import { DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { db, projectTable } from "../../../../lib/db";
import { getStoredProject } from "../../../../lib/projects";
import { toPublicProject } from "../../../../lib/project-public";
import { parseProject, validSlug } from "../../../../lib/project-input";
import { apiError, HttpError, readJson, requireAdmin, requireSameOrigin } from "../../../../lib/security";

export const runtime = "nodejs";
type Context = { params: Promise<{ slug: string }> };
export async function GET(_request: Request, { params }: Context) {
  try {
    const { slug } = await params;
    if (!validSlug(slug)) throw new HttpError(404, "作品が見つかりません。");
    const project = await getStoredProject(slug);
    if (!project) throw new HttpError(404, "作品が見つかりません。");
    return Response.json(toPublicProject(project), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    requireSameOrigin(request);
    await requireAdmin(request);
    const { slug } = await params;
    const project = parseProject(await readJson(request));
    if (project.slug !== slug) throw new HttpError(400, "slugは変更できません。");
    const previous = await getStoredProject(slug);
    const now = new Date().toISOString();
    await db.send(new PutCommand({ TableName: projectTable, Item: { ...project, createdAt: previous?.createdAt ?? now, updatedAt: now } }));
    return Response.json({ message: "作品を更新しました。" });
  } catch (error) { return apiError(error); }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    requireSameOrigin(request);
    await requireAdmin(request);
    const { slug } = await params;
    if (!validSlug(slug)) throw new HttpError(400, "slugを確認してください。");
    await db.send(new DeleteCommand({ TableName: projectTable, Key: { slug } }));
    return Response.json({ message: "作品を削除しました。" });
  } catch (error) { return apiError(error); }
}
