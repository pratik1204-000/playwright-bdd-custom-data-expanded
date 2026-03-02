import { test, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export class ScreenshotOperations {

  /**
   * Takes a screenshot and stores it inside test output directory
   */
  static async save(
    page: Page,
    name: string
  ): Promise<void> {

    const buffer = await page.screenshot();

    const safeName = name
      .replace(/[\/\\:?*"<>|]/g, '-')
      .replace(/\s+/g, '-')
      .substring(0, 150);

    // Track screenshots on testInfo
    const testInfoAny = test.info() as any;
    testInfoAny._shots = testInfoAny._shots || [];

    const dir = path.join(test.info().outputDir, 'screens');
    fs.mkdirSync(dir, { recursive: true });

    const filename = `${Date.now()}-${safeName}.png`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, buffer);

    testInfoAny._shots.push({
      path: filepath,
      name,
      time: new Date().toISOString()
    });

    console.info(`[Screenshot saved] ${name}`);
  }

  /**
   * Takes a screenshot and attaches it to Playwright HTML report
   */
  static async attach(
    page: Page,
    name: string
  ): Promise<void> {

    const buffer = await page.screenshot();

    await test.info().attach(name, {
      body: buffer,
      contentType: 'image/png'
    });

    console.info(`[Screenshot attached to report] ${name}`);
  }
}