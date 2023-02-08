import { defineUserConfig } from 'vuepress';

import { VueDocgenPlugin } from '../../src/index';


export default defineUserConfig({
  plugins: [
    VueDocgenPlugin({}),
  ],
});
