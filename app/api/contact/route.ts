export async function POST(request: Request) {
  const body = await request.json();

  const { name, email, message } = body;

  if (!name || !email || !message) {
    return Response.json(
      { error: "名前、メールアドレス、メッセージは必須です。" },
      { status: 400 }
    );
  }

  console.log("お問い合わせを受信しました", {
    name,
    email,
    message,
  });

  return Response.json({
    message: "お問い合わせを受け付けました。",
  });
}