import type { DocgenCLIConfig } from 'vue-docgen-cli';


declare module '@vuepress/core' {
  interface PageOptions {
    isDocgenPage?: boolean;
  }
}

// This properties used while vue-docgen-cli config extraction
// and can't be processed by some merge
export type UsedInVueDocgenConfigProcessingProperties = 'docsBranch'
  | 'docsRepo'
  | 'docsFolder';

export interface VueDocgenPluginGroup {
  // Root of component (this part of file path would cutted)
  root?: string;
  // Glob string for find components
  components: string | string[];
  // Out path of docs in vuepress app for this group
  outDir?: string;
  // Custom docgenCliConfig for current group
  docgenCliConfig?: Partial<Omit<DocgenCLIConfig, 'outDir' | UsedInVueDocgenConfigProcessingProperties> & Record<UsedInVueDocgenConfigProcessingProperties, never>>;
}

export interface VueDocgenPluginOptions {
  // Some of properties wouldn't worked not from file
  // because vue-docgen-cli only accept file based config.
  // For example 'docsBranch', 'docsFolder' and 'docsRepo' wouldn't converted to 'getRepoEditUrl'
  docgenCliConfig?: Partial<Omit<DocgenCLIConfig, 'outDir' | 'components' | UsedInVueDocgenConfigProcessingProperties> & Record<UsedInVueDocgenConfigProcessingProperties, never>>;
  // Path to vue-docgen-cli config
  docgenCliConfigPath?: string;

  // List of component entries with custom outputs
  groups?: string | string[] | VueDocgenPluginGroup[];
  // Flag to generate doc files in vuepressApp.temp folder
  // Enabled by default
  stateless?: boolean;
}
