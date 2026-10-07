import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3100";
const output = path.resolve(".artifacts/hero-layout");
const selectedCase = process.env.TEST_HERO_CASE;
const cases = [
  { width: 1920, height: 1080 }, { width: 1440, height: 1000 },
  { width: 1920, height: 800 }, { width: 1366, height: 768 },
  { width: 1280, height: 720 }, { width: 1024, height: 768 },
  { width: 768, height: 1024 }, { width: 800, height: 600 },
  { width: 1366, height: 650 }, { width: 1280, height: 550 },
  { width: 1536, height: 720, scale: 1.25 },
  { width: 1280, height: 600, scale: 1.5 },
  { width: 960, height: 450, scale: 2 },
  { width: 390, height: 844 }, { width: 320, height: 740 }, { width: 375, height: 667 },
].filter(({ width, height, scale = 1 }) => !selectedCase || selectedCase === `${width}x${height}-${scale}`);
assert(cases.length > 0, "TEST_HERO_CASE must match a supported layout case");
const modes = [
  { id: "app", label: "アプリを作る", surface: ".idea-notes" },
  { id: "game", label: "ゲームを作る", surface: ".physics-canvas" },
  { id: "system", label: "仕組みを作る", surface: ".system-sketch" },
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];

async function inspect(page, name) {
  const layout = await page.evaluate(() => {
    const rect = (selector) => document.querySelector(selector).getBoundingClientRect().toJSON();
    const hero = rect(".hero"), controls = rect(".curiosity-controls"), footer = rect(".hero-foot");
    const demo = rect(".curiosity-demo"), stage = rect(".curiosity-stage"), copy = rect(".hero-content");
    const intersects = (a, b) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
    const conflicts = [".hero-intro", ".hero h1", ".hero-bottom", ".hero-foot", ".curiosity-stage"].filter((selector) => intersects(controls, rect(selector)));
    const buttons = [...document.querySelectorAll(".curiosity-controls button")].map((button) => {
      const box = button.getBoundingClientRect();
      return { width: box.width, height: box.height, top: box.top, bottom: box.bottom,
        clickable: button.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)) };
    });
    const headerLinks = [...document.querySelectorAll(".site-header a,.site-header button")].map((element) => {
      const box = element.getBoundingClientRect();
      return { box: box.toJSON(), text: element.textContent,
        clickable: element.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)) };
    }).filter(({ box }) => box.width > 0);
    const headerConflicts = headerLinks.flatMap((link, index) => headerLinks.slice(index + 1).filter((other) => intersects(link.box, other.box)).map((other) => `${link.text}/${other.text}`));
    const outOfDemo = [...document.querySelectorAll(".curiosity-demo button,.curiosity-demo input,.system-flow,.system-output,.sketch-status,.idea-list")].filter((element) => !element.closest(".idea-list") || element.classList.contains("idea-list")).filter((element) => {
      const box = element.getBoundingClientRect();
      return box.left < demo.left - 1 || box.right > demo.right + 1 || box.top < demo.top - 1 || box.bottom > demo.bottom + 1;
    }).map((element) => element.className || element.tagName);
    const textOverflow = [];
    const walker = document.createTreeWalker(document.querySelector(".hero h1"), NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const range = document.createRange(); range.selectNodeContents(node);
      for (const box of range.getClientRects()) if (box.left < copy.left - 4 || box.right > copy.right + 4) textOverflow.push(node.textContent);
    }
    return { width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth,
      hero, controls, footer, stage, copy, conflicts, buttons, headerLinks, headerConflicts, outOfDemo, textOverflow,
      headerBottom: rect(".site-header").bottom, introTop: rect(".hero-intro").top };
  });
  assert.deepEqual(layout.conflicts, [], `${name}: controls overlap ${JSON.stringify(layout)}`);
  assert.deepEqual(layout.headerConflicts, [], `${name}: header links overlap`);
  assert(layout.headerLinks.every(({ box, clickable }) => box.left >= 0 && box.right <= layout.width && clickable), `${name}: header links must fit and be clickable`);
  assert(layout.controls.bottom + 8 <= layout.footer.top, `${name}: footer clearance`);
  assert(layout.controls.bottom <= layout.hero.bottom, `${name}: clipped controls`);
  assert(layout.hero.bottom <= layout.height - 8, `${name}: next-section hint must remain visible`);
  assert(layout.introTop >= layout.headerBottom + 5, `${name}: header must not overlap intro`);
  assert(layout.stage.bottom <= layout.footer.top, `${name}: demo/footer overlap`);
  if (layout.width > 760) assert(layout.copy.right < layout.stage.left, `${name}: demo/copy overlap`);
  assert(layout.documentWidth <= layout.width + 1, `${name}: horizontal overflow`);
  assert.deepEqual(layout.outOfDemo, [], `${name}: clipped demo controls/status`);
  assert.deepEqual(layout.textOverflow, [], `${name}: headline text overflow`);
  if (await page.locator(".system-output").count()) assert(await page.locator(".system-output").evaluate((element) => element.clientHeight >= 44), `${name}: JSON output must fit its download button`);
  assert(layout.buttons.length === 4 && layout.buttons.every((button) => button.width >= 44 && button.height >= 44 && button.top >= 0 && button.bottom <= layout.height && button.clickable), `${name}: mode buttons must be visible and clickable`);
  return { width: layout.width, height: layout.height, footerGap: layout.footer.top - layout.controls.bottom, nextSection: layout.height - layout.hero.bottom };
}

