import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3100";
const output = path.resolve(".artifacts/browser");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome", headless: true });
const results = [];
try {
  for (const [width, height] of [[1440, 1000], [1920, 1080], [768, 1024], [390, 844], [320, 740]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    const csp = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.exposeFunction("captureCsp", (violation) => csp.push(violation));
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (event) => window.captureCsp(`${event.violatedDirective}: ${event.blockedURI}`));
      window.layoutShifts = 0;
      new PerformanceObserver((list) => list.getEntries().forEach((entry) => { if (!entry.hadRecentInput) window.layoutShifts += entry.value; })).observe({ type: "layout-shift", buffered: true });
    });
    const response = await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    assert(response.headers()["content-security-policy"].includes("'nonce-"));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(output, `hero-${width}.png`) });
    const layout = await page.evaluate(() => ({
      viewport: innerWidth, document: document.documentElement.scrollWidth,
      image: document.querySelector(".hero-image").naturalWidth,
      heroEnd: document.querySelector(".hero").getBoundingClientRect().bottom,
      shifts: window.layoutShifts,
      overflow: [...document.querySelectorAll("h1,h2,h3,button,input,textarea,.work-item")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1);
      }).map((element) => element.className || element.tagName),
    }));
    assert(layout.image > 0, "hero asset must load");
    assert(layout.document <= layout.viewport + 1, `horizontal overflow at ${width}: ${JSON.stringify(layout)}`);
    assert.deepEqual(layout.overflow, [], `text/control overflow at ${width}`);
    assert(layout.heroEnd < height, `next section must be visible at ${width}`);
    assert((await page.locator(".hero-bottom").textContent()).includes("玉木秀杷のポートフォリオです"));
    assert.equal(await page.getByRole("heading", { name: "制作物一覧", exact: true }).count(), 1);
    assert.equal(await page.getByRole("heading", { name: "お問い合わせ", exact: true }).count(), 1);
    assert.equal(await page.getByRole("link", { name: "管理者ログイン", exact: true }).getAttribute("href"), "/admin");
    assert.equal(await page.locator(".curiosity-prompt,.guitar-lab,#playground").count(), 0);
    assert(!(await page.locator("body").textContent()).includes("A LITTLE PLAYGROUND"));
    const homeAccessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    assert.deepEqual(homeAccessibility.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })), [], `home accessibility at ${width}`);
    await page.getByRole("link", { name: "制作物を見る", exact: true }).click();
    assert(await page.locator("#projects").evaluate((element) => {
      const top = element.getBoundingClientRect().top;
      return top >= -1 && top <= 100;
    }), "hero link must navigate to works");
    const originalCount = await page.locator(".work-item").count();
    await page.getByRole("button", { name: "ゲーム", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: "ゲーム", exact: true }).getAttribute("aria-pressed"), "true");
    assert((await page.locator(".work-item").count()) < originalCount);
    await page.getByRole("button", { name: "すべて", exact: true }).click();
    assert.equal(await page.locator(".work-item").count(), originalCount);
    assert(await page.locator(".phone-screen").evaluate((image) => {
      const frame = image.parentElement.getBoundingClientRect();
      const rect = image.getBoundingClientRect();
      return rect.left >= frame.left && rect.right <= frame.right && rect.top >= frame.top && rect.bottom <= frame.bottom;
    }), `phone screenshot must not be clipped at ${width}`);
    await page.locator("#projects").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `works-${width}.png`) });
    if (width <= 760) {
      await page.getByRole("button", { name: "メニューを開く" }).click();
      assert(await page.locator("dialog").evaluate((element) => element.matches(":modal")));
      await page.screenshot({ path: path.join(output, `menu-${width}.png`) });
      const topmost = await page.locator("dialog nav a").first().evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
      });
      assert(topmost, "menu must render above all work visuals");
      assert.deepEqual(await page.locator("dialog nav a > span:nth-child(2)").evaluateAll((elements) => elements.map((element) => element.childNodes[0].textContent)), ["制作物一覧", "私の強み", "プロフィール", "お問い合わせ"]);
      assert(await page.locator("dialog nav a").evaluateAll((elements) => elements.every((element) => element.scrollWidth <= element.clientWidth)), `menu text must fit at ${width}`);
      const menuAccessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      assert.deepEqual(menuAccessibility.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })), [], `menu accessibility at ${width}`);
      await page.keyboard.press("Escape");
      assert(!(await page.locator("dialog").isVisible()));
      assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    }
    await page.route("**/api/contact", async (route) => {
      const body = route.request().postDataJSON();
      assert.equal(body.name, "Browser Test");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "お問い合わせを受け付けました。" }) });
    });
    await page.getByLabel("お名前", { exact: false }).fill("Browser Test");
    await page.getByLabel("メールアドレス", { exact: false }).fill("browser@example.com");
    await page.getByLabel("メッセージ", { exact: false }).fill("This is a mocked browser verification.");
    await page.locator(".contact-form button[type=submit]").click();
    await page.getByRole("status").filter({ hasText: "メッセージを受け付けました" }).waitFor();
    await page.locator("#about").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `about-${width}.png`) });
    await page.screenshot({ path: path.join(output, `full-${width}.png`), fullPage: true });
    const publicProjects = await (await context.request.get(`${base}/api/projects`)).json();
    const tsudowa = publicProjects.find((project) => /tsudowa|do-eventer|doeventer/i.test(`${project.slug} ${project.title}`));
    assert(tsudowa && !tsudowa.githubUrl);
    await page.locator(`#projects .work-link[href="/projects/${tsudowa.slug}"]`).click();
    await page.waitForURL(`**/projects/${tsudowa.slug}`);
    await page.waitForLoadState("networkidle");
    assert.equal(await page.getByRole("heading", { level: 1 }).textContent(), "TSUDOWA");
    assert.equal(await page.locator('a[href*="github.com"]').count(), 0);
    assert.equal(await page.locator(".decision").count(), 0);
    for (const image of await page.locator(".detail-media img").all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((element) => element.decode());
    }
    const media = await page.locator(".detail-media img").evaluateAll((images) => images.map((image) => ({
      loaded: image.complete && image.naturalWidth > 0,
      ratio: image.clientWidth / image.clientHeight,
      original: image.naturalWidth / image.naturalHeight,
    })));
    assert(media.length > 0 && media.every((image) => image.loaded && Math.abs(image.ratio - image.original) < 0.015), "detail media must preserve source aspect ratio");
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: path.join(output, `tsudowa-${width}.png`), fullPage: true });
    const detailAccessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    assert.deepEqual(detailAccessibility.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })), [], `detail accessibility at ${width}`);
    assert.deepEqual(csp, [], `CSP violations at ${width}`);
    assert.deepEqual(errors, [], `runtime/console errors at ${width}`);
    results.push({ width, height, projects: originalCount, cls: layout.shifts, cspViolations: csp.length, runtimeErrors: errors.length, accessibilityViolations: homeAccessibility.violations.length + detailAccessibility.violations.length });
    await context.close();
    console.log(`PASS viewport ${width}x${height}`);
  }
  const request = await browser.newContext();
  for (const route of ["/api/contacts", "/api/projects?view=admin"]) assert.equal((await request.request.get(base + route)).status(), 401);
  const hostile = await request.request.post(base + "/api/contact", { headers: { Origin: "https://evil.example" }, data: { name: "Test", email: "test@example.com", message: "Test" } });
  assert.equal(hostile.status(), 403);
  await request.close();
  await writeFile(path.join(output, "results.json"), JSON.stringify(results, null, 2));
  console.log("Browser checks passed. Screenshots: .artifacts/browser");
} finally {
  await browser.close();
}
