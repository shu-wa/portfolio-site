import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { projects as fallbackProjects } from "../../../../data/projects";

export const runtime = "nodejs";

const TABLE_NAME = "PortfolioProjects";
const REGION = "ap-southeast-2";

const dynamoDbClient = new DynamoDBClient({
  region: REGION,
});

const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

type ProjectApiProps = {
  params: Promise<{
    slug: string;
  }>;
};

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