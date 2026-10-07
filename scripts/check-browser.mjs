import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3100";
const output = path.resolve(".artifacts/browser");
const notesOnly = process.env.TEST_SCOPE === "notes";
await mkdir(output, { recursive: true });
const results = [];
const viewports = [[1440, 1000], [1920, 1080], [768, 1024], [390, 844], [320, 740], [390, 740], [430, 740], [375, 667]].filter(([width]) => !process.env.TEST_WIDTH || width === Number(process.env.TEST_WIDTH));
assert(viewports.length > 0, "TEST_WIDTH must match a supported viewport");
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome", headless: true });
async function checkDemoGeometry(page, mode, width, height) {
  assert.equal(await page.locator(".hero").getAttribute("data-mode"), mode);
  assert(await page.evaluate(() => {
    const controls = document.querySelector(".curiosity-controls").getBoundingClientRect();
    const footer = document.querySelector(".hero-foot").getBoundingClientRect();
    const hero = document.querySelector(".hero").getBoundingClientRect();
    return controls.bottom + 8 <= footer.top && controls.bottom <= hero.bottom;
  }), `mode controls must not overlap footer or be clipped at ${width}x${height}`);
  assert(await page.locator(".curiosity-demo").evaluate((element) => {
    const frame = element.getBoundingClientRect();
    return [...element.querySelectorAll("button,input,h2,.system-flow,.system-output,.sketch-status,.idea-list")].filter((child) => !child.closest(".idea-list") || child.classList.contains("idea-list")).every((child) => {
      const rect = child.getBoundingClientRect();
      return rect.left >= frame.left - 1 && rect.right <= frame.right + 1 && rect.top >= frame.top - 1 && rect.bottom <= frame.bottom + 1;
    });
  }), `demo controls/status must fit for ${mode} at ${width}x${height}`);
  assert(await page.evaluate(() => document.querySelector(".curiosity-stage").getBoundingClientRect().bottom < document.querySelector(".hero-foot").getBoundingClientRect().top + 1), `demo must not overlap footer at ${width}x${height}`);
  if (width > 760) assert(await page.evaluate(() => document.querySelector(".hero-content").getBoundingClientRect().right < document.querySelector(".curiosity-stage").getBoundingClientRect().left), `demo must not overlap headline at ${width}`);
}
try {
  for (const [width, height] of notesOnly ? [] : viewports) {
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
    await page.screenshot({ path: path.join(output, `hero-${width}x${height}.png`) });
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
    assert.equal(await page.locator(".github-profile-link").count(), 2);
    for (const link of await page.locator(".github-profile-link").all()) {
      assert.equal(await link.getAttribute("href"), "https://github.com/shu-wa");
      assert.equal(await link.getAttribute("target"), "_blank");
      assert.equal(await link.getAttribute("rel"), "noopener noreferrer");
    }
    assert(await page.locator(".profile-links span").evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getClientRects().length === 1;
    }), `profile GitHub label must fit on one line at ${width}`);
    assert(await page.locator(".header-github").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const brand = document.querySelector(".site-header .brand").getBoundingClientRect();
      const nav = document.querySelector(".desktop-nav").getBoundingClientRect();
      return rect.height >= 44 && rect.left > brand.right && (nav.width === 0 || rect.left > nav.right)
        && rect.right <= innerWidth && element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
    }), `GitHub header link must fit and be clickable at ${width}`);
    assert.equal(await page.locator(".curiosity-prompt,.guitar-lab,#playground").count(), 0);
    assert(!(await page.locator("body").textContent()).includes("A LITTLE PLAYGROUND"));
    const homeAccessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    assert.deepEqual(homeAccessibility.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })), [], `home accessibility at ${width}`);
    async function checkDemo(mode) {
      await checkDemoGeometry(page, mode, width, height);
      const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      assert.deepEqual(accessibility.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })), [], `${mode} accessibility at ${width}`);
      await page.screenshot({ path: path.join(output, `${mode}-${width}x${height}.png`) });
    }
    const noteTitle = "Browser idea";
    await page.getByLabel("つくりたいこと", { exact: true }).fill(`  ${noteTitle}  `);
    await page.getByRole("button", { name: "メモを追加", exact: true }).click();
    const note = page.getByRole("checkbox", { name: noteTitle, exact: true });
    assert.equal(await page.locator(".idea-list li").first().textContent(), noteTitle, "new notes must appear first");
    assert(await note.evaluate((element) => {
      const frame = element.closest(".idea-list").getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      return rect.top >= frame.top && rect.bottom <= frame.bottom;
    }), "added notes must be immediately visible");
    await note.check();
    await page.getByRole("button", { name: "未完了のメモを表示", exact: true }).click();
    assert.equal(await note.count(), 0);
    await page.getByRole("button", { name: "完了したメモを表示", exact: true }).click();
    assert(await note.isChecked());
    await page.reload({ waitUntil: "networkidle" });
    await note.waitFor();
    assert(await note.isChecked(), "notes must survive reload");
    await note.uncheck();
    assert(!(await note.isChecked()));
    await checkDemo("app");
    const allWorks = await page.locator(".work-link").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    assert.equal(await page.getByRole("button", { name: "制作物をシャッフル", exact: true }).count(), 0);
    await page.getByRole("button", { name: "次の制作モード", exact: true }).click();
    await page.locator(".physics-canvas").waitFor();
    assert.equal(await page.getByRole("button", { name: "すべて", exact: true }).getAttribute("aria-pressed"), "true", "hero mode must not select a work category");
    assert.deepEqual(await page.locator(".work-link").evaluateAll((links) => links.map((link) => link.getAttribute("href"))), allWorks, "hero game mode must not filter or reorder works");
    assert(await page.locator(".physics-canvas").evaluate((canvas) => {
      const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
      const colors = new Set();
      for (let index = 0; index < pixels.length; index += 16) colors.add(`${pixels[index]},${pixels[index + 1]},${pixels[index + 2]}`);
      return colors.size > 30;
    }), "physics canvas must contain visible rendered parts");
    const beforeKick = await page.locator(".physics-canvas").evaluate((canvas) => canvas.toDataURL());
    await page.getByRole("button", { name: "パーツを跳ねさせる", exact: true }).click();
    await page.waitForTimeout(250);
    assert.notEqual(await page.locator(".physics-canvas").evaluate((canvas) => canvas.toDataURL()), beforeKick, "physics must actually move");
    await page.getByRole("button", { name: "重力を反転", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: "重力を反転", exact: true }).getAttribute("aria-pressed"), "true");
    await page.getByRole("button", { name: "パーツを元に戻す", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: "重力を反転", exact: true }).getAttribute("aria-pressed"), "false");
    const beforeDrag = await page.locator(".physics-canvas").evaluate((canvas) => canvas.toDataURL());
    const dragPoint = await page.locator(".physics-canvas").evaluate((canvas) => {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(rect.width / 480, rect.height / 280);
      return { x: rect.left + (rect.width - 480 * scale) / 2 + 65 * scale, y: rect.top + (rect.height - 280 * scale) / 2 + 88 * scale, scale };
    });
    await page.mouse.move(dragPoint.x, dragPoint.y);
    await page.mouse.down();
    await page.mouse.move(dragPoint.x + 70 * dragPoint.scale, dragPoint.y - 25 * dragPoint.scale, { steps: 5 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    assert.notEqual(await page.locator(".physics-canvas").evaluate((canvas) => canvas.toDataURL()), beforeDrag, "physics parts must be draggable");
    await page.getByRole("button", { name: "パーツを元に戻す", exact: true }).click();
    await checkDemo("game");
    await page.getByRole("button", { name: "次の制作モード", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: "すべて", exact: true }).getAttribute("aria-pressed"), "true");
    assert.deepEqual(await page.locator(".work-link").evaluateAll((links) => links.map((link) => link.getAttribute("href"))), allWorks, "hero system mode must not filter or reorder works");
    await page.getByLabel("アイデアのタイトル", { exact: true }).fill("  Browser Sketch  ");
    await page.getByRole("button", { name: "JSONをつくる", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "JSONを作成しました" }).waitFor();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "JSONをダウンロード", exact: true }).click();
    const download = await downloadPromise;
    const downloadPath = path.join(output, `idea-${width}.json`);
    await download.saveAs(downloadPath);
    assert.deepEqual(JSON.parse(await readFile(downloadPath, "utf8")), { title: "Browser Sketch", status: "idea", tags: [] });
    await checkDemo("system");
    await page.getByLabel("アイデアのタイトル", { exact: true }).fill(" ");
    await page.getByRole("button", { name: "JSONをつくる", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "タイトルを入力してください" }).waitFor();
    await checkDemoGeometry(page, "system", width, height);
    await page.getByRole("button", { name: "次の制作モード", exact: true }).click();
    assert.equal(await page.locator(".hero").getAttribute("data-mode"), "app");
    assert.equal(await note.count(), 1, "notes must survive mode switching");
    await page.getByRole("button", { name: `${noteTitle}を削除`, exact: true }).click();
    assert.equal(await note.count(), 0);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await note.count(), 0, "deletion must survive reload");
    await page.getByRole("button", { name: "すべて", exact: true }).click();
    await page.locator("#top").scrollIntoViewIfNeeded();
    await page.getByRole("link", { name: "制作物を見る", exact: true }).click();
    assert(await page.locator("#projects").evaluate((element) => {
      const top = element.getBoundingClientRect().top;
      return top >= -1 && top <= 100;
    }), "hero link must navigate to works");
    const originalCount = await page.locator(".work-item").count();
    const originalOrder = await page.locator(".work-link").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    for (const category of ["アプリ・Web", "ゲーム", "システム"]) {
      await page.getByRole("button", { name: category, exact: true }).click();
      assert.equal(await page.getByRole("button", { name: category, exact: true }).getAttribute("aria-pressed"), "true");
      assert.equal(await page.locator(".hero").getAttribute("data-mode"), "app", "category selection must not change the hero demo");
      const filteredOrder = await page.locator(".work-link").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
      assert(filteredOrder.length < originalCount);
      assert.deepEqual(filteredOrder, originalOrder.filter((href) => filteredOrder.includes(href)), "filtering must preserve registered order");
      for (const mode of ["ゲームを作る", "仕組みを作る", "アプリを作る"]) {
        await page.getByRole("button", { name: mode, exact: true }).click();
        assert.equal(await page.getByRole("button", { name: category, exact: true }).getAttribute("aria-pressed"), "true");
        assert.deepEqual(await page.locator(".work-link").evaluateAll((links) => links.map((link) => link.getAttribute("href"))), filteredOrder, "hero modes must preserve selected category and order");
      }
      await page.getByRole("link", { name: "制作物一覧へ", exact: true }).click();
      assert.equal(await page.getByRole("button", { name: category, exact: true }).getAttribute("aria-pressed"), "true", "hero works link must preserve the selected category");
      await page.getByRole("link", { name: "制作物を見る", exact: true }).click();
      assert.equal(await page.getByRole("button", { name: category, exact: true }).getAttribute("aria-pressed"), "true");
    }
    await page.getByRole("button", { name: "すべて", exact: true }).click();
    assert.equal(await page.locator(".work-item").count(), originalCount);
    assert.deepEqual(await page.locator(".work-link").evaluateAll((links) => links.map((link) => link.getAttribute("href"))), originalOrder, "returning to all works must restore the original order");
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
    assert.equal(await page.locator('main a[href*="github.com"]').count(), 0, "TSUDOWA must not expose a repository link");
    assert.equal(await page.locator(".header-github").getAttribute("href"), "https://github.com/shu-wa");
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
  if (!process.env.TEST_WIDTH && !notesOnly) for (const [width, height] of [[1440, 1000], [390, 740], [375, 667]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "no-preference" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(base, { waitUntil: "networkidle" });
    const cycle = page.getByRole("button", { name: "次の制作モード", exact: true });
    await cycle.focus(); await page.keyboard.press("Enter");
    await page.locator(".physics-canvas").waitFor();
    const before = await page.locator(".physics-canvas").evaluate((canvas) => canvas.toDataURL());
    await page.getByRole("button", { name: "パーツを跳ねさせる", exact: true }).click();
    await page.waitForTimeout(800);
    assert.notEqual(await page.locator(".physics-canvas").evaluate((canvas) => canvas.toDataURL()), before);
    await page.screenshot({ path: path.join(output, `motion-${width}.png`) });
    await cycle.click();
    await page.waitForTimeout(450);
    // Freeze only the next processing timers so the transient layout can be measured reliably.
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    await page.getByRole("button", { name: "JSONをつくる", exact: true }).click();
    assert.equal(await page.locator(".system-sketch .sketch-status").textContent(), "処理中");
    await checkDemoGeometry(page, "system", width, height);
    await page.clock.runFor(600);
    assert.equal(await page.locator(".system-sketch .sketch-status").textContent(), "JSONを作成しました");
    await checkDemoGeometry(page, "system", width, height);
    await page.getByLabel("アイデアのタイトル", { exact: true }).fill("Another idea");
    await page.getByRole("button", { name: "JSONをつくる", exact: true }).click();
    await cycle.click();
    await page.clock.runFor(700);
    assert.equal(await page.locator(".hero").getAttribute("data-mode"), "app");
    assert.deepEqual(errors, [], `normal-motion lifecycle at ${width}`);
    await context.close();
    console.log(`PASS normal motion and keyboard ${width}x${height}`);
  }
  if (!process.env.TEST_WIDTH || notesOnly) {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    const key = "portfolio:idea-notes:v1";
    await page.goto(base, { waitUntil: "networkidle" });
    for (const malformed of ["not-json", '[{"id":"x","title":"invalid","done":"yes"}]', '[{"id":"x","title":"one","done":false},{"id":"x","title":"two","done":true}]']) {
      await page.evaluate(({ key, malformed }) => localStorage.setItem(key, malformed), { key, malformed });
      await page.reload({ waitUntil: "networkidle" });
      assert.equal(await page.getByRole("checkbox").count(), 2, "invalid saved notes must fall back safely");
    }
    const escaped = '<img src=x onerror="alert(1)">';
    await page.getByLabel("つくりたいこと", { exact: true }).fill(escaped);
    await page.getByRole("button", { name: "メモを追加", exact: true }).click();
    assert.equal(await page.locator(".idea-list img").count(), 0);
    assert.equal(await page.getByRole("checkbox", { name: escaped, exact: true }).count(), 1);
    const otherTab = await context.newPage();
    await otherTab.goto(base, { waitUntil: "networkidle" });
    await otherTab.getByRole("checkbox", { name: escaped, exact: true }).waitFor();
    await page.getByRole("button", { name: `${escaped}を削除`, exact: true }).click();
    await otherTab.getByRole("checkbox", { name: escaped, exact: true }).waitFor({ state: "detached" });
    await page.evaluate((key) => localStorage.setItem(key, "[]"), key);
    await page.reload({ waitUntil: "networkidle" });
    await page.locator(".idea-empty").waitFor();
    assert.equal(await page.getByRole("checkbox").count(), 0);
    assert.equal(await page.locator(".idea-empty").textContent(), "メモはありません");
    for (let index = 0; index < 13; index++) {
      await page.getByLabel("つくりたいこと", { exact: true }).fill(`Idea ${index}`);
      await page.getByRole("button", { name: "メモを追加", exact: true }).click();
    }
    assert.equal(await page.getByRole("checkbox").count(), 12);
    assert.equal(await page.locator(".idea-notes .sketch-status").textContent(), "メモは12件までです。");
    await context.close();
    const blocked = await browser.newContext({ reducedMotion: "reduce" });
    await blocked.addInitScript(() => {
      Object.defineProperty(Storage.prototype, "setItem", { value: () => { throw new DOMException("Blocked", "QuotaExceededError"); } });
    });
    const blockedPage = await blocked.newPage();
    await blockedPage.goto(base, { waitUntil: "networkidle" });
    await blockedPage.getByLabel("つくりたいこと", { exact: true }).fill("Temporary idea");
    await blockedPage.getByRole("button", { name: "メモを追加", exact: true }).click();
    assert.equal(await blockedPage.getByRole("checkbox", { name: "Temporary idea", exact: true }).count(), 1);
    assert((await blockedPage.locator(".idea-notes .sketch-status").textContent()).includes("一時保存"));
    await blockedPage.getByRole("button", { name: "仕組みを作る", exact: true }).click();
    await blockedPage.getByRole("button", { name: "アプリを作る", exact: true }).click();
    assert.equal(await blockedPage.getByRole("checkbox", { name: "Temporary idea", exact: true }).count(), 1);
    await blocked.close();
    console.log("PASS notes validation, escaping, cross-tab sync, limits and blocked storage");
  }
  const request = await browser.newContext();
  for (const route of ["/api/contacts", "/api/projects?view=admin"]) assert.equal((await request.request.get(base + route)).status(), 401);
  const hostile = await request.request.post(base + "/api/contact", { headers: { Origin: "https://evil.example" }, data: { name: "Test", email: "test@example.com", message: "Test" } });
  assert.equal(hostile.status(), 403);
  await request.close();
  if (!notesOnly) await writeFile(path.join(output, "results.json"), JSON.stringify(results, null, 2));
  console.log("Browser checks passed. Screenshots: .artifacts/browser");
} finally {
  await browser.close();
}
