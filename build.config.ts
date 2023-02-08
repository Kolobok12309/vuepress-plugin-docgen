import { defineBuildConfig } from 'unbuild'


export default defineBuildConfig({
  entries: [
    './src/index',
    {
      builder: 'mkdist',
      input: './src/runtime',
      outDir: './dist/runtime',
    },
  ],
  rollup: {
    emitCJS: true,
  },
  externals: [
    'vue-docgen-api',
    'vuepress',
  ],

  outDir: 'dist',
  declaration: true,
});
