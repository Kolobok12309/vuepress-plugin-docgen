import { resolve, dirname, join } from 'path';

import type { Plugin, PageData } from 'vuepress';
import { parse, type ComponentDoc } from 'vue-docgen-api';
import chokidar from 'chokidar';

import { isFileExists } from './utils';


export interface VueDocgenPluginOptions {

}

export const VueDocgenPlugin = (options: VueDocgenPluginOptions) => {
  let componentPaths = [];

  return {
    name: 'vuepress-plugin-docgen',

    extendsPage: async (page, app) => {
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
    },

    clientConfigFile: resolve(__dirname, './runtime/client.ts')
  } as Plugin;
}
