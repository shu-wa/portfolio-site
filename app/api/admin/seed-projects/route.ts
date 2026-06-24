import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { projects } from "../../../../data/projects";

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

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return Response.json(
        { error: "認証情報がありません。" },
        { status: 401 }
      );
    }

    const token = authorization.replace("Bearer ", "");
    await verifier.verify(token);

    const now = new Date().toISOString();

    await Promise.all(
      projects.map((project, index) =>
        documentClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              ...project,
              order: index + 1,
              createdAt: project.createdAt ?? now,
              updatedAt: now,
            },
          })
        )
      )
    );

    return Response.json({
      message: "作品データをDynamoDBに投入しました。",
    });
  } catch (error) {
    console.error("作品データ投入エラー", error);

    return Response.json(
      { error: "作品データの投入に失敗しました。" },
      { status: 500 }
    );
  }
}