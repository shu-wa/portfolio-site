import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";

export const runtime = "nodejs";

const TABLE_NAME = "PortfolioContacts";
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

export async function GET(request: Request) {
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

    const result = await documentClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    const contacts = (result.Items ?? []).sort((a, b) => {
      const aDate = typeof a.createdAt === "string" ? a.createdAt : "";
      const bDate = typeof b.createdAt === "string" ? b.createdAt : "";
      return bDate.localeCompare(aDate);
    });

    return Response.json(contacts);
  } catch (error) {
    console.error("お問い合わせ一覧取得エラー", error);

    return Response.json(
      { error: "お問い合わせ一覧の取得に失敗しました。" },
      { status: 500 }
    );
  }
}