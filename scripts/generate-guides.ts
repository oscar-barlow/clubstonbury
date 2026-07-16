import { chromium } from '@playwright/test';
import path from 'node:path';
import process from 'node:process';

const guides = [
  {
    source: 'admin-guide.html',
    output: 'clubstonbury-admin-guide.pdf',
  },
  {
    source: 'algorithm-guide.html',
    output: 'clubstonbury-algorithm-guide.pdf',
  },
];

const executablePath = process.env.CHROMIUM_BIN;
const browser = await chromium.launch(executablePath ? { executablePath } : undefined);

try {
  await Deno.mkdir('static/guides', { recursive: true });
  for (const guide of guides) {
    const page = await browser.newPage();
    const sourcePath = path.resolve('guides', guide.source);
    await page.goto(new URL(`file://${sourcePath}`).href, { waitUntil: 'load' });

    const layout = await page.locator('.page').evaluateAll((pages) =>
      pages.map((item) => {
        const content = item.querySelector<HTMLElement>('.page-content');
        return {
          clientHeight: content?.clientHeight ?? 0,
          scrollHeight: content?.scrollHeight ?? 0,
        };
      })
    );
    if (layout.length !== 2) {
      throw new Error(`${guide.source} must contain exactly two .page elements.`);
    }
    if (layout.some(({ clientHeight, scrollHeight }) => scrollHeight > clientHeight + 1)) {
      throw new Error(
        `${guide.source} has content overflowing its printable page: ${JSON.stringify(layout)}`,
      );
    }

    await page.pdf({
      path: path.resolve('static/guides', guide.output),
      format: 'A4',
      preferCSSPageSize: true,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    await page.close();
  }
} finally {
  await browser.close();
}
