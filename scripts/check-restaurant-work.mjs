import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const project = JSON.parse(await readFile("data/restaurant-order-system.json", "utf8"));
const base = process.env.TEST_BASE_URL ?? "http://localhost:3142";
const output = path.resolve(".artifacts/restaurant-work-browser");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
try {
  for (const [width, height] of [[1440, 1000], [768, 1024], [320, 740]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    const csp = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.exposeFunction("restaurantCsp", (value) => csp.push(value));
    await page.addInitScript(() => document.addEventListener("securitypolicyviolation", (event) => window.restaurantCsp(`${event.violatedDirective}: ${event.blockedURI}`)));
    const listResponse = await page.request.get(`${base}/api/projects`);
    assert.equal(listResponse.status(), 200);
    const list = await listResponse.json();
    assert.equal(list.filter((item) => item.slug === project.slug).length, 1);
    const detailResponse = await page.request.get(`${base}/api/projects/${project.slug}`);
    assert.equal(detailResponse.status(), 200);
    const published = await detailResponse.json();
    assert.deepEqual(list.find((item) => item.slug === project.slug), published);
    for (const key of ["title", "description", "overview", "githubUrl", "features", "problems", "designDecisions", "screenshotUrls"]) {
      assert.deepEqual(published[key], project[key], `published ${key}`);
    }
    const response = await page.goto(`${base}/projects/${project.slug}`, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    assert(response.headers()["content-security-policy"].includes("'nonce-"));
    assert.equal(await page.title(), `${project.title} | Shuwa Tamaki`);
    assert.equal(await page.getByRole("heading", { level: 1 }).textContent(), project.title);
    assert.equal(await page.locator(`main a[href="${project.githubUrl}"]`).count(), 1);
    assert((await page.locator(".project-contribution").textContent()).includes("大学の授業・4人チーム"));
    for (const title of ["制作体制・担当", "授業後の保守改修", "保守版の設計", "保守版の実行結果"]) {
      assert.equal(await page.getByRole("heading", { name: title, exact: true }).count(), 1);
    }
    assert((await page.locator(".detail-overview").textContent()).includes("授業後"));
    assert.equal(await page.locator(".detail-media img").count(), 2);
    await page.locator(".detail-media").scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.querySelectorAll(".detail-media img")].every((image) => image.complete && image.naturalWidth > 0));
    const images = await page.locator(".detail-media img").evaluateAll((images) => images.map((image) => {
      const rect = image.getBoundingClientRect();
      return { natural: image.naturalWidth / image.naturalHeight, rendered: rect.width / rect.height, fit: getComputedStyle(image).objectFit };
    }));
    for (const image of images) { assert.equal(image.fit, "contain"); assert(Math.abs(image.natural - image.rendered) < 0.02); }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow ${width}`);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    assert.deepEqual(axe.violations.map((item) => item.id), [], `accessibility ${width}`);
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await page.screenshot({ path: path.join(output, `detail-${width}.png`), fullPage: true });
    const tsudowa = list.find((item) => /tsudowa/i.test(`${item.slug} ${item.title}`));
    assert(tsudowa && !tsudowa.githubUrl);
    assert.deepEqual(tsudowa.designDecisions, []);
    assert.deepEqual(errors, [], `runtime ${width}`);
    assert.deepEqual(csp, [], `CSP ${width}`);
    results.push({ width, api: "passed", media: "passed", layout: "passed", accessibility: "passed", privacy: "passed" });
    await context.close();
  }
  await writeFile(path.join(output, "results.json"), JSON.stringify(results, null, 2) + "\n");
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); }
