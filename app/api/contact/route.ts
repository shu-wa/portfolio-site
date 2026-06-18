import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const TABLE_NAME = "PortfolioContacts";
const REGION = "ap-southeast-2";

const dynamoDbClient = new DynamoDBClient({
  region: REGION,
});

const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, message } = body;

    if (!name || !email || !message) {
      return Response.json(
        { error: "名前、メールアドレス、メッセージは必須です。" },
        { status: 400 }
      );
    }

    const contact = {
      id: randomUUID(),
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };

    await documentClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: contact,
      })
    );

    return Response.json({
      message: "お問い合わせを受け付けました。",
    });
  } catch (error) {
    console.error("お問い合わせ保存エラー", error);

    return Response.json(
      { error: "お問い合わせの保存に失敗しました。" },
      { status: 500 }
    );
  }
}