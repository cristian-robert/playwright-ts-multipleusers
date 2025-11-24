// tests/global-setup.ts
import { chromium, FullConfig } from "@playwright/test";
import { config } from "../src/config/env.config";
import { createMicrosoftAuthHelper } from "@utils/auth/microsoft-sso.helper";
import * as path from "path";
import * as fs from "fs";

const AUTH_DIR = path.join(process.cwd(), "playwright/.auth");

async function authenticateUser(
  browser: any,
  email: string,
  password: string,
  storageStatePath: string
) {
  // Skip if already authenticated (file exists and not expired)
  if (fs.existsSync(storageStatePath)) {
    const stats = fs.statSync(storageStatePath);
    const hoursSinceModified = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
    if (hoursSinceModified < 12) {
      // Reuse if less than 12 hours old
      console.log(`✅ Reusing existing auth state: ${storageStatePath}`);
      return;
    }
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(config.baseUrl);
  await page.waitForLoadState("networkidle");

  const loginButton = page
    .locator('button:has-text("Login"), a:has-text("Login")')
    .first();
  if (await loginButton.isVisible().catch(() => false)) {
    await loginButton.click();
    await page.waitForLoadState("networkidle");

    const authHelper = createMicrosoftAuthHelper(page);
    await authHelper.login({ email, password });

    console.log(`✅ Authenticated: ${email}`);
  }

  // Save storage state
  await context.storageState({ path: storageStatePath });
  await context.close();
}

async function globalSetup(config: FullConfig) {
  // Create auth directory
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const users = [
    {
      email: process.env.USER1_EMAIL!,
      password: process.env.USER1_PASSWORD!,
      file: "user1.json",
    },
    {
      email: process.env.USER2_EMAIL!,
      password: process.env.USER2_PASSWORD!,
      file: "user2.json",
    },
    {
      email: process.env.USER3_EMAIL!,
      password: process.env.USER3_PASSWORD!,
      file: "user3.json",
    },
  ];

  for (const user of users) {
    if (user.email && user.password) {
      await authenticateUser(
        browser,
        user.email,
        user.password,
        path.join(AUTH_DIR, user.file)
      );
    }
  }

  await browser.close();
}

export default globalSetup;
