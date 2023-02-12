import { resolve } from 'path';

import { defineUserConfig, createPage } from 'vuepress';
import { defaultTheme } from '@vuepress/theme-default';

import { VueDocgenPlugin } from '../../src/index';


export default defineUserConfig({
  base: process.env.BASE_URL as any || '/',

  plugins: [
    VueDocgenPlugin({
      // docgenCliConfigPath: resolve(__dirname, './docgen.config.cjs'),
      docgenCliConfig: {
        // This properties can't be added not from file config
        // docsRepo: 'kolobok12309/vuepress-plugin-docgen',
        // docsBranch: 'master',
        editLinkLabel: 'Edit on github',
        getRepoEditUrl: (p) =>
          `https://github.com/kolobok12309/vuepress-plugin-docgen/edit/master/${p}`,
      },

      pages: 'components/**/*.vue',
      // pages: [
      //   {
      //     root: resolve(__dirname, '../../components'),
      //     components: '**/*.vue',
      //     outDir: 'components',
      //   },
      //   {
      //     root: resolve(__dirname, '../../components'),
      //     components: '**/*.vue',
      //     outDir: 'foo/bar',
      //   }
      // ],
    }),
  ],

  locales: {
    '/': {
      lang: 'en-US',
      title: 'vuepress-plugin-vue-docgen',
      description: 'Vuepress plugin for auto-generation doc from vue components with vue-docgen-cli',
    },

    '/ru/': {
      lang: 'ru-RU',
      title: 'vuepress-plugin-vue-docgen',
      description: 'Vuepress плагин для автогенерации документации из vue компонентов с помощью vue-docgen-cli',
    },
  },

  theme: defaultTheme({
    repo: 'Kolobok12309/vuepress-plugin-docgen',

    locales: {
      '/': {
        selectLanguageName: 'English',

        navbar: [
          { text: 'Introduction', link: '/' },
          { text: 'Examples', link: '/components/' },
          { text: 'Changelog', link: '/changelog/' },
        ],

        sidebar: [
          {
            text: 'Introduction',
            link: '/',
          },
          {
            text: 'Examples',
            link: '/examples/',
            children: [
              {
                text: 'Button',
                link: '/components/button',
              },
              {
                text: 'CounterButton',
                link: '/components/counter-button',
              },
              {
                text: 'DropDown',
                link: '/components/drop-down',
              },
            ],
          }
        ],
      },

      '/ru/': {
        selectLanguageName: 'Русский',

        navbar: [
          { text: 'Введение', link: '/' },
          { text: 'Примеры', link: '/components/' },
          { text: 'Changelog', link: '/changelog/' },
        ],

        sidebar: [
          {
            text: 'Введение',
            link: '/ru/',
          },
          {
            text: 'Примеры',
            link: '/examples/',
            children: [
              {
                text: 'Button',
                link: '/components/button',
              },
              {
                text: 'CounterButton',
                link: '/components/counter-button',
              },
              {
                text: 'DropDown',
                link: '/components/drop-down',
              },
            ],
          },
        ],
      },
    },
  }),

  async onInitialized(app) {
    const changelogPage = await createPage(app, {
      path: '/changelog/',
      filePath: resolve(__dirname, './../../CHANGELOG.md'),
    });

    app.pages.push(changelogPage);
  },
});
