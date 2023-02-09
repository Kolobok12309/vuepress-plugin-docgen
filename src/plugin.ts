import { resolve, dirname, join, isAbsolute } from 'path';

import type { Plugin, PageData } from 'vuepress';

import { parse, type ComponentDoc } from 'vue-docgen-api';
import _docgen, { extractConfig, type DocgenCLIConfig } from 'vue-docgen-cli';
import WebpackConfig from 'webpack-chain';

import chokidar from 'chokidar';

import { isFileExists, webpackHandleResolve } from './utils';


const docgen = (_docgen as any).default as typeof import('vue-docgen-cli').default;

export interface VueDocgenPluginOptions {
  docgenCliConfig?: DocgenCLIConfig;
  docgenCliConfigPath?: string;
}

export const VueDocgenPlugin = ({
  docgenCliConfig,
  docgenCliConfigPath,
}: VueDocgenPluginOptions) => {
  let componentPaths = [];

  return {
    name: 'vuepress-plugin-docgen',

    onInitialized: async (app) => {
      console.log('app.options', app.options);
      if (!docgenCliConfig) {
        docgenCliConfig = extractConfig(process.cwd(), app.env.isDev, docgenCliConfigPath, []);
      }

      const webpackConfig = new WebpackConfig();

      await webpackHandleResolve({ app, config: webpackConfig, isServer: true });

      docgenCliConfig = {
        ...docgenCliConfig,
        apiOptions: {
          jsx: true,
          ...docgenCliConfig.apiOptions,
          ...webpackConfig.toConfig().resolve as any,
        },

        outDir: !docgenCliConfig.outDir || isAbsolute(docgenCliConfig.outDir)
          ? docgenCliConfig.outDir
          : join(app.options.source, docgenCliConfig.outDir),
      }

      console.log('Res config', docgenCliConfig);

      console.log('Starting vue-docgen-cli');
      await docgen(docgenCliConfig);
    },

    /*extendsPage: async (page, app) => {
      if (page.filePath) {
        const fileDir = dirname(page.filePath);
        const componentPath = page?.frontmatter?.componentPath as string || 'index.vue';
        const fullComponentPath = resolve(fileDir, componentPath);
        const isComponentExists = await isFileExists(fullComponentPath);

        if (isComponentExists) {
          componentPaths.push(fullComponentPath);

          page.frontmatter = page.frontmatter ?? {};
          page.frontmatter.componentPath = componentPath;
          page.frontmatter.fullComponentPath = fullComponentPath;

          const parsedComponent = await parse(fullComponentPath);

          page.data.componentDoc = parsedComponent;
          console.log(page.filePath, parsedComponent);
        }
      }
    },

    onWatched(app, watchers, restart) {
      const watcher = chokidar.watch(componentPaths, {
        cwd: process.cwd(),
        ignoreInitial: true,
      });

      watcher.on('change', () => restart());

      watchers.push(watcher);
    },*/

    clientConfigFile: resolve(__dirname, './runtime/client.ts')
  } as Plugin;
}
