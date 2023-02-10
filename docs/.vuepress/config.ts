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

      // components: 'components/**/*.vue',
      // components: [
      //   {
      //     root: resolve(__dirname, '../../components'),
      //     in: '**/*.vue',
      //     out: 'components',
      //   },
      //   {
      //     root: resolve(__dirname, '../../components'),
      //     in: '**/*.vue',
      //     out: 'foo/bar',
      //   }
      // ],
    }),
  ],
});
