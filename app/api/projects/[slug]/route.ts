import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { projects as fallbackProjects } from "../../../../data/projects";
import type { Project } from "../../../../types/project";

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

type ProjectApiProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function verifyAdmin(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("認証情報がありません。");
  }

  const token = authorization.replace("Bearer ", "");
  await verifier.verify(token);
}

export async function GET(_request: Request, { params }: ProjectApiProps) {
  const { slug } = await params;

  try {
    const result = await documentClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          slug,
        },
      })
    );

    if (result.Item) {
      return Response.json(result.Item);
    }

    const fallbackProject = fallbackProjects.find(
      (project) => project.slug === slug
    );

    if (!fallbackProject) {
      return Response.json(
        { error: "作品が見つかりません。" },
        { status: 404 }
      );
    }

    return Response.json(fallbackProject);
  } catch (error) {
    console.error("作品詳細取得エラー", error);

    const fallbackProject = fallbackProjects.find(
      (project) => project.slug === slug
    );

    if (!fallbackProject) {
      return Response.json(
        { error: "作品が見つかりません。" },
        { status: 404 }
      );
    }

    return Response.json(fallbackProject);
  }
}

export async function PUT(request: Request, { params }: ProjectApiProps) {
  try {
    await verifyAdmin(request);

    const { slug } = await params;
    const project = (await request.json()) as Project;

    const now = new Date().toISOString();

    await documentClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...project,
          slug,
          tech: project.tech ?? [],
          features: project.features ?? [],
          designDecisions: project.designDecisions ?? [],
          problems: project.problems ?? [],
          learnings: project.learnings ?? [],
          future: project.future ?? [],
          updatedAt: now,
        },
      })
    );

    return Response.json({
      message: "作品を更新しました。",
    });
  } catch (error) {
    console.error("作品更新エラー", error);

    return Response.json(
      { error: "作品の更新に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: ProjectApiProps) {
  try {
    await verifyAdmin(request);

    const { slug } = await params;

    await documentClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          slug,
        },
      })
    );

    return Response.json({
      message: "作品を削除しました。",
    });
  } catch (error) {
    console.error("作品削除エラー", error);

    return Response.json(
      { error: "作品の削除に失敗しました。" },
      { status: 500 }
    );
  }
}