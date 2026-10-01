import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const cache = new Map();
const root = path.resolve(import.meta.dirname, "..");
let claims = { sub: "reader" };
let rejectToken = false;
const calls = [];
let send = async () => ({});

// Execute the actual TypeScript modules with only network boundaries mocked.
function load(relative) {
  const filename = path.resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const compiled = { exports: {} };
  cache.set(filename, compiled);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = (id) => {
    if (id === "aws-jwt-verify") return { CognitoJwtVerifier: { create: () => ({ verify: async () => {
      if (rejectToken) throw new Error("invalid token");
      return claims;
    } }) } };
    if (id.startsWith(".")) {
      const target = path.resolve(path.dirname(filename), id) + ".ts";
      if (target === path.join(root, "lib/db.ts")) return {
        db: { send: async (command) => { calls.push(command); return send(command); } },
        projectTable: "Projects", contactTable: "Contacts",
      };
      return load(target);
    }
    return require(id);
  };
  vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename })(localRequire, compiled, compiled.exports);
  return compiled.exports;
}

process.env.NODE_ENV = "production";
process.env.SITE_ORIGIN = "https://portfolio.example";
process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = "ap-southeast-2_test";
process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID = "test-client";
delete process.env.ADMIN_COGNITO_SUBS;
delete process.env.ADMIN_COGNITO_GROUP;
const security = load("lib/security.ts");
const publicData = load("lib/project-public.ts");
const { parseProject, validSlug } = load("lib/project-input.ts");
let count = 0;
function check(label, fn) { fn(); count++; console.log(`PASS ${label}`); }
async function checkAsync(label, fn) { await fn(); count++; console.log(`PASS ${label}`); }
const request = (body, extra = {}) => new Request("https://portfolio.example/api/contact", {
  method: "POST", body: typeof body === "string" ? body : JSON.stringify(body),
  headers: { origin: "https://portfolio.example", "content-type": "application/json", ...extra },
});
const status = (value) => (error) => error instanceof security.HttpError && error.status === value;
const project = { slug: "sample", title: "Sample", description: "Description", tech: [], features: [], designDecisions: [], problems: [], learnings: [], future: [] };

