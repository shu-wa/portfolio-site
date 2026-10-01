import { GetCommand, ScanCommand, type ScanCommandOutput } from "@aws-sdk/lib-dynamodb";
import { projects as fallback } from "../data/projects";
import type { Project } from "../types/project";
import { db, projectTable } from "./db";
import { publicProjectList, tsudowaPublic } from "./project-public";

export async function getStoredProjects(fallbackOnError = true): Promise<Project[]> {
  try {
    const items: Project[] = [];
    let cursor: ScanCommandOutput["LastEvaluatedKey"];
    do {
      const result: ScanCommandOutput = await db.send(new ScanCommand({ TableName: projectTable, ExclusiveStartKey: cursor }));
      items.push(...(result.Items ?? []) as Project[]);
      cursor = result.LastEvaluatedKey;
    } while (cursor);
    return items.length || !fallbackOnError ? items : [tsudowaPublic, ...fallback];
  } catch (error) {
    if (!fallbackOnError) throw error;
    console.error("Project store unavailable; using public fallback.");
    return [tsudowaPublic, ...fallback];
  }
}

export async function getPublicProjects() {
  return publicProjectList(await getStoredProjects());
}

export async function getStoredProject(slug: string): Promise<Project | null> {
  try {
    const result = await db.send(new GetCommand({ TableName: projectTable, Key: { slug } }));
    if (result.Item) return result.Item as Project;
  } catch {
    console.error("Project read unavailable; using public fallback.");
  }
  return [tsudowaPublic, ...fallback].find((project) => project.slug === slug) ?? null;
}
