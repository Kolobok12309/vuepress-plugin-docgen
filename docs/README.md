# vuepress-plugin-vue-docgen

## Introduction

The `vuepress-plugin-vue-docgen` plugin is designed to auto-generate documentation of `vue` components to [given syntax](https://vue-styleguidist.github.io/docs/Documenting.html).
The plugin links `vuepress 2` and `vue-docgen-cli`.
All `vue-docgen` documentation files continue to work with `frontmatter`.

## Installation

```shell
npm add --save vuepress-plugin-vue-docgen
# pnpm add vuepress-plugin-vue-docgen
# yarn add vuepress-plugin-vue-docgen
```

## Typical usage

```ts
// .vuepress/config.ts
import { defineUserConfig } from 'vuepress';
import { VueDocgenPlugin } from 'vuepress-plugin-vue-docgen';

export default defineUserConfig({
  plugins: [
    VueDocgenPlugin(),
  ],
});
```

Without options, the plugin will look for `.vue` files using `glob` template `['**/components/**/*.vue', '!**/node_modules/**', '!**/.vuepress/**']`

## Config

### docgenCliConfig

- type: `Partial<Omit<DocgenCLIConfig, 'outDir' | 'components'>>`
- required: `false`

Config for `vue-docgen-cli`.

::: warning
If you need change `docgenCliConfig.templates.component` and save functionality of `frontmatter`, you need use [`extractAndCutFrontmatter`](#advanced-usage).
:::

### docgenCliConfigPath

- type: `string`
- required: `false`

File path to `docgenCliConfig`. Work only for `commonjs` syntax of config file.

### pages

```ts
interface VueDocgenPluginPages {
  // Root of component (this part of file path would cutted from result vuepress url)
  root?: string;
  // Glob string for find components
  components: string | string[];
  // Out path of docs in vuepress app
  outDir?: string;
}
```

- type: `string | string[] | VueDocgenPluginPages[]`
- required: `false`
- default: `[{ components: ['**/components/**/*.vue', '!**/node_modules/**', '!**/.vuepress/**'] }]`

List of component entries with customization of `root` and `outDir`. `string` type will converted to object like this `pages: '*.vue'` -> `pages: [{ components: '*.vue' }]`.

## Advanced usage

If you need to change `docgenCliConfig.templates.component` and still keep functionality of `frontmatter`, you need use `extractAndCutFrontmatter`.
Without it `frontmatter` of nested doc files will be treated as a common `markdown`.

### extractAndCutFrontmatter

Function created for strip `frontmatter` information from all nested `.md` files and inject and merge it to base `.md` content(`content`). By default, everything is inject and merge in a result of the original `docgenCliConfig.tepmlates.component`.

```ts
export const extractAndCutFrontmatter = (
  // doc.docsBlocks will modified by calling this function
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

### Example

Delete info-block contained `slots`.

```ts
// templates/component.ts
import type { Templates } from 'vue-docgen-cli';

import { extractAndCutFrontmatter, templateComponent } from 'vuepress-plugin-vue-docgen';


const grayMatterOptions = {};

const componentTemplate: Templates['component'] = (
  renderedUsage,
  doc,
  config,
  fileName,
  requiresMd,
  subTemplateOptions,
) => {
  renderedUsage.slots = '';

  return templateComponent(grayMatterOptions)(
    renderedUsage,
    doc,
    config,
    fileName,
    requiresMd,
    subTemplateOptions,
  );
};
```
