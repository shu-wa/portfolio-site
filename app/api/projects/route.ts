import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { projects as fallbackProjects } from "../../../data/projects";
import type { Project } from "../../../types/project";

export const runtime = "nodejs";

const TABLE_NAME = "PortfolioProjects";
const REGION = "ap-southeast-2";

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!;

const dynamoDbClient = new DynamoDBClient({
  region: REGION,
});

const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

const verifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: "id",
  clientId,
});

async function verifyAdmin(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("認証情報がありません。");
  }

  const token = authorization.replace("Bearer ", "");
  await verifier.verify(token);
}

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
    return Response.json(fallbackProjects);
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdmin(request);

    const project = (await request.json()) as Project;

    if (!project.slug || !project.title || !project.description) {
      return Response.json(
        { error: "slug、title、descriptionは必須です。" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    await documentClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...project,
          tech: project.tech ?? [],
          features: project.features ?? [],
          designDecisions: project.designDecisions ?? [],
          problems: project.problems ?? [],
          learnings: project.learnings ?? [],
          future: project.future ?? [],
          createdAt: project.createdAt ?? now,
          updatedAt: now,
        },
      })
    );

    return Response.json({
      message: "作品を保存しました。",
    });
  } catch (error) {
    console.error("作品保存エラー", error);

    return Response.json(
      { error: "作品の保存に失敗しました。" },
      { status: 500 }
    );
  }
}