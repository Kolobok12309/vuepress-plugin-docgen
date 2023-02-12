# vuepress-plugin-vue-docgen

## Введение

Плагин `vuepress-plugin-vue-docgen` предназначен для авто-генерации документации `vue` компонентов по [заданному синтаксису](https://vue-styleguidist.github.io/docs/Documenting.html).
Плагин связывает `vuepress 2` и `vue-docgen-cli`.
В каждом из файлов документации `vue-docgen` продолжает работать `frontmatter`.

## Установка

```shell
npm add --save vuepress-plugin-vue-docgen
# pnpm add vuepress-plugin-vue-docgen
# yarn add vuepress-plugin-vue-docgen
```

## Типичное использование

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

Без параметров, плагин будет искать `.vue` файлы по `glob` шаблону `['**/components/**/*.vue', '!**/node_modules/**', '!**/.vuepress/**']`

## Конфигурация

### docgenCliConfig

- type: `Partial<Omit<DocgenCLIConfig, 'outDir' | 'components'>>`
- required: `false`

Конфиг для `vue-docgen-cli`.

::: warning
Если вам нужно изменить `docgenCliConfig.templates.component` и сохранить функциональность `frontmatter`, вам необходимо использовать [`extractAndCutFrontmatter`](#продвинутое-использование).
:::

### docgenCliConfigPath

- type: `string`
- required: `false`

Путь к `docgenCliConfig`. Работает лишь в `commonjs` синтаксисе модуля.

### pages

```ts
interface VueDocgenPluginPages {
  // Корень набора компонентов (эта часть пути будет вырезана из итогового url)
  root?: string;
  // Glob строка для поиска компонентов
  components: string | string[];
  // Итоговая папка документации конкретной Page в vuepress
  outDir?: string;
}
```

- type: `string | string[] | VueDocgenPluginPages[]`
- required: `false`
- default: `[{ components: ['**/components/**/*.vue', '!**/node_modules/**', '!**/.vuepress/**'] }]`

Список наборов компонентов с возможностью кастомизации `root` и `outDir`. `string` типы конвертируются в объект вида `pages: '*.vue'` -> `pages: [{ components: '*.vue' }]`.

### stateless

- type: `boolean`
- default: `true`

Режим генерации файлов во временную папку.

## Продвинутое использование

В случае если вам необходимо изменить `docgenCliConfig.templates.component` и при этом сохранить функциональность `frontmatter`, необходимо использовать `extractAndCutFrontmatter`.
Без этого `frontmatter` вложенных файлов документации будет восприниматься как обычный `markdown` тег.

### extractAndCutFrontmatter

Функция созданная для изъятия `frontmatter` информации из всех вложенных `.md` файлов и дальнейшем совмещении в итоговом `.md`(по умолчанию все совмещается в результат оригинального `docgenCliConfig.tepmlates.component`)

```ts
export const extractAndCutFrontmatter = (
  // doc.docsBlocks мутируется при вызове данной функции
  doc: Partial<Pick<ComponentDoc, 'docsBlocks'>>,
  grayMatterOptions: GrayMatterOption<any, any>,
  // Исходный markdown документ (к примеру результат оригинального templates.component)
  content = '',
): {
  // Исходный документ с внедренным frontmatter
  content: string;
  // Отдельно весь frontmatter в виде объекта
  frontmatter: Record<any, any>;
} => {}
```

### Пример

Удаление информации о слотах.

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

## Известные ошибки

### Vuepress editLink

"Edit this page" в `stateless: true` моде не будет работать корректно и будет вести на несуществующий файл.
Из-за этого, `editLink` отключены в `stateless: true` моде по умолчанию.

Возможные решение:
- `stateless: false` и хранить все сгенерированные файлы в репозитории.
- Использовать [`docgenCliConfig.getRepoEditUrl`](https://github.com/vue-styleguidist/vue-styleguidist/tree/dev/packages/vue-docgen-cli#getrepoediturl) и его под-свойства типа `docsRepo`, `docsBranch`.
