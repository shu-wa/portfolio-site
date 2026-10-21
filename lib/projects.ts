import { GetCommand, ScanCommand, type ScanCommandOutput } from "@aws-sdk/lib-dynamodb";
import { projects as fallback } from "../data/projects";
import type { Project } from "../types/project";
import { db, projectTable } from "./db";
import { publicProjectList, toPublicProject, tsudowaPublic } from "./project-public";
import todoEventCalendar from "../data/todo-event-calendar.json";
import { currentRestaurantPublication, restaurantPublication } from "./restaurant-publication";

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
  const stored = await getStoredProjects();
  // Only explicitly published works supplement the stored catalog.
  const projects = [...stored];
  for (const source of [todoEventCalendar, restaurantPublication]) {
    if (!projects.some((project) => project.slug === source.slug)) projects.push(source);
  }
  return publicProjectList(projects.map(currentRestaurantPublication));
}

export async function getPublicProject(slug: string): Promise<Project | null> {
  const project = await getStoredProject(slug);
  return project ? toPublicProject(currentRestaurantPublication(project)) : null;
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