try {
  for (const { width, height, scale = 1 } of cases) {
    const name = `${width}x${height}-${scale}`;
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [], csp = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.exposeFunction("captureCsp", (message) => csp.push(message));
    await page.addInitScript(() => document.addEventListener("securitypolicyviolation", (event) => window.captureCsp(`${event.violatedDirective}: ${event.blockedURI}`)));
    await page.goto(base, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    for (const mode of modes) {
      await page.getByRole("button", { name: mode.label, exact: true }).click();
      await page.locator(mode.surface).waitFor();
      if (mode.id === "system") {
        await page.getByRole("button", { name: "JSONをつくる", exact: true }).click();
        await page.locator(".system-sketch .sketch-status").filter({ hasText: "JSONを作成しました" }).waitFor();
      }
      results.push({ name, mode: mode.id, ...await inspect(page, `${name}/${mode.id}`) });
      await page.screenshot({ path: path.join(output, `${name}-${mode.id}.png`) });
      if (mode.id === "game") assert(await page.locator(".physics-canvas").evaluate((canvas) => {
        const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
        const colors = new Set();
        for (let index = 0; index < pixels.length; index += 16) colors.add(`${pixels[index]},${pixels[index + 1]},${pixels[index + 2]}`);
        return colors.size > 30;
      }), `${name}: game canvas must not be blank`);
      if (mode.id === "system") {
        await page.getByLabel("アイデアのタイトル", { exact: true }).fill("");
        await page.getByRole("button", { name: "JSONをつくる", exact: true }).click();
        await page.locator(".system-sketch .sketch-status").filter({ hasText: "タイトルを入力してください" }).waitFor();
        await inspect(page, `${name}/error`);
      }
    }
    await page.getByRole("button", { name: "次の制作モード", exact: true }).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".hero").getAttribute("data-mode"), "app");
    const accessibility = await new AxeBuilder({ page }).include(".hero").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    assert.deepEqual(accessibility.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })), [], `${name}: hero accessibility`);
    assert.deepEqual(errors, [], `${name}: runtime errors`);
    assert.deepEqual(csp, [], `${name}: CSP errors`);
    await context.close();
    console.log(`PASS hero layout ${name}`);
  }
  if (!selectedCase) for (const [width, height] of [[1366, 768], [1280, 720], [960, 450]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.clock.install();
    await page.goto(base, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "仕組みを作る", exact: true }).click();
    await page.waitForTimeout(450);
    await page.clock.pauseAt(new Date());
    await page.getByRole("button", { name: "JSONをつくる", exact: true }).click();
    assert.equal(await page.locator(".system-sketch .sketch-status").textContent(), "処理中");
    await inspect(page, `${width}x${height}/processing`);
    await page.clock.runFor(600);
    assert.equal(await page.locator(".system-sketch .sketch-status").textContent(), "JSONを作成しました");
    await inspect(page, `${width}x${height}/complete`);
    await context.close();
    console.log(`PASS normal-motion processing ${width}x${height}`);
  }
  await writeFile(path.join(output, "results.json"), JSON.stringify(results, null, 2));
  console.log("Hero layout checks passed. Screenshots: .artifacts/hero-layout");
} finally { await browser.close(); }
