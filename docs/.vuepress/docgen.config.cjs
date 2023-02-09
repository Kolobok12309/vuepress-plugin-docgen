const { resolve } = require('path');

const { defineConfig } = require('vue-docgen-cli');


module.exports = defineConfig({
  docsRepo: 'kolobok123409/vuepress-plugin-docgen',
  docsBranch: 'master',
  editLinkLabel: 'Edit on github',
  componentsRoot: resolve(__dirname, '../components'),
  components: [
    '**/[a-zA-Z]*.vue'
  ],
});
