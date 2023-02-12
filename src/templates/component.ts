import type { GrayMatterOption } from 'gray-matter';
import type { Templates } from 'vue-docgen-cli';
// TODO Debug why can't import without extension
import _originalComponentTemplate from 'vue-docgen-cli/lib/templates/component.js';

import { extractAndCutFrontmatter } from '../utils';


// TODO Fix this imports
const originalComponentTemplate = (_originalComponentTemplate as any).default as typeof import('vue-docgen-cli/lib/templates/component').default;

export default (grayMatterOptions: GrayMatterOption<any, any>): Templates['component'] => (
  renderedUsage,
  doc,
  config,
  fileName,
  requiresMd,
  subTemplateOptions,
) => {
  if (subTemplateOptions.isSubComponent) {
    return originalComponentTemplate(
      renderedUsage,
      doc,
      config,
      fileName,
      requiresMd,
      subTemplateOptions,
    );
  }

  const originalResultWithoutDocsBlocks = originalComponentTemplate(
    renderedUsage,
    {
      ...doc,
      docsBlocks: [],
    },
    config,
    fileName,
    requiresMd,
    subTemplateOptions,
  );

  let {
    content,
  } = extractAndCutFrontmatter(
    doc,
    grayMatterOptions,
    originalResultWithoutDocsBlocks,
  );

  if (doc.docsBlocks)
    content += '---\n' + doc.docsBlocks.join('\n---\n')

  return content;
};
