const { resolve } = require('path');

const { defineConfig } = require('vue-docgen-cli');


module.exports = defineConfig({
  docsRepo: 'kolobok12309/vuepress-plugin-docgen',
  docsBranch: 'master',
  editLinkLabel: 'Edit on github',
  componentsRoot: resolve(__dirname, '../../components'),
  outDir: 'components',
  components: [
    '**/[a-zA-Z]*.vue'
  ],
});
