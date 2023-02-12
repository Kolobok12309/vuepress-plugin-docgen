import { type App, createPage } from '@vuepress/core';
import glob from 'globby';


// Add missing pages to app (for example from onInitialized hook, after original resolvePages)
export const reResolveAppPages = async (app: App): Promise<void> => {
  const pageFilePaths = await glob(app.options.pagePatterns, {
    absolute: true,
    cwd: app.dir.source(),
  });

  const createdPages = await Promise.all(
    pageFilePaths
      .filter((filePath) =>
        // Ignore already added pages
        !app.pages.some((page) => page.filePath === filePath)
      )
      .map((filePath) => createPage(app, { filePath }))
  );

  app.pages.push(...createdPages);
}
