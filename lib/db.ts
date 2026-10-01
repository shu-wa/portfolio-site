import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const projectTable = process.env.DYNAMODB_PROJECTS_TABLE_NAME ?? "PortfolioProjects";
export const contactTable = process.env.DYNAMODB_CONTACTS_TABLE_NAME ?? "PortfolioContacts";
export const db = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.DYNAMODB_REGION ?? "ap-southeast-2",
  maxAttempts: 2,
}), { marshallOptions: { removeUndefinedValues: true } });
