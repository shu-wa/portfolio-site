import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { projects as fallbackProjects } from "../../../data/projects";
import type { Project } from "../../../types/project";

export const runtime = "nodejs";

const TABLE_NAME = "PortfolioProjects";
const REGION = "ap-southeast-2";

const dynamoDbClient = new DynamoDBClient({
  region: REGION,
});

const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export async function GET() {
  try {
    const result = await documentClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    const projects = (result.Items ?? []) as Project[];

    if (projects.length === 0) {
      return Response.json(fallbackProjects);
    }

    projects.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    return Response.json(projects);
  } catch (error) {
    console.error("作品一覧取得エラー", error);

    // DynamoDB未投入・ローカル確認時でもサイトが壊れないようにする
    return Response.json(fallbackProjects);
  }
}