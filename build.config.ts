import { defineBuildConfig } from 'unbuild'


export default defineBuildConfig({
  entries: [
    './src/index',
  ],
  rollup: {
    emitCJS: true,
  },
  externals: [
    '@vuepress/bundler-webpack',
    '@vuepress/core',
    'chokidar',
    'defu',
    'globby',
    'gray-matter',
    'vue-docgen-cli',
    'vue-docgen-api',
    'webpack-chain',
  ],

  outDir: 'dist',
  declaration: true,
});
