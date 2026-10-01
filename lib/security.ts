import { CognitoJwtVerifier } from "aws-jwt-verify";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | undefined;

export function isAdminClaims(claims: { sub: string; "cognito:groups"?: unknown }) {
  const owners = (process.env.ADMIN_COGNITO_SUBS ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  const groups = claims["cognito:groups"];
  return owners.includes(claims.sub) || (Array.isArray(groups) && groups.includes(process.env.ADMIN_COGNITO_GROUP ?? "portfolio-admin"));
}

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new HttpError(401, "ログインが必要です。");
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
  if (!userPoolId || !clientId) throw new HttpError(503, "管理者認証を利用できません。");
  verifier ??= CognitoJwtVerifier.create({ userPoolId, clientId, tokenUse: "id" });
  let claims;
  try { claims = await verifier.verify(authorization.slice(7)); }
  catch { throw new HttpError(401, "ログイン情報を確認してください。"); }
  if (!isAdminClaims(claims)) throw new HttpError(403, "管理者権限が必要です。");
  return claims;
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const configured = process.env.SITE_ORIGIN ?? "https://main.d217a718xi2gst.amplifyapp.com";
  const allowed = [configured];
  if (process.env.NODE_ENV !== "production") allowed.push(new URL(request.url).origin);
  if (request.headers.get("sec-fetch-site") === "cross-site" || !origin || !allowed.includes(origin)) {
    throw new HttpError(403, "送信元を確認できません。");
  }
}

export async function readJson(request: Request, limit = 128_000): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
    throw new HttpError(415, "JSON形式で送信してください。");
  }
  if (Number(request.headers.get("content-length")) > limit) throw new HttpError(413, "送信内容が大きすぎます。");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "送信内容がありません。");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) { await reader.cancel(); throw new HttpError(413, "送信内容が大きすぎます。"); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "JSON形式を確認してください。");
  } finally { reader.releaseLock(); }
}

export function apiError(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  console.error("API operation failed.", error instanceof Error ? error.name : "UnknownError");
  return Response.json({ error: "処理を完了できませんでした。時間をおいてお試しください。" }, { status: 500, headers: { "Cache-Control": "no-store" } });
}
