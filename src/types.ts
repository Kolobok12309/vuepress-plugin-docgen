import { DocgenCLIConfig } from 'vue-docgen-cli/lib/config';


declare module '@vuepress/core' {
  interface PageOptions {
    isDocgenPage?: boolean;
  }
}

export interface VueDocgenPluginPages {
  // Root of component (this part of file path would cutted)
  root?: string;
  // Glob string for find components
  components: string | string[];
  // Out path of docs in vuepress app
  outDir?: string;
}

// This properties used while vue-docgen-cli config extraction
// and can't be processed by some merge
export type UsedInVueDocgenConfigProcessingProperties = 'docsBranch'
  | 'docsRepo'
  | 'docsFolder';
export interface VueDocgenPluginOptions {
  // Some of properties wouldn't worked not from file
  // because vue-docgen-cli only accept file based config.
  // For example 'docsBranch', 'docsFolder' and 'docsRepo' wouldn't converted to 'getRepoEditUrl'
  docgenCliConfig?: Partial<Omit<DocgenCLIConfig, 'outDir' | 'components' | UsedInVueDocgenConfigProcessingProperties> & Record<UsedInVueDocgenConfigProcessingProperties, never>>;
  // Path to vue-docgen-cli config
  docgenCliConfigPath?: string;

  // List of component entries with custom outputs
  pages?: string | string[] | VueDocgenPluginPages[];
  // Flag to generate doc files in vuepressApp.temp folder
  // Enabled by default
  stateless?: boolean;
}
