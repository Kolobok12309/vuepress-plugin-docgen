import { resolve, basename, extname, dirname } from 'path';

import type { DocgenCLIConfig } from 'vue-docgen-cli';


export const defaultGetDestFile: DocgenCLIConfig['getDestFile'] = (file, config) => {
  // Rename index files to README.md for vuepress
  if (basename(file, extname(file)).toLowerCase() === 'index')
    return resolve(config.outDir, dirname(file), 'README.md');

  // Default vue-docgen-cli logic
  return resolve(config.outDir, file)
    .replace(/\.\w+$/, '.md');
}
