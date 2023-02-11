import { resolve } from 'path';

import { defineUserConfig } from 'vuepress';
import { defineConfig } from 'vue-docgen-cli';

import { VueDocgenPlugin } from '../../src/index';


export default defineUserConfig({
  base: process.env.BASE_URL as any || '/',

  alias: {
    '@runtime': resolve(__dirname, '../../src/runtime'),
  },
  plugins: [
    VueDocgenPlugin({
      // docgenCliConfigPath: resolve(__dirname, './docgen.config.cjs'),
      docgenCliConfig: defineConfig({
        docsRepo: 'kolobok12309/vuepress-plugin-docgen',
        docsBranch: 'master',
        editLinkLabel: 'Edit on github',
      }),

      pages: 'components/**/*.vue',
      // pages: [
      //   {
      //     root: resolve(__dirname, '../../components'),
      //     components: '**/*.vue',
      //     outDir: 'components',
      //   },
      //   {
      //     root: resolve(__dirname, '../../components'),
      //     components: '**/*.vue',
      //     outDir: 'foo/bar',
      //   }
      // ],
    }),
  ],
});
