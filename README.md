# vuepress-plugin-docgen

[![npm](https://img.shields.io/npm/v/vuepress-plugin-vue-docgen)](https://www.npmjs.com/package/vuepress-plugin-vue-docgen)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/kolobok12309/vuepress-plugin-docgen/ci.yml?label=ci)](https://github.com/Kolobok12309/vuepress-plugin-docgen/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/dw/vuepress-plugin-vue-docgen)](https://www.npmjs.com/package/vuepress-plugin-vue-docgen)
[![Docs deploy](https://img.shields.io/github/deployments/kolobok12309/vuepress-plugin-docgen/github-pages?label=Docs%20deploy)](https://kolobok12309.github.io/vuepress-plugin-docgen)

> Integration of [vue-docgen-cli](https://vue-styleguidist.github.io/docs/docgen-cli.html) with [vuepress 2](https://vuepress.github.io)

---

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Config](#config)
- [extractAndCutFrontmatter](#extractAndCutFrontmatter)

## Install

```sh
npm add --save vuepress-plugin-vue-docgen
# pnpm add vuepress-plugin-vue-docgen
# yarn add vuepress-plugin-vue-docgen
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
      
      groups: 'components/**/*.vue',
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

### groups

```ts
interface VueDocgenPluginGroup {
  // Root of component (this part of file path would cutted)
  root?: string;
  // Glob string for find components
  components: string | string[];
  // Out path of docs in vuepress app for this group
  outDir?: string;
  // Custom docgenCliConfig for current group
  docgenCliConfig?: Partial<Omit<DocgenCLIConfig, 'outDir' | UsedInVueDocgenConfigProcessingProperties>>;
}
```

- type: `string | string[] | VueDocgenPluginGroup[]`
- required: `false`
- default: `[{ components: ['**/components/**/*.vue', '!**/node_modules/**', '!**/.vuepress/**'] }]`

List of component entries with custom `root` and `outDir`. `string` types converted like this `groups: '*.vue'` -> `groups: [{ components: '*.vue' }]`.

### stateless

- type: `boolean`
- default: `true`

Mode for generation files in tmp folder.

## extractAndCutFrontmatter

For right integration with `frontmatter`, `docgenCliConfig.templates.component` modified by this plugin to use and merge `frontmatter` from `ComponentDoc.docsBlocks`. Full usage code in [`/src/templates/component.ts`](https://github.com/Kolobok12309/vuepress-plugin-docgen/blob/master/src/templates/component.ts)

```ts
export const extractAndCutFrontmatter = (
  // doc.docsBlocks will modified by this function
  doc: Partial<Pick<ComponentDoc, 'docsBlocks'>>,
  grayMatterOptions: GrayMatterOption<any, any>,
  // Base markdown content (for example result of original templates.component)
  content = '',
): {
  // Content with injected all frontmatter
  content: string;
  // Separated frontmatter
  frontmatter: Record<any, any>;
} => {}
```

## Known issues

### Vuepress editLink

"Edit this page" in `stateless: true` mode will not work correctly and lead to a non-existent file.
Because it, `editLink` disabled in `stateless: true` mode by default.

Solutions:
- `stateless: false` and save all generated files in repo
- Use [`docgenCliConfig.getRepoEditUrl`](https://github.com/vue-styleguidist/vue-styleguidist/tree/dev/packages/vue-docgen-cli#getrepoediturl) and their sub-properties like `docsRepo`, `docsBranch`.
