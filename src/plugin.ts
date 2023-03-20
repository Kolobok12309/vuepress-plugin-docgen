import { resolve, join, basename } from 'path';

import type { Plugin } from '@vuepress/core';
import { createPage } from '@vuepress/core';

import _docgen, { extractConfig } from 'vue-docgen-cli';
import WebpackConfig from 'webpack-chain';
import glob from 'globby';

import { defu } from 'defu';
import chokidar from 'chokidar';

import { templateComponent } from './templates';

import type { VueDocgenPluginGroup, VueDocgenPluginOptions } from './types';
import { sleep, webpackHandleResolve, defaultGetDestFile, reResolveAppPages } from './utils';
import { tmpFolderName } from './config';


// TODO Fix this imports
const docgen = (_docgen as any).default as typeof import('vue-docgen-cli').default;


export const VueDocgenPlugin = ({
  docgenCliConfig = {},
  docgenCliConfigPath,

  groups = [{ components: ['**/components/**/*.vue', '!**/node_modules/**', '!**/.vuepress/**'] }],
  stateless = true,
}: VueDocgenPluginOptions) => {
  // Normalize groups
  if (!Array.isArray(groups))
    groups = [groups];

  const normalizedGroups = groups.map<VueDocgenPluginGroup>((stringOrObject) => {
    if (typeof stringOrObject === 'string') return {
      components: stringOrObject,
    } as VueDocgenPluginGroup;

    return stringOrObject;
  });


  return {
    name: 'vuepress-plugin-docgen',

    onInitialized: async (app) => {
      const { grayMatterOptions } = app.options.markdown.frontmatter || {};
      const tmpFolder = join(app.options.temp, tmpFolderName);
      const rootFolder = app.dir.source();

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
        getDestFile: defaultGetDestFile,
      }, await extractConfig(process.cwd(), app.env.isDev, docgenCliConfigPath, []));

      // Generate doc from components entries
      await Promise.all(normalizedGroups.map(async ({
        root: componentsRoot,
        components,
        outDir: rawOutDir = '',
        docgenCliConfig: groupDocgenCliConfig = {},
      }) => {
        const outDir = stateless
          ? resolve(tmpFolder, rawOutDir)
          : resolve(rootFolder, rawOutDir);
        const config = defu({
          componentsRoot,
          components,
          outDir,
        }, baseDocgenCliConfig, groupDocgenCliConfig);

        await docgen(config);
      }));

      // Without it, glob doesn't see generated files
      await sleep(100);

      if (!stateless) {
        // resolvePages that have been added by docgen
        // TODO Handle case when file already exists, but changed by docgen
        await reResolveAppPages(app);
        return;
      }

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
            // Disable editLink by default for stateless
            // because it created in tmp folder
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
      if (!stateless) return;

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
