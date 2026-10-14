import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3100";
const output = path.resolve(".artifacts/profile");
const source = await readFile("data/profile.ts", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { profileDetails, restaurantContribution } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
assert(!source.includes("chatgpt.com/share/"), "private source conversations must not be published");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome", headless: true });
const results = [];
async function checkLayout(page, selector, width) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `horizontal overflow at ${width}`);
  assert(await page.locator(selector).evaluate((element) => {
    const frame = element.getBoundingClientRect();
    return [...element.querySelectorAll("h2,h3,h4,p,dt,dd,a")].every((child) => {
      const rect = child.getBoundingClientRect();
      return rect.left >= frame.left - 1 && rect.right <= frame.right + 1;
    });
  }), `profile text must fit at ${width}`);
  assert(await page.locator(`${selector} dl > div`).evaluateAll((rows) => rows.every((row) => {
    const label = row.querySelector("dt").getBoundingClientRect();
    const value = row.querySelector("dd").getBoundingClientRect();
    return label.right < value.left && label.top >= row.getBoundingClientRect().top;
  })), `definition labels and values must not overlap at ${width}`);
}
async function checkAccessibility(page, label) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  assert.deepEqual(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })), [], label);
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
}
try {
  for (const [width, height] of [[1440, 1000], [768, 1024], [320, 740]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    const violations = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.exposeFunction("captureProfileCsp", (value) => violations.push(value));
    await page.addInitScript(() => document.addEventListener("securitypolicyviolation", (event) => {
      window.captureProfileCsp(`${event.violatedDirective}: ${event.blockedURI}`);
    }));

    const home = await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(home.status(), 200);
    assert(home.headers()["content-security-policy"].includes("'nonce-"));
    await page.evaluate(() => document.fonts.ready);
    const profileText = await page.locator(".about-copy").textContent();
    for (const value of Object.values(profileDetails)) assert(profileText.includes(value), `missing profile fact at ${width}`);
    assert.deepEqual(await page.locator(".profile-facts dt").allTextContents(), ["関心", "開発経験", "UX調査"]);
    const projectLink = page.locator(`.evidence-link[href="/projects/${restaurantContribution.slug}"]`);
    assert((await projectLink.textContent()).includes(restaurantContribution.summary));
    assert((await page.locator(".hero h1").textContent()).includes("やってみる"), "the curiosity concept must remain");
    await page.locator("#about").scrollIntoViewIfNeeded();
    await checkLayout(page, ".about-copy", width);
    await checkAccessibility(page, `home accessibility at ${width}`);
    await page.locator("#about").screenshot({ path: path.join(output, `about-${width}.png`) });

    const detail = await page.goto(`${base}/projects/${restaurantContribution.slug}`, { waitUntil: "networkidle" });
    assert.equal(detail.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.getByRole("heading", { name: "制作体制・担当", exact: true }).count(), 1);
    const contributionText = await page.locator(".project-contribution").textContent();
    for (const key of ["format", "duration", "role", "coordination"]) assert(contributionText.includes(restaurantContribution[key]), `missing contribution ${key}`);
    await checkLayout(page, ".project-contribution", width);
    await checkAccessibility(page, `project accessibility at ${width}`);
    await page.locator(".project-contribution").screenshot({ path: path.join(output, `contribution-${width}.png`) });
    await page.screenshot({ path: path.join(output, `project-${width}.png`), fullPage: true });

    const publicProjects = await page.request.get(`${base}/api/projects`);
    assert.equal(publicProjects.status(), 200);
    const products = await publicProjects.json();
    const tsudowa = products.find((project) => /tsudowa/i.test(`${project.slug} ${project.title}`));
    assert(tsudowa, "TSUDOWA must remain in the public works list");
    assert(!tsudowa.githubUrl, "TSUDOWA repository must remain private");
    assert.deepEqual(tsudowa.designDecisions, [], "TSUDOWA internal design must remain private");
    assert.equal((await page.goto(`${base}/projects/${tsudowa.slug}`, { waitUntil: "networkidle" })).status(), 200);
    assert.equal(await page.locator(".project-contribution").count(), 0, "student project contributions must not leak into other works");
    assert.equal(await page.locator('main a[href*="github.com"]').count(), 0);
    assert.deepEqual(errors, [], `runtime errors at ${width}`);
    assert.deepEqual(violations, [], `CSP violations at ${width}`);
    results.push({ width, height, profile: "passed", contribution: "passed", privacy: "passed", accessibility: "passed" });
    await context.close();
  }
  await writeFile(path.join(output, "results.json"), `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