check("TSUDOWA private fields never enter public projections", () => {
  for (const slug of ["tsudowa", "do-eventer", "doeventer"]) {
    const raw = { ...project, slug, title: "TSUDOWA", overview: "PRIVATE_SENTINEL", tech: ["PRIVATE_SENTINEL"], githubUrl: "https://github.com/private/PRIVATE_SENTINEL", internal: "PRIVATE_SENTINEL", designDecisions: [{ title: "PRIVATE_SENTINEL" }] };
    const result = publicData.toPublicProject(raw);
    assert(!JSON.stringify(result).includes("PRIVATE_SENTINEL"));
    assert.equal(result.githubUrl, undefined);
    assert.deepEqual(result.designDecisions, []);
  }
});
check("Public projection uses an allowlist and safe media links", () => {
  const result = publicData.toPublicProject({ ...project, secret: "private", githubUrl: "javascript:alert(1)", screenshotUrls: ["//evil.example/img", "/valid.png", "https://example.com/img"], designDecisions: [null] });
  assert.equal(result.secret, undefined);
  assert.equal(result.githubUrl, "");
  assert.deepEqual(result.screenshotUrls, ["/valid.png", "https://example.com/img"]);
});
check("Unsafe protocols, credentials and network-path URLs are rejected", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,x", "http://example.com", "https://user:pass@example.com", "//evil.example", "/\\evil.example", "/test\n"]) assert.equal(publicData.safeUrl(url, true), "");
});
check("Project input rejects invalid types and mass assignment", () => {
  assert.equal(parseProject({ ...project, isAdmin: true }).isAdmin, undefined);
  for (const invalid of [{ tech: [1] }, { order: -1 }, { screenshotUrls: ["javascript:x"] }, { designDecisions: [null] }, { slug: "../admin" }, { title: "x".repeat(161) }]) assert.throws(() => parseProject({ ...project, ...invalid }), status(400));
  assert(!validSlug("%2fadmin"));
});
check("Only admin membership or an explicitly configured owner grants privileges", () => {
  assert(!security.isAdminClaims({ sub: "reader" }));
  assert(!security.isAdminClaims({ sub: "reader", "cognito:groups": "portfolio-admin" }));
  assert(security.isAdminClaims({ sub: "admin", "cognito:groups": ["portfolio-admin"] }));
  process.env.ADMIN_COGNITO_SUBS = " owner ";
  assert(security.isAdminClaims({ sub: "owner" }));
  delete process.env.ADMIN_COGNITO_SUBS;
});
check("Cross-site and missing origins are denied", () => {
  security.requireSameOrigin(request({}));
  for (const origin of ["https://evil.example", "https://portfolio.example.evil.example", "null", ""]) assert.throws(() => security.requireSameOrigin(request({}, { origin })), status(403));
  assert.throws(() => security.requireSameOrigin(request({}, { "sec-fetch-site": "cross-site" })), status(403));
});
await checkAsync("Malformed and oversized JSON is rejected before database work", async () => {
  assert.deepEqual(await security.readJson(request({ ok: true })), { ok: true });
  await assert.rejects(security.readJson(request("{")), status(400));
  await assert.rejects(security.readJson(request("x".repeat(100)), 20), status(413));
  await assert.rejects(security.readJson(request({}, { "content-type": "text/plain" })), status(415));
  await assert.rejects(security.readJson(request({}, { "content-type": "application/json-invalid" })), status(415));
});
await checkAsync("Invalid tokens and ordinary authenticated users are denied", async () => {
  await assert.rejects(security.requireAdmin(request({})), status(401));
  rejectToken = true;
  await assert.rejects(security.requireAdmin(request({}, { authorization: "Bearer bad" })), status(401));
  rejectToken = false;
  claims = { sub: "reader" };
  await assert.rejects(security.requireAdmin(request({}, { authorization: "Bearer reader" })), status(403));
  claims = { sub: "admin", "cognito:groups": ["portfolio-admin"] };
  assert.equal((await security.requireAdmin(request({}, { authorization: "Bearer admin" }))).sub, "admin");
});
const projectsRoute = load("app/api/projects/route.ts");
const contactsRoute = load("app/api/contacts/route.ts");
const contactRoute = load("app/api/contact/route.ts");
const projectRoute = load("app/api/projects/[slug]/route.ts");
const deleteContactRoute = load("app/api/contacts/[id]/route.ts");
await checkAsync("Unauthenticated admin reads do not access DynamoDB", async () => {
  calls.length = 0;
  assert.equal((await projectsRoute.GET(new Request("https://portfolio.example/api/projects?view=admin"))).status, 401);
  assert.equal((await contactsRoute.GET(new Request("https://portfolio.example/api/contacts"))).status, 401);
  assert.equal(calls.length, 0);
});
await checkAsync("Every mutation denies ordinary authenticated users before database work", async () => {
  calls.length = 0;
  claims = { sub: "reader" };
  const headers = { authorization: "Bearer reader" };
  assert.equal((await projectsRoute.POST(request(project, headers))).status, 403);
  assert.equal((await projectRoute.PUT(request(project, headers), { params: Promise.resolve({ slug: "sample" }) })).status, 403);
  assert.equal((await projectRoute.DELETE(request({}, headers), { params: Promise.resolve({ slug: "sample" }) })).status, 403);
  assert.equal((await deleteContactRoute.DELETE(request({}, headers), { params: Promise.resolve({ id: "00000000-0000-4000-8000-000000000000" }) })).status, 403);
  assert.equal(calls.length, 0);
  claims = { sub: "admin", "cognito:groups": ["portfolio-admin"] };
});
await checkAsync("Admin database failures never return editable fallback data", async () => {
  send = async () => { throw new Error("database unavailable"); };
  await assert.rejects(load("lib/projects.ts").getStoredProjects(false));
  send = async () => ({ Items: [] });
  assert.deepEqual(await load("lib/projects.ts").getStoredProjects(false), []);
});
await checkAsync("Public project API strips private TSUDOWA data", async () => {
  send = async () => ({ Items: [{ ...project, slug: "do-eventer", title: "TSUDOWA", overview: "PRIVATE_SENTINEL", githubUrl: "https://github.com/private/PRIVATE_SENTINEL" }] });
  const result = await projectsRoute.GET(new Request("https://portfolio.example/api/projects"));
  assert.equal(result.status, 200);
  assert(!(await result.text()).includes("PRIVATE_SENTINEL"));
});
await checkAsync("Contact validation and honeypot do not create records", async () => {
  calls.length = 0;
  assert.equal((await contactRoute.POST(request({ name: "Test", email: "bad", message: "Test" }))).status, 400);
  assert.equal((await contactRoute.POST(request({ name: "Test", email: "test@example.com", message: "Test", website: "bot" }))).status, 200);
  assert.equal(calls.length, 0);
});
await checkAsync("Contact uses shared conditional slots and preserves real messages", async () => {
  calls.length = 0;
  send = async () => ({});
  assert.equal((await contactRoute.POST(request({ name: "Test", email: "test@example.com", message: "Test" }))).status, 200);
  assert.equal(calls.length, 2);
  assert(calls[0].input.ConditionExpression.includes("expiresAt <= :now"));
  assert.equal(calls[1].input.Item.message, "Test");
  send = async () => { const error = new Error("limit"); error.name = "ConditionalCheckFailedException"; throw error; };
  assert.equal((await contactRoute.POST(request({ name: "Test", email: "test@example.com", message: "Test" }))).status, 429);
});
await checkAsync("Concurrent contact requests cannot exceed three slots", async () => {
  const reservations = new Set();
  send = async (command) => {
    if (command.input.ConditionExpression) {
      const id = command.input.Item.id;
      if (reservations.has(id)) { const error = new Error("occupied"); error.name = "ConditionalCheckFailedException"; throw error; }
      reservations.add(id);
    }
    return {};
  };
  const responses = await Promise.all(Array.from({ length: 8 }, () => contactRoute.POST(request({ name: "Test", email: "concurrent@example.com", message: "Test" }))));
  assert.equal(responses.filter((response) => response.status === 200).length, 3);
  assert.equal(responses.filter((response) => response.status === 429).length, 5);
});
await checkAsync("Contact listing paginates and omits internal rate records", async () => {
  send = async (command) => command.input.ExclusiveStartKey ? { Items: [{ id: "message", createdAt: "2026-10-02" }] } : { Items: [{ id: "rate#private" }], LastEvaluatedKey: { id: "cursor" } };
  const result = await contactsRoute.GET(new Request("https://portfolio.example/api/contacts", { headers: { authorization: "Bearer admin" } }));
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("cache-control"), "private, no-store");
  assert.equal((await result.json()).length, 1);
});
console.log(`${count} security regression checks passed.`);
