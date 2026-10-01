import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { db, projectTable } from "../../../lib/db";
import { getPublicProjects, getStoredProjects } from "../../../lib/projects";
import { parseProject } from "../../../lib/project-input";
import { apiError, readJson, requireAdmin, requireSameOrigin } from "../../../lib/security";

export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    if (new URL(request.url).searchParams.get("view") === "admin") {
      await requireAdmin(request);
      return Response.json(await getStoredProjects(false), { headers: { "Cache-Control": "private, no-store" } });
    }
    return Response.json(await getPublicProjects(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    await requireAdmin(request);
    const project = parseProject(await readJson(request));
    const now = new Date().toISOString();
    await db.send(new PutCommand({ TableName: projectTable, Item: { ...project, createdAt: now, updatedAt: now } }));
    return Response.json({ message: "作品を保存しました。" });
  } catch (error) { return apiError(error); }
}
