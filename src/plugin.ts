import { resolve, join, basename, relative, dirname } from 'path';
import { unlink, mkdir, symlink } from 'fs/promises';

import type { Plugin } from '@vuepress/core';
import { createPage } from '@vuepress/core';
import { handlePageAdd, handlePageChange, handlePageUnlink } from '@vuepress/cli';

import _docgen, { extractConfig } from 'vue-docgen-cli';
import WebpackConfig from 'webpack-chain';
import glob from 'globby';

import { defu } from 'defu';
import chokidar, { type FSWatcher } from 'chokidar';

import { templateComponent } from './templates';

import type { VueDocgenPluginGroup, VueDocgenPluginOptions } from './types';
import {
  sleep,
  webpackHandleResolve,
  defaultGetDestFile,
  reResolveAppPages,
  isFileExists,
} from './utils';
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
  const cwd = process.cwd();


  return {
    name: 'vuepress-plugin-docgen',

    onInitialized: async (app) => {
      const { grayMatterOptions } = app.options.markdown.frontmatter || {};
      const tmpFolder = join(app.options.temp, tmpFolderName);
      const rootFolder = app.dir.source();

      if (stateless) {
        // Ignore native watch for pages
        app.options.pagePatterns.push(`!${relative(rootFolder, tmpFolder)}/**/*.md`);
      }

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
      }, await extractConfig(cwd, app.env.isDev, docgenCliConfigPath, []));

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

    async onWatched(app, watchers, restart) {
      const configFilePath = docgenCliConfigPath
        ? resolve(cwd, docgenCliConfigPath)
        : join(cwd, 'docgen.config.js');

      const configWatcher = chokidar.watch(configFilePath, {
        ignoreInitial: true,
      });

      configWatcher.on('change', () => restart());

      watchers.push(configWatcher);

      if (!stateless) return;

      // Base logic of watching for `tmpFolder` is creating symlink's on every changes
      // and update pages by them, because vuepress use only `filePath` for updates
      // without some additional properties, for example `path`
      const tmpFolder = join(app.options.temp, tmpFolderName);
      const rootFolder = app.dir.source();

      const [nativePagesWatcher] = watchers as FSWatcher[];

      const pagesWatcher = chokidar.watch('**/*.md', {
        cwd: tmpFolder,
        ignoreInitial: true,
      });

      const changedSet = new Set<string>();
      pagesWatcher.on('add', async (filePathRelative) => {
        console.log(`[vuepress-plugin-vue-docgen] add page: "${filePathRelative}"`);

        const filePath = join(tmpFolder, filePathRelative);
        const fullPathInDocs = resolve(rootFolder, filePathRelative);

        const isAlreadyExistsInDocs = await isFileExists(fullPathInDocs);

        if (isAlreadyExistsInDocs) {
          console.warn(`[vuepress-plugin-vue-docgen] Not add page "${filePathRelative}", file already exists in "${fullPathInDocs}"`);
          return;
        }

        nativePagesWatcher.unwatch(fullPathInDocs);

        await mkdir(dirname(fullPathInDocs), { recursive: true });
        await symlink(filePath, fullPathInDocs, 'file');

        try {
          await handlePageAdd(app, fullPathInDocs);

          changedSet.add(filePath);
        } catch (err) {
          console.warn(`[vuepress-plugin-vue-docgen] Error while process tmp symlink`, err);
        }

        await unlink(fullPathInDocs);
      });
      pagesWatcher.on('change', async (filePathRelative) => {
        console.log(`[vuepress-plugin-vue-docgen] change page: "${filePathRelative}"`);

        const filePath = join(tmpFolder, filePathRelative);
        const fullPathInDocs = resolve(rootFolder, filePathRelative);

        const isAlreadyExistsInDocs = await isFileExists(fullPathInDocs);

        if (isAlreadyExistsInDocs) {
          console.warn(`[vuepress-plugin-vue-docgen] Not update page "${filePathRelative}", file already exists in "${fullPathInDocs}"`);
          return;
        }

        const isAlreadyChanged = changedSet.has(filePath);

        if (!isAlreadyChanged) {
          changedSet.add(filePath);

          // With unlink, first change not update hmr
          // await handlePageUnlink(app, filePath);
          nativePagesWatcher.unwatch(fullPathInDocs);
        }

        await mkdir(dirname(fullPathInDocs), { recursive: true });
        await symlink(filePath, fullPathInDocs, 'file');

        try {
          if (isAlreadyChanged) await handlePageChange(app, fullPathInDocs);
          else await handlePageAdd(app, fullPathInDocs);
        } catch (err) {
          console.warn(`[vuepress-plugin-vue-docgen] Error while process tmp symlink`, err);
        }

        await unlink(fullPathInDocs);
      });
      pagesWatcher.on('unlink', async (filePathRelative) => {
        console.log(`[vuepress-plugin-vue-docgen] unlink page: "${filePathRelative}"`);

        const filePath = join(tmpFolder, filePathRelative);
        const fullPathInDocs = resolve(rootFolder, filePathRelative);

        const isAlreadyChanged = changedSet.has(filePath);

        const unlinkPath = isAlreadyChanged
          ? fullPathInDocs
          : filePath;

        await handlePageUnlink(app, unlinkPath);
      });

      watchers.push(pagesWatcher);
    },
  } as Plugin;
}
