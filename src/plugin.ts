import { resolve, join, basename } from 'path';

import type { Plugin } from '@vuepress/core';
import { createPage } from '@vuepress/core';

import _docgen, { extractConfig } from 'vue-docgen-cli';
import WebpackConfig from 'webpack-chain';
import glob from 'globby';

import defu from 'defu';
import chokidar from 'chokidar';

import { templateComponent } from './templates';

import type { VueDocgenPluginPages, VueDocgenPluginOptions } from './types';
import { sleep, webpackHandleResolve } from './utils';
import { tmpFolderName } from './config';


// TODO Fix this imports
const docgen = (_docgen as any).default as typeof import('vue-docgen-cli').default;


export const VueDocgenPlugin = ({
  docgenCliConfig = {},
  docgenCliConfigPath,

  pages = [{ components: ['**/components/**/*.vue', '!**/node_modules/**', '!**/.vuepress/**'] }],
}: VueDocgenPluginOptions) => {
  // Normalize pages
  if (!Array.isArray(pages))
    pages = [pages];

  const normalizedPages: VueDocgenPluginPages[] = pages.map((stringOrObject) => {
    if (typeof stringOrObject === 'string') return {
      components: stringOrObject,
    };

    return stringOrObject;
  });


  return {
    name: 'vuepress-plugin-docgen',

    onInitialized: async (app) => {
      const { grayMatterOptions } = app.options.markdown.frontmatter || {};
      const tmpFolder = join(app.options.temp, tmpFolderName);

      // Create WebpackConfig for getting aliases and other config.resolve
      const webpackConfig = new WebpackConfig();

      await webpackHandleResolve({ app, config: webpackConfig, isServer: true });

      const baseDocgenCliConfig = defu(docgenCliConfig, {
        apiOptions: {
          ...webpackConfig.toConfig().resolve as any,
        },
        templates: {
          component: templateComponent(grayMatterOptions),
        },
      }, extractConfig(process.cwd(), app.env.isDev, docgenCliConfigPath, []));

      // Generate doc from components entries
      await Promise.all(normalizedPages.map(async ({
        root: componentsRoot,
        components,
        outDir: rawOutDir = '',
      }) => {
        const outDir = resolve(tmpFolder, rawOutDir);
        const config = {
          ...baseDocgenCliConfig,
          ...(componentsRoot && { componentsRoot }),
          components,
          outDir,
        };

        await docgen(config);
      }));

      // Without it, glob doesn't see generated files
      await sleep(100);

      // Read all generated doc files
      const docFiles = await glob('**/*.md', {
        cwd: tmpFolder,
      });

      // Add result files to vuepress router
      await Promise.all(docFiles.map(async (relativeDocPath) => {
        let normalizedRelativeDocPath = relativeDocPath;
        const docBasename = basename(relativeDocPath);

        // Normalize path
        // Remove extension .md
        normalizedRelativeDocPath = normalizedRelativeDocPath.slice(0, -3);
        // Imitate vuepress index files README.md logic
        if (docBasename.toLowerCase() === 'readme.md')
          normalizedRelativeDocPath = normalizedRelativeDocPath.replace(/readme$/i, '');

        // Remove last slash
        if (normalizedRelativeDocPath.endsWith('/'))
          normalizedRelativeDocPath = normalizedRelativeDocPath.slice(0, -1);

        const page = await createPage(app, {
          path: '/' + normalizedRelativeDocPath,
          filePath: join(tmpFolder, relativeDocPath),
          isDocgenPage: true,
          frontmatter: {
            // Disable editLink by default, because vue-docgen-cli
            // creates its links
            editLink: false,
          },
        });

        // Use original permalink if exists
        if (page.permalink)
          page.path = page.permalink;

        app.pages.push(page);
      }));
    },


    onWatched(app, watchers, restart) {
      const tmpFolder = join(app.options.temp, tmpFolderName);

      const watcher = chokidar.watch('**/*.md', {
        cwd: tmpFolder,
        ignoreInitial: true,
      });

      watcher.on('change', () => restart());

      watchers.push(watcher);
    },
  } as Plugin;
}
