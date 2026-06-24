import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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

type DeleteContactProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, { params }: DeleteContactProps) {
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

    const { id } = await params;

    await documentClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          id,
        },
      })
    );

    return Response.json({
      message: "お問い合わせを削除しました。",
    });
  } catch (error) {
    console.error("お問い合わせ削除エラー", error);

    return Response.json(
      { error: "お問い合わせの削除に失敗しました。" },
      { status: 500 }
    );
  }
}