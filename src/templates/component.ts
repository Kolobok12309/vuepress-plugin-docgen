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

  const {
    content,
  } = extractAndCutFrontmatter(
    doc,
    grayMatterOptions,
    originalResultWithoutDocsBlocks,
  );

  return content;
};
