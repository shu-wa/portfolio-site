import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const project = JSON.parse(await readFile("data/todo-event-calendar.json", "utf8"));
const base = process.env.TEST_BASE_URL ?? "http://localhost:3142";
const output = path.resolve(".artifacts/todo-work");
await mkdir(output, { recursive: true });
const results = [];
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome", headless: true });
try {
  for (const [width, height] of [[1440, 1000], [768, 1024], [320, 740]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    const csp = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.exposeFunction("captureWorkCsp", (value) => csp.push(value));
    await page.addInitScript(() => document.addEventListener("securitypolicyviolation", (event) => {
      window.captureWorkCsp(`${event.violatedDirective}: ${event.blockedURI}`);
    }));
    assert.equal((await page.goto(base, { waitUntil: "networkidle" })).status(), 200);
    const response = await page.request.get(`${base}/api/projects`);
    assert.equal(response.status(), 200);
    const projects = await response.json();
    const entries = projects.filter(({ slug }) => slug === project.slug);
    assert.equal(entries.length, 1, "new work must appear exactly once in the API");
    assert.equal(entries[0].githubUrl, project.githubUrl);
    assert(entries[0].description.startsWith("インターンシップでチーム制作"));
    assert(entries[0].overview.includes("私の担当はTODO側の実装と、成果物のマージ・統合"));
    assert(!(await page.locator("#mindset").textContent()).includes(project.title), "strengths must not duplicate the work");
    await page.getByRole("button", { name: "アプリ・Web", exact: true }).click();
    const work = page.locator(`.work-link[href="/projects/${project.slug}"]`);
    assert.equal(await work.count(), 1, "new work must be in the app category");
    assert((await work.textContent()).includes(project.description));
    assert.equal(await work.locator("img").count(), 0, "do not fabricate screenshots");
    await work.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `list-${width}.png`) });
    await work.click();
    await page.waitForURL(`**/projects/${project.slug}`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.getByRole("heading", { level: 1, name: project.title, exact: true }).count(), 1);
    const main = await page.locator("main").textContent();
    assert(main.includes(project.overview));
    assert(entries[0].overview.startsWith("インターンシップでチーム制作"));
    for (const feature of project.features) assert(main.includes(feature));
    assert(main.includes("アプリ全体はチームの制作物"), "team authorship must be clear");
    assert.equal(await page.getByRole("heading", { name: "画面", exact: true }).count(), 0);
    const github = page.locator(`main a[href="${project.githubUrl}"]`);
    assert.equal(await github.count(), 1);
    assert.equal(await github.getAttribute("target"), "_blank");
    assert.equal(await github.getAttribute("rel"), "noopener noreferrer");
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `horizontal overflow at ${width}`);
    assert(await page.locator(".detail-main").evaluate((element) => [...element.querySelectorAll("h1,h2,p,li,a")].every((child) => {
      const rect = child.getBoundingClientRect();
      return rect.left >= -1 && rect.right <= innerWidth + 1;
    })), `work copy must fit at ${width}`);
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    assert.deepEqual(accessibility.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })), []);
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await page.screenshot({ path: path.join(output, `detail-${width}.png`), fullPage: true });
    const tsudowa = projects.find(({ slug, title }) => /tsudowa|do-eventer/i.test(`${slug} ${title}`));
    assert(tsudowa);
    assert(!tsudowa.githubUrl);
    assert.deepEqual(tsudowa.designDecisions, []);
    assert.deepEqual(errors, []);
    assert.deepEqual(csp, []);
    results.push({ width, height, list: "passed", detail: "passed", github: "passed", accessibility: "passed", privacy: "passed" });
    await context.close();
  }
  await writeFile(path.join(output, "results.json"), `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
