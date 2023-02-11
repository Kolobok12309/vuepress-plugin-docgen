import { DocgenCLIConfig } from 'vue-docgen-cli/lib/config';


declare module 'vuepress' {
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

export interface VueDocgenPluginOptions {
  docgenCliConfig?: Partial<Omit<DocgenCLIConfig, 'outDir' | 'components'>>;
  // Path to vue-docgen-cli config
  docgenCliConfigPath?: string;

  // List of component entries with custom outputs
  pages?: string | string[] | VueDocgenPluginPages[];
}
