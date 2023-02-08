import { defineClientConfig } from '@vuepress/client';

import DocComponent from './doc-component/index.vue';


export default defineClientConfig({
  enhance({ app }) {
    app.component('DocComponent', DocComponent);
  },
});
