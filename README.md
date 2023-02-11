# vuepress-plugin-docgen

> Integration of [vue-docgen-cli](https://vue-styleguidist.github.io/docs/docgen-cli.html) with [vuepress 2](https://vuepress.github.io)

---

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Config](#config)
- [extractAndCutFrontmatter](#extractAndCutFrontmatter)

## Install

```sh
npm add --save vuepress-plugin-docgen
# pnpm add vuepress-plugin-docgen
# yarn add vuepress-plugin-docgen
```

## Usage

```ts
// .vuepress/config.ts
import { defineUserConfig } from 'vuepress';
import { VueDocgenPlugin } from 'vuepress-plugin-docgen';

export default defineUserConfig({
  plugins: [
    VueDocgenPlugin({
      docgenCliConfigPath: null,
      docgenCliConfig: null,
      
      pages: 'components/**/*.vue',
    }),
  ],
});
```

## Config

### docgenCliConfig

- type: `Partial<Omit<DocgenCLIConfig, 'outDir' | 'components'>>`
- required: `false`

Config for `vue-docgen-cli`.

🔥 If you need change `docgenCliConfig.templates.component` and save functionality of `frontmatter`, you need use [`extractAndCutFrontmatter`](#extractAndCutFrontmatter).

### docgenCliConfigPath

- type: `string`
- required: `false`

File path to `docgenCliConfig`. Worked only `commonjs` syntax.

### pages

https://github.com/Kolobok12309/vuepress-plugin-docgen/blob/82d9994164057bbf88f5ab6da442c03c6e37326e/src/types.ts#L10-L17

- type: `string | string[] | VueDocgenPluginPages[]`
- required: `false`
- default: `[{ components: ['**/components/**/*.vue', '!**/node_modules/**', '!**/.vuepress/**'] }]`

List of component entries with custom `root` and `outDir`. `string` types converted like this `pages: '*.vue'` -> `pages: [{ components: '*.vue' }]`.

## extractAndCutFrontmatter

For right integration with `frontmatter`, `docgenCliConfig.templates.component` modified by this plugin to use and merge `frontmatter` from `ComponentDoc.docsBlocks`. Full usage code in [`/src/templates/component.ts`](https://github.com/Kolobok12309/vuepress-plugin-docgen/blob/master/src/templates/component.ts)

https://github.com/Kolobok12309/vuepress-plugin-docgen/blob/82d9994164057bbf88f5ab6da442c03c6e37326e/src/utils/extractAndCutFrontmatter.ts#L10-L21
