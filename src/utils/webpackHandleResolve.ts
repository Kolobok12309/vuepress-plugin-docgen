// Full copy of https://github.com/vuepress/vuepress-next/blob/fd2e241235fc87c66ce59ba22c8e27521c594fbd/packages/bundler-webpack/src/config/handleResolve.ts
import type { App } from '@vuepress/core'
import type Config from 'webpack-chain'

/**
 * Set webpack resolve
 */
export const webpackHandleResolve = async ({
  app,
  config,
  isServer,
}: {
  app: App
  config: Config
  isServer: boolean
}): Promise<void> => {
  // aliases
  config.resolve.alias
    .set('@source', app.dir.source())
    .set('@temp', app.dir.temp())
    .set('@internal', app.dir.temp('internal'))

  // extensions
  config.merge({
    resolve: {
      extensionAlias: {
        '.js': ['.js', '.ts'],
        '.mjs': ['.mjs', '.mts'],
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json'],
    },
  })

  // extensions
  config.resolve.extensions.merge([
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.vue',
    '.json',
  ])

  // plugin hook: alias
  const aliasResult = await app.pluginApi.hooks.alias.process(app, isServer)

  // set aliases
  aliasResult.forEach((aliasObject) =>
    Object.entries(aliasObject).forEach(([key, value]) => {
      config.resolve.alias.set(key, value)
    })
  )
}
