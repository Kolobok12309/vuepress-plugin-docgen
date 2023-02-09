import { resolve } from 'path';

import { defineUserConfig } from 'vuepress';

import { VueDocgenPlugin } from '../../src/index';


export default defineUserConfig({
  alias: {
    '@runtime': resolve(__dirname, '../../src/runtime'),
  },
  plugins: [
    VueDocgenPlugin({
      docgenCliConfigPath: resolve(__dirname, './docgen.config.cjs'),
    }),
  ],
});
