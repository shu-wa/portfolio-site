import restaurant from "../data/restaurant-order-system.json";
import type { Project } from "../types/project";

export const restaurantPublication: Project = restaurant;

export function currentRestaurantPublication(project: Project): Project {
  if (project.slug !== restaurant.slug) return project;
  const storedAt = typeof project.updatedAt === "string" ? Date.parse(project.updatedAt) : NaN;
  if (Number.isFinite(storedAt) && storedAt >= Date.parse(restaurant.updatedAt)) return project;
  // Publish the reviewed revision without mutating the editable store. Later admin edits win.
  return { ...restaurant, order: project.order ?? restaurant.order, createdAt: project.createdAt };
}
