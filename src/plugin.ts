import { resolve, join, basename } from 'path';

import type { Plugin } from 'vuepress';
import { createPage } from 'vuepress';

import _docgen, { extractConfig } from 'vue-docgen-cli';
// Is compatible with defineConfig
import type { DocgenCLIConfig } from 'vue-docgen-cli/lib/config';
import WebpackConfig from 'webpack-chain';
import glob from 'globby';

import defu from 'defu';
import chokidar from 'chokidar';

import { sleep, webpackHandleResolve } from './utils';
import { tmpFolderName } from './config';


const docgen = (_docgen as any).default as typeof import('vue-docgen-cli').default;


export interface ComponentsInfo {
  root?: string;
  in: string | string[];
  out?: string;
}
export interface VueDocgenPluginOptions {
  docgenCliConfig?: Partial<Omit<DocgenCLIConfig, 'outDir' | 'components'>>;
  docgenCliConfigPath?: string;

  components: string | string[] | ComponentsInfo[];
}

export const VueDocgenPlugin = ({
  docgenCliConfig = {},
  docgenCliConfigPath,

  components = [],
}: VueDocgenPluginOptions) => {
  // Normalize components
  if (!Array.isArray(components))
    components = [components];

  const normalizedComponentsInfo: ComponentsInfo[] = components.map((stringOrObject) => {
    if (typeof stringOrObject === 'string') return {
      in: stringOrObject,
    };

    return stringOrObject;
  });


  return {
    name: 'vuepress-plugin-docgen',

    onInitialized: async (app) => {
      const tmpFolder = join(app.options.temp, tmpFolderName);

      const safeDocgenCliConfig = defu(docgenCliConfig, extractConfig(process.cwd(), app.env.isDev, docgenCliConfigPath, []));

      // Create WebpackConfig for getting aliases and other config.resolve
      const webpackConfig = new WebpackConfig();

      await webpackHandleResolve({ app, config: webpackConfig, isServer: true });

      const baseDocgenCliConfig = {
        ...safeDocgenCliConfig,
        apiOptions: {
          jsx: true,
          ...safeDocgenCliConfig.apiOptions,
          ...webpackConfig.toConfig().resolve as any,
        },
      };

      // Generate doc from components entries
      await Promise.all(normalizedComponentsInfo.map(async ({
        root: componentsRoot,
        in: componentsInput,
        out: componentsOutput = '',
      }) => {
        const outDir = resolve(tmpFolder, componentsOutput);
        const config = {
          ...baseDocgenCliConfig,
          ...(componentsRoot && { componentsRoot }),
          components: componentsInput,
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
        // Make README and index more friendly urls
        if (docBasename.toLowerCase() === 'readme.md')
          normalizedRelativeDocPath = normalizedRelativeDocPath.replace(/readme$/i, '');
        if (docBasename.toLowerCase() === 'index.md')
          normalizedRelativeDocPath = normalizedRelativeDocPath.replace(/index$/i, '');

        // Remove last slash
        if (normalizedRelativeDocPath.endsWith('/'))
          normalizedRelativeDocPath = normalizedRelativeDocPath.slice(0, -1);

        const page = await createPage(app, {
          path: '/' + normalizedRelativeDocPath,
          filePath: join(tmpFolder, relativeDocPath),
        });

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

    // clientConfigFile: resolve(__dirname, './runtime/client.ts')
  } as Plugin;
}
