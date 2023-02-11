import type { ComponentDoc } from 'vue-docgen-api';

import type { GrayMatterOption } from 'gray-matter';
import matter from 'gray-matter';
import defu from 'defu';


// Extract all frontmatter comments from content and doc.docsBlocks
// and inject it back to content
export const extractAndCutFrontmatter = (
  // doc.docsBlocks will modified by this function
  doc: Partial<Pick<ComponentDoc, 'docsBlocks'>>,
  grayMatterOptions: GrayMatterOption<any, any>,
  // Base markdown content (for example result of original templates.component)
  content = '',
): {
  // Content with injected all frontmatter
  content: string;
  // Separated frontmatter
  frontmatter: Record<any, any>;
} => {
  const {
    data: topContentFrontmatter = {},
    content: cuttedTopContent,
    // Without .trim() matter ignore some files
  } = matter(content.trim(), grayMatterOptions);

  let frontmatter = topContentFrontmatter;

  doc.docsBlocks?.forEach((blockContent, index) => {
    const {
      data,
      content: cuttedBlockContent
    } = matter(blockContent.trim(), grayMatterOptions);

    frontmatter = defu(data, frontmatter);
    doc.docsBlocks[index] = cuttedBlockContent;
  });


  return {
    content: matter.stringify(cuttedTopContent, frontmatter, grayMatterOptions),
    frontmatter,
  };
};
