import type { GrayMatterOption } from 'gray-matter';
import { Templates } from 'vue-docgen-cli';
// import originalComponentTemplate from 'vue-docgen-cli/lib/templates/component.js';

import { extractAndCutFrontmatter } from '../utils';


export default (grayMatterOptions: GrayMatterOption<any, any>, originalComponentTemplate): Templates['component'] => (
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
